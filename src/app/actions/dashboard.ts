"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import type { RoleUser } from "@/types"

export async function getDashboardStats() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const [pesananHariIni, totalPendapatan] = await Promise.all([
      prisma.pesanan.findMany({
        where: { createdAt: { gte: today } },
      }),
      prisma.pesanan.findMany({
        where: { 
          createdAt: { gte: today },
          statusPembayaran: 'berhasil',
        },
      }),
    ])
    const [mejaStats, pesananMenunggu] = await Promise.all([
      prisma.meja.findMany({
        select: { statusMeja: true },
      }),
      prisma.pesanan.findMany({
        where: { statusPesanan: 'menunggu' },
      }),
    ])

  const mejaKosong = mejaStats.filter(m => m.statusMeja === 'kosong').length
  const mejaTerpakai = mejaStats.filter(m => m.statusMeja === 'terpakai').length

  const itemTerjualHariIni = await prisma.detailPesanan.findMany({
    where: {
      pesanan: {
        createdAt: { gte: today },
        statusPembayaran: 'berhasil',
        deletedAt: null,
      },
    },
    select: { jumlah: true },
  })

  const stats = {
    pesananHariIni: pesananHariIni.length,
    totalPendapatan: totalPendapatan.reduce((sum, p) => sum + Number(p.totalHarga), 0),
    mejaKosong,
    mejaTerpakai,
    pesananMenunggu: pesananMenunggu.length,
    itemTerjual: itemTerjualHariIni.reduce((s, d) => s + d.jumlah, 0),
  }

    if (role === 'cashier') {
      return {
        ...stats,
        showMeja: false,
      }
    }

    if (role === 'waiter') {
      const pesananDiproses = await prisma.pesanan.findMany({
        where: { statusPesanan: 'diproses' },
        select: { id: true },
      })
      return {
        pesananHariIni: stats.pesananHariIni,
        pesananMenunggu: stats.pesananMenunggu,
        pesananDiproses: pesananDiproses.length,
        showPendapatan: false,
        showMeja: false,
        showPesananDiproses: true,
      }
    }

    return {
      ...stats,
      showMeja: true,
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return {
      pesananHariIni: 0,
      totalPendapatan: 0,
      mejaKosong: 0,
      mejaTerpakai: 0,
      pesananMenunggu: 0,
      itemTerjual: 0,
      showMeja: role !== 'cashier',
    }
  }
}

