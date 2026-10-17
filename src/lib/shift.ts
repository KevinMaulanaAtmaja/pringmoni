import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const PESANAN_TANPA_SHIFT =
  "Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu."

export const HANYA_KASIR = "Hanya kasir yang dapat membuka atau menutup shift"

export const MAKS_NOMINAL = 1_000_000_000

export type HasilPerhitunganShift = {
  totalTransaksi: number
  totalPendapatan: number
  totalTunai: number
  totalNonTunai: number
}

/**
 * Rekap transaksi yang terikat ke sebuah shift.
 *
 * Hanya pesanan berstatus_pembayaran = 'berhasil' yang dihitung, karena itu
 * uang yang benar-benar masuk ke laci kas / rekening. Filter per metode
 * dipisah agar selisih kas hanya memakai uang tunai.
 */
export async function hitungTotalShift(shiftId: number): Promise<HasilPerhitunganShift> {
  const rows = await prisma.$queryRaw<
    Array<{
      total_transaksi: number
      total_pendapatan: string | number
      total_tunai: string | number
      total_non_tunai: string | number
    }>
  >`
    SELECT
      COUNT(*)::int AS total_transaksi,
      COALESCE(SUM(p.total_harga + COALESCE(p.biaya_admin, 0) + COALESCE(p.ppn, 0)), 0) AS total_pendapatan,
      COALESCE(
        SUM(p.total_harga + COALESCE(p.biaya_admin, 0) + COALESCE(p.ppn, 0))
          FILTER (WHERE p.metode_pembayaran = 'tunai'),
        0
      ) AS total_tunai,
      COALESCE(
        SUM(p.total_harga + COALESCE(p.biaya_admin, 0) + COALESCE(p.ppn, 0))
          FILTER (WHERE p.metode_pembayaran IS NOT NULL AND p.metode_pembayaran <> 'tunai'),
        0
      ) AS total_non_tunai
    FROM pesanan p
    WHERE p.shift_id = ${shiftId}
      AND p.status_pembayaran = 'berhasil'
      AND p.deleted_at IS NULL
  `

  const row = rows[0]
  return {
    totalTransaksi: row?.total_transaksi ?? 0,
    totalPendapatan: Number(row?.total_pendapatan ?? 0),
    totalTunai: Number(row?.total_tunai ?? 0),
    totalNonTunai: Number(row?.total_non_tunai ?? 0),
  }
}

/**
 * Gerbang wajib untuk setiap aksi kasir yang mencatat uang.
 *
 * Memastikan yang memanggil benar-benar kasir dan shift miliknya sendiri
 * sedang ACTIVE. Mengembalikan shiftId supaya pemanggil bisa menempelkannya
 * ke pesanan sehingga transaksi terikat ke shift yang benar.
 */
export async function requireShiftAktif(): Promise<
  | { shiftId: number; kasirId: number; kasirUsername: string }
  | { error: string }
> {
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

  const shift = await prisma.shiftKasir.findFirst({
    where: { kasirId, statusShift: "ACTIVE" },
    select: { id: true },
  })

  if (!shift) {
    return { error: PESANAN_TANPA_SHIFT }
  }

  return {
    shiftId: shift.id,
    kasirId,
    kasirUsername: session.user.username || "",
  }
}

/**
 * Tanggal lokal kasir sebagai midnight UTC supaya kolom `tanggal` (DATE)
 * selalu jatuh pada hari yang sama di seluruh zona waktu.
 */
export function tanggalShiftSekarang(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

/** Angka nominal yang valid untuk uang awal / uang akhir kas. */
export function validasiNominal(nilai: unknown): { nilai: number } | { error: string } {
  const nominal = typeof nilai === "number" ? nilai : Number(nilai)

  if (!Number.isFinite(nominal) || nominal <= 0) {
    return { error: "Nominal uang kas harus lebih dari 0" }
  }
  if (nominal > MAKS_NOMINAL) {
    return { error: "Nominal melebihi batas yang wajar" }
  }
  if (!Number.isInteger(nominal)) {
    return { error: "Nominal harus berupa angka bulat rupiah" }
  }

  return { nilai: nominal }
}