import { describe, it, expect } from "vitest"
import {
  buildVektorKriteria,
  buildVektorMenu,
  cosineSimilarity,
  rekomendasiCBF,
  type MenuBahanData,
} from "./cbf"

describe("SPK - Cosine Similarity", () => {
  it("mengembalikan 0 untuk vektor yang sama persis", () => {
    const vektor = new Map<string, number>([["rasa:manis", 1]])
    expect(cosineSimilarity(vektor, vektor)).toBe(1)
  })

  it("mengembalikan 0 untuk dua vektor yang tidak beririsan", () => {
    const q = new Map<string, number>([["rasa:manis", 1]])
    const m = new Map<string, number>([["suhu:dingin", 1]])
    expect(cosineSimilarity(q, m)).toBe(0)
  })

  it("mengembalikan 0 untuk vektor kosong", () => {
    expect(cosineSimilarity(new Map<string, number>(), new Map<string, number>())).toBe(0)
  })
})

describe("SPK - Vektor Kriteria", () => {
  it("membangun vektor dari kriteria kueri", () => {
    const vektor = buildVektorKriteria({
      suhu: "Dingin",
      rasa: ["Manis"],
      kategori: ["Minuman"],
      kepekatan: 0.6,
      energi: 0.4,
    })

    expect(vektor.get("suhu:dingin")).toBe(1)
    expect(vektor.get("rasa:manis")).toBe(1)
    expect(vektor.get("kategori:minuman")).toBe(1)
  })
})

describe("SPK - Profil Menu CBF", () => {
  it("membangun vektor menu dari token, fitur rasa, dan suhu", () => {
    const menu: MenuBahanData = {
      id: 1,
      namaMenu: "Es Teh Manis",
      deskripsi: "Teh hitam segar dengan gula merah",
      kategori: "Minuman",
      lokasi: "cafe",
      pilihanSuhu: true,
    }

    const idf = (token: string) => Math.log(1 + 2 / Math.max(token === "es" ? 1 : 1, 1))
    const vektor = buildVektorMenu(menu, idf)

    expect(vektor.get("tf:es")).toBeDefined()
    expect(vektor.get("rasa:manis")).toBe(1)
    expect(vektor.get("suhu:dingin")).toBe(1)
    expect(vektor.get("lokasi:cafe")).toBe(1)
  })

  it("cosine antara kriteria dan profil menu harus menghasilkan skor > 0", () => {
    const menu: MenuBahanData = {
      id: 1,
      namaMenu: "Es Teh Manis",
      deskripsi: "Teh hitam segar dengan gula merah",
      kategori: "Minuman",
      lokasi: "cafe",
      pilihanSuhu: true,
    }
    const idf = () => Math.log(2)
    const vektorMenu = buildVektorMenu(menu, idf)
    const vektorKriteria = buildVektorKriteria({
      suhu: "dingin",
      rasa: ["manis"],
      kategori: ["minuman"],
      kepekatan: 0.6,
      energi: 0.4,
    })

    expect(cosineSimilarity(vektorKriteria, vektorMenu)).toBeGreaterThan(0)
  })
})

describe("SPK - CBF (Content-Based Filtering)", () => {
  it("menentukan rekomendasi terbaik dari kriteria tanpa riwayat pesanan (cold start)", () => {
    const katalog: MenuBahanData[] = [
      { id: 1, namaMenu: "Es Teh Manis", deskripsi: "Teh hitam segar dengan gula merah", kategori: "Minuman", lokasi: "cafe", pilihanSuhu: true },
      { id: 2, namaMenu: "Nasi Ayam", deskripsi: "Nasi putih dengan ayam goreng", kategori: "Makanan", lokasi: "resto", pilihanSuhu: false },
    ]

    const hasil = rekomendasiCBF(
      { suhu: "dingin", rasa: ["manis"], kategori: ["minuman"], kepekatan: 0.6, energi: 0.4 },
      katalog
    )

    expect(hasil).toHaveLength(2)
    expect(hasil[0].menuId).toBe(1)
    expect(hasil[0].skor).toBeGreaterThan(hasil[1].skor)
    expect(hasil[0].skor).toBeGreaterThan(0)
  })
})
