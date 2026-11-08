import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  authMock,
  createLogMock,
  triggerPusherMock,
  requireShiftAktifMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  triggerPusherMock: vi.fn(),
  requireShiftAktifMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/qris-static', () => ({ getQrisStaticUrl: () => '/qris.png' }))
vi.mock('@/lib/shift', () => ({ requireShiftAktif: requireShiftAktifMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: {
    newOrder: 'new-order',
    orderUpdated: 'order-updated',
    orderPaid: 'order-paid',
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { pesananFixture } from '@/test/helpers/fixtures'
import {
  accPesanan,
  batalkanPesananKasir,
  confirmQrisPayment,
  generateQRISCode,
  getPaidOrdersForNotification,
  getPembayaranInfo,
  getPesananBelumBayar,
  getPesananRiwayatKasir,
  konfirmasiPembayaran,
  prosesPembayaranQRIS,
  prosesPembayaranTunai,
  selesaikanPesananKasir,
  updatePesananMeja,
} from '@/app/actions/kasir'

const SHIFT_AKTIF = { shiftId: 9, kasirId: 2, kasirUsername: 'kasir1' }

function orderRiwayat(overrides: Record<string, unknown> = {}) {
  return {
    ...pesananFixture({ totalHarga: 50000, metodePembayaran: 'tunai' }),
    meja: { nomorMeja: 'K01' },
    waiter: { username: 'waiter1' },
    kasir: { username: 'kasir1' },
    detailPesanan: [
      {
        id: 1,
        menuId: 7,
        jumlah: 2,
        hargaSaatPesan: 25000,
        catatanItem: null,
        menu: { namaMenu: 'Nasi Goreng' },
      },
    ],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
  requireShiftAktifMock.mockResolvedValue(SHIFT_AKTIF)
  prismaMock.pesanan.findFirst.mockResolvedValue(pesananFixture({ totalHarga: 50000 }))
  prismaMock.pesanan.update.mockResolvedValue({})
  prismaMock.pesanan.findMany.mockResolvedValue([])
  prismaMock.users.findMany.mockResolvedValue([])
  prismaMock.meja.findFirst.mockResolvedValue({ id: 1, nomorMeja: 'K01', tokenMeja: 'tok' })
  prismaMock.meja.update.mockResolvedValue({})
  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') return (arg as (tx: unknown) => unknown)(prismaMock)
    return Promise.all(arg as Promise<unknown>[])
  })
  createLogMock.mockResolvedValue(undefined)
  triggerPusherMock.mockResolvedValue(undefined)
})

describe('prosesPembayaranTunai', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(requireShiftAktifMock).not.toHaveBeenCalled()
  })

  it('menolak role selain cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('meneruskan error saat shift belum aktif', async () => {
    requireShiftAktifMock.mockResolvedValue({ error: 'Shift belum dibuka' })

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Shift belum dibuka' })
    expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah dibayar', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPembayaran: 'berhasil' })
    )

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Pesanan sudah dibayar' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('menolak jumlah bayar kurang dari total', async () => {
    const hasil = await prosesPembayaranTunai(1, 40000)

    expect(hasil).toEqual({ error: 'Jumlah bayar kurang dari total harga' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('memproses pembayaran tunai pas tanpa kembalian', async () => {
    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ success: true, kembalian: 0, pending: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        metodePembayaran: 'tunai',
        jumlahBayar: 50000,
        kembalian: 0,
        biayaAdmin: 0,
        ppn: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: 2,
        shiftId: 9,
        midtransTransactionId: null,
        updatedAt: expect.any(Date),
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'PROCESS_PAYMENT',
      expect.stringContaining('Pembayaran tunai pesanan #1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-paid', {})
  })

  it('menghitung kembalian saat jumlah bayar lebih', async () => {
    const hasil = await prosesPembayaranTunai(1, 60000)

    expect(hasil).toEqual({ success: true, kembalian: 10000, pending: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kembalian: 10000 }),
      })
    )
  })

  it('mengembalikan error umum saat database gagal', async () => {
    prismaMock.pesanan.findFirst.mockRejectedValue(new Error('db down'))

    const hasil = await prosesPembayaranTunai(1, 50000)

    expect(hasil).toEqual({ error: 'Terjadi kesalahan saat memproses pembayaran' })
  })
})

