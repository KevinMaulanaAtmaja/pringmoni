import { describe, it, expect } from 'vitest'
import {
  cariSlot,
  deskripsiJadwal,
  formatJam,
  hitungUangHarap,
  jamDariTeks,
  menitHariIni,
  rentangBentrok,
  slotSaatIni,
} from '@/lib/jadwal'

describe('menitHariIni', () => {
  it('menghitung menit sejak tengah malam dari waktu lokal', () => {
    expect(menitHariIni(new Date(2026, 10, 5, 8, 30))).toBe(510)
    expect(menitHariIni(new Date(2026, 10, 5, 0, 0))).toBe(0)
  })
})

describe('formatJam', () => {
  it('memformat menit menjadi HH:MM', () => {
    expect(formatJam(0)).toBe('00:00')
    expect(formatJam(480)).toBe('08:00')
    expect(formatJam(485)).toBe('08:05')
    expect(formatJam(1440)).toBe('24:00')
  })
})

describe('jamDariTeks', () => {
  it('mengubah teks jam valid menjadi menit', () => {
    expect(jamDariTeks('08:00')).toBe(480)
    expect(jamDariTeks('8:05')).toBe(485)
    expect(jamDariTeks(' 24:00 ')).toBe(1440)
  })

  it('menolak format atau nilai jam yang tidak valid', () => {
    expect(jamDariTeks('abc')).toBeNull()
    expect(jamDariTeks('25:00')).toBeNull()
    expect(jamDariTeks('08:60')).toBeNull()
    expect(jamDariTeks('24:01')).toBeNull()
    expect(jamDariTeks('08:5')).toBeNull()
    expect(jamDariTeks('')).toBeNull()
  })
})

describe('cariSlot', () => {
  const jadwal = [{ nama: 'Pagi', jamMulai: 480, jamSelesai: 960 }]

  it('menemukan slot pada batas awal dan sebelum batas akhir', () => {
    expect(cariSlot(jadwal, 480)).toEqual(jadwal[0])
    expect(cariSlot(jadwal, 959)).toEqual(jadwal[0])
  })

  it('mengembalikan null di luar rentang', () => {
    expect(cariSlot(jadwal, 479)).toBeNull()
    expect(cariSlot(jadwal, 960)).toBeNull()
  })
})

describe('slotSaatIni', () => {
  it('memilih slot berdasarkan waktu sekarang', () => {
    const jadwal = [
      { id: 1, jamMulai: 480, jamSelesai: 960 },
      { id: 2, jamMulai: 960, jamSelesai: 1440 },
    ]

    expect(slotSaatIni(jadwal, new Date(2026, 10, 5, 10, 0))).toEqual(jadwal[0])
    expect(slotSaatIni(jadwal, new Date(2026, 10, 5, 16, 0))).toEqual(jadwal[1])
    expect(slotSaatIni(jadwal, new Date(2026, 10, 5, 7, 0))).toBeNull()
  })
})

describe('deskripsiJadwal', () => {
  it('menggabungkan nama dan rentang jam setiap slot', () => {
    expect(
      deskripsiJadwal([
        { nama: 'Pagi', jamMulai: 480, jamSelesai: 960 },
        { nama: 'Sore', jamMulai: 960, jamSelesai: 1440 },
      ])
    ).toBe('Pagi (08:00-16:00), Sore (16:00-24:00)')
  })
})

describe('rentangBentrok', () => {
  it('mendeteksi rentang yang saling menutupi', () => {
    expect(rentangBentrok({ jamMulai: 480, jamSelesai: 960 }, { jamMulai: 900, jamSelesai: 1000 })).toBe(true)
    expect(rentangBentrok({ jamMulai: 480, jamSelesai: 960 }, { jamMulai: 500, jamSelesai: 600 })).toBe(true)
  })

  it('menganggap rentang bersambung atau terpisah tidak bentrok', () => {
    expect(rentangBentrok({ jamMulai: 480, jamSelesai: 960 }, { jamMulai: 960, jamSelesai: 1000 })).toBe(false)
    expect(rentangBentrok({ jamMulai: 480, jamSelesai: 960 }, { jamMulai: 1000, jamSelesai: 1100 })).toBe(false)
  })
})

describe('hitungUangHarap', () => {
  it('menghitung uang awal + tunai - kas keluar', () => {
    expect(hitungUangHarap(100000, 50000, 20000)).toBe(130000)
    expect(hitungUangHarap(0, 0, 0)).toBe(0)
    expect(hitungUangHarap(100000, 0, 150000)).toBe(-50000)
  })
})
