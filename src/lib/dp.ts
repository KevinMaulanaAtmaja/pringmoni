export const DP_PERSEN = 20
export const DP_ROUNDING_UNIT = 1000

export interface RincianDp {
  persen: number
  totalPreorder: number
  dpMentah: number
  dpNominal: number
  pembulatan: number
  sisaTagihan: number
  unit: number
}

/**
 * Menghitung rincian Uang Muka (DP) dengan algoritma pembulatan ke atas (ceil)
 * ke kelipatan unit tertentu (default: Rp 1.000).
 *
 * Mengapa pembulatan ke atas (ceil) ke kelipatan Rp 1.000?
 * 1. Best practice F&B/POS di Indonesia: Menghindari pecahan uang receh/koin
 *    (seperti Rp 50, Rp 150, Rp 250) yang menyulitkan transaksi tunai kasir & kembalian.
 * 2. Menjamin batas minimal DP 20% yang disyaratkan mitra/restoran selalu terpenuhi (>= 20%).
 * 3. Selisih pembulatan otomatis disesuaikan ke sisa tagihan (sisaTagihan = total - dpNominal),
 *    sehingga total penerimaan kasir (DP + sisa) tetap 100% tepat dan akurat.
 *
 * Contoh:
 * Total Pre-order: Rp 125.750
 * DP 20% mentah: Rp 25.150
 * Pembulatan (+Rp 850) -> DP Nominal: Rp 26.000
 * Sisa Tagihan saat kedatangan: Rp 99.750
 */
export function hitungRincianDp(
  total: number,
  persen: number = DP_PERSEN,
  unit: number = DP_ROUNDING_UNIT
): RincianDp {
  const safeTotal = Math.max(0, Math.round(Number(total) || 0))
  if (safeTotal <= 0) {
    return {
      persen,
      totalPreorder: 0,
      dpMentah: 0,
      dpNominal: 0,
      pembulatan: 0,
      sisaTagihan: 0,
      unit,
    }
  }

  const safePersen = Math.max(0, Number(persen) || DP_PERSEN)
  const safeUnit = Math.max(1, Number(unit) || DP_ROUNDING_UNIT)

  const dpMentah = (safeTotal * safePersen) / 100
  const dpNominal = Math.ceil(dpMentah / safeUnit) * safeUnit
  const pembulatan = dpNominal - dpMentah
  const sisaTagihan = Math.max(0, safeTotal - dpNominal)

  return {
    persen: safePersen,
    totalPreorder: safeTotal,
    dpMentah,
    dpNominal,
    pembulatan,
    sisaTagihan,
    unit: safeUnit,
  }
}

/**
 * Mengembalikan nominal DP yang sudah dibulatkan ke kelipatan unit (Rp 1.000).
 */
export function hitungDpNominal(
  total: number,
  persen: number = DP_PERSEN,
  unit: number = DP_ROUNDING_UNIT
): number {
  return hitungRincianDp(total, persen, unit).dpNominal
}