describe('prosesPembayaranQRIS', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await prosesPembayaranQRIS(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('meneruskan error shift', async () => {
    requireShiftAktifMock.mockResolvedValue({ error: 'Shift belum dibuka' })

    const hasil = await prosesPembayaranQRIS(1)

    expect(hasil).toEqual({ error: 'Shift belum dibuka' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await prosesPembayaranQRIS(1)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah dibayar', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPembayaran: 'berhasil' })
    )

    const hasil = await prosesPembayaranQRIS(1)

    expect(hasil).toEqual({ error: 'Pesanan sudah dibayar' })
  })

  it('menandai pembayaran QRIS berhasil tanpa biaya admin', async () => {
    const hasil = await prosesPembayaranQRIS(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        metodePembayaran: 'qris',
        jumlahBayar: 50000,
        kembalian: 0,
        biayaAdmin: 0,
        ppn: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: 2,
        shiftId: 9,
        updatedAt: expect.any(Date),
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'PROCESS_PAYMENT',
      expect.stringContaining('Pembayaran QRIS pesanan #1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-paid', {})
  })
})

describe('getPesananRiwayatKasir', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getPesananRiwayatKasir()

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak role waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await getPesananRiwayatKasir()

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it.each([
    ['all', false],
    ['today', true],
    ['week', true],
    ['month', true],
  ] as const)('memfilter periode %s', async (period, memakaiTanggal) => {
    const hasil = await getPesananRiwayatKasir({ period })

    expect(hasil).not.toHaveProperty('error')
    const where = prismaMock.pesanan.findMany.mock.calls[0][0].where
    if (memakaiTanggal) {
      expect(where.createdAt.gte).toBeInstanceOf(Date)
    } else {
      expect(where.createdAt).toBeUndefined()
    }
  })

  it('memetakan pesanan dan daftar kasir', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([orderRiwayat()])
    prismaMock.users.findMany.mockResolvedValue([{ username: 'kasir1' }])

    const hasil = await getPesananRiwayatKasir({ period: 'all' })

    expect(hasil).toEqual({
      pesanan: [
        {
          id: 1,
          mejaId: 1,
          nomorMeja: 'K01',
          statusPesanan: 'menunggu',
          statusPembayaran: 'menunggu',
          totalHarga: 50000,
          biayaAdmin: null,
          ppn: null,
          metodePembayaran: 'tunai',
          jumlahBayar: 0,
          kembalian: 0,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          waiterUsername: 'waiter1',
          kasirUsername: 'kasir1',
          namaPelanggan: 'Budi',
          items: [
            {
              id: 1,
              menuId: 7,
              namaMenu: 'Nasi Goreng',
              jumlah: 2,
              hargaSaatPesan: 25000,
              catatanItem: null,
            },
          ],
        },
      ],
      daftarKasir: ['kasir1'],
    })
  })
})

function orderKasir(overrides: Record<string, unknown> = {}) {
  return {
    ...pesananFixture({ totalHarga: 50000, biayaAdmin: null, ppn: null, jumlahBayar: 0 }),
    metodePembayaran: 'tunai',
    meja: { nomorMeja: 'K01' },
    waiter: null,
    kasir: null,
    detailPesanan: [
      {
        id: 1,
        menuId: 7,
        jumlah: 2,
        hargaSaatPesan: 25000,
        catatanItem: '[Varian: Pedas]',
        menu: { namaMenu: 'Nasi Goreng' },
      },
    ],
    ...overrides,
  }
}

