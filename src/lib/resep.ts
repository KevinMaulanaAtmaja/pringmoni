/**
 * Helper murni untuk menghitung ketersediaan stok dari resep.
 * Tidak menyentuh database — aman dipakai di server maupun client.
 *
 * Model ketersediaan menu ada dua mode:
 * - Otomatis: menu punya minimal 1 bahan di resep. Porsi maksimum dihitung
 *   dari stok bahan, dan 0 berarti bahan habis sehingga menu tidak tersedia.
 * - Manual: menu belum punya resep sama sekali. Ketersediaan mengikuti
 *   `statusMenu` yang dipegang owner, bukan dihitung dari stok.
 */

export type BahanResepAvailability = {
  namaBahan: string
  satuan: string
  jumlahPerPorsi: number
  stokQty: number
}

export type KetersediaanResep = {
  /** true bila ada minimal 1 bahan aktif → stok dilacak otomatis */
  adaResep: boolean
  /** true bila resep dianggap lengkap sesuai aturan kategorinya */
  lengkap: boolean
  /** Resep tidak punya bahan cukup untuk 1 porsi pun */
  habis: boolean
  /** Berapa porsi maksimum yang masih bisa dimasak dari stok sekarang */
  porsiTersedia: number
  /** Bahan yang menjadi penyebab porsiTersedia paling kecil */
  bahanPembatas: string[]
}

/**
 * Aturan kelengkapan resep per kategori menu:
 * - Makanan: wajib punya bahan utama + bumbu.
 * - Kategori lain (Minuman, Camilan, dst.): bumbu opsional, cukup bahan utama.
 *
 * Dipakai bersama di server (gate pesanan) maupun client (badge & validasi form
 * resep) supaya aturannya konsisten. Murni — tidak menyentuh database.
 */
export function butuhBumbu(_kategori: string | null | undefined): boolean {
  return false
}

/**
 * Porsi tersedia = floor(min(stok / jumlah per porsi)).
 * Bahan dengan jumlah per porsi <= 0 diabaikan karena tidak membatasi.
 *
 * `wajibBumbu` menentukan apakah bumbu ikut dihitung untuk status `lengkap`.
 * Default `true` agar pemanggil lama tetap aman; pemanggil sebaiknya mengirim
 * `butuhBumbu(kategoriMenu)`.
 */
export function hitungKetersediaanResep(
  bahan: BahanResepAvailability[],
  punyaBahanUtama: number,
  punyaBahanBumbu: number,
  wajibBumbu = true
): KetersediaanResep {
  const lengkap = punyaBahanUtama > 0

  const pembatas = bahan
    .filter((b) => b.jumlahPerPorsi > 0)
    .map((b) => ({
      namaBahan: b.namaBahan,
      satuan: b.satuan,
      porsi: Math.floor(b.stokQty / b.jumlahPerPorsi),
    }))

  // Tanpa resep: mode manual, ketersediaan ikut statusMenu (diatur owner).
  if (pembatas.length === 0) {
    return {
      adaResep: false,
      lengkap: false,
      habis: false,
      porsiTersedia: 0,
      bahanPembatas: [],
    }
  }

  const minimum = Math.min(...pembatas.map((p) => p.porsi))

  return {
    adaResep: true,
    lengkap,
    habis: minimum <= 0,
    porsiTersedia: Math.max(0, minimum),
    bahanPembatas: pembatas
      .filter((p) => p.porsi === minimum)
      .map((p) => p.namaBahan),
  }
}