import { describe, it, expect } from 'vitest'
import { formatRupiah, hitungPotonganDiskon } from '@/lib/voucher'

describe('hitungPotonganDiskon', () => {
  it('mengembalikan 0 untuk subtotal tidak valid', () => {
    expect(hitungPotonganDiskon(0, 10)).toBe(0)
    expect(hitungPotonganDiskon(-100, 10)).toBe(0)
    expect(hitungPotonganDiskon(Number.NaN, 10)).toBe(0)
    expect(hitungPotonganDiskon(Number.POSITIVE_INFINITY, 10)).toBe(0)
  })

  it('membatasi persen ke rentang 0-100', () => {
    expect(hitungPotonganDiskon(10000, -5)).toBe(0)
    expect(hitungPotonganDiskon(10000, 150)).toBe(10000)
  })

  it('membulatkan hasil ke rupiah penuh', () => {
    expect(hitungPotonganDiskon(3333, 10)).toBe(333)
    expect(hitungPotonganDiskon(9999, 33)).toBe(3300)
  })
})

describe('formatRupiah', () => {
  it('memformat nominal dengan pemisah ribuan Indonesia', () => {
    expect(formatRupiah(1500)).toBe('Rp 1.500')
    expect(formatRupiah(1500.6)).toBe('Rp 1.501')
    expect(formatRupiah(0)).toBe('Rp 0')
  })
})
