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
  getPesananRiwayatKasir,
  prosesPembayaranQRIS,
  prosesPembayaranTunai,
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
