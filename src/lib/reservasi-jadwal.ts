/**
 * Jadwal tetap reservasi (tanpa pengaturan owner).
 * Semua jam dalam menit sejak 00:00 agar validasi konsisten di client & server.
 */

export const JAM_BUKA_RESERVASI_MENIT = 13 * 60
export const JAM_TUTUP_RESERVASI_MENIT = 21 * 60
export const BATAS_KEDATANGAN_RESERVASI_MENIT = 20 * 60 + 30
export const INTERVAL_SLOT_RESERVASI_MENIT = 30
export const MAKS_HARI_KE_DEPAN = 7

export function formatMenit(menit: number): string {
  const jam = Math.floor(menit / 60) % 24
  const sisa = menit % 60
  return `${String(jam).padStart(2, "0")}:${String(sisa).padStart(2, "0")}`
}

export const SLOT_RESERVASI: string[] = (() => {
  const slots: string[] = []
  for (
    let menit = JAM_BUKA_RESERVASI_MENIT;
    menit <= BATAS_KEDATANGAN_RESERVASI_MENIT;
    menit += INTERVAL_SLOT_RESERVASI_MENIT
  ) {
    slots.push(formatMenit(menit))
  }
  return slots
})()

export type PeriodeJam = "Pagi" | "Siang" | "Sore" | "Malam"

export function periodeJam(jam: string): PeriodeJam {
  const jamAngka = Number(jam.slice(0, 2))
  if (jamAngka < 10) return "Pagi"
  if (jamAngka < 15) return "Siang"
  if (jamAngka < 18) return "Sore"
  return "Malam"
}

export function menitDariTanggal(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function awalHari(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function akhirHari(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Batas akhir rentang reservasi: akhir hari H+MAKS_HARI_KE_DEPAN.
 * Hari ini dihitung sebagai hari ke-0, sehingga tersedia 8 tanggal
 * (hari ini s/d H+7) dan bukan 7×24 jam sejak waktu sekarang.
 */
export function batasAkhirReservasi(now: Date = new Date()): Date {
  const d = awalHari(now)
  d.setDate(d.getDate() + MAKS_HARI_KE_DEPAN)
  return akhirHari(d)
}

export function validasiWaktuKedatangan(
  date: Date,
  now: Date = new Date()
): string | null {
  if (Number.isNaN(date.getTime())) return "Waktu kedatangan tidak valid"
  if (date.getTime() < now.getTime() - 5 * 60 * 1000) {
    return "Waktu kedatangan sudah lewat"
  }
  if (date.getTime() > batasAkhirReservasi(now).getTime()) {
    return `Waktu kedatangan maksimal ${MAKS_HARI_KE_DEPAN} hari ke depan`
  }

  const menit = menitDariTanggal(date)
  if (
    menit < JAM_BUKA_RESERVASI_MENIT ||
    menit > BATAS_KEDATANGAN_RESERVASI_MENIT
  ) {
    return `Jam kedatangan harus antara ${formatMenit(
      JAM_BUKA_RESERVASI_MENIT
    )} dan ${formatMenit(BATAS_KEDATANGAN_RESERVASI_MENIT)}`
  }
  if ((menit - JAM_BUKA_RESERVASI_MENIT) % INTERVAL_SLOT_RESERVASI_MENIT !== 0) {
    return "Pilih jam kedatangan yang tersedia"
  }
  return null
}

/**
 * Batas konfirmasi DP = kedatangan + expiry, tetapi tidak boleh melewati jam tutup.
 */
export function hitungBatasKonfirmasi(
  waktuKedatangan: Date,
  expiryJam: number
): Date {
  const expiry = new Date(waktuKedatangan.getTime() + expiryJam * 60 * 60 * 1000)
  const tutup = new Date(waktuKedatangan)
  tutup.setHours(0, 0, 0, 0)
  tutup.setMinutes(JAM_TUTUP_RESERVASI_MENIT)
  return expiry.getTime() > tutup.getTime() ? tutup : expiry
}
