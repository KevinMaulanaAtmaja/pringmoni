import { describe, it, expect } from 'vitest'
import {
  ADMIN_FEE_QRIS_PERSEN,
  ADMIN_FEE_TRANSFER,
  EXPIRY_QRIS_MENIT,
  EXPIRY_TRANSFER_MENIT,
  hitungAdminFee,
  hitungExpiryMenit,
} from '@/lib/fee'

describe('hitungAdminFee', () => {
  it('mengembalikan biaya tetap untuk transfer', () => {
    expect(hitungAdminFee('transfer', 10000)).toBe(4000)
    expect(hitungAdminFee('transfer', 0)).toBe(ADMIN_FEE_TRANSFER)
  })

  it('mengembalikan nol untuk QRIS', () => {
    expect(ADMIN_FEE_QRIS_PERSEN).toBe(0)
    expect(hitungAdminFee('qris', 100000)).toBe(0)
  })

  it('mengembalikan nol untuk metode yang tidak dikenal', () => {
    expect(hitungAdminFee('lain' as 'qris', 100000)).toBe(0)
  })
})

describe('hitungExpiryMenit', () => {
  it('mengembalikan 60 menit untuk transfer dan QRIS', () => {
    expect(hitungExpiryMenit('transfer')).toBe(EXPIRY_TRANSFER_MENIT)
    expect(hitungExpiryMenit('qris')).toBe(EXPIRY_QRIS_MENIT)
    expect(hitungExpiryMenit('lain' as 'qris')).toBe(60)
  })
})
