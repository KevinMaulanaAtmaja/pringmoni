"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import {
  HANYA_KASIR,
  hitungTotalShift,
  PESANAN_TANPA_SHIFT,
  validasiNominal,
  totalKasKeluar,
  uangHarapAkhir,
  requireShiftAktif,
  tanggalShiftSekarang,
} from "@/lib/shift"
import {
  deskripsiJadwal,
  formatJam,
  slotSaatIni,
  rentangBentrok,
} from "@/lib/jadwal"
import type { JadwalShift, KasKeluarItem, ShiftAktif, ShiftRiwayat } from "@/types"

type SaranUangAwal = { shiftId: number; nominal: number; dariKasir: string }

type SlotSaatIni = { id: number; nama: string; jamMulai: number; jamSelesai: number } | null

type HasilShiftAktif = {
  shift: ShiftAktif | null
  canManage: boolean
  saranUangAwal: SaranUangAwal | null
  slotSaatIni: SlotSaatIni
}

type RingkasanTutup = {
  totalTransaksi: number
  totalPendapatan: number
  totalTunai: number
  totalNonTunai: number
  totalKasKeluar: number
  uangHarapAkhir: number
  selisihKas: number
}

type HasilTutupShift =
  | { success: true; ringkasan: RingkasanTutup }
  | { warning: string; sisaPesanan: number }
  | { error: string }

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
  jadwalShiftId: true,
  autoClosed: true,
} as const

const relasiShift = {
  kasir: { select: { username: true } },
  jadwalShift: { select: { id: true, nama: true, jamMulai: true, jamSelesai: true } },
  kasKeluar: { select: { id: true, nominal: true } },
} as const

function ambilShiftRow(kasirId: number, statusShift: "ACTIVE" | "CLOSED") {
  return prisma.shiftKasir.findFirst({
    where: { kasirId, statusShift },
    select: { ...selectShift, ...relasiShift },
  })
}

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
    totalKasKeluar: row.kasKeluar.reduce((s, k) => s + Number(k.nominal), 0),
    selisihKas: row.selisihKas ? Number(row.selisihKas) : null,
    keterangan: row.keterangan,
    jadwalShiftId: row.jadwalShiftId,
    namaJadwal: row.jadwalShift?.nama ?? null,
    autoClosed: row.autoClosed,
  }
}

/**
 * Tutup otomatis semua shift ACTIVE yang tanggalnya sudah lewat hari ini
 * (dibuka sebelum 00:00 dan belum ditutup). Diatur selisih kas = 0 dan
 * uangAkhir = uang harap akhir, ditandai autoClosed = true.
 */
export async function autoCloseShifts(): Promise<number> {
  const hariIni = tanggalShiftSekarang()
  const basi = await prisma.shiftKasir.findMany({
    where: { statusShift: "ACTIVE", tanggal: { lt: hariIni } },
    select: {
      id: true,
      uangAwal: true,
      kasir: { select: { username: true } },
    },
  })

  const now = new Date()
  for (const s of basi) {
    const totals = await hitungTotalShift(s.id)
    const kasKeluar = await totalKasKeluar(s.id)
    const uangHarap = uangHarapAkhir(Number(s.uangAwal), totals.totalTunai, kasKeluar)

    await prisma.shiftKasir.update({
      where: { id: s.id },
      data: {
        statusShift: "CLOSED",
        waktuKeluar: now,
        uangAkhir: uangHarap,
        totalTransaksi: totals.totalTransaksi,
        totalPendapatan: totals.totalPendapatan,
        totalTunai: totals.totalTunai,
        totalNonTunai: totals.totalNonTunai,
        selisihKas: 0,
        keterangan: "Ditutup otomatis oleh sistem (melewati batas hari 00:00)",
        autoClosed: true,
        aktifKey: null,
        slotAktifKey: null,
        updatedAt: now,
      },
    })

    await createLog(
      "AUTO_CLOSE_SHIFT",
      `Shift #${s.id} ditutup otomatis oleh sistem pada 00:00 — ${totals.totalTransaksi} transaksi, pendapatan Rp${totals.totalPendapatan.toLocaleString("id-ID")}, uang harap akhir Rp${uangHarap.toLocaleString("id-ID")} (kasir: ${s.kasir.username})`,
      null
    )
  }
  return basi.length
}

