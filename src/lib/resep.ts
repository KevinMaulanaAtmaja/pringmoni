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
  /** true bila resep punya 1 bahan utama + 1 bumbu (indikator kualitas data) */
  lengkap: boolean
  /** Resep tidak punya bahan cukup untuk 1 porsi pun */
  habis: boolean
  /** Berapa porsi maksimum yang masih bisa dimasak dari stok sekarang */
  porsiTersedia: number
  /** Bahan yang menjadi penyebab porsiTersedia paling kecil */
  bahanPembatas: string[]
}

/**
 * Porsi tersedia = floor(min(stok / jumlah per porsi)).
 * Bahan dengan jumlah per porsi <= 0 diabaikan karena tidak membatasi.
 */
export function hitungKetersediaanResep(
  bahan: BahanResepAvailability[],
  punyaBahanUtama: number,
  punyaBahanBumbu: number
): KetersediaanResep {
  const lengkap = punyaBahanUtama > 0 && punyaBahanBumbu > 0

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