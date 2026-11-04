import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ default: {} }))

import { AMBANG_SESI_AKTIF_MS, sesiLainKemungkinanAktif, waktuLoginLabel } from './sesi'

const sekarang = (selisihMs: number) => new Date(Date.now() - selisihMs)

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
