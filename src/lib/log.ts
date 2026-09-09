import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type JenisAksiLog =
  | "LOGIN"
  | "LOGOUT"
  | "RESET_PASSWORD"
  | "CREATE_ORDER"
  | "UPDATE_ORDER_STATUS"
  | "CANCEL_ORDER_KASIR"
  | "CANCEL_ORDER_EXPIRED"
  | "CANCEL_ORDER_STALE"
  | "PROCESS_PAYMENT"
  | "EMPTY_TABLE"

async function getIp(): Promise<string | null> {
  try {
    const headersList = await headers()
    return (
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null
    )
  } catch {
    return null
  }
}

export async function createLog(
  aksi: JenisAksiLog,
  keterangan: string,
  userId?: number | null
) {
  try {
    const ip = await getIp()

    if (userId === undefined) {
      const session = await auth()
      userId = session?.user?.id ? parseInt(session.user.id) : null
    }

    await prisma.logs.create({
      data: {
        userId,
        aksi: aksi as any,
        keterangan,
        ipAddress: ip,
      },
    })
  } catch {
    // Logging failure should never break the main action
  }
}

export async function createLogNoSession(
  aksi: JenisAksiLog,
  keterangan: string,
  userId?: number | null,
  ip?: string | null
) {
  try {
    await prisma.logs.create({
      data: {
        userId,
        aksi: aksi as any,
        keterangan,
        ipAddress: ip || null,
      },
    })
  } catch {
    // Logging failure should never break the main action
  }
}
