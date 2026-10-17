"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import {
  HANYA_KASIR,
  hitungTotalShift,
  PESANAN_TANPA_SHIFT,
  tanggalShiftSekarang,
  validasiNominal,
} from "@/lib/shift"
import type { ShiftAktif, ShiftRiwayat } from "@/types"

type SaranUangAwal = {
  shiftId: number
  nominal: number
  dariKasir: string
}

type HasilShiftAktif = {
  shift: ShiftAktif | null
  /** Hanya kasir yang boleh membuka/menutup shift; owner sekadar memantau. */
  canManage: boolean
  /**
   * Uang akhir shift tertutup terakhir. Aturan 7: nominal ini boleh jadi uang
   * awal shift berikutnya, tapi tetap tercatat sebagai dua shift terpisah.
   */
  saranUangAwal: SaranUangAwal | null
}

const selectShift = {
  id: true,
  kasirId: true,
  tanggal: true,
  waktuMasuk: true,
  waktuKeluar: true,
  uangAwal: true,
  uangAkhir: true,
  statusShift: true,
  totalTransaksi: true,
  totalPendapatan: true,
  totalTunai: true,
  totalNonTunai: true,
  selisihKas: true,
  keterangan: true,
} as const

function keShiftAktif(row: Awaited<ReturnType<typeof ambilShiftRow>>): ShiftAktif | null {
  if (!row) return null
  return {
    id: row.id,
    kasirId: row.kasirId,
    kasirUsername: row.kasir.username,
    tanggal: row.tanggal.toISOString().slice(0, 10),
    waktuMasuk: row.waktuMasuk.toISOString(),
    waktuKeluar: row.waktuKeluar ? row.waktuKeluar.toISOString() : null,
    uangAwal: Number(row.uangAwal),
    uangAkhir: row.uangAkhir ? Number(row.uangAkhir) : null,
    statusShift: row.statusShift,
    totalTransaksi: row.totalTransaksi,
    totalPendapatan: Number(row.totalPendapatan),
    totalTunai: Number(row.totalTunai),
    totalNonTunai: Number(row.totalNonTunai),
    selisihKas: row.selisihKas ? Number(row.selisihKas) : null,
    keterangan: row.keterangan,
  }
}

function ambilShiftRow(kasirId: number, statusShift: "ACTIVE" | "CLOSED") {
  return prisma.shiftKasir.findFirst({
    where: { kasirId, statusShift },
    select: { ...selectShift, kasir: { select: { username: true } } },
  })
}

/** Shift milik kasir yang sedang masuk, lengkap dengan total berjalan. */
export async function getShiftAktif(): Promise<
  HasilShiftAktif | { error: string }
> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const canManage = session.user.role === "cashier"

  if (!canManage) {
    // Owner/waiter hanya memantau lewat halaman riwayat, bukan lewat sini.
    return { shift: null, canManage: false, saranUangAwal: null }
  }

  const kasirId = parseInt(session.user.id, 10)
  if (Number.isNaN(kasirId)) {
    return { error: "Unauthorized" }
  }

  const row = await ambilShiftRow(kasirId, "ACTIVE")
  const shift = keShiftAktif(row)

  // Shift ACTIVE belum menyimpan total final, jadi dihitung langsung dari pesanan.
  if (shift) {
    const totals = await hitungTotalShift(shift.id)
    shift.totalTransaksi = totals.totalTransaksi
    shift.totalPendapatan = totals.totalPendapatan
    shift.totalTunai = totals.totalTunai
    shift.totalNonTunai = totals.totalNonTunai
  }

  const shiftTertutupTerakhir = await prisma.shiftKasir.findFirst({
    where: { statusShift: "CLOSED", uangAkhir: { not: null } },
    select: {
      id: true,
      uangAkhir: true,
      kasir: { select: { username: true } },
    },
    orderBy: { waktuKeluar: "desc" },
  })

  return {
    shift,
    canManage: true,
    saranUangAwal: shiftTertutupTerakhir?.uangAkhir
      ? {
          shiftId: shiftTertutupTerakhir.id,
          nominal: Number(shiftTertutupTerakhir.uangAkhir),
          dariKasir: shiftTertutupTerakhir.kasir.username,
        }
      : null,
  }
}

