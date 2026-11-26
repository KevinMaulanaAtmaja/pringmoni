import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const pdfState = vi.hoisted(() => ({
  instances: [] as Array<Record<string, unknown>>,
  height: 297,
}))

const excelState = vi.hoisted(() => ({
  workbooks: [] as Array<Record<string, unknown>>,
}))

vi.mock('jspdf', () => {
  class FakeJsPDF {
    internal = {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => pdfState.height,
      },
    }
    text = vi.fn()
    line = vi.fn()
    setFont = vi.fn()
    setFontSize = vi.fn()
    setDrawColor = vi.fn()
    setLineWidth = vi.fn()
    getTextWidth = vi.fn((text: string) => text.length * 2)
    addPage = vi.fn()
    autoPrint = vi.fn()
    output = vi.fn(() => new Blob(['pdf']))

    constructor() {
      pdfState.instances.push(this as unknown as Record<string, unknown>)
    }
  }

  return { jsPDF: FakeJsPDF }
})

vi.mock('exceljs', () => {
  class FakeWorksheet {
    rows: unknown[][] = []
    addRow = vi.fn((row: unknown[]) => {
      this.rows.push(row)
    })
    addRows = vi.fn((rows: unknown[][]) => {
      this.rows.push(...rows)
    })

    constructor(public name: string) {}
  }

  class FakeWorkbook {
    worksheets: FakeWorksheet[] = []
    xlsx = { writeBuffer: vi.fn(async () => new ArrayBuffer(8)) }

    addWorksheet(name: string) {
      const ws = new FakeWorksheet(name)
      this.worksheets.push(ws)
      return ws
    }

    constructor() {
      excelState.workbooks.push(this as unknown as Record<string, unknown>)
    }
  }

  return { default: { Workbook: FakeWorkbook } }
})

import { exportLaporanExcel, exportLaporanPDF } from '@/lib/export-laporan'

const windowOpenMock = vi.fn()
const createObjectUrlMock = vi.fn(() => 'blob:url')
const revokeObjectUrlMock = vi.fn()
const clickMock = vi.fn()
const createElementMock = vi.fn(() => ({ href: '', download: '', click: clickMock }))

