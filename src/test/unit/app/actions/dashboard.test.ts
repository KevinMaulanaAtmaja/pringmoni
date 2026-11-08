import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  authMock,
  createLogMock,
  triggerPusherMock,
  getNotifikasiTerlambatMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  triggerPusherMock: vi.fn(),
  getNotifikasiTerlambatMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'order-updated' },
}))
vi.mock('@/app/actions/notifikasi', () => ({
  getNotifikasiTerlambat: getNotifikasiTerlambatMock,
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  autoCancelStaleUnpaid,
  cekAutoCancelOtomatis,
  getDashboardCharts,
  getDashboardStats,
  getPaidStaleWarnings,
  getStaleOrders,
} from '@/app/actions/dashboard'

beforeEach(() => {
  vi.resetAllMocks()

  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  authMock.mockResolvedValue(sessionUntuk('owner'))
  prismaMock.pesanan.count.mockResolvedValue(0)
  prismaMock.pesanan.aggregate.mockResolvedValue({ _sum: { totalHarga: null } })
  prismaMock.pesanan.findMany.mockResolvedValue([])
  prismaMock.pesanan.updateMany.mockResolvedValue({ count: 1 })
  prismaMock.meja.findMany.mockResolvedValue([])
  prismaMock.meja.updateMany.mockResolvedValue({ count: 1 })
  prismaMock.detailPesanan.aggregate.mockResolvedValue({ _sum: { jumlah: null } })
  prismaMock.detailPesanan.findMany.mockResolvedValue([])
  getNotifikasiTerlambatMock.mockResolvedValue({ orders: [], total: 0 })
  createLogMock.mockResolvedValue(undefined)
  triggerPusherMock.mockResolvedValue(undefined)
})

describe('cekAutoCancelOtomatis', () => {
  it('menjalankan auto-cancel pada pemanggilan pertama', async () => {
    const hasil = await cekAutoCancelOtomatis()

    expect(hasil).toEqual({ cancelled: 0 })
    expect(prismaMock.pesanan.findMany).toHaveBeenCalled()
  })

  it('melewati pemanggilan kedua dalam 60 detik', async () => {
    const hasil = await cekAutoCancelOtomatis()

    expect(hasil).toEqual({ cancelled: 0, skipped: true })
  })
})

describe('getDashboardStats', () => {
  it('mengembalikan statistik lengkap untuk owner', async () => {
    prismaMock.pesanan.count.mockResolvedValueOnce(12).mockResolvedValueOnce(3)
    prismaMock.pesanan.aggregate.mockResolvedValue({ _sum: { totalHarga: 500000 } })
    prismaMock.meja.findMany.mockResolvedValue([
      { statusMeja: 'kosong' },
      { statusMeja: 'kosong' },
      { statusMeja: 'terpakai' },
    ])
    prismaMock.detailPesanan.aggregate.mockResolvedValue({ _sum: { jumlah: 27 } })

    const hasil = await getDashboardStats()

    expect(hasil).toEqual({
      pesananHariIni: 12,
      totalPendapatan: 500000,
      mejaKosong: 2,
      mejaTerpakai: 1,
      pesananMenunggu: 3,
      itemTerjual: 27,
      showMeja: true,
    })
  })

  it('menyembunyikan data meja untuk cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await getDashboardStats()

    expect(hasil).toMatchObject({ showMeja: false })
  })

  it('mengembalikan statistik khusus waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.count
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5)

    const hasil = await getDashboardStats()

    expect(hasil).toEqual({
      pesananHariIni: 8,
      pesananMenunggu: 2,
      pesananDiproses: 5,
      showPendapatan: false,
      showMeja: false,
      showPesananDiproses: true,
    })
  })

  it('memakai nilai nol saat agregat kosong', async () => {
    const hasil = await getDashboardStats()

    expect(hasil).toMatchObject({
      totalPendapatan: 0,
      itemTerjual: 0,
    })
  })

  it('mengembalikan nol saat query gagal', async () => {
    prismaMock.pesanan.count.mockRejectedValue(new Error('db down'))

    const hasil = await getDashboardStats()

    expect(hasil).toEqual({
      pesananHariIni: 0,
      totalPendapatan: 0,
      mejaKosong: 0,
      mejaTerpakai: 0,
      pesananMenunggu: 0,
      itemTerjual: 0,
      showMeja: true,
    })
  })
})