export async function bukaShift(
  uangAwal: number,
  sumberShiftId?: number | null
): Promise<{ success: true; shiftId: number } | { error: string }> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Unauthorized" }
    }
    if (session.user.role !== "cashier") {
      return { error: HANYA_KASIR }
    }

    const kasirId = parseInt(session.user.id, 10)
    if (Number.isNaN(kasirId)) {
      return { error: "Unauthorized" }
    }

    const nominal = validasiNominal(uangAwal)
    if ("error" in nominal) {
      return nominal
    }

    const shiftAktif = await prisma.shiftKasir.findFirst({
      where: { kasirId, statusShift: "ACTIVE" },
      select: { id: true },
    })
    if (shiftAktif) {
      return {
        error: "Shift kamu masih aktif. Tutup shift yang sedang berjalan sebelum membuka shift baru.",
      }
    }

    // Aturan 7: uang kas boleh gelap dari shift tertutup milik kasir lain,
    // asal shift itu benar-benar sudah tertutup dan uang akhirnya tercatat.
    let sumberValid: number | null = null
    if (sumberShiftId != null) {
      const sumber = await prisma.shiftKasir.findUnique({
        where: { id: sumberShiftId },
        select: { id: true, statusShift: true, uangAkhir: true, kasirId: true },
      })

      if (!sumber || sumber.statusShift !== "CLOSED" || sumber.uangAkhir === null) {
        return { error: "Shift sumber uang kas tidak valid atau belum ditutup" }
      }
      if (sumber.kasirId === kasirId) {
        return { error: "Shift sumber uang kas harus milik kasir lain" }
      }
      sumberValid = sumber.id
    }

    const shift = await prisma.shiftKasir.create({
      data: {
        kasirId,
        tanggal: tanggalShiftSekarang(),
        waktuMasuk: new Date(),
        uangAwal: nominal.nilai,
        statusShift: "ACTIVE",
        // Unik per kasir selama ACTIVE — inilah yang menjamin satu kasir hanya
        // punya satu shift aktif, walau ada permintaan bersamaan.
        aktifKey: kasirId,
        sumberShiftId: sumberValid,
      },
      select: { id: true },
    })

    await createLog(
      "OPEN_SHIFT",
      `Shift kasir dibuka oleh ${session.user.username} (${session.user.role}) — uang awal Rp${nominal.nilai.toLocaleString("id-ID")}${
        sumberValid ? ` (dari serah terima shift #${sumberValid})` : ""
      }`
    )

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/shift")

    return { success: true, shiftId: shift.id }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        error: "Shift kamu masih aktif. Tutup shift yang sedang berjalan sebelum membuka shift baru.",
      }
    }
    console.error("bukaShift error:", error)
    return { error: "Terjadi kesalahan saat membuka shift" }
  }
}

export async function tutupShift(
  uangAkhir: number,
  keterangan?: string | null
): Promise<
  | {
      success: true
      ringkasan: {
        totalTransaksi: number
        totalPendapatan: number
        totalTunai: number
        totalNonTunai: number
        uangHarapAkhir: number
        selisihKas: number
      }
    }
  | { error: string }
> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Unauthorized" }
    }
    if (session.user.role !== "cashier") {
      return { error: HANYA_KASIR }
    }

    const kasirId = parseInt(session.user.id, 10)
    if (Number.isNaN(kasirId)) {
      return { error: "Unauthorized" }
    }

    const nominal = validasiNominal(uangAkhir)
    if ("error" in nominal) {
      return nominal
    }

    const shift = await prisma.shiftKasir.findFirst({
      where: { kasirId, statusShift: "ACTIVE" },
      select: { id: true, uangAwal: true },
    })
    if (!shift) {
      return { error: PESANAN_TANPA_SHIFT }
    }

    const totals = await hitungTotalShift(shift.id)
    const uangAwal = Number(shift.uangAwal)
    // Uang yang seharusnya ada di laci = modal awal + kas yang masuk secara tunai.
    const uangHarapAkhir = uangAwal + totals.totalTunai
    const selisihKas = nominal.nilai - uangHarapAkhir

    await prisma.shiftKasir.update({
      where: { id: shift.id },
      data: {
        statusShift: "CLOSED",
        waktuKeluar: new Date(),
        uangAkhir: nominal.nilai,
        totalTransaksi: totals.totalTransaksi,
        totalPendapatan: totals.totalPendapatan,
        totalTunai: totals.totalTunai,
        totalNonTunai: totals.totalNonTunai,
        selisihKas,
        keterangan: keterangan?.trim() ? keterangan.trim() : null,
        updatedAt: new Date(),
        aktifKey: null,
      },
    })

    const selisihTeks =
      selisihKas === 0
        ? "sesuai"
        : selisihKas > 0
          ? `lebih Rp${selisihKas.toLocaleString("id-ID")}`
          : `kurang Rp${Math.abs(selisihKas).toLocaleString("id-ID")}`

    await createLog(
      "CLOSE_SHIFT",
      `Shift kasir ditutup oleh ${session.user.username} — ${totals.totalTransaksi} transaksi, pendapatan Rp${totals.totalPendapatan.toLocaleString("id-ID")}, uang awal Rp${uangAwal.toLocaleString("id-ID")}, uang akhir Rp${nominal.nilai.toLocaleString("id-ID")} (${selisihTeks})`
    )

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/shift")

    return {
      success: true,
      ringkasan: {
        ...totals,
        uangHarapAkhir,
        selisihKas,
      },
    }
  } catch (error) {
    console.error("tutupShift error:", error)
    return { error: "Terjadi kesalahan saat menutup shift" }
  }
}

/**
 * Riwayat shift. Kasir hanya boleh melihat miliknya sendiri (aturan 5),
 * owner boleh melihat semua untuk monitoring.
 */
export async function getRiwayatShift(filter?: {
  period?: "today" | "week" | "month" | "all"
  kasirUsername?: string
}): Promise<{ shifts: ShiftRiwayat[] } | { error: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }
  if (session.user.role === "waiter") {
    return { error: "Unauthorized" }
  }

  const isOwner = session.user.role === "owner"
  const where: Record<string, unknown> = {}

  if (!isOwner) {
    where.kasirId = parseInt(session.user.id, 10)
  } else if (filter?.kasirUsername && filter.kasirUsername !== "all") {
    where.kasir = { username: filter.kasirUsername }
  }

  const period = filter?.period || "all"
  if (period !== "all") {
    const now = new Date()
    const start = new Date(now)
    if (period === "today") {
      start.setHours(0, 0, 0, 0)
    } else if (period === "week") {
      start.setDate(now.getDate() - 7)
    } else {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
    }
    where.waktuMasuk = { gte: start }
  }

  const rows = await prisma.shiftKasir.findMany({
    where,
    select: {
      ...selectShift,
      kasir: { select: { username: true } },
      sumberShift: { select: { id: true, kasir: { select: { username: true } } } },
    },
    orderBy: [{ statusShift: "asc" }, { waktuMasuk: "desc" }],
    take: 200,
  })

  return {
    shifts: rows.map((row) => {
      const base = keShiftAktif(row)!
      return {
        ...base,
        uangHarapAkhir: Number(row.uangAwal) + Number(row.totalTunai),
        sumberShiftId: row.sumberShift?.id ?? null,
        sumberShiftKasir: row.sumberShift?.kasir.username ?? null,
      }
    }),
  }
}

/** Daftar kasir — hanya untuk filter halaman riwayat milik owner. */
export async function getDaftarKasir(): Promise<{ kasir: string[] } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { error: "Unauthorized" }
  }

  const kasir = await prisma.users.findMany({
    where: { role: "cashier" },
    select: { username: true },
    orderBy: { username: "asc" },
  })

  return { kasir: kasir.map((k) => k.username) }
}