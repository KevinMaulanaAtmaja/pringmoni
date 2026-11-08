import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  authMock,
  createLogMock,
  triggerPusherMock,
  revalidatePathMock,
  deleteFilesMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  triggerPusherMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  deleteFilesMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'order-updated' },
}))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('uploadthing/server', () => ({
  UTApi: class {
    deleteFiles(fileKey: string) {
      return deleteFilesMock(fileKey)
    }
  },
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { pesananFixture } from '@/test/helpers/fixtures'
import {
  ajukanRefund,
  deleteRefundBukti,
  getRefundInfo,
} from '@/app/actions/refund'

function pesananRefund(overrides: Record<string, unknown> = {}) {
  return {
    ...pesananFixture({
      statusPembayaran: 'berhasil',
      statusPesanan: 'diproses',
      totalHarga: 50000,
    }),
    meja: { nomorMeja: 'K01' },
    refundedBy: { username: 'kasir1' },
    refundBukti: [
      { id: 11, fotoUrl: 'https://file/11.jpg', fileKey: 'key-11' },
    ],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()

  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
  prismaMock.pesanan.findFirst.mockResolvedValue(pesananRefund())
  prismaMock.refundBukti.createMany.mockResolvedValue({ count: 1 })
  prismaMock.refundBukti.findUnique.mockResolvedValue({
    id: 5,
    pesananId: 1,
    fotoUrl: 'https://file/5.jpg',
    fileKey: 'key-5',
  })
  prismaMock.refundBukti.delete.mockResolvedValue({})
  prismaMock.pesanan.update.mockResolvedValue({})
  createLogMock.mockResolvedValue(undefined)
  triggerPusherMock.mockResolvedValue(undefined)
  deleteFilesMock.mockResolvedValue({})
})

describe('getRefundInfo', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getRefundInfo(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
  })

  it('menolak role waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await getRefundInfo(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('mengizinkan owner membaca detail refund', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    const hasil = await getRefundInfo(1)

    expect(hasil).toMatchObject({
      id: 1,
      nomorMeja: 'K01',
      totalHarga: 50000,
      refundedByUsername: 'kasir1',
      bukti: [{ id: 11, fotoUrl: 'https://file/11.jpg', fileKey: 'key-11' }],
    })
  })

  it('mengembalikan error saat pesanan tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await getRefundInfo(99)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('memakai null saat data relasi opsional kosong', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananRefund({ meja: { nomorMeja: 'K02' }, refundedBy: null, refundBukti: [] })
    )

    const hasil = await getRefundInfo(1)

    expect(hasil).toMatchObject({
      nomorMeja: 'K02',
      refundedByUsername: null,
      bukti: [],
    })
  })
})

describe('ajukanRefund', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await ajukanRefund(1, 'rusak', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak role selain cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    const hasil = await ajukanRefund(1, 'rusak', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak catatan kurang dari 3 karakter', async () => {
    const hasil = await ajukanRefund(1, '  ok ', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({
      error: 'Catatan refund wajib diisi (minimal 3 karakter)',
    })
    expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
  })

  it('menolak tanpa bukti foto valid', async () => {
    const hasil = await ajukanRefund(1, 'rusak parah', [
      { url: '' },
      { url: '' },
    ])

    expect(hasil).toEqual({
      error: 'Bukti foto refund wajib diunggah minimal 1 foto',
    })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await ajukanRefund(1, 'rusak parah', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah refund', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananRefund({ statusPembayaran: 'refund' })
    )

    const hasil = await ajukanRefund(1, 'rusak parah', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({ error: 'Pesanan ini sudah di-refund' })
  })

  it('menolak pesanan yang belum dibayar', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananRefund({ statusPembayaran: 'menunggu' })
    )

    const hasil = await ajukanRefund(1, 'rusak parah', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({
      error: 'Hanya pesanan yang sudah dibayar yang dapat di-refund',
    })
  })

  it('menolak pesanan yang sudah dibatalkan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananRefund({ statusPesanan: 'dibatalkan' })
    )

    const hasil = await ajukanRefund(1, 'rusak parah', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({ error: 'Pesanan sudah dibatalkan' })
  })

  it('menyimpan bukti, mengubah status, mencatat log, dan memicu Pusher', async () => {
    const hasil = await ajukanRefund(1, '  Makanan basi  ', [
      { url: 'https://file/a.jpg', fileKey: 'key-a' },
      { url: 'https://file/b.jpg' },
    ])

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.refundBukti.createMany).toHaveBeenCalledWith({
      data: [
        { pesananId: 1, fotoUrl: 'https://file/a.jpg', fileKey: 'key-a' },
        { pesananId: 1, fotoUrl: 'https://file/b.jpg', fileKey: null },
      ],
    })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        statusPembayaran: 'refund',
        statusPesanan: 'refund',
        refundCatatan: 'Makanan basi',
        refundedById: 2,
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'REFUND_ORDER',
      expect.stringContaining('Refund pesanan #1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/kasir')
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/pesanan')
  })

  it('mengembalikan error generik saat transaksi gagal', async () => {
    prismaMock.$transaction.mockRejectedValue(new Error('db down'))

    const hasil = await ajukanRefund(1, 'rusak parah', [{ url: 'https://file/a.jpg' }])

    expect(hasil).toEqual({
      error: 'Terjadi kesalahan saat memproses refund',
    })
  })
})

describe('deleteRefundBukti', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await deleteRefundBukti(5)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan error saat bukti tidak ditemukan', async () => {
    prismaMock.refundBukti.findUnique.mockResolvedValue(null)

    const hasil = await deleteRefundBukti(5)

    expect(hasil).toEqual({ error: 'Bukti tidak ditemukan' })
  })

  it('menghapus file UploadThing lalu baris database', async () => {
    const hasil = await deleteRefundBukti(5)

    expect(hasil).toEqual({ success: true })
    expect(deleteFilesMock).toHaveBeenCalledWith('key-5')
    expect(prismaMock.refundBukti.delete).toHaveBeenCalledWith({ where: { id: 5 } })
  })

  it('tetap menghapus database saat fileKey kosong', async () => {
    prismaMock.refundBukti.findUnique.mockResolvedValue({
      id: 5,
      fotoUrl: 'https://file/5.jpg',
      fileKey: null,
    })

    const hasil = await deleteRefundBukti(5)

    expect(hasil).toEqual({ success: true })
    expect(deleteFilesMock).not.toHaveBeenCalled()
    expect(prismaMock.refundBukti.delete).toHaveBeenCalled()
  })

  it('tetap sukses saat penghapusan file gagal', async () => {
    deleteFilesMock.mockRejectedValue(new Error('uploadthing down'))

    const hasil = await deleteRefundBukti(5)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.refundBukti.delete).toHaveBeenCalledWith({ where: { id: 5 } })
  })
})
