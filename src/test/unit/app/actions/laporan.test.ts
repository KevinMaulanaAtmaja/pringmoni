import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  getAnalisisTambahan,
  getGrafikPendapatan,
  getLaporanAll,
  getLaporanBanding,
  getLaporanKasir,
  getLaporanKategori,
  getLaporanMenuTerlaris,
  getLaporanPendapatan,
  getPerbandingan,
} from '@/app/actions/laporan'

function pesananLaporan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    nomorMeja: 'K01',
    namaPelanggan: 'Budi',
    totalHarga: 30000,
    statusPesanan: 'selesai',
    metodePembayaran: 'tunai',
    statusPembayaran: 'berhasil',
    createdAt: new Date('2026-11-05T09:00:00+07:00'),
    meja: { nomorMeja: 'K01' },
    kasir: { username: 'kasir1' },
    waiter: { username: 'waiter1' },
    detailPesanan: [
      {
        jumlah: 2,
        hargaSaatPesan: 15000,
        menu: { namaMenu: 'Nasi Goreng', kategori: { namaKategori: 'Makanan' } },
      },
    ],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.pesanan.findMany.mockResolvedValue([])
  prismaMock.detailPesanan.findMany.mockResolvedValue([])
})

describe('getLaporanPendapatan', () => {
  it('mengembalikan nol untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await getLaporanPendapatan('harian', '2026-11-05')

    expect(hasil.pendapatan.totalPendapatan).toBe(0)
    expect(hasil.pendapatan.detailPesanan).toEqual([])
    expect(prismaMock.pesanan.findMany).not.toHaveBeenCalled()
  })

  it('mengagregasi hanya pesanan berhasil dan memecah metode bayar', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      pesananLaporan({ id: 1, totalHarga: 30000, metodePembayaran: 'tunai' }),
      pesananLaporan({ id: 2, totalHarga: 20000, metodePembayaran: 'qris' }),
      pesananLaporan({ id: 3, totalHarga: 10000, metodePembayaran: null, statusPembayaran: 'menunggu' }),
    ])

    const hasil = await getLaporanPendapatan('harian', '2026-11-05')

    expect(hasil.pendapatan).toMatchObject({
      totalPendapatan: 50000,
      totalPesanan: 3,
      totalItemTerjual: 4,
      tunai: 30000,
      qris: 20000,
      transfer: 0,
      rataRataPesanan: 25000,
    })
    expect(hasil.pendapatan.detailPesanan).toHaveLength(3)
    expect(hasil.pendapatan.detailPesanan[0].items[0]).toEqual({
      namaMenu: 'Nasi Goreng',
      jumlah: 2,
      hargaSaatPesan: 15000,
    })
  })

  it('memakai rentang satu hari penuh untuk periode harian', async () => {
    await getLaporanPendapatan('harian', '2026-11-05')

    const arg = prismaMock.pesanan.findMany.mock.calls[0][0]
    expect(arg.where.createdAt.gte).toEqual(new Date(2026, 10, 5))
    expect(arg.where.createdAt.lt).toEqual(new Date(2026, 10, 6))
  })

  it('memakai rentang sebulan penuh untuk periode bulanan', async () => {
    await getLaporanPendapatan('bulanan', '2026-11-15')

    const arg = prismaMock.pesanan.findMany.mock.calls[0][0]
    expect(arg.where.createdAt.gte).toEqual(new Date(2026, 10, 1))
    expect(arg.where.createdAt.lt).toEqual(new Date(2026, 11, 1))
  })

  it('memakai rentang setahun penuh untuk periode tahunan', async () => {
    await getLaporanPendapatan('tahunan', '2026-11-15')

    const arg = prismaMock.pesanan.findMany.mock.calls[0][0]
    expect(arg.where.createdAt.gte).toEqual(new Date(2026, 0, 1))
    expect(arg.where.createdAt.lt).toEqual(new Date(2027, 0, 1))
  })
})

describe('getLaporanMenuTerlaris', () => {
  it('mengembalikan kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getLaporanMenuTerlaris('harian', '2026-11-05')

    expect(hasil).toEqual({ menus: [] })
  })

  it('menggabungkan menu yang sama dan mengurutkan terlaris', async () => {
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { jumlah: 2, hargaSaatPesan: 15000, menu: { namaMenu: 'Nasi Goreng', kategori: { namaKategori: 'Makanan' } } },
      { jumlah: 3, hargaSaatPesan: 5000, menu: { namaMenu: 'Es Teh', kategori: { namaKategori: 'Minuman' } } },
      { jumlah: 1, hargaSaatPesan: 15000, menu: { namaMenu: 'Nasi Goreng', kategori: { namaKategori: 'Makanan' } } },
    ])

    const hasil = await getLaporanMenuTerlaris('harian', '2026-11-05')

    expect(hasil.menus).toEqual([
      { namaMenu: 'Nasi Goreng', kategori: 'Makanan', totalTerjual: 3, totalPendapatan: 45000 },
      { namaMenu: 'Es Teh', kategori: 'Minuman', totalTerjual: 3, totalPendapatan: 15000 },
    ])
  })

  it('memakai kategori "-" saat relasi kategori kosong', async () => {
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { jumlah: 1, hargaSaatPesan: 10000, menu: { namaMenu: 'Air Mineral', kategori: null } },
    ])

    const hasil = await getLaporanMenuTerlaris('harian', '2026-11-05')

    expect(hasil.menus[0].kategori).toBe('-')
  })
})

