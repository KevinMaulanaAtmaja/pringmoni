import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StatusPesanan } from '@prisma/client'

const {
  authMock,
  createLogMock,
  triggerPusherMock,
  potongStokDapurMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  triggerPusherMock: vi.fn(),
  potongStokDapurMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { newOrder: 'new-order', orderUpdated: 'order-updated' },
}))
vi.mock('@/lib/stok', () => ({ potongStokDapur: potongStokDapurMock }))
vi.mock('@/lib/shift', () => ({
  requireShiftAktif: vi.fn(),
  shiftAktifSlotSekarang: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: (fn: unknown) => fn }
})
vi.mock('@/app/actions/menu', () => ({ getKategoriMenus: vi.fn() }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  detailPesananFixture,
  mejaFixture,
  menuFixture,
  pesananFixture,
  voucherFixture,
} from '@/test/helpers/fixtures'
import {
  cancelPesanan,
  createPesanan,
  getMejaTersediaPindah,
  markItemDiantar,
  markPesananSelesai,
  pindahMeja,
  updateStatusPesanan,
} from '@/app/actions/pesanan'

const STATE_PESANAN = {
  tokenMeja: 'TOKEN01',
  items: [{ menuId: 7, jumlah: 2 }],
}

beforeEach(() => {
  vi.resetAllMocks()

  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  authMock.mockResolvedValue(null)
  prismaMock.meja.findFirst.mockResolvedValue(mejaFixture())
  prismaMock.meja.findMany.mockResolvedValue([])
  prismaMock.meja.update.mockResolvedValue({})
  prismaMock.pesanan.findFirst.mockResolvedValue(null)
  prismaMock.pesanan.create.mockResolvedValue({ id: 101, midtransOrderId: 'pub-101' })
  prismaMock.pesanan.update.mockResolvedValue({})
  prismaMock.menu.findFirst.mockResolvedValue(menuFixture({ id: 7, harga: 25000, stokManual: 10 }))
  prismaMock.menu.findUnique.mockResolvedValue({ stokManual: 10, statusMenu: 'tersedia' })
  prismaMock.menu.update.mockResolvedValue({})
  prismaMock.detailPesanan.findUnique.mockResolvedValue(detailPesananFixture())
  prismaMock.detailPesanan.update.mockResolvedValue({})
  createLogMock.mockResolvedValue(undefined)
  triggerPusherMock.mockResolvedValue(undefined)
  potongStokDapurMock.mockResolvedValue({ deducted: true })
})

describe('createPesanan', () => {
  it('menolak token meja tidak valid sebelum query pesanan', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil).toEqual({ error: 'Token meja tidak valid' })
    expect(prismaMock.pesanan.findFirst).not.toHaveBeenCalled()
  })

  it('menolak pesanan baru saat masih ada pesanan menunggu pembayaran', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 99 })

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil.error).toContain('masih menunggu pembayaran')
    expect(prismaMock.menu.findFirst).not.toHaveBeenCalled()
  })

  it('menolak item pesanan kosong', async () => {
    const hasil = await createPesanan({ ...STATE_PESANAN, items: [] })

    expect(hasil).toEqual({ error: 'Item pesanan tidak boleh kosong' })
  })

  it('menolak menu yang tidak ditemukan', async () => {
    prismaMock.menu.findFirst.mockResolvedValue(null)

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil).toEqual({ error: 'Menu dengan ID 7 tidak ditemukan' })
  })

  it('menolak menu yang tidak tersedia', async () => {
    prismaMock.menu.findFirst.mockResolvedValue(
      menuFixture({ id: 7, namaMenu: 'Nasi Goreng', statusMenu: 'habis' })
    )

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil).toEqual({ error: 'Nasi Goreng sedang tidak tersedia' })
  })

  it('menolak jumlah yang melebihi stok harian', async () => {
    prismaMock.menu.findFirst.mockResolvedValue(
      menuFixture({ id: 7, namaMenu: 'Nasi Goreng', stokManual: 1 })
    )

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil).toEqual({ error: 'Nasi Goreng hanya tersisa 1 porsi' })
  })

  it('menggabungkan item dengan menu sama untuk validasi dan pemotongan stok', async () => {
    const hasil = await createPesanan({
      ...STATE_PESANAN,
      items: [
        { menuId: 7, jumlah: 2 },
        { menuId: 7, jumlah: 3, catatan: 'pedas' },
      ],
    })

    expect(hasil.success).toBe(true)
    expect(prismaMock.menu.findFirst).toHaveBeenCalledTimes(1)
    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { stokManual: 5, statusMenu: 'tersedia' },
    })
    expect(prismaMock.pesanan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalHarga: 125000,
          detailPesanan: {
            create: [
              expect.objectContaining({ menuId: 7, jumlah: 2 }),
              expect.objectContaining({ menuId: 7, jumlah: 3, catatanItem: 'pedas' }),
            ],
          },
        }),
      })
    )
  })

  it('menolak voucher yang tidak ditemukan', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(null)

    const hasil = await createPesanan({ ...STATE_PESANAN, kodeVoucher: 'NOPE' })

    expect(hasil).toEqual({ error: 'Kode voucher tidak ditemukan' })
  })

  it('menolak voucher yang tidak aktif', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(
      voucherFixture({ statusVoucher: 'nonaktif' })
    )

    const hasil = await createPesanan({ ...STATE_PESANAN, kodeVoucher: 'HEMAT10' })

    expect(hasil).toEqual({ error: 'Voucher sedang tidak aktif' })
  })

  it('menolak voucher saat minimal belanja belum terpenuhi', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(
      voucherFixture({ kode: 'HEMAT10', minimalBelanja: 100000 })
    )

    const hasil = await createPesanan({ ...STATE_PESANAN, kodeVoucher: 'hemat10' })

    expect(hasil.error).toContain('Minimal belanja untuk voucher HEMAT10')
  })

  it('menerapkan diskon voucher yang valid dan menormalkan kode', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(
      voucherFixture({ kode: 'HEMAT10', minimalBelanja: 50000, diskonPersen: 10 })
    )

    const hasil = await createPesanan({
      ...STATE_PESANAN,
      items: [{ menuId: 7, jumlah: 4 }],
      kodeVoucher: ' hemat10 ',
    })

    expect(hasil.success).toBe(true)
    expect(prismaMock.voucher.findFirst).toHaveBeenCalledWith({
      where: { kode: 'HEMAT10', deletedAt: null },
    })
    expect(prismaMock.pesanan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalHarga: 90000,
          voucherId: 1,
          diskonVoucher: 10000,
        }),
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'CREATE_ORDER',
      expect.stringContaining('Voucher HEMAT10')
    )
  })

  it('menyimpan pesanan, memotong stok, menandai meja terpakai, dan mencatat log', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
    prismaMock.menu.findFirst.mockResolvedValue(
      menuFixture({ id: 7, namaMenu: 'Nasi Goreng', harga: 25000, stokManual: 2 })
    )
    prismaMock.menu.findUnique.mockResolvedValue({ stokManual: 2, statusMenu: 'tersedia' })

    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil).toEqual({ success: true, orderId: 'pub-101', id: 101 })
    expect(prismaMock.pesanan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mejaId: 1,
          kasirId: 2,
          totalHarga: 50000,
          metodePembayaran: null,
        }),
      })
    )
    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { stokManual: 0, statusMenu: 'habis' },
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMeja: 'terpakai' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'CREATE_ORDER',
      expect.stringContaining('Pesanan baru #101 dari K01')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'new-order', {})
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/pesanan')
    expect(revalidatePathMock).toHaveBeenCalledWith('/TOKEN01')
  })

  it('menyimpan kasirId null saat pesanan dibuat customer tanpa session', async () => {
    const hasil = await createPesanan(STATE_PESANAN)

    expect(hasil.success).toBe(true)
    expect(prismaMock.pesanan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kasirId: null }),
      })
    )
  })

  it('menggagalkan transaksi saat stok berubah menjadi tidak cukup', async () => {
    prismaMock.menu.findFirst.mockResolvedValue(
      menuFixture({ id: 7, stokManual: 5 })
    )
    prismaMock.menu.findUnique.mockResolvedValue({ stokManual: 2, statusMenu: 'tersedia' })

    await expect(
      createPesanan({ ...STATE_PESANAN, items: [{ menuId: 7, jumlah: 5 }] })
    ).rejects.toThrow('Stok tidak mencukupi')

    expect(prismaMock.meja.update).not.toHaveBeenCalled()
    expect(createLogMock).not.toHaveBeenCalled()
  })

  it('menggagalkan transaksi saat menu hilang di tengah transaksi', async () => {
    prismaMock.menu.findUnique.mockResolvedValue(null)

    await expect(createPesanan(STATE_PESANAN)).rejects.toThrow('Menu tidak ditemukan')

    expect(prismaMock.meja.update).not.toHaveBeenCalled()
  })
})

