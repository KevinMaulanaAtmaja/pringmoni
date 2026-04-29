"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { RoleUser } from "@/types"

export async function getDashboardStats() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const [pesananHariIni, totalPendapatan, mejaStats, pesananMenunggu, pesananDiproses] = await Promise.all([
      prisma.pesanan.findMany({
        where: { createdAt: { gte: today } },
      }),
      prisma.pesanan.findMany({
        where: { 
          createdAt: { gte: today },
          statusPembayaran: 'berhasil',
        },
      }),
      prisma.meja.findMany({
        select: { statusMeja: true },
      }),
      prisma.pesanan.findMany({
        where: { statusPesanan: 'menunggu' },
      }),
      prisma.pesanan.findMany({
        where: { statusPesanan: 'diproses' },
      }),
    ])

    const mejaKosong = mejaStats.filter(m => m.statusMeja === 'kosong').length
    const mejaTerpakai = mejaStats.filter(m => m.statusMeja === 'terpakai').length

    const stats = {
      pesananHariIni: pesananHariIni.length,
      totalPendapatan: totalPendapatan.reduce((sum, p) => sum + Number(p.totalHarga), 0),
      mejaKosong,
      mejaTerpakai,
      pesananMenunggu: pesananMenunggu.length,
      pesananDiproses: pesananDiproses.length,
    }

    if (role === 'kasir') {
      return {
        ...stats,
        showMeja: false,
        showPesananDiproses: false,
      }
    }

    if (role === 'waiter') {
      return {
        pesananHariIni: stats.pesananHariIni,
        pesananMenunggu: stats.pesananMenunggu,
        showPendapatan: false,
        showMeja: false,
        showPesananDiproses: true,
      }
    }

    return {
      ...stats,
      showMeja: true,
      showPesananDiproses: true,
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return {
      pesananHariIni: 0,
      totalPendapatan: 0,
      mejaKosong: 0,
      mejaTerpakai: 0,
      pesananMenunggu: 0,
      pesananDiproses: 0,
      showMeja: role !== 'kasir',
      showPesananDiproses: true,
    }
  }
}