export async function getShiftAktif(): Promise<HasilShiftAktif | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }
  const canManage = session.user.role === "cashier"

  await autoCloseShifts()

  if (!canManage) {
    return { shift: null, canManage: false, saranUangAwal: null, slotSaatIni: null }
  }

  const kasirId = parseInt(session.user.id, 10)
  if (Number.isNaN(kasirId)) return { error: "Unauthorized" }

  const row = await ambilShiftRow(kasirId, "ACTIVE")
  const shift = keShiftAktif(row)

  if (shift) {
    const totals = await hitungTotalShift(shift.id)
    shift.totalTransaksi = totals.totalTransaksi
    shift.totalPendapatan = totals.totalPendapatan
    shift.totalTunai = totals.totalTunai
    shift.totalNonTunai = totals.totalNonTunai
    shift.totalKasKeluar = await totalKasKeluar(shift.id)
  }

  const jadwal = await prisma.jadwalShift.findMany({
    where: { aktif: true },
    select: { id: true, nama: true, jamMulai: true, jamSelesai: true },
    orderBy: { urutan: "asc" },
  })
  const slot = slotSaatIni(jadwal)

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
    slotSaatIni: slot
      ? { id: slot.id, nama: slot.nama, jamMulai: slot.jamMulai, jamSelesai: slot.jamSelesai }
      : null,
  }
}