describe('getDashboardCharts', () => {
  it('membangun grafik owner dari data pesanan', async () => {
    const now = new Date()
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([
        { totalHarga: 100000, createdAt: now },
        { totalHarga: 50000, createdAt: now },
      ])
      .mockResolvedValueOnce([
        { totalHarga: 100000, statusPembayaran: 'berhasil', metodePembayaran: 'tunai' },
        { totalHarga: 50000, statusPembayaran: 'berhasil', metodePembayaran: 'qris' },
        { totalHarga: 25000, statusPembayaran: 'menunggu', metodePembayaran: null },
      ])
    prismaMock.meja.findMany.mockResolvedValue([
      { statusMeja: 'terpakai' },
      { statusMeja: 'kosong' },
    ])
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { jumlah: 2, menu: { namaMenu: 'Nasi Goreng' } },
      { jumlah: 1, menu: { namaMenu: 'Nasi Goreng' } },
      { jumlah: 1, menu: { namaMenu: 'Es Teh' } },
    ])

    const hasil = await getDashboardCharts()

    expect(hasil.pendapatan7Hari).toHaveLength(7)
    expect(hasil.meja).toEqual({ terpakai: 1, kosong: 1 })
    expect(hasil.metodePembayaran).toEqual([
      { label: 'tunai', value: 100000 },
      { label: 'qris', value: 50000 },
    ])
    expect(hasil.topMenu).toEqual([
      { nama: 'Nasi Goreng', total: 3 },
      { nama: 'Es Teh', total: 1 },
    ])
  })

  it('membangun grafik cashier per status dan metode', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    const jam = new Date()
    jam.setHours(9, 0, 0, 0)
    prismaMock.pesanan.findMany.mockResolvedValue([
      {
        createdAt: jam,
        totalHarga: 30000,
        statusPembayaran: 'berhasil',
        metodePembayaran: 'tunai',
      },
      {
        createdAt: jam,
        totalHarga: 20000,
        statusPembayaran: 'berhasil',
        metodePembayaran: 'qris',
      },
      {
        createdAt: jam,
        totalHarga: 10000,
        statusPembayaran: 'menunggu',
        metodePembayaran: null,
      },
    ])

    const hasil = await getDashboardCharts()

    expect(hasil.statusPembayaran).toEqual(
      expect.arrayContaining([
        { label: 'berhasil', value: 2 },
        { label: 'menunggu', value: 1 },
      ])
    )
    expect(hasil.perbandinganMetode).toEqual([
      { label: '09:00', tunai: 30000, qris: 20000, transfer: 0 },
    ])
  })

  it('membangun grafik waiter per jam dan status antar', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    const jam = new Date()
    jam.setHours(11, 0, 0, 0)
    prismaMock.pesanan.findMany.mockResolvedValue([{ createdAt: jam }])
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { statusAntar: 'diantar', jumlah: 2 },
      { statusAntar: 'belum', jumlah: 3 },
    ])

    const hasil = await getDashboardCharts()

    expect(hasil.pesananPerJam).toEqual([{ label: '11:00', value: 1 }])
    expect(hasil.statusAntarItem).toEqual(
      expect.arrayContaining([
        { label: 'diantar', value: 2 },
        { label: 'belum', value: 3 },
      ])
    )
  })

  it('mengembalikan objek kosong tanpa role', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getDashboardCharts()

    expect(hasil).toEqual({})
  })

  it('mengembalikan hasil parsial saat query gagal', async () => {
    prismaMock.pesanan.findMany.mockRejectedValue(new Error('db down'))

    const hasil = await getDashboardCharts()

    expect(hasil).toEqual({})
  })
})

