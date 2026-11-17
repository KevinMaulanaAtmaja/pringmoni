import { describe, it, expect } from "vitest"
import { analisaMoodFallback } from "./mood-fallback"

describe("SPK - Mood fallback leksikon", () => {
  it("memetakan kata panas ke kriteria dingin dan segar", () => {
    const hasil = analisaMoodFallback("Aduh hari ini panas apa yang enak ya?")

    expect(hasil.mood).toBe("panas")
    expect(hasil.kriteria.suhu).toBe("dingin")
    expect(hasil.kriteria.rasa).toContain("segar")
    expect(hasil.kriteria.kepekatan).toBeLessThan(0.5)
  })

  it("memetakan kata dingin/hujan ke kriteria hangat", () => {
    const hasil = analisaMoodFallback("Hujan terus dingin, pengen yang hangat")

    expect(hasil.mood).toBe("dingin")
    expect(hasil.kriteria.suhu).toBe("hangat")
  })

  it("memetakan kata capek ke energi tinggi dan rasa manis", () => {
    const hasil = analisaMoodFallback("Capek banget butuh tenaga")

    expect(hasil.mood).toBe("lemas")
    expect(hasil.kriteria.rasa).toContain("manis")
    expect(hasil.kriteria.energi).toBeGreaterThan(0.5)
  })

  it("memberi kriteria netral untuk kalimat tanpa kata mood", () => {
    const hasil = analisaMoodFallback("Menu apa saja yang tersedia?")

    expect(hasil.mood).toBe("netral")
    expect(hasil.kriteria.suhu).toBeNull()
    expect(hasil.kriteria.rasa).toEqual([])
    expect(hasil.kriteria.kepekatan).toBe(0.5)
  })
})
