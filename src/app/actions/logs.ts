"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export interface LogItem {
  id: number
  userId: number | null
  userName: string
  aksi: string
  keterangan: string | null
  ipAddress: string | null
  createdAt: string
}

export async function getLogs(filters?: {
  aksi?: string
  search?: string
  limit?: number
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized", data: [] }
  }

  const where: Record<string, unknown> = {}

  if (filters?.aksi && filters.aksi !== 'Semua') {
    const kategoriMap: Record<string, string[]> = {
      Auth: ['LOGIN', 'LOGOUT', 'RESET_PASSWORD'],
      Pesanan: ['CREATE_ORDER', 'UPDATE_ORDER_STATUS'],
      Pembatalan: ['CANCEL_ORDER_KASIR', 'CANCEL_ORDER_EXPIRED', 'CANCEL_ORDER_STALE'],
      Pembayaran: ['PROCESS_PAYMENT'],
    }
    const selected = kategoriMap[filters.aksi]
    if (selected?.length === 1) {
      where.aksi = selected[0]
    }
  }

  if (filters?.search) {
    where.keterangan = { contains: filters.search, mode: 'insensitive' }
  }

  const logs = await prisma.logs.findMany({
    where: where as any,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 200,
  })

  return {
    data: logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.username || 'System',
      aksi: log.aksi,
      keterangan: log.keterangan,
      ipAddress: log.ipAddress || '-',
      createdAt: log.createdAt.toISOString().replace('T', ' ').substring(0, 19),
    })),
  }
}

export async function getUniqueUsers() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') return []

  const logs = await prisma.logs.findMany({
    select: { user: { select: { username: true } } },
    distinct: ['userId'],
    where: { userId: { not: null } },
  })

  const usernames = logs.map(l => l.user?.username).filter(Boolean) as string[]
  return [...new Set(usernames)]
}

export async function getLogCount() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') return 0

  return await prisma.logs.count()
}

export async function clearLogs() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  await prisma.logs.deleteMany()
  return { success: true }
}