describe('updateStatusPesanan', () => {
  it('menolak tanpa session', async () => {
    const hasil = await updateStatusPesanan(1, StatusPesanan.diproses)
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak owner mengubah status pesanan', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    const hasil = await updateStatusPesanan(1, StatusPesanan.diproses)

    expect(hasil).toEqual({ error: 'Owner tidak bisa mengubah status pesanan' })
  })

  it('menolak status yang tidak valid', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await updateStatusPesanan(1, 'entah' as StatusPesanan)

    expect(hasil).toEqual({ error: 'Status tidak valid' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await updateStatusPesanan(1, StatusPesanan.diproses)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pembatalan pesanan yang sudah dibayar dan sedang diproses', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPembayaran: 'berhasil', statusPesanan: 'diproses' })
    )

    const hasil = await updateStatusPesanan(1, StatusPesanan.dibatalkan)

    expect(hasil).toEqual({ error: 'Tidak bisa membatalkan pesanan yang sudah dibayar' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('memperbarui status non-pembatalan dan mencatat log', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { username: 'kasir1' }))
    prismaMock.pesanan.findFirst.mockResolvedValue(pesananFixture())

    const hasil = await updateStatusPesanan(1, StatusPesanan.diproses)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusPesanan: StatusPesanan.diproses },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('kasir1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/pesanan')
  })

  it('mencatat log pembatalan saat status dibatalkan', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { username: 'kasir1' }))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPesanan: 'menunggu', statusPembayaran: 'berhasil' })
    )

    const hasil = await updateStatusPesanan(1, StatusPesanan.dibatalkan)

    expect(hasil).toEqual({ success: true })
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_KASIR',
      expect.stringContaining('dibatalkan oleh kasir1')
    )
  })
})