describe('getLaporanKasir', () => {
  it('mengembalikan kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await getLaporanKasir('harian', '2026-11-05')

    expect(hasil.laporanKasir.daftarKasir).toEqual([])
  })

  it('mengelompokkan transaksi per kasir dan metode', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      { totalHarga: 30000, kasir: { username: 'kasir1' }, metodePembayaran: 'tunai' },
      { totalHarga: 20000, kasir: { username: 'kasir1' }, metodePembayaran: 'qris' },
      { totalHarga: 10000, kasir: { username: 'kasir2' }, metodePembayaran: 'transfer' },
      { totalHarga: 5000, kasir: null, metodePembayaran: 'tunai' },
    ])

    const hasil = await getLaporanKasir('harian', '2026-11-05')

    expect(hasil.laporanKasir.daftarKasir).toEqual([
      {
        username: 'kasir1',
        totalTransaksi: 2,
        totalPendapatan: 50000,
        tunai: 30000,
        qris: 20000,
        transfer: 0,
        rataRata: 25000,
      },
      {
        username: 'kasir2',
        totalTransaksi: 1,
        totalPendapatan: 10000,
        tunai: 0,
        qris: 0,
        transfer: 10000,
        rataRata: 10000,
      },
      {
        username: 'Unknown',
        totalTransaksi: 1,
        totalPendapatan: 5000,
        tunai: 5000,
        qris: 0,
        transfer: 0,
        rataRata: 5000,
      },
    ])
  })
})

describe('getGrafikPendapatan', () => {
  it('mengembalikan kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getGrafikPendapatan('harian', '2026-11-05')

    expect(hasil).toEqual({ grafik: [] })
  })

  it('mengelompokkan pendapatan per jam untuk periode harian', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      { totalHarga: 30000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 5, 9) },
      { totalHarga: 10000, statusPembayaran: 'menunggu', createdAt: new Date(2026, 10, 5, 9) },
      { totalHarga: 20000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 5, 10) },
    ])

    const hasil = await getGrafikPendapatan('harian', '2026-11-05')

    expect(hasil.grafik).toEqual([
      { label: '09:00', pendapatan: 30000, pesanan: 2 },
      { label: '10:00', pendapatan: 20000, pesanan: 1 },
    ])
  })

  it('mengelompokkan per minggu untuk periode bulanan', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      { totalHarga: 10000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 2) },
      { totalHarga: 20000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 10) },
      { totalHarga: 30000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 25) },
      { totalHarga: 40000, statusPembayaran: 'berhasil', createdAt: new Date(2026, 10, 30) },
    ])

    const hasil = await getGrafikPendapatan('bulanan', '2026-11-15')

    expect(hasil.grafik.map((g) => g.label)).toEqual([
      'Minggu 1',
      'Minggu 2',
      'Minggu 4',
      'Minggu 5',
    ])
  })
})

describe('getPerbandingan', () => {
  it('mengembalikan null untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUtil('cashier'))

    const hasil = await getPerbandingan('harian', '2026-11-05')

    expect(hasil).toEqual({ perbandingan: null })
  })

  it('menghitung growth dibanding periode sebelumnya', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([
        { totalHarga: 30000, statusPembayaran: 'berhasil' },
        { totalHarga: 20000, statusPembayaran: 'berhasil' },
      ])
      .mockResolvedValueOnce([
        { totalHarga: 25000, statusPembayaran: 'berhasil' },
      ])

    const hasil = await getPerbandingan('harian', '2026-11-05')

    expect(hasil.perbandingan).toMatchObject({
      nominalSekarang: 50000,
      nominalSebelumnya: 25000,
      pesananSekarang: 2,
      pesananSebelumnya: 1,
      growthPendapatan: 100,
      growthPesanan: 100,
    })
  })

  it('memakai growth 100 saat periode sebelumnya nol', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([{ totalHarga: 10000, statusPembayaran: 'berhasil' }])
      .mockResolvedValueOnce([])

    const hasil = await getPerbandingan('harian', '2026-11-05')

    expect(hasil.perbandingan).toMatchObject({
      growthPendapatan: 100,
      growthPesanan: 100,
    })
  })

  it('memakai growth 0 saat kedua periode kosong', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([])

    const hasil = await getPerbandingan('harian', '2026-11-05')

    expect(hasil.perbandingan).toMatchObject({
      growthPendapatan: 0,
      growthPesanan: 0,
    })
  })
})

