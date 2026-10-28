"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { triggerPusher, ORDERS_CHANNEL, PESANAN_EVENTS } from "@/lib/pusher"

/**
 * Batas waktu (menit) sebelum pesanan dianggap "diabaikan" / terlambat.
 * Sesuai aturan operasional: pesanan yang sudah >30 menit dan belum ditangani
 * harus terus nagih sampai ditangani atau dibatalkan.
 *
 * Tidak di-export: file ini memakai directive "use server" yang hanya mengizinkan
 * ekspor async function.
 */
const BATAS_MENIT_TERLAMBAT = 30

export interface NotifikasiPesananTerlambat {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  statusPesanan: string
  statusPembayaran: string
  lamaMenit: number
  /** ISO string agar serializable ke client component */
  createdAt: string
}

/**
 * Awal hari (00:00) menurut waktu server. Dipakai sebagai batas "hari bisnis":
 * notifikasi terlambat hanya berlaku untuk pesanan yang dibuat hari ini.
 */
function awalHari(now: Date) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Sweep tengah malam.
 *
 * Pesanan yang masih menggantung (belum dibayar) saat hari berganti otomatis
 * dibatalkan dan mejanya dikosongkan, supaya tidak "nempel" selamanya di
 * dashboard. Pesanan yang sudah dibayar TIDAK dibatalkan otomatis (butuh
 * refund manual), hanya dikeluarkan dari daftar notifikasi.
 *
 * Idempotent: pesanan yang sudah dibatalkan tidak akan terbaca lagi.
 */
async function sweepTengahMalam(hariIni: Date) {
  const sisa = await prisma.pesanan.findMany({
    where: {
      deletedAt: null,
      statusPesanan: { in: ["menunggu", "diproses"] },
      statusPembayaran: "menunggu",
      createdAt: { lt: hariIni },
    },
    select: { id: true, mejaId: true },
  })

  if (sisa.length === 0) return 0

  const ids = sisa.map((p) => p.id)
  const mejaIds = [...new Set(sisa.map((p) => p.mejaId))]

  const [pesananTerbatal] = await prisma.$transaction([
    prisma.pesanan.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        statusPesanan: { in: ["menunggu", "diproses"] },
        statusPembayaran: "menunggu",
      },
      data: {
        statusPesanan: "dibatalkan",
        statusPembayaran: "dibatalkan",
        catatan: "Auto-cancel: lewat tengah malam tanpa dibayar",
        updatedAt: new Date(),
      },
    }),
    prisma.meja.updateMany({
      where: { id: { in: mejaIds }, statusMeja: "terpakai" },
      data: { statusMeja: "kosong" },
    }),
  ])

  if (pesananTerbatal.count > 0) {
    await createLog(
      "CANCEL_ORDER_EXPIRED",
      `Auto-cancel ${pesananTerbatal.count} pesanan yang lewat tengah malam tanpa dibayar`
    )
    await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})
  }

  return pesananTerbatal.count
}

/**
 * Daftar pesanan terlambat untuk badge notifikasi di header dashboard.
 *
 * - Semua role (owner, cashier, waiter) boleh melihat.
 * - Pesanan dianggap terlambat bila sudah >30 menit dan statusnya masih
 *   `menunggu` (belum di-acknowledge) atau `diproses` (sudah bayar, belum diantar).
 * - Hanya pesanan yang dibuat hari ini (`>= 00:00`): begitu lewat tengah malam
 *   notifikasinya hilang (sisa pesanan tak dibayar otomatis dibatalkan).
 */
export async function getNotifikasiTerlambat(): Promise<{
  orders: NotifikasiPesananTerlambat[]
  total: number
}> {
  const session = await auth()
  if (!session?.user) return { orders: [], total: 0 }

  const now = new Date()
  const hariIni = awalHari(now)
  const batas = new Date(now.getTime() - BATAS_MENIT_TERLAMBAT * 60 * 1000)

  try {
    await sweepTengahMalam(hariIni)

    const terlambat = await prisma.pesanan.findMany({
      where: {
        deletedAt: null,
        statusPesanan: { in: ["menunggu", "diproses"] },
        createdAt: { lte: batas, gte: hariIni },
      },
      select: {
        id: true,
        createdAt: true,
        mejaId: true,
        namaPelanggan: true,
        statusPesanan: true,
        statusPembayaran: true,
      },
      orderBy: { createdAt: "asc" },
    })

    const mejaIds = [...new Set(terlambat.map((p) => p.mejaId))]
    const mejaList = await prisma.meja.findMany({
      where: { id: { in: mejaIds } },
      select: { id: true, nomorMeja: true },
    })
    const mejaMap = new Map(mejaList.map((m) => [m.id, m.nomorMeja]))

    const orders = terlambat.map((p) => ({
      id: p.id,
      nomorMeja: mejaMap.get(p.mejaId) ?? `Meja #${p.mejaId}`,
      namaPelanggan: p.namaPelanggan,
      statusPesanan: p.statusPesanan,
      statusPembayaran: p.statusPembayaran,
      lamaMenit: Math.round((now.getTime() - p.createdAt.getTime()) / 60000),
      createdAt: p.createdAt.toISOString(),
    }))

    return { orders, total: orders.length }
  } catch (error) {
    console.error("Notifikasi terlambat error:", error)
    return { orders: [], total: 0 }
  }
}
