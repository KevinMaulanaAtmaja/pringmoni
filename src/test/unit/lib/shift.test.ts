import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  HANYA_KASIR,
  MAKS_NOMINAL,
  PESANAN_TANPA_SHIFT,
  hitungTotalShift,
  requireShiftAktif,
  shiftAktifSlotSekarang,
  tanggalShiftSekarang,
  totalKasKeluar,
  uangHarapAkhir,
  validasiNominal,
} from '@/lib/shift'

beforeEach(() => {
  vi.resetAllMocks()
  authMock.mockResolvedValue(null)
  prismaMock.$queryRaw.mockResolvedValue([])
  prismaMock.shiftKasir.findFirst.mockResolvedValue(null)
  prismaMock.jadwalShift.findMany.mockResolvedValue([])
  prismaMock.shiftKasir.findMany.mockResolvedValue([])
  prismaMock.kasKeluar.aggregate.mockResolvedValue({ _sum: { nominal: null } })
})

describe('validasiNominal', () => {
  it('menerima nol dan nominal bulat valid', () => {
    expect(validasiNominal(0)).toEqual({ nilai: 0 })
    expect(validasiNominal('50000')).toEqual({ nilai: 50000 })
    expect(validasiNominal(100000)).toEqual({ nilai: 100000 })
  })

  it('menolak nominal negatif, tidak berhingga, atau bukan angka', () => {
    expect(validasiNominal(-1)).toEqual({ error: 'Nominal uang kas tidak valid' })
    expect(validasiNominal(Number.NaN)).toEqual({ error: 'Nominal uang kas tidak valid' })
    expect(validasiNominal(Number.POSITIVE_INFINITY)).toEqual({ error: 'Nominal uang kas tidak valid' })
    expect(validasiNominal('abc')).toEqual({ error: 'Nominal uang kas tidak valid' })
  })

  it('menolak nominal melebihi batas', () => {
    expect(validasiNominal(MAKS_NOMINAL + 1)).toEqual({
      error: 'Nominal melebihi batas yang wajar',
    })
  })

  it('menolak nominal pecahan', () => {
    expect(validasiNominal(1000.5)).toEqual({
      error: 'Nominal harus berupa angka bulat rupiah',
    })
  })
})

describe('tanggalShiftSekarang', () => {
  it('mengembalikan tengah malam UTC dari tanggal lokal', () => {
    const hasil = tanggalShiftSekarang(new Date(2026, 10, 5, 23, 59))
    expect(hasil.toISOString()).toBe('2026-11-05T00:00:00.000Z')
  })
})

describe('uangHarapAkhir', () => {
  it('menghitung uang awal + tunai - kas keluar', () => {
    expect(uangHarapAkhir(100000, 50000, 20000)).toBe(130000)
    expect(uangHarapAkhir(0, 0, 0)).toBe(0)
    expect(uangHarapAkhir(100000, 0, 150000)).toBe(-50000)
  })
})

describe('hitungTotalShift', () => {
  it('mengubah hasil query menjadi angka', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        total_transaksi: 3,
        total_pendapatan: '75000',
        total_tunai: '50000',
        total_non_tunai: '25000',
      },
    ])

    const hasil = await hitungTotalShift(7)

    expect(hasil).toEqual({
      totalTransaksi: 3,
      totalPendapatan: 75000,
      totalTunai: 50000,
      totalNonTunai: 25000,
    })
  })

  it('mengembalikan nol saat tidak ada baris', async () => {
    const hasil = await hitungTotalShift(7)

    expect(hasil).toEqual({
      totalTransaksi: 0,
      totalPendapatan: 0,
      totalTunai: 0,
      totalNonTunai: 0,
    })
  })
})

describe('requireShiftAktif', () => {
  it('menolak tanpa session', async () => {
    await expect(requireShiftAktif()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menolak role selain cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    await expect(requireShiftAktif()).resolves.toEqual({ error: HANYA_KASIR })
  })

  it('menolak id kasir yang tidak valid', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: 'abc' }))

    await expect(requireShiftAktif()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menolak saat tidak ada shift aktif', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2' }))

    await expect(requireShiftAktif()).resolves.toEqual({ error: PESANAN_TANPA_SHIFT })
  })

  it('mengembalikan shift aktif milik kasir', async () => {
    authMock.mockResolvedValue(
      sessionUntuk('cashier', { id: '2', username: 'kasir1' })
    )
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })

    await expect(requireShiftAktif()).resolves.toEqual({
      shiftId: 9,
      kasirId: 2,
      kasirUsername: 'kasir1',
    })
  })

  it('memakai username kosong bila session tidak punya username', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: '' }))
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })

    const hasil = await requireShiftAktif()

    expect(hasil).toEqual({ shiftId: 9, kasirId: 2, kasirUsername: '' })
  })
})

describe('shiftAktifSlotSekarang', () => {
  const now = new Date(2026, 10, 5, 10, 0)
  const jadwal = [{ id: 1, jamMulai: 0, jamSelesai: 1440 }]

  it('mengembalikan null bila tidak ada jadwal aktif', async () => {
    await expect(shiftAktifSlotSekarang(now)).resolves.toBeNull()
  })

  it('mengembalikan null bila waktu di luar slot', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([
      { id: 1, jamMulai: 480, jamSelesai: 960 },
    ])

    await expect(
      shiftAktifSlotSekarang(new Date(2026, 10, 5, 7, 0))
    ).resolves.toBeNull()
  })

  it('mengembalikan null bila shift aktif bukan tepat satu', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue(jadwal)
    prismaMock.shiftKasir.findMany.mockResolvedValue([])

    await expect(shiftAktifSlotSekarang(now)).resolves.toBeNull()

    prismaMock.shiftKasir.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }])
    await expect(shiftAktifSlotSekarang(now)).resolves.toBeNull()
  })

  it('mengembalikan id shift saat tepat satu shift aktif di slot', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue(jadwal)
    prismaMock.shiftKasir.findMany.mockResolvedValue([{ id: 9 }])

    await expect(shiftAktifSlotSekarang(now)).resolves.toBe(9)
  })
})

describe('totalKasKeluar', () => {
  it('mengembalikan nol saat tidak ada kas keluar', async () => {
    await expect(totalKasKeluar(1)).resolves.toBe(0)
  })

  it('menjumlahkan nominal kas keluar', async () => {
    prismaMock.kasKeluar.aggregate.mockResolvedValue({ _sum: { nominal: 25000 } })

    await expect(totalKasKeluar(1)).resolves.toBe(25000)
  })
})
