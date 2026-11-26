"use server"

import type { RoleUser } from "@prisma/client"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { finalizeReservasiUntukMeja } from "@/lib/reservasi"
import { triggerPusher, ORDERS_CHANNEL, PESANAN_EVENTS } from "@/lib/pusher"

/**
 * Batas waktu (dalam menit) suatu pesanan dianggap "terlambat" bila belum
 * selesai diproses / belum diantar.
 */
const BATAS_MENIT_TERLAMBAT = 30

export type NotifikasiKind =
  | "terlambat"
  | "belum_dibayar"
  | "perlu_diproses"
  | "belum_diantar"
  | "siap_selesai"
  | "refund"
  | "stok_menipis"

export interface NotifikasiItem {
  id: string
  kind: NotifikasiKind
  href: string
  lamaMenit: number
  createdAt: string
  pesananId?: number
  nomorMeja?: string
  namaPelanggan?: string | null
  statusPesanan?: string
  statusPembayaran?: string
  totalHarga?: number
  jumlahItem?: number
  itemBelumDiantar?: number
  namaBahan?: string
  stokQty?: number
  satuan?: string
  statusStok?: string
}

export interface NotifikasiPesananTerlambat {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  statusPesanan: string
  statusPembayaran: string
  lamaMenit: number
  createdAt: string
}

const PRIORITAS_KIND: Record<NotifikasiKind, number> = {
  terlambat: 0,
  refund: 1,
  belum_dibayar: 2,
  perlu_diproses: 3,
  belum_diantar: 4,
  siap_selesai: 5,
  stok_menipis: 6,
}

const KIND_PER_ROLE: Record<RoleUser, NotifikasiKind[]> = {
  owner: [
    "terlambat",
    "belum_dibayar",
    "perlu_diproses",
    "belum_diantar",
    "siap_selesai",
    "refund",
    "stok_menipis",
  ],
  cashier: [
    "terlambat",
    "belum_dibayar",
    "perlu_diproses",
    "belum_diantar",
    "siap_selesai",
    "refund",
  ],
  waiter: ["terlambat", "perlu_diproses", "belum_diantar", "siap_selesai"],
  kitchen: ["terlambat", "perlu_diproses", "belum_diantar"],
  gudang: ["stok_menipis"],
}

function awalHari(now: Date) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function sweepTengahMalam(hariIni: Date) {
  try {
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

    for (const mejaId of mejaIds) {
      await finalizeReservasiUntukMeja(mejaId, "batal")
    }

    if (pesananTerbatal.count > 0) {
      await createLog(
        "CANCEL_ORDER_EXPIRED",
        `Auto-cancel ${pesananTerbatal.count} pesanan yang lewat tengah malam tanpa dibayar`
      )
      await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})
    }

    return pesananTerbatal.count
  } catch (error) {
    console.error("sweepTengahMalam error:", error)
    return 0
  }
}

type PesananNotifikasi = {
  id: number
  createdAt: Date
  mejaId: number
  namaPelanggan: string | null
  statusPesanan: string
  statusPembayaran: string
  totalHarga: number
  jumlahItem: number
  itemBelumDiantar: number
}

function klasifikasiPesanan(
  pesanan: PesananNotifikasi,
  batas: Date
): NotifikasiKind | null {
  const terlambat = pesanan.createdAt <= batas
  if (terlambat) return "terlambat"

  if (pesanan.statusPembayaran === "menunggu") return "belum_dibayar"

  if (pesanan.statusPembayaran === "berhasil") {
    if (pesanan.statusPesanan === "menunggu") return "perlu_diproses"
    if (pesanan.statusPesanan === "diproses") {
      return pesanan.itemBelumDiantar > 0 ? "belum_diantar" : "siap_selesai"
    }
  }

  return null
}