export async function getDashboardCharts() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: Record<string, unknown> = {}

  try {
    if (role === 'owner') {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

      const weeklyPesanan = await prisma.pesanan.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, statusPembayaran: 'berhasil', deletedAt: null },
        select: { totalHarga: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })

      const dailyMap = new Map<string, number>()
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo)
        d.setDate(d.getDate() + i)
        dailyMap.set(d.toISOString().split('T')[0], 0)
      }
      for (const p of weeklyPesanan) {
        const key = p.createdAt.toISOString().split('T')[0]
        if (dailyMap.has(key)) {
          dailyMap.set(key, dailyMap.get(key)! + Number(p.totalHarga))
        }
      }
      result.pendapatan7Hari = Array.from(dailyMap.entries()).map(([date, value]) => ({
        label: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        value,
      }))

      const mejaList = await prisma.meja.findMany({ select: { statusMeja: true } })
      result.meja = {
        terpakai: mejaList.filter(m => m.statusMeja === 'terpakai').length,
        kosong: mejaList.filter(m => m.statusMeja === 'kosong').length,
      }

      const ownerTodayPesanan = await prisma.pesanan.findMany({
        where: { createdAt: { gte: today }, deletedAt: null },
        select: { totalHarga: true, statusPembayaran: true, metodePembayaran: true },
      })
      const metodeMap = new Map<string, number>()
      const berhasil = ownerTodayPesanan.filter(p => p.statusPembayaran === 'berhasil')
      for (const p of berhasil) {
        const metode = p.metodePembayaran || 'unknown'
        metodeMap.set(metode, (metodeMap.get(metode) || 0) + Number(p.totalHarga))
      }
      result.metodePembayaran = Array.from(metodeMap.entries()).map(([label, value]) => ({ label, value }))

      const todayItems = await prisma.detailPesanan.findMany({
        where: {
          pesanan: { createdAt: { gte: today }, statusPembayaran: 'berhasil', deletedAt: null },
        },
        include: { menu: true },
      })
      const menuMap = new Map<string, number>()
      for (const item of todayItems) {
        menuMap.set(item.menu.namaMenu, (menuMap.get(item.menu.namaMenu) || 0) + item.jumlah)
      }
      result.topMenu = Array.from(menuMap.entries())
        .map(([nama, total]) => ({ nama, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    }

    if (role === 'cashier') {
      const todayPesanan = await prisma.pesanan.findMany({
        where: { createdAt: { gte: today }, deletedAt: null },
        select: { createdAt: true, totalHarga: true, statusPembayaran: true, metodePembayaran: true },
        orderBy: { createdAt: 'asc' },
      })

      const statusBayarMap = new Map<string, number>()
      for (const p of todayPesanan) {
        statusBayarMap.set(p.statusPembayaran, (statusBayarMap.get(p.statusPembayaran) || 0) + 1)
      }
      result.statusPembayaran = Array.from(statusBayarMap.entries()).map(([label, value]) => ({ label, value }))

      const perJamMetode = new Map<string, Map<string, number>>()
      for (let h = 0; h < 24; h++) {
        perJamMetode.set(`${String(h).padStart(2, '0')}:00`, new Map())
      }
      const berhasil = todayPesanan.filter(p => p.statusPembayaran === 'berhasil')
      for (const p of berhasil) {
        const hour = `${String(p.createdAt.getHours()).padStart(2, '0')}:00`
        const metode = p.metodePembayaran || 'unknown'
        const inner = perJamMetode.get(hour)!
        inner.set(metode, (inner.get(metode) || 0) + Number(p.totalHarga))
      }
      result.perbandinganMetode = Array.from(perJamMetode.entries())
        .map(([label, metodeMap]) => ({
          label,
          tunai: metodeMap.get('tunai') || 0,
          qris: metodeMap.get('qris') || 0,
          transfer: metodeMap.get('transfer') || 0,
        }))
        .filter(h => h.tunai > 0 || h.qris > 0 || h.transfer > 0)
    }

    if (role === 'waiter') {
      const todayPesanan = await prisma.pesanan.findMany({
        where: { createdAt: { gte: today }, deletedAt: null },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      })

      const hourlyMap = new Map<string, number>()
      for (let h = 0; h < 24; h++) {
        hourlyMap.set(`${String(h).padStart(2, '0')}:00`, 0)
      }
      for (const p of todayPesanan) {
        const hour = `${String(p.createdAt.getHours()).padStart(2, '0')}:00`
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      }
      result.pesananPerJam = Array.from(hourlyMap.entries())
        .map(([label, value]) => ({ label, value }))
        .filter(h => h.value > 0)

      const antarMap = new Map<string, number>()
      const todayItemStatus = await prisma.detailPesanan.findMany({
        where: {
          pesanan: { createdAt: { gte: today }, deletedAt: null },
        },
        select: { statusAntar: true, jumlah: true },
      })
      for (const item of todayItemStatus) {
        const status = item.statusAntar === 'diantar' ? 'diantar' : 'belum'
        antarMap.set(status, (antarMap.get(status) || 0) + item.jumlah)
      }
      result.statusAntarItem = Array.from(antarMap.entries()).map(([label, value]) => ({ label, value }))
    }

    return result
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return result
  }
}

export interface StaleOrder {
  id: number
  nomorMeja: string
  statusPesanan: string
  lamaMenit: number
  createdAt: Date
}

