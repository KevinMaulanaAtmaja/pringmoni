import { describe, it, expect } from 'vitest'
import { QRIS_STATIC_URL, getQrisStaticUrl } from '@/lib/qris-static'

describe('qris-static', () => {
  it('mengembalikan URL statis yang sama dengan konstanta modul', () => {
    expect(getQrisStaticUrl()).toBe(QRIS_STATIC_URL)
    expect(typeof getQrisStaticUrl()).toBe('string')
  })
})