describe('getPesananBelumBayar', () => {
  it('menolak tanpa session dan role waiter', async () => {
    authMock.mockResolvedValue(null)
    expect(await getPesananBelumBayar()).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('waiter'))
    expect(await getPesananBelumBayar()).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.pesanan.findMany).not.toHaveBeenCalled()
  })

  it('memetakan pesanan aktif beserta item dan field nullable', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      orderKasir({ biayaAdmin: 1000, ppn: 500, jumlahBayar: 51000 }),
    ])

    const hasil = await getPesananBelumBayar()

    expect(hasil).toEqual([
      {
        id: 1,
        mejaId: 1,
        nomorMeja: 'K01',
        statusPesanan: 'menunggu',
        statusPembayaran: 'menunggu',
        totalHarga: 50000,
        biayaAdmin: 1000,
        ppn: 500,
        metodePembayaran: 'tunai',
        jumlahBayar: 51000,
        kembalian: 0,
        midtransOrderId: null,
        createdAt: expect.any(Date),
        waiterUsername: null,
        namaPelanggan: 'Budi',
        items: [
          {
            id: 1,
            menuId: 7,
            namaMenu: 'Nasi Goreng',
            jumlah: 2,
            hargaSaatPesan: 25000,
            catatanItem: '[Varian: Pedas]',
          },
        ],
      },
    ])
  })
})

describe('getPaidOrdersForNotification', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)
    expect(await getPaidOrdersForNotification()).toEqual({ error: 'Unauthorized' })
  })

  it('hanya mengambil pembayaran berhasil dalam 10 menit terakhir', async () => {
    prismaMock.pesanan.findMany.mockResolvedValue([
      orderKasir({ statusPembayaran: 'berhasil', biayaAdmin: 0, ppn: 0 }),
    ])

    const hasil = await getPaidOrdersForNotification()

    const where = prismaMock.pesanan.findMany.mock.calls[0][0].where
    expect(where.statusPembayaran).toBe('berhasil')
    expect(where.updatedAt.gte).toBeInstanceOf(Date)
    expect(hasil).toEqual([
      {
        id: 1,
        nomorMeja: 'K01',
        namaPelanggan: 'Budi',
        totalHarga: 50000,
        biayaAdmin: null,
        ppn: null,
      },
    ])
  })
})

describe('getPesananRiwayatKasir periode tidak dikenal', () => {
  it('memakai tanggal epoch sebagai fallback', async () => {
    await getPesananRiwayatKasir({ period: 'year' as never })

    const where = prismaMock.pesanan.findMany.mock.calls[0][0].where
    expect(where.createdAt.gte.getTime()).toBe(0)
  })
})

describe('getPembayaranInfo', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)
    expect(await getPembayaranInfo(1)).toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan error saat pesanan tidak ada', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await getPembayaranInfo(1)).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('memetakan info pembayaran lengkap', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({
        midtransOrderId: 'MID-1',
        biayaAdmin: 2000,
        ppn: 1000,
        jumlahBayar: 53000,
        createdAt: new Date('2026-11-05T10:00:00Z'),
      })
    )

    const hasil = await getPembayaranInfo(1)

    expect(hasil).toEqual({
      id: 1,
      midtransOrderId: 'MID-1',
      nomorMeja: 'K01',
      namaPelanggan: 'Budi',
      totalHarga: 50000,
      biayaAdmin: 2000,
      ppn: 1000,
      metodePembayaran: 'tunai',
      statusPembayaran: 'menunggu',
      jumlahBayar: 53000,
      kembalian: 0,
      createdAt: '2026-11-05T10:00:00.000Z',
      items: [{ id: 1, namaMenu: 'Nasi Goreng', jumlah: 2, hargaSaatPesan: 25000 }],
      qrUrl: '/qris.png',
    })
  })

  it('memakai nilai nol saat biaya opsional kosong', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ biayaAdmin: null, ppn: null, jumlahBayar: null })
    )

    const hasil = await getPembayaranInfo(1)

    expect(hasil).toMatchObject({ biayaAdmin: 0, ppn: 0, jumlahBayar: 0 })
  })
})

