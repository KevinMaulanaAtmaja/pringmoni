import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('menggabungkan class dan mengabaikan nilai falsy', () => {
    expect(cn('px-2', false && 'hidden', null, undefined, ['text-sm'])).toBe('px-2 text-sm')
  })

  it('menggabungkan class Tailwind yang bertabrakan', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
