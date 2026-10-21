"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { triggerPusher, ORDERS_CHANNEL, PESANAN_EVENTS } from "@/lib/pusher"
import { StatusPesanan } from "@prisma/client"

export interface RefundBuktiInput {
  url: string
  fileKey?: string | null
}

export interface RefundInfo {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  totalHarga: number
  statusPesanan: string
  statusPembayaran: string
  metodePembayaran: string | null
  refundCatatan: string | null
  refundedAt: Date | null
  refundedByUsername: string | null
  bukti: Array<{ id: number; fotoUrl: string; fileKey: string | null }>
}

async function requireKasir() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
    return null
  }
  return session
}

/**
 * Ambil detail refund sebuah pesanan (kasir & owner boleh lihat).
 */
export async function getRefundInfo(pesananId: number) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'cashier' && session.user.role !== 'owner')) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
    include: {
      meja: true,
      refundedBy: true,
      refundBukti: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }

  return {
    id: pesanan.id,
    nomorMeja: pesanan.meja.nomorMeja,
    namaPelanggan: pesanan.namaPelanggan,
    totalHarga: Number(pesanan.totalHarga),
    statusPesanan: pesanan.statusPesanan,
    statusPembayaran: pesanan.statusPembayaran,
    metodePembayaran: pesanan.metodePembayaran,
    refundCatatan: pesanan.refundCatatan,
    refundedAt: pesanan.refundedAt,
    refundedByUsername: pesanan.refundedBy?.username || null,
    bukti: pesanan.refundBukti.map(b => ({
      id: b.id,
      fotoUrl: b.fotoUrl,
      fileKey: b.fileKey,
    })),
  } as RefundInfo
}

/**
 * Kasir mengajukan refund. Wajib disertai minimal 1 bukti foto.
 * Status pesanan & pembayaran menjadi 'refund'. Hanya sekali per pesanan.
 */
export async function ajukanRefund(
  pesananId: number,
  catatan: string,
  bukti: RefundBuktiInput[]
) {
  try {
    const session = await requireKasir()
    if (!session) return { error: "Unauthorized" }

    const trimmedCatatan = catatan?.trim() || ""
    if (trimmedCatatan.length < 3) {
      return { error: "Catatan refund wajib diisi (minimal 3 karakter)" }
    }

    const buktiValid = (bukti || []).filter(b => b?.url)
    if (buktiValid.length === 0) {
      return { error: "Bukti foto refund wajib diunggah minimal 1 foto" }
    }

    const pesanan = await prisma.pesanan.findFirst({
      where: { id: pesananId, deletedAt: null },
    })

    if (!pesanan) return { error: "Pesanan tidak ditemukan" }

    if (pesanan.statusPembayaran === 'refund') {
      return { error: "Pesanan ini sudah di-refund" }
    }

    if (pesanan.statusPembayaran !== 'berhasil') {
      return { error: "Hanya pesanan yang sudah dibayar yang dapat di-refund" }
    }

    if (pesanan.statusPesanan === 'dibatalkan') {
      return { error: "Pesanan sudah dibatalkan" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.refundBukti.createMany({
        data: buktiValid.map(b => ({
          pesananId,
          fotoUrl: b.url,
          fileKey: b.fileKey || null,
        })),
      })

      await tx.pesanan.update({
        where: { id: pesananId },
        data: {
          statusPembayaran: 'refund',
          statusPesanan: 'refund' as StatusPesanan,
          refundCatatan: trimmedCatatan,
          refundedAt: new Date(),
          refundedById: parseInt(session.user.id),
          updatedAt: new Date(),
        },
      })
    })

    await createLog(
      'REFUND_ORDER',
      `Refund pesanan #${pesananId} (meja ${pesanan.mejaId}) sebesar Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')} dengan ${buktiValid.length} bukti foto — ${trimmedCatatan}`
    )

    await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/pesanan")

    return { success: true }
  } catch (error) {
    console.error("ajukanRefund error:", error)
    return { error: "Terjadi kesalahan saat memproses refund" }
  }
}

/**
 * Hapus satu bukti foto refund (kasir). Dipakai sebelum refund disimpan.
 */
export async function deleteRefundBukti(buktiId: number) {
  const session = await requireKasir()
  if (!session) return { error: "Unauthorized" }

  const bukti = await prisma.refundBukti.findUnique({ where: { id: buktiId } })
  if (!bukti) return { error: "Bukti tidak ditemukan" }

  if (bukti.fileKey) {
    try {
      const { UTApi } = await import('uploadthing/server')
      const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN })
      await utapi.deleteFiles(bukti.fileKey)
    } catch (error) {
      console.error("Delete refund bukti from UploadThing failed:", error)
    }
  }

  await prisma.refundBukti.delete({ where: { id: buktiId } })

  revalidatePath("/dashboard/kasir")
  return { success: true }
}
