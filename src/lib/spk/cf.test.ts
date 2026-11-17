import { describe, it, expect } from "vitest"
import {
  ambilSimilarity,
  bobotRank,
  buatPetaSimilarity,
  hitungSkorSosial,
  matriksTersedia,
  setMatriksSimilarity,
  similaritasItem,
  skorSosial,
} from "./cf"

describe("SPK - Matriks Similarity CF", () => {
  it("membangun peta dan membaca similarity dua arah", () => {
    const peta = buatPetaSimilarity([
      { a: 1, b: 2, sim: 0.8 },
      { a: 3, b: 4, sim: 0 },
    ])

    expect(ambilSimilarity(peta, 1, 2)).toBe(0.8)
    expect(ambilSimilarity(peta, 2, 1)).toBe(0.8)
    expect(ambilSimilarity(peta, 1, 1)).toBe(0)
    expect(ambilSimilarity(peta, 3, 4)).toBe(0)
    expect(ambilSimilarity(peta, 5, 6)).toBe(0)
  })

  it("menghitung skor sosial dari seed Top3 dengan bobot peringkat", () => {
    const peta = buatPetaSimilarity([
      { a: 1, b: 10, sim: 1 },
      { a: 2, b: 10, sim: 0.5 },
      { a: 3, b: 10, sim: 0.2 },
    ])

    const skor = hitungSkorSosial(peta, 10, [1, 2, 3])
    expect(skor).toBeGreaterThan(0)
    expect(skor).toBeLessThanOrEqual(1)
    expect(bobotRank(0)).toBeGreaterThan(bobotRank(1))
    expect(bobotRank(1)).toBeGreaterThan(bobotRank(2))
  })

  it("mengabaikan seed yang sama dengan kandidat", () => {
    const peta = buatPetaSimilarity([{ a: 1, b: 2, sim: 0.9 }])
    expect(hitungSkorSosial(peta, 2, [2, 1])).toBeCloseTo(0.9)
  })
})

describe("SPK - CF tanpa data", () => {
  it("matriks kosong membuat seluruh skor sosial menjadi 0", () => {
    expect(matriksTersedia()).toBe(false)
    expect(similaritasItem(1, 2)).toBe(0)
    expect(skorSosial(2, [1, 3, 4])).toBe(0)
  })

  it("menu baru yang tidak ada di matriks mendapat skor 0", () => {
    const peta = buatPetaSimilarity([{ a: 1, b: 2, sim: 0.7 }])
    expect(hitungSkorSosial(peta, 99, [1, 2])).toBe(0)
  })

  it("matriks bisa diperbarui saat runtime tanpa restart", () => {
    try {
      setMatriksSimilarity({
        generatedAt: "2026-11-17T00:00:00.000Z",
        menuCount: 2,
        pairs: [{ a: 1, b: 2, sim: 0.7 }],
      })

      expect(matriksTersedia()).toBe(true)
      expect(similaritasItem(1, 2)).toBe(0.7)
    } finally {
      setMatriksSimilarity({
        generatedAt: "1970-01-01T00:00:00.000Z",
        menuCount: 0,
        pairs: [],
      })
    }
  })
})
