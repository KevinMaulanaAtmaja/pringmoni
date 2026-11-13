import { Prisma, StatusReservasi, StatusMeja } from "@prisma/client"
import crypto from "crypto"
import prisma from "@/lib/prisma"

export type ReservasiOutcome = "selesai" | "batal"

/**
 * Jendela waktu konfirmasi kedatangan untuk reservasi yang belum dikonfirmasi,
 * dihitung dari waktu kedatangan (bukan dari waktu pembuatan reservasi).
 * Berlaku untuk reservasi staf (offline) maupun customer (online).
 * Bisa diatur lewat env `RESERVASI_EXPIRY_JAM` (default 3 jam).
 */
export const EXPIRY_JAM_DEFAULT = (() => {
  const raw = Number(process.env.RESERVASI_EXPIRY_JAM)
  return Number.isFinite(raw) && raw > 0 && raw <= 48 ? raw : 3
})()

/** Batas hari ke depan yang boleh dipilih customer untuk waktu kedatangan. */
export const MAKS_HARI_KE_DEPAN = 7

/**
 * Kode reservasi pendek untuk customer (mis. "7K2P9Q"), unik di DB.
 * Karakter ambigu (0/O, 1/I) dihindari agar mudah dibacakan manual.
 */
export function generateKodeReservasi(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let kode = ""
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    kode += chars[bytes[i] % chars.length]
  }
  return `RSV-${kode}`
}

/**
 * Expiry lazy tanpa auth — aman dipanggil dari halaman customer.
 * Hanya memproses reservasi online yang melewati batas konfirmasi.
 */
export async function expireReservasiLazy() {
  const now = new Date()
  const expired = await prisma.reservasi.findMany({
    where: {
      statusReservasi: StatusReservasi.menunggu_kedatangan,
      sumber: "online" as const,
      batasKonfirmasi: { lt: now },
    },
    select: { id: true, mejaId: true },
    take: 100,
  })

  if (expired.length === 0) return 0

  for (const reservasi of expired) {
    await prisma.$transaction([
      prisma.reservasi.update({
        where: { id: reservasi.id },
        data: { statusReservasi: StatusReservasi.expired, updatedAt: now },
      }),
      prisma.meja.updateMany({
        where: { id: reservasi.mejaId, statusMeja: StatusMeja.dipesan },
        data: { statusMeja: StatusMeja.kosong },
      }),
    ])
  }
  return expired.length
}

export async function finalizeReservasiUntukMeja(
  mejaId: number,
  outcome: ReservasiOutcome,
  options?: { client?: Prisma.TransactionClient }
) {
  const client = (options?.client ?? (prisma as unknown as Prisma.TransactionClient)) as Prisma.TransactionClient

  const reservasi = await client.reservasi.findFirst({
    where: {
      mejaId,
      statusReservasi: { in: [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      statusReservasi: true,
      pesananId: true,
      catatan: true,
    },
  })

  if (!reservasi) return null

  const now = new Date()
  const data: Prisma.ReservasiUncheckedUpdateInput = { updatedAt: now }

  if (outcome === "selesai") {
    if (reservasi.statusReservasi !== StatusReservasi.dikonfirmasi) return null
    data.statusReservasi = StatusReservasi.selesai
    data.selesaiAt = now
    data.pesananId = reservasi.pesananId ?? null
  } else {
    data.statusReservasi = StatusReservasi.batal
    data.cancelledAt = now
  }

  return client.reservasi.update({
    where: { id: reservasi.id },
    data,
  })
}