export async function bukaShift(
  uangAwal: number,
  sumberShiftId?: number | null
): Promise<{ success: true; shiftId: number } | { error: string }> {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }
    if (session.user.role !== "cashier") return { error: HANYA_KASIR }
    const kasirId = parseInt(session.user.id, 10)
    if (Number.isNaN(kasirId)) return { error: "Unauthorized" }

    const nominal = validasiNominal(uangAwal)
    if ("error" in nominal) return nominal

    await autoCloseShifts()

    const shiftAktif = await prisma.shiftKasir.findFirst({
      where: { kasirId, statusShift: "ACTIVE" },
      select: { id: true },
    })
    if (shiftAktif) {
      return {
        error: "Shift kamu masih aktif. Tutup shift yang sedang berjalan sebelum membuka shift baru.",
      }
    }

    const jadwal = await prisma.jadwalShift.findMany({
      where: { aktif: true },
      select: { id: true, nama: true, jamMulai: true, jamSelesai: true },
      orderBy: { urutan: "asc" },
    })
    if (jadwal.length === 0) {
      return {
        error: "Jadwal shift belum diatur. Hubungi owner untuk membuat jadwal shift.",
      }
    }
    const slot = slotSaatIni(jadwal)
    if (!slot) {
      return {
        error: `Sekarang di luar jam kerja. Jam shift: ${deskripsiJadwal(jadwal)}.`,
      }
    }

    const slotDiisi = await prisma.shiftKasir.findFirst({
      where: { statusShift: "ACTIVE", jadwalShiftId: slot.id },
      select: { id: true, kasir: { select: { username: true } } },
    })
    if (slotDiisi) {
      return {
        error: `Slot ${slot.nama} sedang diisi kasir ${slotDiisi.kasir.username}. Satu slot hanya boleh diisi satu kasir.`,
      }
    }

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
        aktifKey: kasirId,
        jadwalShiftId: slot.id,
        slotAktifKey: `slot:${slot.id}`,
        sumberShiftId: sumberValid,
      },
      select: { id: true },
    })

    await createLog(
      "OPEN_SHIFT",
      `Shift kasir dibuka oleh ${session.user.username} (${session.user.role}) — uang awal Rp${nominal.nilai.toLocaleString("id-ID")} (slot ${slot.nama} ${formatJam(slot.jamMulai)}-${formatJam(slot.jamSelesai)})${
        sumberValid ? ` (dari serah terima shift #${sumberValid})` : ""
      }`
    )

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/shift")

    return { success: true, shiftId: shift.id }
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
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
  keterangan?: string | null,
  konfirmasiSisaPesanan?: boolean
): Promise<HasilTutupShift> {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }
    if (session.user.role !== "cashier") return { error: HANYA_KASIR }
    const kasirId = parseInt(session.user.id, 10)
    if (Number.isNaN(kasirId)) return { error: "Unauthorized" }

    const nominal = validasiNominal(uangAkhir)
    if ("error" in nominal) return nominal

    const shift = await prisma.shiftKasir.findFirst({
      where: { kasirId, statusShift: "ACTIVE" },
      select: { ...selectShift, ...relasiShift },
    })
    if (!shift) return { error: PESANAN_TANPA_SHIFT }

    const totals = await hitungTotalShift(shift.id)
    const kasKeluar = await totalKasKeluar(shift.id)
    const uangHarap = uangHarapAkhir(Number(shift.uangAwal), totals.totalTunai, kasKeluar)
    const selisihKas = nominal.nilai - uangHarap

    if (selisihKas !== 0 && (!keterangan || keterangan.trim() === "")) {
      return {
        error: `Selisih kas Rp${selisihKas.toLocaleString("id-ID")} tidak boleh kosong. Silakan isi keterangan.`
      }
    }

    const sisa = await prisma.pesanan.count({
      where: {
        deletedAt: null,
        OR: [
          { statusPembayaran: "menunggu" },
          { statusPesanan: { in: ["menunggu", "diproses"] } },
        ],
      },
    })
    if (sisa > 0 && !konfirmasiSisaPesanan) {
      return {
        warning: `Masih ada ${sisa} pesanan belum lunas/proses. Yakin ingin menutup shift?`,
        sisaPesanan: sisa,
      }
    }

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
        keterangan: keterangan?.trim() ?? null,
        updatedAt: new Date(),
        aktifKey: null,
        slotAktifKey: null,
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
      `Shift kasir ditutup oleh ${session.user.username} — ${totals.totalTransaksi} transaksi, pendapatan Rp${totals.totalPendapatan.toLocaleString("id-ID")}, uang awal Rp${Number(shift.uangAwal).toLocaleString("id-ID")}, uang akhir Rp${nominal.nilai.toLocaleString("id-ID")} (${selisihTeks})`
    )

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/shift")

    return {
      success: true,
      ringkasan: {
        totalTransaksi: totals.totalTransaksi,
        totalPendapatan: totals.totalPendapatan,
        totalTunai: totals.totalTunai,
        totalNonTunai: totals.totalNonTunai,
        totalKasKeluar: kasKeluar,
        uangHarapAkhir: uangHarap,
        selisihKas,
      },
    }
  } catch (error) {
    console.error("tutupShift error:", error)
    return { error: "Terjadi kesalahan saat menutup shift" }
  }
}

export async function getRiwayatShift(filter?: {
  period?: "today" | "week" | "month" | "all"
  kasirUsername?: string
}): Promise<{ shifts: ShiftRiwayat[] } | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }
  if (session.user.role !== "owner" && session.user.role !== "cashier") {
    return { error: "Riwayat shift hanya untuk kasir dan owner" }
  }

  await autoCloseShifts()

  const isOwner = session.user.role === "owner"
  const where: Record<string, unknown> = {}

  if (!isOwner) {
    const kasirId = parseInt(session.user.id, 10)
    if (Number.isNaN(kasirId)) return { error: "Unauthorized" }
    where.kasirId = kasirId
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
      // "Minggu Ini" = sejak hari Senin minggu berjalan.
      start.setHours(0, 0, 0, 0)
      const hariDalamMinggu = (start.getDay() + 6) % 7
      start.setDate(start.getDate() - hariDalamMinggu)
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
      ...relasiShift,
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
        uangHarapAkhir: uangHarapAkhir(
          Number(row.uangAwal),
          Number(row.totalTunai),
          row.kasKeluar.reduce((s, k) => s + Number(k.nominal), 0)
        ),
        sumberShiftId: row.sumberShift?.id ?? null,
        sumberShiftKasir: row.sumberShift?.kasir.username ?? null,
      }
    }),
  }
}

export async function getSisaPesanan(): Promise<{ sisa: number } | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }
  const sisa = await prisma.pesanan.count({
    where: {
      deletedAt: null,
      OR: [
        { statusPembayaran: "menunggu" },
        { statusPesanan: { in: ["menunggu", "diproses"] } },
      ],
    },
  })
  return { sisa }
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

// ── Jadwal slot shift (owner) ─────────────────────────────────────────────────

type InputJadwal = {
  nama: string
  jamMulai: number
  jamSelesai: number
  urutan?: number
  aktif?: boolean
}

function validasiJadwal(
  input: InputJadwal,
  daftar: Array<{ id: number; jamMulai: number; jamSelesai: number; nama: string }>
): { error: string } | null {
  const nama = input.nama.trim()
  if (!nama || nama.length > 40) return { error: "Nama slot harus diisi (maks 40 karakter)" }
  if (!Number.isInteger(input.jamMulai) || input.jamMulai < 0 || input.jamMulai >= 1440) {
    return { error: "Jam mulai harus antara 00:00–23:59" }
  }
  if (!Number.isInteger(input.jamSelesai) || input.jamSelesai < 1 || input.jamSelesai > 1440) {
    return { error: "Jam selesai harus antara 00:01–24:00" }
  }
  if (input.jamMulai >= input.jamSelesai) {
    return { error: "Jam selesai harus lebih besar dari jam mulai" }
  }
  const maksSlot = 8
  if (daftar.filter((s) => s.nama === nama).length === 0 && daftar.filter(() => true).length >= maksSlot) {
    return { error: `Maksimal ${maksSlot} slot jadwal aktif` }
  }
  for (const existing of daftar) {
    if (existing.nama === nama) continue
    if (rentangBentrok({ jamMulai: input.jamMulai, jamSelesai: input.jamSelesai }, existing)) {
      return { error: `Bentrok dengan slot "${existing.nama}" (${formatJam(existing.jamMulai)}-${formatJam(existing.jamSelesai)})` }
    }
  }
  return null
}

export async function getJadwalShift(): Promise<{ jadwal: JadwalShift[] } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") return { error: "Unauthorized" }
  const rows = await prisma.jadwalShift.findMany({
    orderBy: [{ urutan: "asc" }, { jamMulai: "asc" }],
  })
  return {
    jadwal: rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      jamMulai: r.jamMulai,
      jamSelesai: r.jamSelesai,
      urutan: r.urutan,
      aktif: r.aktif,
    })),
  }
}

export async function simpanJadwalShift(
  input: InputJadwal
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") return { error: "Unauthorized" }
  const err = validasiJadwal(input, await semuaJadwal())
  if (err) return { error: err.error }

  const urutan = input.urutan ?? (await maxUrutan() + 1)

  await prisma.jadwalShift.create({
    data: {
      nama: input.nama.trim(),
      jamMulai: input.jamMulai,
      jamSelesai: input.jamSelesai,
      urutan,
      aktif: input.aktif ?? true,
    },
  })

  revalidatePath("/dashboard/shift")
  return { success: true }
}

export async function updateJadwalShift(
  id: number,
  input: InputJadwal
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") return { error: "Unauthorized" }

  const daftar = await semuaJadwal()
  const err = validasiJadwal(input, daftar.filter((s) => s.id !== id))
  if (err) return { error: err.error }

  await prisma.jadwalShift.update({
    where: { id },
    data: {
      nama: input.nama.trim(),
      jamMulai: input.jamMulai,
      jamSelesai: input.jamSelesai,
      urutan: input.urutan ?? 1,
      aktif: input.aktif ?? true,
    },
  })

  revalidatePath("/dashboard/shift")
  return { success: true }
}

export async function hapusJadwalShift(id: number): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") return { error: "Unauthorized" }

  const terpakai = await prisma.shiftKasir.count({ where: { jadwalShiftId: id } })
  if (terpakai > 0) {
    return {
      error: "Slot sudah digunakan riwayat shift. Nonaktifkan saja agar riwayat tetap tercatat.",
    }
  }

  await prisma.jadwalShift.delete({ where: { id } })
  revalidatePath("/dashboard/shift")
  return { success: true }
}

async function semuaJadwal(): Promise<Array<{ id: number; jamMulai: number; jamSelesai: number; nama: string }>> {
  const rows = await prisma.jadwalShift.findMany({
    select: { id: true, jamMulai: true, jamSelesai: true, nama: true },
  })
  return rows
}

async function maxUrutan(): Promise<number> {
  const row = await prisma.jadwalShift.aggregate({ _max: { urutan: true } })
  return row._max.urutan ?? 0
}

// ── Kas keluar (kasir, milik shift aktif sendiri) ─────────────────────────────

export async function getKasKeluarAktif(): Promise<{ items: KasKeluarItem[]; total: number } | { error: string }> {
  const shift = await requireShiftAktif()
  if ("error" in shift) return shift

  const rows = await prisma.kasKeluar.findMany({
    where: { shiftId: shift.shiftId },
    orderBy: { createdAt: "desc" },
    select: { id: true, nominal: true, keterangan: true, createdAt: true, user: { select: { username: true } } },
  })

  return {
    items: rows.map((r) => ({
      id: r.id,
      nominal: Number(r.nominal),
      keterangan: r.keterangan,
      createdAt: r.createdAt.toISOString(),
      userName: r.user?.username ?? null,
    })),
    total: rows.reduce((s, r) => s + Number(r.nominal), 0),
  }
}

export async function tambahKasKeluar(
  nominal: number,
  keterangan: string
): Promise<{ success: true; item: KasKeluarItem } | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "cashier") return { error: "Unauthorized" }

  const kasirId = parseInt(session.user.id, 10)
  if (Number.isNaN(kasirId)) return { error: "Unauthorized" }

  const validasi = validasiNominal(nominal)
  if ("error" in validasi) return validasi

  const shift = await prisma.shiftKasir.findFirst({
    where: { kasirId, statusShift: "ACTIVE" },
    select: { id: true },
  })
  if (!shift) return { error: "Shift belum dibuka" }

  const item = await prisma.kasKeluar.create({
    data: {
      shiftId: shift.id,
      nominal: validasi.nilai,
      keterangan: keterangan.trim(),
      userId: kasirId,
    },
    select: { id: true, nominal: true, keterangan: true, createdAt: true, user: { select: { username: true } } },
  })

  await createLog(
    "KAS_KELUAR",
    `Kas keluar shift #${shift.id}: Rp${validasi.nilai.toLocaleString("id-ID")} — ${item.keterangan}`
  )

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/shift")

  return {
    success: true,
    item: {
      id: item.id,
      nominal: Number(item.nominal),
      keterangan: item.keterangan,
      createdAt: item.createdAt.toISOString(),
      userName: item.user?.username ?? null,
    },
  }
}

export async function hapusKasKeluar(id: number): Promise<{ success: true } | { error: string }> {
  const shift = await requireShiftAktif()
  if ("error" in shift) return shift

  const item = await prisma.kasKeluar.findFirst({ where: { id, shiftId: shift.shiftId } })
  if (!item) return { error: "Catatan kas keluar tidak ditemukan atau bukan milik shift aktif ini" }

  await prisma.kasKeluar.delete({ where: { id } })
  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/shift")
  return { success: true }
}
