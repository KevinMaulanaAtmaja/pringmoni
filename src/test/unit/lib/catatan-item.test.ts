import { describe, it, expect } from 'vitest'
import { gabungCatatanItem, pisahCatatanItem } from '@/lib/catatan-item'

describe('pisahCatatanItem', () => {
  it('mengembalikan null untuk nilai kosong', () => {
    expect(pisahCatatanItem(null)).toEqual({ varian: null, catatan: null })
    expect(pisahCatatanItem(undefined)).toEqual({ varian: null, catatan: null })
    expect(pisahCatatanItem('')).toEqual({ varian: null, catatan: null })
    expect(pisahCatatanItem('   ')).toEqual({ varian: null, catatan: null })
  })

  it('memisahkan varian dan catatan', () => {
    expect(pisahCatatanItem('[Varian: Pedas] Catatan: tanpa saus')).toEqual({
      varian: 'Pedas',
      catatan: 'tanpa saus',
    })
  })

  it('mendukung penulisan varian case-insensitive dan spasi', () => {
    expect(pisahCatatanItem('[varian:  Level 5 ]')).toEqual({
      varian: 'Level 5',
      catatan: null,
    })
  })

  it('mengembalikan catatan null untuk teks biasa', () => {
    expect(pisahCatatanItem('Tanpa es')).toEqual({ varian: null, catatan: 'Tanpa es' })
  })

  it('menghapus semua penanda varian bila lebih dari satu', () => {
    expect(pisahCatatanItem('[Varian: A][Varian: B] Catatan: tes')).toEqual({
      varian: 'A',
      catatan: 'tes',
    })
  })
})

describe('gabungCatatanItem', () => {
  it('menyimpan varian tanpa catatan', () => {
    expect(gabungCatatanItem(null, 'Panas')).toBe('[Varian: Panas]')
    expect(gabungCatatanItem('', 'Dingin')).toBe('[Varian: Dingin]')
  })

  it('menyimpan varian dan catatan', () => {
    expect(gabungCatatanItem('tanpa saus', 'Dingin')).toBe('[Varian: Dingin] Catatan: tanpa saus')
  })

  it('mengembalikan catatan apa adanya bila tanpa varian', () => {
    expect(gabungCatatanItem('tanpa saus', null)).toBe('tanpa saus')
    expect(gabungCatatanItem(null, null)).toBe(null)
  })

  it('hasil gabungan bisa dibaca kembali oleh pisahCatatanItem', () => {
    expect(pisahCatatanItem(gabungCatatanItem('pedas', 'Panas'))).toEqual({
      varian: 'Panas',
      catatan: 'pedas',
    })
  })
})
