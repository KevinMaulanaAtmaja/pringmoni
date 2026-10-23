'use server'

import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLog } from "@/lib/log"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limiter"
import { COOKIE_PERANGKAT } from "@/lib/sesi"

export type LoginState = {
  error: string
  success: boolean
}

const STATE_AWAL: LoginState = {
  error: "",
  success: false,
}

type HasilValidasi =
  | { user: { id: number; lastLoginDevice: string | null } }
  | { databaseError: true }
  | null

/**
 * Cek username/password tanpa membuat sesi.
 * Dipisah dari signIn supaya kita bisa menanyakan konfirmasi "ambil alih"
 * ke pengguna sebelum sesi lamanya dibatalkan.
 */
async function validasiKredensial(username: string, password: string): Promise<HasilValidasi> {
  if (!username || !password) return null

  try {
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      select: {
        id: true,
        username: true,
        password: true,
        status: true,
        lastLoginDevice: true,
      },
    })

    if (!user || !user.status) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return {
      user: {
        id: user.id,
        lastLoginDevice: user.lastLoginDevice,
      },
    }
  } catch (error: unknown) {
    const err = error as Error & { code?: string; message?: string }
    if (err.code === "P1001" || err.message?.includes("DatabaseNotReachable")) {
      return { databaseError: true }
    }
    throw error
  }
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string) ?? ""
  const password = (formData.get("password") as string) ?? ""

  // Check rate limit BEFORE doing anything else
  const rateCheck = checkRateLimit(username)
  if (!rateCheck.allowed) {
    const remainingSeconds = Math.ceil(((rateCheck.blockedUntil ?? 0) - Date.now()) / 1000)
    const menit = Math.ceil(remainingSeconds / 60)
    return { ...STATE_AWAL, error: `Terlalu banyak percobaan login. Coba lagi dalam ${menit} menit.` }
  }

  // Validasi kredensial dulu (belum membuat sesi)
  let hasilValidasi: HasilValidasi
  try {
    hasilValidasi = await validasiKredensial(username, password)
  } catch {
    return { ...STATE_AWAL, error: "Terjadi kesalahan saat menghubungi database. Silakan coba lagi." }
  }

  if (hasilValidasi && "databaseError" in hasilValidasi) {
    return { ...STATE_AWAL, error: "Database tidak dapat dihubungi. Silakan coba lagi." }
  }

  if (!hasilValidasi) {
    recordFailedAttempt(username)
    return { ...STATE_AWAL, error: "Username/Email atau password salah" }
  }

  const deviceId = (await cookies()).get(COOKIE_PERANGKAT)?.value ?? null
  // Login baru langsung mengambil alih sesi (sesi lama dikeluarkan oleh
  // sessionVersion). Perbedaan perangkat hanya dicatat untuk audit log.
  const menggantikanSesiLain =
    Boolean(hasilValidasi.user.lastLoginDevice) &&
    hasilValidasi.user.lastLoginDevice !== deviceId

  try {
    const result = await signIn('credentials', {
      username,
      password,
      deviceId: deviceId ?? "",
      redirect: false,
    })

    // NextAuth v5 returns redirect URL string on failure (with error param) instead of throwing
    if (typeof result === 'string' && result.includes('error=')) {
      recordFailedAttempt(username)
      return { ...STATE_AWAL, error: 'Username/Email atau password salah' }
    }

    resetRateLimit(username)
    await createLog(
      'LOGIN',
      menggantikanSesiLain
        ? `User ${username} login ke sistem (menggantikan sesi di perangkat lain)`
        : `User ${username} login ke sistem`
    )
    return { ...STATE_AWAL, success: true }
  } catch (error: unknown) {
    const err = error as Error & { message?: string; cause?: Error & { message?: string } }
    const errMsg = err.message || err.cause?.message || ''
    if (errMsg === 'DATABASE_ERROR') {
      return { ...STATE_AWAL, error: 'Database tidak dapat dihubungi. Silakan coba lagi.' }
    }
    recordFailedAttempt(username)
    return { ...STATE_AWAL, error: 'Username/Email atau password salah' }
  }
}
