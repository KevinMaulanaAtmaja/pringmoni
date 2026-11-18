import { describe, expect, it } from "vitest"
import {
  BATAS_KEDATANGAN_RESERVASI_MENIT,
  JAM_BUKA_RESERVASI_MENIT,
  JAM_TUTUP_RESERVASI_MENIT,
  SLOT_RESERVASI,
  formatMenit,
  hitungBatasKonfirmasi,
  periodeJam,
  validasiWaktuKedatangan,
} from "./reservasi-jadwal"

const NOW = new Date(2026, 10, 14, 12, 0, 0)

describe("Jadwal slot reservasi", () => {
  it("membuat slot 30 menit dari 13:00 sampai 20:30", () => {
    expect(formatMenit(JAM_BUKA_RESERVASI_MENIT)).toBe("13:00")
    expect(formatMenit(BATAS_KEDATANGAN_RESERVASI_MENIT)).toBe("20:30")
    expect(formatMenit(JAM_TUTUP_RESERVASI_MENIT)).toBe("21:00")
    expect(SLOT_RESERVASI).toHaveLength(16)
    expect(SLOT_RESERVASI[0]).toBe("13:00")
    expect(SLOT_RESERVASI[1]).toBe("13:30")
    expect(SLOT_RESERVASI.at(-1)).toBe("20:30")
  })

  it("mengelompokkan periode Siang/Sore/Malam", () => {
    expect(periodeJam("13:00")).toBe("Siang")
    expect(periodeJam("15:00")).toBe("Sore")
    expect(periodeJam("18:00")).toBe("Malam")
  })
})

describe("validasiWaktuKedatangan", () => {
  it("menerima slot yang sejajar dan masih dalam jam operasional", () => {
    expect(validasiWaktuKedatangan(new Date(2026, 10, 14, 13, 0), NOW)).toBeNull()
    expect(validasiWaktuKedatangan(new Date(2026, 10, 15, 20, 30), NOW)).toBeNull()
  })

  it("menolak waktu yang sudah lewat", () => {
    expect(validasiWaktuKedatangan(new Date(2026, 10, 14, 11, 0), NOW)).toBe(
      "Waktu kedatangan sudah lewat"
    )
  })

  it("menolak waktu di luar jam buka / kedatangan terakhir", () => {
    expect(validasiWaktuKedatangan(new Date(2026, 10, 14, 12, 30), NOW)).toContain(
      "Jam kedatangan harus antara"
    )
    expect(validasiWaktuKedatangan(new Date(2026, 10, 14, 21, 0), NOW)).toContain(
      "Jam kedatangan harus antara"
    )
  })

  it("menolak jam yang tidak sejajar dengan interval slot", () => {
    expect(validasiWaktuKedatangan(new Date(2026, 10, 14, 13, 15), NOW)).toBe(
      "Pilih jam kedatangan yang tersedia"
    )
  })

  it("menolak tanggal melebihi batas hari ke depan", () => {
    expect(validasiWaktuKedatangan(new Date(2026, 10, 22, 13, 0), NOW)).toContain(
      "maksimal 7 hari"
    )
  })

  it("menolak tanggal invalid", () => {
    expect(validasiWaktuKedatangan(new Date("bukan-tanggal"), NOW)).toBe(
      "Waktu kedatangan tidak valid"
    )
  })
})

describe("hitungBatasKonfirmasi", () => {
  it("memakai kedatangan + expiry bila masih sebelum jam tutup", () => {
    const batas = hitungBatasKonfirmasi(new Date(2026, 10, 14, 13, 0), 3)
    expect(batas.getHours()).toBe(16)
    expect(batas.getMinutes()).toBe(0)
  })

  it("membatasi konfirmasi maksimal sampai jam tutup 21:00", () => {
    const batas = hitungBatasKonfirmasi(new Date(2026, 10, 14, 20, 30), 3)
    expect(batas.getHours()).toBe(21)
    expect(batas.getMinutes()).toBe(0)
  })
})