describe('getLaporanKategori', () => {
  it('mengembalikan kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getLaporanKategori('harian', '2026-11-05')

    expect(hasil).toEqual({ kategori: [] })
  })

  it('menghitung total dan persentase per kategori', async () => {
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { jumlah: 2, hargaSaatPesan: 10000, menu: { namaMenu: 'A', kategori: { namaKategori: 'Makanan' } } },
      { jumlah: 1, hargaSaatPesan: 20000, menu: { namaMenu: 'B', kategori: { namaKategori: 'Minuman' } } },
      { jumlah: 1, hargaSaatPesan: 10000, menu: { namaMenu: 'C', kategori: null } },
    ])

    const hasil = await getLaporanKategori('harian', '2026-11-05')

    expect(hasil.kategori).toEqual([
      { namaKategori: 'Makanan', totalTerjual: 2, totalPendapatan: 20000, persentase: 40 },
      { namaKategori: 'Minuman', totalTerjual: 1, totalPendapatan: 20000, persentase: 40 },
      { namaKategori: 'Tanpa Kategori', totalTerjual: 1, totalPendapatan: 10000, persentase: 20 },
    ])
  })
})

describe('getAnalisisTambahan', () => {
  it('mengembalikan nol untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getAnalisisTambahan('harian', '2026-11-05')

    expect(hasil.analisis).toEqual({
      cancelRate: 0,
      totalBatal: 0,
      totalPesanan: 0,
      rataItemPerPesanan: 0,
    })
  })

  it('menghitung cancel rate dan rata-rata item per pesanan', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      { id: 1, statusPesanan: 'selesai' },
      { id: 2, statusPesanan: 'dibatalkan' },
      { id: 3, statusPesanan: 'selesai' },
      { id: 4, statusPesanan: 'selesai' },
    ])
    prismaMock.detailPesanan.findMany.mockResolvedValue([
      { jumlah: 2, pesananId: 1 },
      { jumlah: 1, pesananId: 1 },
      { jumlah: 3, pesananId: 3 },
    ])

    const hasil = await getAnalisisTambahan('harian', '2026-11-05')

    expect(hasil.analisis).toEqual({
      cancelRate: 25,
      totalBatal: 1,
      totalPesanan: 4,
      rataItemPerPesanan: 3,
    })
  })
})

describe('getLaporanAll', () => {
  it('mengembalikan struktur kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await getLaporanAll('harian', '2026-11-05')

    expect(hasil.pendapatan.totalPendapatan).toBe(0)
    expect(hasil.menuTerlaris).toEqual([])
    expect(hasil.grafik).toEqual([])
    expect(hasil.perbandingan).toBeNull()
    expect(hasil.kategori).toEqual([])
  })

  it('menggabungkan semua laporan untuk owner', async () => {
    const hasil = await getLaporanAll('harian', '2026-11-05')

    expect(Object.keys(hasil).sort()).toEqual([
      'analisis',
      'grafik',
      'kategori',
      'laporanKasir',
      'menuTerlaris',
      'pendapatan',
      'perbandingan',
    ])
    expect(hasil.pendapatan.periode).toBe('harian')
  })
})

describe('getLaporanBanding', () => {
  it('mengembalikan dua periode kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getLaporanBanding('harian', '2026-11-04', '2026-11-05')

    expect(hasil.periode1.pendapatan).toBe(0)
    expect(hasil.periode2.pendapatan).toBe(0)
  })

  it('membandingkan dua periode berjalan', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([
        pesananLaporan({ id: 1, totalHarga: 30000, statusPembayaran: 'berhasil' }),
        pesananLaporan({ id: 2, totalHarga: 10000, statusPembayaran: 'menunggu', statusPesanan: 'dibatalkan' }),
      ])
      .mockResolvedValueOnce([
        pesananLaporan({
          id: 3,
          totalHarga: 50000,
          statusPembayaran: 'berhasil',
          detailPesanan: [
            { jumlah: 5, hargaSaatPesan: 10000, menu: { namaMenu: 'Es Teh', kategori: { namaKategori: 'Minuman' } } },
          ],
        }),
      ])
    prismaMock.detailPesanan.findMany
      .mockResolvedValueOnce([
        { jumlah: 2, hargaSaatPesan: 15000, menu: { namaMenu: 'Nasi Goreng', kategori: { namaKategori: 'Makanan' } } },
      ])
      .mockResolvedValueOnce([
        { jumlah: 5, hargaSaatPesan: 10000, menu: { namaMenu: 'Es Teh', kategori: { namaKategori: 'Minuman' } } },
      ])

    const hasil = await getLaporanBanding('harian', '2026-11-04', '2026-11-05')

    expect(hasil.periode1).toMatchObject({
      pendapatan: 30000,
      pesanan: 2,
      itemTerjual: 2,
      rataRata: 30000,
      cancelRate: 50,
    })
    expect(hasil.periode1.topMenu[0]).toMatchObject({ namaMenu: 'Nasi Goreng', totalTerjual: 2 })
    expect(hasil.periode2).toMatchObject({
      pendapatan: 50000,
      pesanan: 1,
      itemTerjual: 5,
      rataRata: 50000,
      cancelRate: 0,
    })
  })
})

function sessionUtil(role: 'owner' | 'cashier' | 'waiter' | 'kitchen') {
  return sessionUntuk(role)
}