export async function getStaleOrders() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined
  if (!role || role === 'owner') return []

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)

  try {
    const stalePesanan = await prisma.pesanan.findMany({
      where: {
        statusPesanan: 'diproses',
        createdAt: { lte: thirtyMinAgo },
        deletedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        mejaId: true,
        statusPesanan: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const mejaIds = [...new Set(stalePesanan.map(p => p.mejaId))]
    const mejaList = await prisma.meja.findMany({
      where: { id: { in: mejaIds } },
      select: { id: true, nomorMeja: true },
    })
    const mejaMap = new Map(mejaList.map(m => [m.id, m.nomorMeja]))

    const now = Date.now()
    return stalePesanan.map(p => ({
      id: p.id,
      nomorMeja: mejaMap.get(p.mejaId) || `Meja #${p.mejaId}`,
      statusPesanan: p.statusPesanan,
      lamaMenit: Math.round((now - p.createdAt.getTime()) / 60000),
      createdAt: p.createdAt,
    }))
  } catch (error) {
    console.error('Stale orders error:', error)
    return []
  }
}

export async function autoCancelStaleUnpaid() {
  const session = await auth()
  if (!session) return { cancelled: 0 }

  const duaJam = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const empatJam = new Date(Date.now() - 4 * 60 * 60 * 1000)
  const duaPuluhTigaJam = new Date(Date.now() - 23 * 60 * 60 * 1000)

  try {
    const [tanpaMetode, pilihTunai, pilihLain] = await Promise.all([
      // Pesan tanpa metode → 2 jam
      prisma.pesanan.findMany({
        where: {
          statusPembayaran: 'menunggu',
          metodePembayaran: null,
          statusPesanan: { notIn: ['dibatalkan', 'selesai'] },
          createdAt: { lte: duaJam },
          deletedAt: null,
        },
        select: { id: true, mejaId: true },
      }),
      // Pilih tunai → 4 jam
      prisma.pesanan.findMany({
        where: {
          statusPembayaran: 'menunggu',
          metodePembayaran: 'tunai',
          statusPesanan: { notIn: ['dibatalkan', 'selesai'] },
          createdAt: { lte: empatJam },
          deletedAt: null,
        },
        select: { id: true, mejaId: true },
      }),
      // Pilih qris/transfer → 23 jam
      prisma.pesanan.findMany({
        where: {
          statusPembayaran: 'menunggu',
          metodePembayaran: { in: ['qris', 'transfer'] },
          statusPesanan: { notIn: ['dibatalkan', 'selesai'] },
          createdAt: { lte: duaPuluhTigaJam },
          deletedAt: null,
        },
        select: { id: true, mejaId: true },
      }),
    ])

    const stale = [...tanpaMetode, ...pilihTunai, ...pilihLain]
    if (stale.length === 0) return { cancelled: 0 }

    const mejaIds = [...new Set(stale.map(p => p.mejaId))]

    await prisma.$transaction([
      prisma.pesanan.updateMany({
        where: { id: { in: stale.map(p => p.id) }, statusPembayaran: 'menunggu' },
        data: { statusPesanan: 'dibatalkan', statusPembayaran: 'dibatalkan' },
      }),
      prisma.meja.updateMany({
        where: { id: { in: mejaIds }, statusMeja: 'terpakai' },
        data: { statusMeja: 'kosong' },
      }),
    ])

    if (stale.length > 0) {
      await createLog('CANCEL_ORDER_STALE', `Auto-cancel ${stale.length} pesanan stale (tanpa metode: ${tanpaMetode.length}, tunai: ${pilihTunai.length}, qris/transfer: ${pilihLain.length})`)
    }

    return {
      cancelled: stale.length,
      rincian: {
        tanpaMetode: tanpaMetode.length,
        pilihTunai: pilihTunai.length,
        pilihLain: pilihLain.length,
      },
    }
  } catch (error) {
    console.error('Auto-cancel error:', error)
    return { cancelled: 0 }
  }
}

export interface PaidStaleOrder {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  lamaMenit: number
}

export async function getPaidStaleWarnings() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined
  if (!role || role === 'owner') return []

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  try {
    const paidStale = await prisma.pesanan.findMany({
      where: {
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        createdAt: { lte: oneHourAgo },
        deletedAt: null,
      },
      select: { id: true, createdAt: true, mejaId: true, namaPelanggan: true },
      orderBy: { createdAt: 'asc' },
    })

    const mejaIds = [...new Set(paidStale.map(p => p.mejaId))]
    const mejaList = await prisma.meja.findMany({
      where: { id: { in: mejaIds } },
      select: { id: true, nomorMeja: true },
    })
    const mejaMap = new Map(mejaList.map(m => [m.id, m.nomorMeja]))

    const now = Date.now()
    return paidStale.map(p => ({
      id: p.id,
      nomorMeja: mejaMap.get(p.mejaId) || `Meja #${p.mejaId}`,
      namaPelanggan: p.namaPelanggan,
      lamaMenit: Math.round((now - p.createdAt.getTime()) / 60000),
    }))
  } catch (error) {
    console.error('Paid stale warning error:', error)
    return []
  }
}