describe('cancelPesanan', () => {
  it('menolak tanpa session', async () => {
    const hasil = await cancelPesanan(1)
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak owner membatalkan pesanan', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    const hasil = await cancelPesanan(1)

    expect(hasil).toEqual({ error: 'Owner tidak bisa membatalkan pesanan' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await cancelPesanan(1)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah dibayar', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPembayaran: 'berhasil' })
    )

    const hasil = await cancelPesanan(1)

    expect(hasil).toEqual({ error: 'Tidak bisa membatalkan pesanan yang sudah dibayar' })
  })

  it('membatalkan pesanan, mengosongkan meja, dan mencatat log', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { username: 'kasir1' }))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPembayaran: 'menunggu', totalHarga: 25000 })
    )

    const hasil = await cancelPesanan(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        statusPesanan: 'dibatalkan',
        statusPembayaran: 'dibatalkan',
        deletedAt: expect.any(Date),
      },
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMeja: 'kosong' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_KASIR',
      expect.stringContaining('kasir1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
  })
})

describe('markPesananSelesai', () => {
  it('menolak tanpa session', async () => {
    const hasil = await markPesananSelesai(1)
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak selain waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await markPesananSelesai(1)

    expect(hasil).toEqual({ error: 'Hanya waiter yang bisa menandai pesanan selesai' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await markPesananSelesai(1)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menolak pesanan yang sudah selesai', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPesanan: 'selesai' })
    )

    const hasil = await markPesananSelesai(1)

    expect(hasil).toEqual({ error: 'Pesanan belum diproses' })
  })

  it('menandai selesai, mengosongkan meja, dan memotong stok dapur', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter', { id: '3', username: 'waiter1' }))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ statusPesanan: 'diproses' })
    )

    const hasil = await markPesananSelesai(1)

    expect(hasil).toEqual({
      success: true,
      message: 'Pesanan berhasil ditandai selesai',
    })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        statusPesanan: 'selesai',
        waiterId: 3,
        updatedAt: expect.any(Date),
      },
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMeja: 'kosong' },
    })
    expect(potongStokDapurMock).toHaveBeenCalledWith(prismaMock, 1, 3)
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('waiter1')
    )
  })
})

describe('markItemDiantar', () => {
  it('menolak tanpa session', async () => {
    const hasil = await markItemDiantar(1)
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak item yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.detailPesanan.findUnique.mockResolvedValue(null)

    const hasil = await markItemDiantar(1)

    expect(hasil).toEqual({ error: 'Item tidak ditemukan' })
  })

  it('mengubah status item dari belum menjadi diantar', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.detailPesanan.findUnique.mockResolvedValue({
      ...detailPesananFixture(),
      statusAntar: 'belum',
    })

    const hasil = await markItemDiantar(1)

    expect(hasil).toEqual({ success: true, statusAntar: 'diantar' })
    expect(prismaMock.detailPesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusAntar: 'diantar' },
    })
  })

  it('mengubah status item dari diantar kembali menjadi belum', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.detailPesanan.findUnique.mockResolvedValue({
      ...detailPesananFixture(),
      statusAntar: 'diantar',
    })

    const hasil = await markItemDiantar(1)

    expect(hasil).toEqual({ success: true, statusAntar: 'belum' })
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'order-updated', {})
  })
})

