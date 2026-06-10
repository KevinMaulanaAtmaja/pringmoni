'use server'

import { signIn } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limiter"

export async function loginAction(prevState: { error: string }, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // Check rate limit BEFORE calling signIn
  const rateCheck = checkRateLimit(username)
  if (!rateCheck.allowed) {
    const remainingSeconds = Math.ceil(((rateCheck.blockedUntil ?? 0) - Date.now()) / 1000)
    const menit = Math.ceil(remainingSeconds / 60)
    return { success: false, error: `Terlalu banyak percobaan login. Coba lagi dalam ${menit} menit.` }
  }

  try {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    // NextAuth v5 returns redirect URL string on failure (with error param) instead of throwing
    if (typeof result === 'string' && result.includes('error=')) {
      recordFailedAttempt(username)
      return { success: false, error: 'Username/Email atau password salah' }
    }

    resetRateLimit(username)
    await createLog('LOGIN', `User ${username} login ke sistem`)
    return { success: true, error: '' }
  } catch (error: unknown) {
    const err = error as Error & { message?: string; cause?: Error & { message?: string } }
    const errMsg = err.message || err.cause?.message || ''
    if (errMsg === 'DATABASE_ERROR') {
      return { success: false, error: 'Database tidak dapat dihubungi. Silakan coba lagi.' }
    }
    recordFailedAttempt(username)
    return { success: false, error: 'Username/Email atau password salah' }
  }
}