export async function getNotifikasiDashboard(): Promise<{
  items: NotifikasiItem[]
  total: number
}> {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined
  if (!role) return { items: [], total: 0 }

  const kinds = KIND_PER_ROLE[role] ?? KIND_PER_ROLE.waiter
  const now = new Date()
  const hariIni = awalHari(now)
  const batas = new Date(now.getTime() - BATAS_MENIT_TERLAMBAT * 60 * 1000)

  try {
    await sweepTengahMalam(hariIni)

    const [aktif, refund] = await Promise.all([
      prisma.pesanan.findMany({
        where: {
          deletedAt: null,
          statusPesanan: { in: ["menunggu", "diproses"] },
        },
        select: {
          id: true,
          createdAt: true,
          mejaId: true,
          namaPelanggan: true,
          statusPesanan: true,
          statusPembayaran: true,
          totalHarga: true,
          detailPesanan: {
            select: { jumlah: true, statusAntar: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.pesanan.findMany({
        where: {
          deletedAt: null,
          OR: [{ statusPesanan: "refund" }, { statusPembayaran: "refund" }],
        },
        select: {
          id: true,
          createdAt: true,
          mejaId: true,
          namaPelanggan: true,
          statusPesanan: true,
          statusPembayaran: true,
          totalHarga: true,
          detailPesanan: { select: { jumlah: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

    const mejaIds = [
      ...new Set([...aktif, ...refund].map((p) => p.mejaId)),
    ]
    const mejaList = await prisma.meja.findMany({
      where: { id: { in: mejaIds } },
      select: { id: true, nomorMeja: true },
    })
    const mejaMap = new Map(mejaList.map((m) => [m.id, m.nomorMeja]))

    const items: NotifikasiItem[] = []

    for (const p of aktif) {
      const jumlahItem = p.detailPesanan.reduce((s, d) => s + d.jumlah, 0)
      const itemBelumDiantar = p.detailPesanan
        .filter((d) => d.statusAntar === "belum")
        .reduce((s, d) => s + d.jumlah, 0)

      const data: PesananNotifikasi = {
        id: p.id,
        createdAt: p.createdAt,
        mejaId: p.mejaId,
        namaPelanggan: p.namaPelanggan,
        statusPesanan: p.statusPesanan,
        statusPembayaran: p.statusPembayaran,
        totalHarga: Number(p.totalHarga),
        jumlahItem,
        itemBelumDiantar,
      }

      const kind = klasifikasiPesanan(data, batas)
      if (!kind || !kinds.includes(kind)) continue

      items.push({
        id: `${kind}-${p.id}`,
        kind,
        href: `/dashboard/pesanan/${p.id}`,
        lamaMenit: Math.round(
          (now.getTime() - p.createdAt.getTime()) / 60000
        ),
        createdAt: p.createdAt.toISOString(),
        pesananId: p.id,
        nomorMeja: mejaMap.get(p.mejaId) ?? `#${p.mejaId}`,
        namaPelanggan: p.namaPelanggan,
        statusPesanan: p.statusPesanan,
        statusPembayaran: p.statusPembayaran,
        totalHarga: data.totalHarga,
        jumlahItem,
        itemBelumDiantar,
      })
    }

    if (kinds.includes("refund")) {
      for (const p of refund) {
        items.push({
          id: `refund-${p.id}`,
          kind: "refund",
          href: `/dashboard/pesanan/${p.id}`,
          lamaMenit: Math.round(
            (now.getTime() - p.createdAt.getTime()) / 60000
          ),
          createdAt: p.createdAt.toISOString(),
          pesananId: p.id,
          nomorMeja: mejaMap.get(p.mejaId) ?? `#${p.mejaId}`,
          namaPelanggan: p.namaPelanggan,
          statusPesanan: p.statusPesanan,
          statusPembayaran: p.statusPembayaran,
          totalHarga: Number(p.totalHarga),
          jumlahItem: p.detailPesanan.reduce((s, d) => s + d.jumlah, 0),
        })
      }
    }

    if (kinds.includes("stok_menipis")) {
      const stok = await prisma.stokBahan.findMany({
        where: {
          deletedAt: null,
          statusStok: { in: ["menipis", "habis"] },
        },
        select: {
          id: true,
          namaBahan: true,
          stokQty: true,
          satuan: true,
          statusStok: true,
        },
        orderBy: [{ statusStok: "asc" }, { namaBahan: "asc" }],
      })

      for (const s of stok) {
        items.push({
          id: `stok-${s.id}`,
          kind: "stok_menipis",
          href: "/dashboard/stok-bahan",
          lamaMenit: 0,
          createdAt: now.toISOString(),
          namaBahan: s.namaBahan,
          stokQty: Number(s.stokQty),
          satuan: s.satuan,
          statusStok: s.statusStok,
        })
      }
    }

    items.sort((a, b) => {
      const prioritas = PRIORITAS_KIND[a.kind] - PRIORITAS_KIND[b.kind]
      if (prioritas !== 0) return prioritas
      return b.lamaMenit - a.lamaMenit
    })

    return { items, total: items.length }
  } catch (error) {
    console.error("Notifikasi dashboard error:", error)
    return { items: [], total: 0 }
  }
}

export async function getNotifikasiTerlambat(): Promise<{
  orders: NotifikasiPesananTerlambat[]
  total: number
}> {
  const { items } = await getNotifikasiDashboard()

  const orders = items
    .filter((i) => i.kind === "terlambat" && i.pesananId !== undefined)
    .map((i) => ({
      id: i.pesananId as number,
      nomorMeja: i.nomorMeja ?? `#${i.pesananId}`,
      namaPelanggan: i.namaPelanggan ?? null,
      statusPesanan: i.statusPesanan ?? "menunggu",
      statusPembayaran: i.statusPembayaran ?? "menunggu",
      lamaMenit: i.lamaMenit,
      createdAt: i.createdAt,
    }))

  return { orders, total: orders.length }
}