describe('getStaleOrders', () => {
  it('memetakan pesanan terlambat dari notifikasi', async () => {
    getNotifikasiTerlambatMock.mockResolvedValue({
      orders: [
        {
          id: 4,
          nomorMeja: 'K02',
          statusPesanan: 'menunggu',
          lamaMenit: 45,
          createdAt: '2026-11-05T03:00:00.000Z',
        },
      ],
      total: 1,
    })

    const hasil = await getStaleOrders()

    expect(hasil).toEqual([
      {
        id: 4,
        nomorMeja: 'K02',
        statusPesanan: 'menunggu',
        lamaMenit: 45,
        createdAt: new Date('2026-11-05T03:00:00.000Z'),
      },
    ])
  })
})

describe('autoCancelStaleUnpaid', () => {
  it('tidak melakukan apa pun saat tidak ada pesanan basi', async () => {
    const hasil = await autoCancelStaleUnpaid()

    expect(hasil).toEqual({ cancelled: 0 })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('membatalkan pesanan basi, mengosongkan meja, log, dan Pusher', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      { id: 1, mejaId: 1, metodePembayaran: 'tunai' },
      { id: 2, mejaId: 1, metodePembayaran: null },
    ])

    const hasil = await autoCancelStaleUnpaid()

    expect(hasil).toEqual({ cancelled: 2 })
    expect(prismaMock.pesanan.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] }, statusPembayaran: 'menunggu' },
      data: expect.objectContaining({
        statusPesanan: 'dibatalkan',
        statusPembayaran: 'dibatalkan',
      }),
    })
    expect(prismaMock.meja.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] }, statusMeja: 'terpakai' },
      data: { statusMeja: 'kosong' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_EXPIRED',
      expect.stringContaining('tunai: 1, tanpa_metode: 1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
  })

  it('mengembalikan nol saat proses gagal', async () => {
    prismaMock.pesanan.findMany.mockRejectedValue(new Error('db down'))

    const hasil = await autoCancelStaleUnpaid()

    expect(hasil).toEqual({ cancelled: 0 })
  })
})

describe('getPaidStaleWarnings', () => {
  it('mengembalikan kosong tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getPaidStaleWarnings()

    expect(hasil).toEqual([])
  })

  it('mengembalikan kosong untuk owner', async () => {
    const hasil = await getPaidStaleWarnings()

    expect(hasil).toEqual([])
    expect(prismaMock.pesanan.findMany).not.toHaveBeenCalled()
  })

  it('memetakan pesanan dibayar yang lama diproses untuk cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    const createdAt = new Date(Date.now() - 90 * 60 * 1000)
    prismaMock.pesanan.findMany.mockResolvedValue([
      { id: 6, createdAt, mejaId: 2, namaPelanggan: 'Ani' },
    ])
    prismaMock.meja.findMany.mockResolvedValue([{ id: 2, nomorMeja: 'L01' }])

    const hasil = await getPaidStaleWarnings()

    expect(hasil).toEqual([
      { id: 6, nomorMeja: 'L01', namaPelanggan: 'Ani', lamaMenit: 90 },
    ])
  })

  it('memakai label fallback saat meja tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findMany.mockResolvedValue([
      { id: 7, createdAt: new Date(Date.now() - 61 * 60 * 1000), mejaId: 9, namaPelanggan: null },
    ])
    prismaMock.meja.findMany.mockResolvedValue([])

    const hasil = await getPaidStaleWarnings()

    expect(hasil[0]).toMatchObject({ id: 7, nomorMeja: 'Meja #9' })
  })

  it('mengembalikan kosong saat query gagal', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findMany.mockRejectedValue(new Error('db down'))

    const hasil = await getPaidStaleWarnings()

    expect(hasil).toEqual([])
  })
})