function itemPesanan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    nomorMeja: 'K01',
    namaPelanggan: 'Budi',
    totalHarga: 50000,
    statusPesanan: 'selesai',
    statusPembayaran: 'berhasil',
    metodePembayaran: 'tunai',
    createdAt: new Date('2026-11-05T09:00:00+07:00'),
    kasirUsername: 'kasir1',
    waiterUsername: 'waiter1',
    items: [],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  pdfState.instances = []
  pdfState.height = 297
  excelState.workbooks = []

  createObjectUrlMock.mockReturnValue('blob:url')
  createElementMock.mockReturnValue({ href: '', download: '', click: clickMock })

  vi.stubGlobal('window', { open: windowOpenMock })
  vi.stubGlobal('document', { createElement: createElementMock })
  vi.stubGlobal('URL', {
    createObjectURL: createObjectUrlMock,
    revokeObjectURL: revokeObjectUrlMock,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('exportLaporanPDF', () => {
  it('mencetak ringkasan periode tunggal dan membuka blob', () => {
    exportLaporanPDF(
      'Laporan',
      '2026',
      null,
      50000,
      2,
      5,
      30000,
      20000,
      0,
      [],
      [],
      [],
      0,
      3,
      '09:00',
      2
    )

    const doc = pdfState.instances[0]
    expect(doc.autoPrint).toHaveBeenCalled()
    expect(doc.output).toHaveBeenCalledWith('blob')
    expect(windowOpenMock).toHaveBeenCalledWith('blob:url')
    expect(doc.text).toHaveBeenCalledWith(
      'Total Pendapatan',
      15,
      expect.any(Number)
    )
    expect(doc.text).toHaveBeenCalledWith(
      expect.stringMatching(/50\.000/),
      100,
      expect.any(Number)
    )
  })

  it('memakai nilai nol saat pendapatan tidak diberikan', () => {
    exportLaporanPDF('Laporan', '2026', null)

    const doc = pdfState.instances[0]
    expect(doc.text).toHaveBeenCalledWith('Rp 0', 100, expect.any(Number))
  })

  it('menambah halaman untuk setiap bulan pada laporan tahunan', () => {
    exportLaporanPDF('Laporan', '2026', [
      { label: 'Januari', pendapatan: null, menuTerlaris: [] },
      { label: 'Februari', pendapatan: null, menuTerlaris: [] },
      { label: 'Maret', pendapatan: null, menuTerlaris: [] },
    ])

    const doc = pdfState.instances[0]
    expect(doc.addPage).toHaveBeenCalledTimes(2)
  })

  it('membuat halaman baru saat konten melewati batas halaman', () => {
    pdfState.height = 50

    exportLaporanPDF(
      'Laporan',
      '2026',
      null,
      100000,
      4,
      8,
      50000,
      30000,
      20000,
      [],
      Array.from({ length: 8 }, (_, i) => ({
        namaMenu: `Menu ${i + 1}`,
        kategori: 'Makanan',
        totalTerjual: 10 - i,
        totalPendapatan: 10000,
      })),
      [],
      0,
      2
    )

    const doc = pdfState.instances[0]
    expect(doc.addPage).toHaveBeenCalled()
    expect(doc.line).toHaveBeenCalled()
  })
})

describe('exportLaporanExcel', () => {
  it('membuat worksheet detail pesanan dan mengunduh file', async () => {
    await exportLaporanExcel('Laporan Penjualan', [itemPesanan()])

    const wb = excelState.workbooks[0] as unknown as {
      worksheets: Array<{ name: string; addRow: ReturnType<typeof vi.fn>; addRows: ReturnType<typeof vi.fn> }>
      xlsx: { writeBuffer: ReturnType<typeof vi.fn> }
    }
    expect(wb.worksheets).toHaveLength(1)
    expect(wb.worksheets[0].name).toBe('Detail Pesanan')
    expect(wb.worksheets[0].addRow).toHaveBeenCalledWith([
      'ID',
      'Meja',
      'Pelanggan',
      'Total',
      'Status',
      'Status Bayar',
      'Metode',
      'Waktu',
      'Kasir',
    ])
    expect(wb.worksheets[0].addRows).toHaveBeenCalledWith([
      [
        1,
        'K01',
        'Budi',
        50000,
        'selesai',
        'berhasil',
        'tunai',
        new Date('2026-11-05T09:00:00+07:00').toISOString(),
        'kasir1',
      ],
    ])
    expect(wb.xlsx.writeBuffer).toHaveBeenCalled()
    expect(createObjectUrlMock).toHaveBeenCalled()
    expect(createElementMock).toHaveBeenCalledWith('a')
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectUrlMock).toHaveBeenCalled()
  })

  it('hanya membuat worksheet untuk bulan yang memiliki pesanan', async () => {
    await exportLaporanExcel('Laporan', [], [
      { label: 'Januari', detailPesanan: [] },
      { label: 'Februari', detailPesanan: [itemPesanan({ id: 2 })] },
    ])

    const wb = excelState.workbooks[0] as unknown as {
      worksheets: Array<{ name: string }>
    }
    expect(wb.worksheets).toHaveLength(1)
    expect(wb.worksheets[0].name).toBe('Februari')
  })

  it('memakai tanda "-" untuk relasi opsional yang kosong', async () => {
    await exportLaporanExcel('Laporan', [
      itemPesanan({ namaPelanggan: null, metodePembayaran: null, kasirUsername: null }),
    ])

    const wb = excelState.workbooks[0] as unknown as {
      worksheets: Array<{ addRows: ReturnType<typeof vi.fn> }>
    }
    const rows = wb.worksheets[0].addRows.mock.calls[0][0]
    expect(rows[0][2]).toBe('-')
    expect(rows[0][6]).toBe('-')
    expect(rows[0][8]).toBe('-')
  })

  it('tetap menulis buffer saat data kosong', async () => {
    await exportLaporanExcel('Laporan', [])

    const wb = excelState.workbooks[0] as unknown as {
      worksheets: unknown[]
      xlsx: { writeBuffer: ReturnType<typeof vi.fn> }
    }
    expect(wb.worksheets).toHaveLength(0)
    expect(wb.xlsx.writeBuffer).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
  })
})
