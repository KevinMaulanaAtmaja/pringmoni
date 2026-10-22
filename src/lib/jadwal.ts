/**
 * Helper jadwal shift yang aman dipakai di client & server.
 *
 * File ini sengaja tidak mengimpr apapun dari prisma/server-only supaya bisa
 * dipakai komponen "use client" tanpa menarik kode server ke bundler client.
 */

export type JamJadwal = {
  jamMulai: number
  jamSelesai: number
}

/** Menit sejak tengah malam dari sebuah Date (lokal). */
export function menitHariIni(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes()
}

/** "08:00" dari 480. */
export function formatJam(menit: number): string {
  const jam = Math.floor(menit / 60)
  const menitSisa = menit % 60
  return `${String(jam).padStart(2, "0")}:${String(menitSisa).padStart(2, "0")}`
}

/** 480 dari "08:00". Mengembalikan null bila format tidak valid. */
export function jamDariTeks(teks: string): number | null {
  const cocok = /^(\d{1,2}):(\d{2})$/.exec(teks.trim())
  if (!cocok) return null
  const jam = Number(cocok[1])
  const menit = Number(cocok[2])
  if (jam < 0 || jam > 24 || menit < 0 || menit > 59) return null
  if (jam === 24 && menit !== 0) return null
  return jam * 60 + menit
}

/** Cari slot jadwal yang menutupi `menit`, atau null bila di luar semua slot. */
export function cariSlot<T extends JamJadwal>(jadwal: T[], menit: number): T | null {
  return jadwal.find((s) => menit >= s.jamMulai && menit < s.jamSelesai) ?? null
}

/** Slot aktif pada saat ini (mis. "Pagi"), atau null bila di luar jam kerja. */
export function slotSaatIni<T extends JamJadwal>(
  jadwal: T[],
  now: Date = new Date()
): T | null {
  return cariSlot(jadwal, menitHariIni(now))
}

/** Deskripsi slot untuk pesan error (mis. "Pagi (08:00-16:00), Sore (16:00-24:00)"). */
export function deskripsiJadwal(jadwal: Array<JamJadwal & { nama: string }>): string {
  return jadwal.map((s) => `${s.nama} (${formatJam(s.jamMulai)}-${formatJam(s.jamSelesai)})`).join(", ")
}

/** Dua slot dianggap bentrok bila rentangnya saling menutupi. */
export function rentangBentrok(
  a: { jamMulai: number; jamSelesai: number },
  b: { jamMulai: number; jamSelesai: number }
): boolean {
  return a.jamMulai < b.jamSelesai && b.jamMulai < a.jamSelesai
}

/**
 * Uang yang seharusnya ada di laci.
 * Uang harap = uang awal + pendapatan tunai - kas keluar.
 */
export function hitungUangHarap(
  uangAwal: number,
  totalTunai: number,
  totalKasKeluar: number
): number {
  return uangAwal + totalTunai - totalKasKeluar
}
