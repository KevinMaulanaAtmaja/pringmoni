import { describe, expect, it } from "vitest"
import { DP_PERSEN, hitungDpNominal, hitungRincianDp } from "./dp"

describe("Algoritma Perhitungan & Pembulatan DP", () => {
  it("membulatkan pecahan Rp 25.150 ke atas menjadi Rp 26.000 (kelipatan Rp 1.000)", () => {
    // Kasus dari user: total pre-order Rp 125.750 -> DP 20% mentah = Rp 25.150
    const total = 125750
    const rincian = hitungRincianDp(total)

    expect(rincian.persen).toBe(20)
    expect(rincian.totalPreorder).toBe(125750)
    expect(rincian.dpMentah).toBe(25150)
    expect(rincian.dpNominal).toBe(26000)
    expect(rincian.pembulatan).toBe(850)
    expect(rincian.sisaTagihan).toBe(99750)

    // Total DP + sisa tagihan harus tepat sama dengan total pre-order
    expect(rincian.dpNominal + rincian.sisaTagihan).toBe(total)

    // Helper hitungDpNominal mengembalikan nilai yang sama
    expect(hitungDpNominal(total)).toBe(26000)
  })

  it("tidak menambah pembulatan jika DP mentah sudah pas kelipatan Rp 1.000", () => {
    const total = 100000 // 20% = 20.000
    const rincian = hitungRincianDp(total)

    expect(rincian.dpMentah).toBe(20000)
    expect(rincian.dpNominal).toBe(20000)
    expect(rincian.pembulatan).toBe(0)
    expect(rincian.sisaTagihan).toBe(80000)
  })

  it("membulatkan ke atas untuk pecahan kecil (misal Rp 25.020 -> Rp 26.000)", () => {
    const total = 125100 // 20% = 25.020
    const rincian = hitungRincianDp(total)

    expect(rincian.dpMentah).toBe(25020)
    expect(rincian.dpNominal).toBe(26000)
    expect(rincian.pembulatan).toBe(980)
    expect(rincian.sisaTagihan).toBe(99100)
    expect(rincian.dpNominal + rincian.sisaTagihan).toBe(total)
  })

  it("menangani nilai 0 atau negatif secara aman", () => {
    expect(hitungDpNominal(0)).toBe(0)
    expect(hitungDpNominal(-50000)).toBe(0)

    const rincianZero = hitungRincianDp(0)
    expect(rincianZero.dpNominal).toBe(0)
    expect(rincianZero.sisaTagihan).toBe(0)
    expect(rincianZero.pembulatan).toBe(0)
  })

  it("memastikan persentase DP efektif selalu >= 20% dari total", () => {
    const testTotals = [125750, 43250, 89900, 15000, 333333]
    for (const total of testTotals) {
      const rincian = hitungRincianDp(total)
      const persentaseEfektif = (rincian.dpNominal / total) * 100
      expect(persentaseEfektif).toBeGreaterThanOrEqual(DP_PERSEN)
    }
  })
})
