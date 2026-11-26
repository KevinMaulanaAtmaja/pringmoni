import { describe, it, expect } from "vitest"
import {
  BOBOT_HYBRID,
  lolosGate,
  rankingHybrid,
  skorHybrid,
  skorStok,
  type MenuPenilaian,
} from "./scoring"

function menu(overrides: Partial<MenuPenilaian> = {}): MenuPenilaian {
  return {
    id: 1,
    namaMenu: "Es Teh Manis",
    deskripsi: "Teh hitam segar dengan gula merah",
    kategori: "Minuman",
    lokasi: "cafe",
    pilihanSuhu: true,
    statusMenu: "tersedia",
    stokManual: 10,
    deletedAt: null,
    ...overrides,
  }
}

describe("SPK - Gate kelayakan", () => {
  it("menolak menu habis, nonaktif, terhapus, dan lokasi beda", () => {
    expect(lolosGate(menu())).toBe(true)
    expect(lolosGate(menu({ statusMenu: "habis" }))).toBe(false)
    expect(lolosGate(menu({ stokManual: 0 }))).toBe(false)
    expect(lolosGate(menu({ deletedAt: new Date() }))).toBe(false)
    expect(lolosGate(menu({ lokasi: "resto" }), "cafe")).toBe(false)
    expect(lolosGate(menu({ lokasi: "cafe" }), "cafe")).toBe(true)
  })

  it("skor stok dinormalisasi terhadap stok maksimum", () => {
    expect(skorStok(menu({ stokManual: 5 }), 10)).toBe(0.5)
    expect(skorStok(menu({ stokManual: 0 }), 10)).toBe(0)
  })
})

describe("SPK - Hybrid scoring", () => {
  it("menghitung bobot 60/30/10", () => {
    expect(skorHybrid(1, 0.5, 1, BOBOT_HYBRID)).toBeCloseTo(0.85)
    expect(skorHybrid(0.8, 0.4, 0.5, BOBOT_HYBRID)).toBeCloseTo(0.65)
  })

  it("membatasi skor ke rentang 0..1", () => {
    expect(skorHybrid(2, 2, 2, BOBOT_HYBRID)).toBeCloseTo(1)
    expect(skorHybrid(-1, -1, -1, BOBOT_HYBRID)).toBe(0)
  })
})

describe("SPK - Peringkat hybrid", () => {
  it("hanya mengembalikan menu lolos gate dan membatasi topN", () => {
    const katalog: MenuPenilaian[] = [
      menu({ id: 1, namaMenu: "Es Teh Manis", kategori: "Minuman", lokasi: "cafe", stokManual: 10 }),
      menu({ id: 2, namaMenu: "Es Krim", kategori: "Dessert", lokasi: "cafe", stokManual: 8 }),
      menu({ id: 3, namaMenu: "Nasi Ayam", kategori: "Makanan", lokasi: "resto", stokManual: 6 }),
      menu({ id: 4, namaMenu: "Kopi Susu", kategori: "Cafe", lokasi: "cafe", stokManual: 0 }),
      menu({ id: 5, namaMenu: "Es Jeruk", kategori: "Minuman", lokasi: "cafe", stokManual: 4 }),
    ]

    const hasil = rankingHybrid(
      { suhu: "dingin", rasa: ["manis", "segar"], kategori: ["Minuman"], kepekatan: 0.2, energi: 0.2 },
      katalog,
      { lokasi: "cafe", topN: 3 }
    )

    expect(hasil).toHaveLength(3)
    expect(hasil.map((item) => item.menuId)).not.toContain(3)
    expect(hasil.map((item) => item.menuId)).not.toContain(4)
    expect(hasil[0].skor).toBeGreaterThanOrEqual(hasil[1].skor)
    expect(hasil[0].rincian.cbf).toBeGreaterThanOrEqual(0)
  })

  it("mengembalikan kosong bila semua menu tertolak", () => {
    const hasil = rankingHybrid(
      { suhu: null, rasa: [], kategori: [], kepekatan: 0.5, energi: 0.5 },
      [menu({ stokManual: 0 })],
      { topN: 4 }
    )

    expect(hasil).toEqual([])
  })
})
