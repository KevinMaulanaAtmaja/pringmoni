import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, shiftMock, createLogMock, triggerPusherMock, revalidatePathMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    shiftMock: vi.fn(),
    createLogMock: vi.fn(),
    triggerPusherMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  })
)

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/shift', () => ({ requireShiftAktif: shiftMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/qris-static', () => ({ getQrisStaticUrl: () => 'https://cdn.test/qris.png' }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'pesanan.orderUpdated', orderPaid: 'pesanan.orderPaid' },
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { pesananFixture } from '@/test/helpers/fixtures'
import {
  confirmQrisPayment,
  generateQRISCode,
  getPembayaranInfo,
  prosesPembayaranQRIS,
} from '@/app/actions/kasir'

const ROLE_NON_CASHIER = ['owner', 'waiter', 'kitchen'] as const

describe('TC-05 QRIS payment (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir' }))
    shiftMock.mockResolvedValue({ shiftId: 9, kasirId: 2, kasirUsername: 'kasir' })
    createLogMock.mockResolvedValue(undefined)
    triggerPusherMock.mockResolvedValue(undefined)
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ id: 1, totalHarga: 50000, statusPembayaran: 'menunggu' })
    )
    prismaMock.pesanan.update.mockResolvedValue(pesananFixture({ id: 1 }))
  })

  describe('confirmQrisPayment', () => {
    it('mengonfirmasi QRIS dan mengikat pesanan ke kasir + shift aktif', async () => {
      const hasil = await confirmQrisPayment(1)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.pesanan.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
      })
      expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          jumlahBayar: 50000,
          kembalian: 0,
          statusPembayaran: 'berhasil',
          statusPesanan: 'diproses',
          kasirId: 2,
          shiftId: 9,
          updatedAt: expect.any(Date),
        }),
      })

      expect(createLogMock).toHaveBeenCalledWith(
        'PROCESS_PAYMENT',
        expect.stringContaining('Konfirmasi QRIS pesanan #1: Rp50.000 (shift #9)')
      )
      expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'pesanan.orderPaid', {})
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/kasir')
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/pesanan')
    })

    it('memformat nominal besar dengan pemisah ribuan', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValue(
        pesananFixture({ id: 7, totalHarga: 1234567, statusPembayaran: 'menunggu' })
      )

      await confirmQrisPayment(7)

      expect(createLogMock).toHaveBeenCalledWith(
        'PROCESS_PAYMENT',
        expect.stringContaining('Rp1.234.567')
      )
    })

    it.each([null, ...ROLE_NON_CASHIER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      const hasil = await confirmQrisPayment(1)

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(shiftMock).not.toHaveBeenCalled()
      expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    })

    it('meneruskan error shift sebelum membaca pesanan', async () => {
      shiftMock.mockResolvedValue({
        error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
      })

      const hasil = await confirmQrisPayment(1)

      expect(hasil).toEqual({
        error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
      })
      expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    })

    it('menolak pesanan yang tidak ditemukan', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValue(null)

      const hasil = await confirmQrisPayment(999)

      expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
      expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    })

    it.each(['berhasil', 'dibatalkan'] as const)(
      'menolak pesanan berstatus %s',
      async (statusPembayaran) => {
        prismaMock.pesanan.findFirst.mockResolvedValue(
          pesananFixture({ id: 1, statusPembayaran })
        )

        const hasil = await confirmQrisPayment(1)

        expect(hasil).toEqual({ error: 'Pesanan sudah dikonfirmasi' })
        expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
      }
    )
  })

  describe('generateQRISCode', () => {
    it('menandai pesanan memakai QRIS dan mengembalikan info pembayaran', async () => {
      const hasil = await generateQRISCode(1)

      expect(hasil).toEqual({
        success: true,
        qrUrl: 'https://cdn.test/qris.png',
        totalBayar: 50000,
        adminFee: 0,
        expiryMenit: 60,
      })
      expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          metodePembayaran: 'qris',
          biayaAdmin: 0,
          ppn: 0,
          updatedAt: expect.any(Date),
        }),
      })
      expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'pesanan.orderUpdated', {})
    })

    it('menolak pesanan yang tidak ditemukan', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValue(null)

      expect(await generateQRISCode(99)).toEqual({ error: 'Pesanan tidak ditemukan' })
    })

    it('menolak pesanan yang sudah dibayar', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValue(
        pesananFixture({ id: 1, statusPembayaran: 'berhasil' })
      )

      expect(await generateQRISCode(1)).toEqual({ error: 'Pesanan sudah dibayar' })
      expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_CASHIER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      expect(await generateQRISCode(1)).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('prosesPembayaranQRIS', () => {
    it('membayar QRIS, mencatat log, dan mengirim event realtime', async () => {
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
        }),
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'PROCESS_PAYMENT',
        expect.stringContaining('Pembayaran QRIS pesanan #1: Rp50.000')
      )
      expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'pesanan.orderPaid', {})
    })

    it('meneruskan error shift', async () => {
      shiftMock.mockResolvedValue({ error: 'Shift belum dibuka.' })

      expect(await prosesPembayaranQRIS(1)).toEqual({ error: 'Shift belum dibuka.' })
      expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
    })

    it('menolak pesanan tidak ditemukan dan yang sudah dibayar', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValueOnce(null)
      expect(await prosesPembayaranQRIS(9)).toEqual({ error: 'Pesanan tidak ditemukan' })

      prismaMock.pesanan.findFirst.mockResolvedValueOnce(
        pesananFixture({ id: 1, statusPembayaran: 'berhasil' })
      )
      expect(await prosesPembayaranQRIS(1)).toEqual({ error: 'Pesanan sudah dibayar' })
    })

    it.each([null, ...ROLE_NON_CASHIER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      expect(await prosesPembayaranQRIS(1)).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('getPembayaranInfo', () => {
    it('mengembalikan detail pembayaran dan item pesanan', async () => {
      prismaMock.pesanan.findFirst.mockResolvedValue({
        ...pesananFixture({
          id: 1,
          totalHarga: 50000,
          biayaAdmin: null,
          ppn: null,
          jumlahBayar: null,
          kembalian: 0,
          metodePembayaran: 'qris',
          statusPembayaran: 'menunggu',
        }),
        meja: { nomorMeja: 'K01' },
        detailPesanan: [
          {
            id: 5,
            jumlah: 2,
            hargaSaatPesan: 25000,
            menu: { namaMenu: 'Nasi Goreng' },
          },
        ],
      })

      const hasil = await getPembayaranInfo(1)

      expect(hasil).toMatchObject({
        id: 1,
        nomorMeja: 'K01',
        totalHarga: 50000,
        biayaAdmin: 0,
        ppn: 0,
        jumlahBayar: 0,
        kembalian: 0,
        metodePembayaran: 'qris',
        statusPembayaran: 'menunggu',
        qrUrl: 'https://cdn.test/qris.png',
        items: [
          { id: 5, namaMenu: 'Nasi Goreng', jumlah: 2, hargaSaatPesan: 25000 },
        ],
      })
      expect(hasil).toHaveProperty('createdAt')
    })

    it('menolak tanpa session dan pesanan yang tidak ditemukan', async () => {
      authMock.mockResolvedValue(null)
      expect(await getPembayaranInfo(1)).toEqual({ error: 'Unauthorized' })

      authMock.mockResolvedValue(sessionUntuk('cashier'))
      prismaMock.pesanan.findFirst.mockResolvedValue(null)
      expect(await getPembayaranInfo(99)).toEqual({ error: 'Pesanan tidak ditemukan' })
    })
  })
})
