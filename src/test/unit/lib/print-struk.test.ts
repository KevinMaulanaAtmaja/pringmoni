import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { jsPDFMock, createdDocs } = vi.hoisted(() => {
  class MockJsPDF {
    width: number
    internal: { pageSize: { getWidth: () => number } }
    text = vi.fn()
    setFont = vi.fn()
    setFontSize = vi.fn()
    getTextWidth = vi.fn((text: string) => text.length)
    autoPrint = vi.fn()
    output = vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' }))

    constructor(options: { format: [number, number] }) {
      this.width = options.format[0]
      this.internal = { pageSize: { getWidth: () => this.width } }
    }
  }

  const docs: MockJsPDF[] = []
  class TrackedJsPDF extends MockJsPDF {
    constructor(options: { format: [number, number] }) {
      super(options)
      docs.push(this)
    }
  }

  return { jsPDFMock: TrackedJsPDF, createdDocs: docs }
})

vi.mock('jspdf', () => ({ jsPDF: jsPDFMock }))

import { printStruk, printStruk58 } from '@/lib/print-struk'

const openMock = vi.fn()

function semuaTeks() {
  return createdDocs.flatMap((doc) =>
    doc.text.mock.calls.map((panggilan) => String(panggilan[0]))
  )
}

beforeEach(() => {
  createdDocs.length = 0
  openMock.mockClear()
  vi.stubGlobal('window', { open: openMock })
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('printStruk', () => {
  it('mencetak struk pelanggan dan kitchen dengan data lengkap', () => {
    printStruk({
      id: 7,
      nomorMeja: 'K01',
      items: [{ nama: 'Nasi Goreng Spesial Pringsewu', jumlah: 2, harga: 25000 }],
      totalHarga: 50000,
      metodePembayaran: 'transfer',
      jumlahBayar: 60000,
      kembalian: 5000,
      createdAt: new Date('2026-11-05T10:00:00+07:00'),
      waiterUsername: 'waiter1',
      kasirUsername: 'kasir1',
      namaPelanggan: 'Budi',
    })

    const teks = semuaTeks()
    expect(createdDocs).toHaveLength(2)
    expect(openMock).toHaveBeenCalledWith('blob:mock')
    expect(teks).toContain('PRINGMONI')
    expect(teks).toContain('Restoran Pringsewu')
    expect(teks).toContain('Atas Nama: Budi')
    expect(teks).toContain('Kasir: kasir1')
    expect(teks).toContain('Metode: TRANSFER')
    expect(teks).toContain('KITCHEN ORDER')
    expect(teks).toContain('Biaya Admin')
    expect(teks).toContain('Dibayar:')
    expect(teks).toContain('Kembalian:')
    expect(teks.some((t) => t.startsWith('WiFi:'))).toBe(true)
    expect(teks.some((t) => t.startsWith('2x ') && t.endsWith('..'))).toBe(true)
  })

  it('menampilkan varian suhu dan catatan item pada struk', () => {
    printStruk({
      id: 11,
      nomorMeja: 'K05',
      items: [
        {
          nama: 'Es Teh',
          jumlah: 1,
          harga: 5000,
          catatan: '[Varian: Dingin] Catatan: tanpa gula',
        },
      ],
      totalHarga: 5000,
      createdAt: new Date('2026-11-28T10:00:00+07:00'),
    })

    const teks = semuaTeks()
    expect(teks.some((t) => t === '1x Es Teh [DINGIN]')).toBe(true)
    expect(teks.some((t) => t.trim() === 'tanpa gula')).toBe(true)
    expect(teks.some((t) => t.includes('[Varian:'))).toBe(false)
  })

  it('mencetak QRIS tanpa biaya admin tambahan', () => {
    printStruk({
      id: 8,
      nomorMeja: 'K02',
      items: [],
      totalHarga: 20000,
      metodePembayaran: 'qris',
      createdAt: '2026-11-05T10:00:00+07:00',
    })

    const teks = semuaTeks()
    expect(teks).toContain('Metode: QRIS')
    expect(teks).not.toContain('Biaya Admin')
    expect(teks).not.toContain('Dibayar:')
    expect(teks).not.toContain('Kembalian:')
  })

  it('mencetak tanpa data opsional', () => {
    printStruk({
      id: 9,
      nomorMeja: 'K03',
      items: [],
      totalHarga: 0,
      createdAt: new Date('2026-11-05T10:00:00+07:00'),
    })

    const teks = semuaTeks()
    expect(teks).not.toContain('Atas Nama:')
    expect(teks.some((t) => t.startsWith('Kasir:'))).toBe(false)
    expect(teks.some((t) => t.startsWith('Metode:'))).toBe(false)
    expect(teks).not.toContain('Biaya Admin')
    expect(teks).not.toContain('Dibayar:')
    expect(teks).not.toContain('Kembalian:')
  })
})

describe('printStruk58', () => {
  it('memakai subtotal, admin fee, dan ppn eksplisit pada kertas 58mm', () => {
    printStruk58({
      id: 10,
      nomorMeja: 'K04',
      items: [],
      totalHarga: 20000,
      subtotal: 20000,
      adminFee: 0,
      ppn: 1000,
      metodePembayaran: 'qris',
      createdAt: '2026-11-05T10:00:00+07:00',
    })

    const teks = semuaTeks()
    expect(createdDocs).toHaveLength(2)
    expect(teks).toContain('='.repeat(18))
    expect(teks).toContain('Subtotal')
    expect(teks).toContain('TOTAL')
    expect(teks).not.toContain('Biaya Admin')
    expect(teks).not.toContain('Dibayar:')
    expect(openMock).toHaveBeenCalledWith('blob:mock')
  })
})
