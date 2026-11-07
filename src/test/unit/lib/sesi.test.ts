import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import {
  AMBANG_SESI_AKTIF_MS,
  ambilVersiSesi,
  catatAktivitasSesi,
  catatVersiSesi,
  sesiLainKemungkinanAktif,
  waktuLoginLabel,
} from '@/lib/sesi'

const sekarang = (selisihMs: number) => new Date(Date.now() - selisihMs)

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('sesiLainKemungkinanAktif', () => {
  it('false bila tidak ada aktivitas tercatat', () => {
    expect(sesiLainKemungkinanAktif(null, 'device-a', 'device-b')).toBe(false)
  })

  it('false bila sesi sudah lewat ambang 15 menit', () => {
    const lama = sekarang(AMBANG_SESI_AKTIF_MS + 60_000)
    expect(sesiLainKemungkinanAktif(lama, 'device-a', 'device-b')).toBe(false)
  })

  it('false bila perangkat sama', () => {
    expect(sesiLainKemungkinanAktif(sekarang(60_000), 'device-a', 'device-a')).toBe(false)
  })

  it('true bila sesi masih aktif dan perangkat berbeda', () => {
    expect(sesiLainKemungkinanAktif(sekarang(60_000), 'device-a', 'device-b')).toBe(true)
  })

  it('true bila sesi masih aktif dan perangkat tidak diketahui', () => {
    expect(sesiLainKemungkinanAktif(sekarang(60_000), 'device-a', null)).toBe(true)
  })
})

describe('waktuLoginLabel', () => {
  it('menangani tanggal kosong', () => {
    expect(waktuLoginLabel(null)).toBe('tidak diketahui')
  })

  it('memformat selisih detik, menit, jam, dan hari', () => {
    expect(waktuLoginLabel(sekarang(10_000))).toBe('beberapa detik yang lalu')
    expect(waktuLoginLabel(sekarang(5 * 60_000))).toBe('5 menit yang lalu')
    expect(waktuLoginLabel(sekarang(3 * 3_600_000))).toBe('3 jam yang lalu')
    expect(waktuLoginLabel(sekarang(2 * 86_400_000))).toBe('2 hari yang lalu')
  })
})

describe('ambilVersiSesi', () => {
  it('mengembalikan versi dari cache tanpa query database', async () => {
    catatVersiSesi(9001, 7)

    expect(await ambilVersiSesi(9001)).toBe(7)
    expect(prismaMock.users.findUnique).not.toHaveBeenCalled()
  })

  it('mengambil versi terbaru dari database setelah cache kedaluwarsa', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))
    catatVersiSesi(9002, 1)

    vi.advanceTimersByTime(3001)
    prismaMock.users.findUnique.mockResolvedValue({ sessionVersion: 2 })

    expect(await ambilVersiSesi(9002)).toBe(2)
    expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
      where: { id: 9002 },
      select: { sessionVersion: true },
    })
  })

  it('mengembalikan null bila user tidak ditemukan', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null)

    expect(await ambilVersiSesi(9003)).toBeNull()
  })

  it('mengembalikan null bila database gagal dibaca', async () => {
    prismaMock.users.findUnique.mockRejectedValue(new Error('database down'))

    expect(await ambilVersiSesi(9004)).toBeNull()
  })
})

describe('catatAktivitasSesi', () => {
  it('membatasi penulisan aktivitas maksimal sekali per 2 menit', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))
    prismaMock.users.update.mockResolvedValue({})

    await catatAktivitasSesi(9101)
    await catatAktivitasSesi(9101)
    expect(prismaMock.users.update).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(2 * 60 * 1000 + 1)
    await catatAktivitasSesi(9101)
    expect(prismaMock.users.update).toHaveBeenCalledTimes(2)
  })

  it('mengabaikan kegagalan pencatatan aktivitas', async () => {
    prismaMock.users.update.mockRejectedValue(new Error('database down'))

    await expect(catatAktivitasSesi(9102)).resolves.toBeUndefined()
  })
})
