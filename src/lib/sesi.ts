import prisma from "@/lib/prisma"

/**
 * Helper untuk fitur "ambil alih" sesi antar perangkat.
 *
 * Ide: setiap akun punya `sessionVersion` pada tabel users. Nilai ini naik
 * setiap kali ada login baru. JWT yang dibuat pada login lama membawa versi
 * yang lebih rendah, sehingga begitu versi di database berubah, sesi lama
 * otomatis dianggap tidak berlaku ( kicked out ).
 */

/** Nama cookie penanda perangkat (dipakai untuk deteksi login di perangkat lain). */
export const COOKIE_PERANGKAT = "pm_device"

/** Umur cache versi sesi (ms). Menghindari satu query DB untuk setiap request. */
const TTL_CACHE_MS = 3000

/**
 * Rentang waktu aktivitas terakhir yang masih dianggap "sesi aktif" (15 menit).
 * Dipakai untuk mendeteksi login dari perangkat lain sebelum sesi dibuat.
 */
export const AMBANG_SESI_AKTIF_MS = 15 * 60 * 1000

/** Jarak minimal antar penulisan `last_seen_at` per user (ms). */
const TTL_AKTIVITAS_MS = 2 * 60 * 1000

const cacheVersi = new Map<string, { versi: number; pada: number }>()
const terakhirCatatAktivitas = new Map<number, number>()

/** Simpan versi sesi terbaru ke cache (dipanggil setelah login berhasil). */
export function catatVersiSesi(userId: number, versi: number): void {
  cacheVersi.set(String(userId), { versi, pada: Date.now() })
}

/**
 * Ambil versi sesi aktif dari database.
 * Mengembalikan null bila user tidak ada atau database tidak bisa dibaca
 * (fail-open: sesi tidak di-invalidate karena masalah koneksi).
 */
export async function ambilVersiSesi(userId: number): Promise<number | null> {
  const key = String(userId)
  const cached = cacheVersi.get(key)
  if (cached && Date.now() - cached.pada < TTL_CACHE_MS) return cached.versi

  try {
    const row = await prisma.users.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    })
    if (!row) return null
    catatVersiSesi(userId, row.sessionVersion)
    return row.sessionVersion
  } catch {
    return null
  }
}

/**
 * Tandai bahwa sesi akun ini masih dipakai (dipanggil dari jwt callback).
 * Ditulis maksimal sekali per TTL_AKTIVITAS_MS per user supaya tidak
 * menambah satu UPDATE pada setiap request.
 */
export async function catatAktivitasSesi(userId: number): Promise<void> {
  const sekarang = Date.now()
  const terakhir = terakhirCatatAktivitas.get(userId) ?? 0
  if (sekarang - terakhir < TTL_AKTIVITAS_MS) return

  terakhirCatatAktivitas.set(userId, sekarang)
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { lastSeenAt: new Date(sekarang) },
    })
  } catch {
    // best effort — kegagalan pencatatan aktivitas tidak boleh menggagalkan request
  }
}

/**
 * True bila ada kemungkinan sesi lain masih hidup: sesi terakhir masih
 * aktif dalam ambang waktu dan dipakai dari perangkat yang berbeda.
 */
export function sesiLainKemungkinanAktif(
  terakhirAktif: Date | null,
  lastLoginDevice: string | null,
  deviceId: string | null
): boolean {
  if (!terakhirAktif) return false
  if (Date.now() - terakhirAktif.getTime() > AMBANG_SESI_AKTIF_MS) return false
  if (lastLoginDevice && deviceId && lastLoginDevice === deviceId) return false
  return true
}

/** Format waktu login terakhir untuk ditampilkan pada dialog konfirmasi. */
export function waktuLoginLabel(lastLoginAt: Date | null): string {
  if (!lastLoginAt) return "tidak diketahui"
  const selisihMenit = Math.max(0, Math.floor((Date.now() - lastLoginAt.getTime()) / 60000))
  if (selisihMenit < 1) return "beberapa detik yang lalu"
  if (selisihMenit < 60) return `${selisihMenit} menit yang lalu`
  const selisihJam = Math.floor(selisihMenit / 60)
  if (selisihJam < 24) return `${selisihJam} jam yang lalu`
  const selisihHari = Math.floor(selisihJam / 24)
  return `${selisihHari} hari yang lalu`
}