describe('selesaikanPesananKasir', () => {
  it('menolak tanpa session atau role bukan cashier', async () => {
    authMock.mockResolvedValue(null)
    expect(await selesaikanPesananKasir(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('owner'))
    expect(await selesaikanPesananKasir(1)).toEqual({ error: 'Unauthorized' })
  })

  it('menolak pesanan tidak ditemukan, belum dibayar, atau belum diproses', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await selesaikanPesananKasir(1)).toEqual({ error: 'Pesanan tidak ditemukan' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'menunggu', statusPesanan: 'diproses' })
    )
    expect(await selesaikanPesananKasir(1)).toEqual({ error: 'Pesanan belum dibayar' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil', statusPesanan: 'menunggu' })
    )
    expect(await selesaikanPesananKasir(1)).toEqual({ error: 'Pesanan belum diproses' })
  })

  it('menandai selesai dan mengosongkan meja dalam transaksi', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil', statusPesanan: 'diproses' })
    )

    const hasil = await selesaikanPesananKasir(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusPesanan: 'selesai', updatedAt: expect.any(Date) },
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMeja: 'kosong' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('ditandai selesai')
    )
  })
})

describe('updatePesananMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)
    expect(await updatePesananMeja('tok', {})).toEqual({ error: 'Unauthorized' })
  })

  it('menolak meja atau pesanan aktif yang tidak ada', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)
    expect(await updatePesananMeja('tok', {})).toEqual({ error: 'Meja tidak ditemukan' })

    prismaMock.meja.findFirst.mockResolvedValue({ id: 1, nomorMeja: 'K01' })
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await updatePesananMeja('tok', {})).toEqual({
      error: 'Pesanan aktif tidak ditemukan untuk meja ini',
    })
  })

  it('tidak update saat tidak ada perubahan, tetap trigger realtime', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(orderKasir())

    const hasil = await updatePesananMeja('tok', {})

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
  })

  it('memperbarui status dan catatan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(orderKasir())

    const hasil = await updatePesananMeja('tok', { statusPesanan: 'selesai', catatan: 'meja 1' })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusPesanan: 'selesai', catatan: 'meja 1' },
    })
  })

  it('memperbarui catatan saja', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(orderKasir())

    await updatePesananMeja('tok', { catatan: 'tanpa sambal' })

    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { catatan: 'tanpa sambal' },
    })
  })
})

describe('konfirmasiPembayaran', () => {
  it('menolak tanpa session, shift tidak aktif, dan pesanan tidak ada', async () => {
    authMock.mockResolvedValue(null)
    expect(await konfirmasiPembayaran(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('cashier'))
    requireShiftAktifMock.mockResolvedValue({ error: 'Shift belum dibuka' })
    expect(await konfirmasiPembayaran(1)).toEqual({ error: 'Shift belum dibuka' })

    requireShiftAktifMock.mockResolvedValue(SHIFT_AKTIF)
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await konfirmasiPembayaran(1)).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah dikonfirmasi', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil' })
    )

    expect(await konfirmasiPembayaran(1)).toEqual({
      error: 'Pesanan sudah dikonfirmasi atau dibatalkan',
    })
  })

  it('mengonfirmasi pembayaran dan mencatat log', async () => {
    const hasil = await konfirmasiPembayaran(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: 2,
        shiftId: 9,
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'PROCESS_PAYMENT',
      expect.stringContaining('Konfirmasi pembayaran pesanan #1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-paid', {})
  })

  it('menangkap error database', async () => {
    prismaMock.pesanan.findFirst.mockRejectedValue(new Error('db down'))

    expect(await konfirmasiPembayaran(1)).toEqual({
      error: 'Terjadi kesalahan saat konfirmasi pembayaran',
    })
  })
})