describe('getMejaTersediaPindah', () => {
  it('menolak token meja asal tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    const hasil = await getMejaTersediaPindah('TOKEN01')

    expect(hasil).toEqual({ error: 'Token meja tidak valid' })
  })

  it('menolak saat tidak ada pesanan aktif', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await getMejaTersediaPindah('TOKEN01')

    expect(hasil).toEqual({ error: 'Tidak ada pesanan aktif yang bisa dipindah di meja ini' })
  })

  it('mengembalikan daftar meja kosong dengan tipe lesehan/kursi', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 1 })
    prismaMock.meja.findMany.mockResolvedValue([
      { id: 2, nomorMeja: 'L01', kapasitas: 6, tokenMeja: 'TOKEN02' },
      { id: 3, nomorMeja: 'K02', kapasitas: 4, tokenMeja: 'TOKEN03' },
    ])

    const hasil = await getMejaTersediaPindah('TOKEN01')

    expect(hasil).toEqual({
      mejaSaatIni: { nomorMeja: 'K01', kapasitas: 4 },
      daftar: [
        { id: 2, nomorMeja: 'L01', tipeMeja: 'lesehan', kapasitas: 6, tokenMeja: 'TOKEN02' },
        { id: 3, nomorMeja: 'K02', tipeMeja: 'kursi', kapasitas: 4, tokenMeja: 'TOKEN03' },
      ],
    })
    expect(prismaMock.meja.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { statusMeja: 'kosong', deletedAt: null, id: { not: 1 } },
      })
    )
  })
})

describe('pindahMeja', () => {
  it('menolak meja tujuan kosong', async () => {
    const hasil = await pindahMeja('TOKEN01', '  ')
    expect(hasil).toEqual({ error: 'Meja tujuan belum dipilih' })
  })

  it('menolak pindah ke meja yang sama', async () => {
    const hasil = await pindahMeja('TOKEN01', 'TOKEN01')
    expect(hasil).toEqual({ error: 'Tidak bisa pindah ke meja yang sama' })
  })

  it('menolak token meja asal tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValueOnce(null)

    const hasil = await pindahMeja('TOKEN01', 'TOKEN02')

    expect(hasil).toEqual({ error: 'Token meja asal tidak valid' })
  })

  it('menolak meja tujuan yang tidak ditemukan', async () => {
    prismaMock.meja.findFirst
      .mockResolvedValueOnce(mejaFixture({ id: 1, tokenMeja: 'TOKEN01' }))
      .mockResolvedValueOnce(null)

    const hasil = await pindahMeja('TOKEN01', 'TOKEN02')

    expect(hasil).toEqual({ error: 'Meja tujuan tidak ditemukan' })
  })

  it('menolak meja tujuan yang sudah terpakai', async () => {
    prismaMock.meja.findFirst
      .mockResolvedValueOnce(mejaFixture({ id: 1, tokenMeja: 'TOKEN01' }))
      .mockResolvedValueOnce(
        mejaFixture({ id: 2, tokenMeja: 'TOKEN02', statusMeja: 'terpakai' })
      )

    const hasil = await pindahMeja('TOKEN01', 'TOKEN02')

    expect(hasil).toEqual({ error: 'Meja tujuan sudah terpakai, silahkan pilih meja lain' })
  })

  it('menolak saat tidak ada pesanan aktif yang bisa dipindah', async () => {
    prismaMock.meja.findFirst
      .mockResolvedValueOnce(mejaFixture({ id: 1, tokenMeja: 'TOKEN01' }))
      .mockResolvedValueOnce(mejaFixture({ id: 2, tokenMeja: 'TOKEN02' }))
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await pindahMeja('TOKEN01', 'TOKEN02')

    expect(hasil).toEqual({ error: 'Tidak ada pesanan aktif yang bisa dipindah' })
  })

  it('memindahkan pesanan dan menukar status meja dalam transaksi', async () => {
    prismaMock.meja.findFirst
      .mockResolvedValueOnce(mejaFixture({ id: 1, tokenMeja: 'TOKEN01', nomorMeja: 'K01' }))
      .mockResolvedValueOnce(mejaFixture({ id: 2, tokenMeja: 'TOKEN02', nomorMeja: 'K02' }))
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 50 })

    const hasil = await pindahMeja('TOKEN01', 'TOKEN02')

    expect(hasil).toEqual({
      success: true,
      nomorMejaBaru: 'K02',
      tokenMejaBaru: 'TOKEN02',
    })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 50 },
      data: { mejaId: 2 },
    })
    expect(prismaMock.meja.update).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      data: { statusMeja: 'kosong' },
    })
    expect(prismaMock.meja.update).toHaveBeenNthCalledWith(2, {
      where: { id: 2 },
      data: { statusMeja: 'terpakai' },
    })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(createLogMock).toHaveBeenCalledWith(
      'PINDAH_MEJA',
      'Pesanan #50 dipindah dari meja K01 ke meja K02'
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/TOKEN01')
    expect(revalidatePathMock).toHaveBeenCalledWith('/TOKEN02')
  })
})