describe('batalkanPesananKasir', () => {
  it('menolak tanpa session dan pesanan tidak ada', async () => {
    authMock.mockResolvedValue(null)
    expect(await batalkanPesananKasir(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await batalkanPesananKasir(1)).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pembatalan pesanan yang sudah dibayar dan diproses', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil', statusPesanan: 'diproses' })
    )

    expect(await batalkanPesananKasir(1)).toEqual({
      error: 'Tidak bisa membatalkan pesanan yang sudah dibayar',
    })
  })

  it('membatalkan pesanan dan mengosongkan meja', async () => {
    const hasil = await batalkanPesananKasir(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        statusPembayaran: 'dibatalkan',
        statusPesanan: 'dibatalkan',
        kasirId: 2,
        catatan: 'Dibatalkan kasir',
      }),
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMeja: 'kosong' },
    })
  })

  it('tidak memperbarui meja bila pesanan tanpa meja', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(orderKasir({ mejaId: null }))

    await batalkanPesananKasir(1)

    expect(prismaMock.meja.update).not.toHaveBeenCalled()
  })
})

describe('accPesanan', () => {
  it('menolak tanpa session, tidak ditemukan, belum bayar, atau sudah diproses', async () => {
    authMock.mockResolvedValue(null)
    expect(await accPesanan(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await accPesanan(1)).toEqual({ error: 'Pesanan tidak ditemukan' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'menunggu' })
    )
    expect(await accPesanan(1)).toEqual({ error: 'Pesanan belum dibayar' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil', statusPesanan: 'diproses' })
    )
    expect(await accPesanan(1)).toEqual({ error: 'Pesanan sudah diproses' })
  })

  it('menerima pesanan menunggu menjadi diproses', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil', statusPesanan: 'menunggu' })
    )

    const hasil = await accPesanan(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusPesanan: 'diproses', kasirId: 2, updatedAt: expect.any(Date) },
    })
  })
})

describe('generateQRISCode', () => {
  it('menolak tanpa session, tidak ditemukan, atau sudah dibayar', async () => {
    authMock.mockResolvedValue(null)
    expect(await generateQRISCode(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await generateQRISCode(1)).toEqual({ error: 'Pesanan tidak ditemukan' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil' })
    )
    expect(await generateQRISCode(1)).toEqual({ error: 'Pesanan sudah dibayar' })
  })

  it('mengembalikan QR statis tanpa biaya admin', async () => {
    const hasil = await generateQRISCode(1)

    expect(hasil).toEqual({
      success: true,
      qrUrl: '/qris.png',
      totalBayar: 50000,
      adminFee: 0,
      expiryMenit: 60,
    })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { metodePembayaran: 'qris', biayaAdmin: 0, ppn: 0, updatedAt: expect.any(Date) },
    })
  })
})

describe('confirmQrisPayment', () => {
  it('menolak tanpa session, shift bermasalah, tidak ditemukan, atau sudah dikonfirmasi', async () => {
    authMock.mockResolvedValue(null)
    expect(await confirmQrisPayment(1)).toEqual({ error: 'Unauthorized' })

    authMock.mockResolvedValue(sessionUntuk('cashier'))
    requireShiftAktifMock.mockResolvedValue({ error: 'Shift belum dibuka' })
    expect(await confirmQrisPayment(1)).toEqual({ error: 'Shift belum dibuka' })

    requireShiftAktifMock.mockResolvedValue(SHIFT_AKTIF)
    prismaMock.pesanan.findFirst.mockResolvedValue(null)
    expect(await confirmQrisPayment(1)).toEqual({ error: 'Pesanan tidak ditemukan' })

    prismaMock.pesanan.findFirst.mockResolvedValue(
      orderKasir({ statusPembayaran: 'berhasil' })
    )
    expect(await confirmQrisPayment(1)).toEqual({ error: 'Pesanan sudah dikonfirmasi' })
  })

  it('menandai QRIS berhasil dengan jumlah bayar penuh', async () => {
    const hasil = await confirmQrisPayment(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        jumlahBayar: 50000,
        kembalian: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: 2,
        shiftId: 9,
      }),
    })
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-paid', {})
  })
})
