vi.mock('next/server', () => ({ after: (fn: () => void | Promise<void>) => { try { const r = fn(); if (r && typeof (r as Promise<void>).then === 'function') (r as Promise<void>).catch(() => {}) } catch {} } }))
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
import { getKategoriMenus } from '@/app/actions/menu'
import { requireShiftAktif, shiftAktifSlotSekarang } from '@/lib/shift'
import {
  cancelExpiredOrders,
  cancelPesanan,
  createPesanan,
  getActivePesananByToken,
  getCustomerMenuData,
  getCustomerPaymentStatus,
  getMenusForCustomer,
  getMejaTersediaPindah,
  getPesananById,
  getPesananByTokenAndId,
  getPesananForCheckout,
  getPesananForDashboard,
  getStatusPesananAktifMeja,
  konfirmasiPembayaranCustomer,
  markItemDiantar,
  markPesananSelesai,
  pindahMeja,
  updateNamaPelanggan,
  updatePembayaran,
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

  it('mengembalikan daftar meja kosong dengan tipe dari tipe', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 1 })
    prismaMock.meja.findMany.mockResolvedValue([
      { id: 2, nomorMeja: 'L01', kapasitas: 6, tokenMeja: 'TOKEN02' },
      { id: 3, nomorMeja: 'K02', kapasitas: 4, tokenMeja: 'TOKEN03' },
    ])

    const hasil = await getMejaTersediaPindah('TOKEN01')

    expect(hasil).toEqual({
      mejaSaatIni: { nomorMeja: 'K01', kapasitas: 4 },
      daftar: [
        { id: 2, nomorMeja: 'L01', tipeMeja: 'Lesehan', kapasitas: 6, tokenMeja: 'TOKEN02' },
        { id: 3, nomorMeja: 'K02', tipeMeja: 'Kursi', kapasitas: 4, tokenMeja: 'TOKEN03' },
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

function barisPesanan(
  overrides: Record<string, unknown> = {},
  detailOverrides: Array<Record<string, unknown>> = []
) {
  const detail = [1, 2, 3, 4].map((i) => ({
    id: i,
    menuId: 7 + i,
    jumlah: 1,
    hargaSaatPesan: 10000,
    catatanItem: null,
    statusAntar: 'belum',
    menu: { namaMenu: `Menu ${i}`, menuFoto: [] },
    ...(detailOverrides[i - 1] ?? {}),
  }))

  return {
    ...pesananFixture({ id: 1, totalHarga: 50000 }),
    meja: { nomorMeja: 'L01', tipeMeja: { namaTipe: 'Lesehan' } },
    waiter: null,
    kasir: null,
    voucher: null,
    detailPesanan: detail,
    ...overrides,
  }
}

describe('getMenusForCustomer', () => {
  it('memetakan menu tersedia beserta foto dan porsi harian', async () => {
    prismaMock.menu.findMany.mockResolvedValue([
      {
        id: 7,
        namaMenu: 'Nasi Goreng',
        deskripsi: 'Enak',
        harga: '25000',
        statusMenu: 'tersedia',
        stokManual: 5,
        kategori: { namaKategori: 'Makanan', lokasi: 'dapur', pilihanSuhu: 'panas' },
        menuFoto: [
          { id: 1, fotoUrl: 'a.jpg' },
          { id: 2, fotoUrl: 'b.jpg' },
        ],
      },
      {
        id: 8,
        namaMenu: 'Es Teh',
        deskripsi: null,
        harga: 5000,
        statusMenu: 'tersedia',
        stokManual: null,
        kategori: { namaKategori: 'Minuman', lokasi: 'bar', pilihanSuhu: 'dingin' },
        menuFoto: [],
      },
    ])

    const hasil = await getMenusForCustomer()

    expect(hasil[0]).toMatchObject({
      id: 7,
      harga: 25000,
      kategori: 'Makanan',
      fotoUrl: 'a.jpg',
      porsiTersedia: 5,
      adaResep: false,
      bahanPembatas: [],
    })
    expect(hasil[0].menuFoto).toHaveLength(2)
    expect(hasil[1]).toMatchObject({ fotoUrl: null, porsiTersedia: 0 })
  })
})

describe('getCustomerMenuData', () => {
  it('mengembalikan data kosong saat token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    const hasil = await getCustomerMenuData('TOKEN-X')

    expect(hasil).toEqual({ meja: null, menus: [], kategoris: [] })
    expect(prismaMock.menu.findMany).not.toHaveBeenCalled()
  })

  it('menggabungkan meja, menu, dan kategori', async () => {
    prismaMock.menu.findMany.mockResolvedValue([])
    vi.mocked(getKategoriMenus).mockResolvedValue([{ id: 1, namaKategori: 'Makanan' }] as never)

    const hasil = await getCustomerMenuData('TOKEN01')

    expect(hasil.meja).toMatchObject({ nomorMeja: 'K01' })
    expect(hasil.menus).toEqual([])
    expect(hasil.kategoris).toEqual([{ id: 1, namaKategori: 'Makanan' }])
  })
})

describe('getPesananForDashboard', () => {
  it('menolak tanpa session', async () => {
    expect(await getPesananForDashboard()).toEqual({ error: 'Unauthorized' })
  })

  it('memetakan pesanan, filter, dan tipe meja', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findMany.mockResolvedValue([
      barisPesanan({
        metodePembayaran: 'tunai',
        namaPelanggan: null,
        kasir: { username: 'kasir1' },
        createdAt: new Date('2026-11-05T03:00:00.000Z'),
        updatedAt: null,
      }),
      barisPesanan({
        id: 2,
        mejaId: 2,
        meja: { nomorMeja: 'K02' },
        waiter: { username: 'waiter1' },
        kasir: null,
        createdAt: new Date('2026-11-05T02:00:00.000Z'),
        updatedAt: new Date('2026-11-05T02:30:00.000Z'),
        detailPesanan: [barisPesanan().detailPesanan[0]],
      }),
    ])

    const hasil = await getPesananForDashboard({
      status: 'menunggu',
      tanggal: '2026-11-05',
      mejaId: 2,
    })

    const where = prismaMock.pesanan.findMany.mock.calls[0][0].where
    expect(where.statusPesanan).toBe('menunggu')
    expect(where.mejaId).toBe(2)
    expect(where.createdAt.gte).toBeInstanceOf(Date)
    expect(where.createdAt.lt.getTime() - where.createdAt.gte.getTime()).toBe(24 * 60 * 60 * 1000)

    const daftar = hasil as Exclude<typeof hasil, { error: string }>
    expect(daftar[0]).toMatchObject({
      tipeMeja: 'Lesehan',
      items: 4,
      itemNames: ['Menu 1', 'Menu 2', 'Menu 3'],
      sisaItems: 1,
      updatedAt: '2026-11-05T03:00:00.000Z',
      namaPelanggan: null,
    })
    expect(daftar[1]).toMatchObject({
      tipeMeja: 'kursi',
      waiterUsername: 'waiter1',
      kasirUsername: null,
      updatedAt: '2026-11-05T02:30:00.000Z',
    })
  })
})

describe('updatePembayaran', () => {
  it('menolak selain kasir', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    expect(
      await updatePembayaran(1, { metodePembayaran: 'tunai', jumlahBayar: 1000, kembalian: 0 })
    ).toEqual({ error: 'Unauthorized' })
  })

  it('meneruskan error saat shift belum aktif', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    vi.mocked(requireShiftAktif).mockResolvedValue({ error: 'Shift belum dibuka' } as never)

    expect(
      await updatePembayaran(1, { metodePembayaran: 'tunai', jumlahBayar: 1000, kembalian: 0 })
    ).toEqual({ error: 'Shift belum dibuka' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    vi.mocked(requireShiftAktif).mockResolvedValue({ shiftId: 9 } as never)
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(
      await updatePembayaran(1, { metodePembayaran: 'tunai', jumlahBayar: 1000, kembalian: 0 })
    ).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('menandai pembayaran berhasil dan mencatat log', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
    vi.mocked(requireShiftAktif).mockResolvedValue({ shiftId: 9 } as never)
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 1, totalHarga: '50000' })

    const hasil = await updatePembayaran(1, {
      metodePembayaran: 'tunai',
      jumlahBayar: 60000,
      kembalian: 10000,
    })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        metodePembayaran: 'tunai',
        statusPembayaran: 'berhasil',
        kasirId: 2,
        shiftId: 9,
      }),
    })
    expect(triggerPusherMock).toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith(
      'PROCESS_PAYMENT',
      expect.stringContaining('Pembayaran pesanan #1')
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/kasir')
  })
})

describe('getPesananById', () => {
  it('menolak tanpa session', async () => {
    expect(await getPesananById(1)).toEqual({ error: 'Unauthorized' })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getPesananById(1)).toEqual({ error: 'Pesanan tidak ditemukan' })
  })

  it('memetakan detail pesanan lengkap', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      barisPesanan({
        biayaAdmin: 1000,
        ppn: 500,
        diskonVoucher: 5000,
        metodePembayaran: 'tunai',
        jumlahBayar: 60000,
        kembalian: 10000,
        catatan: 'tanpa sambal',
        meja: { nomorMeja: 'L02', tipeMeja: { namaTipe: 'Lesehan' } },
        waiter: { username: 'waiter1' },
        kasir: { username: 'kasir1' },
        voucher: { kode: 'HEBAT', namaVoucher: 'Hebat', diskonPersen: 10 },
      })
    )

    const hasil = await getPesananById(1)
    const detail = hasil as NonNullable<Exclude<typeof hasil, { error: string }>>

    expect(detail).toMatchObject({
      tipe_meja: 'Lesehan',
      voucher_kode: 'HEBAT',
      voucher_diskon_persen: 10,
      biaya_admin: 1000,
      ppn: 500,
      jumlah_bayar: 60000,
      waiter_username: 'waiter1',
      kasir_username: 'kasir1',
      catatan: 'tanpa sambal',
    })
    expect(detail.items[0]).toMatchObject({ nama_menu: 'Menu 1', foto_urls: [] })
  })

  it('memakai null saat field opsional kosong', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    prismaMock.pesanan.findFirst.mockResolvedValue(
      barisPesanan({
        biayaAdmin: null,
        ppn: null,
        jumlahBayar: null,
        namaPelanggan: null,
        catatan: null,
      })
    )

    const hasil = await getPesananById(1)

    expect(hasil).toMatchObject({
      voucher_kode: null,
      biaya_admin: null,
      ppn: null,
      jumlah_bayar: null,
      nama_pelanggan: null,
      catatan: null,
    })
  })
})

describe('getPesananForCheckout', () => {
  it('mengembalikan null saat pesanan tidak ada', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getPesananForCheckout('PUB-1')).toBeNull()
  })

  it('memetakan ringkasan checkout dengan voucher', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      barisPesanan({
        midtransOrderId: 'PUB-1',
        totalHarga: 45000,
        diskonVoucher: 5000,
        biayaAdmin: 1000,
        ppn: 500,
        statusPembayaran: 'menunggu',
        voucher: { kode: 'HEBAT', namaVoucher: 'Hebat', diskonPersen: 10 },
      })
    )

    const hasil = await getPesananForCheckout('PUB-1')

    expect(hasil).toMatchObject({
      subtotal: 50000,
      diskon: 5000,
      total: 45000,
      biayaAdmin: 1000,
      ppn: 500,
      voucher: { kode: 'HEBAT', diskonPersen: 10 },
    })
    expect(hasil?.items[0]).toMatchObject({ namaMenu: 'Menu 1', harga: 10000 })
  })
})

describe('getCustomerPaymentStatus', () => {
  it('mengembalikan null saat pesanan tidak ada', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getCustomerPaymentStatus('PUB-1')).toBeNull()
  })

  it('mengembalikan status dan metode pembayaran', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({
      statusPembayaran: 'berhasil',
      metodePembayaran: 'qris',
    })

    expect(await getCustomerPaymentStatus('PUB-1')).toEqual({
      statusPembayaran: 'berhasil',
      metodePembayaran: 'qris',
    })
  })
})

describe('getActivePesananByToken', () => {
  it('mengembalikan null saat token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    expect(await getActivePesananByToken('TOKEN-X')).toBeNull()
  })

  it('mengembalikan null saat tidak ada pesanan aktif', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getActivePesananByToken('TOKEN01')).toBeNull()
  })

  it('memetakan pesanan aktif milik meja', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      barisPesanan({ namaPelanggan: null })
    )

    const hasil = await getActivePesananByToken('TOKEN01')

    expect(hasil).toMatchObject({
      id: 1,
      total: 50000,
      status: 'menunggu',
      namaPelanggan: null,
    })
    expect(hasil?.items[0]).toMatchObject({ namaMenu: 'Menu 1' })
  })
})

describe('getPesananByTokenAndId', () => {
  it('mengembalikan null saat token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    expect(await getPesananByTokenAndId('TOKEN-X', 'PUB-1')).toBeNull()
  })

  it('mengembalikan null saat pesanan tidak ada', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getPesananByTokenAndId('TOKEN01', 'PUB-1')).toBeNull()
  })

  it('memetakan pesanan berdasarkan token dan public id', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      barisPesanan({
        midtransOrderId: 'PUB-1',
        namaPelanggan: null,
        metodePembayaran: 'tunai',
        meja: { nomorMeja: 'K01', tipeMeja: { namaTipe: 'Kursi' } },
      })
    )

    const hasil = await getPesananByTokenAndId('TOKEN01', 'PUB-1')

    expect(hasil).toMatchObject({
      midtransOrderId: 'PUB-1',
      subtotal: 50000,
      total: 50000,
      nomorMeja: 'K01',
      metodePembayaran: 'tunai',
      namaPelanggan: null,
    })
    expect(hasil?.items[0]).toMatchObject({ detailId: 1, statusAntar: 'belum' })
  })
})

describe('konfirmasiPembayaranCustomer', () => {
  it('menolak token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    expect(await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN-X', 'tunai')).toEqual({
      error: 'Token meja tidak valid',
    })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'tunai')).toEqual({
      error: 'Pesanan tidak ditemukan',
    })
  })

  it('menolak pesanan yang sudah dikonfirmasi', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ statusPembayaran: 'berhasil' })

    expect(await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'tunai')).toEqual({
      error: 'Pesanan sudah dikonfirmasi',
    })
  })

  it('menolak metode pembayaran tidak valid', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ statusPembayaran: 'menunggu' })

    expect(await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'transfer')).toEqual({
      error: 'Metode pembayaran tidak valid',
    })
  })

  it('menolak konfirmasi setelah 60 menit', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({
      statusPembayaran: 'menunggu',
      createdAt: new Date(Date.now() - 61 * 60 * 1000),
    })

    const hasil = await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'tunai')

    expect('error' in hasil && hasil.error).toContain('telah habis')
  })

  it('menandai QRIS sebagai berhasil dan menempel shift aktif', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({
      id: 1,
      statusPembayaran: 'menunggu',
      totalHarga: 50000,
      createdAt: new Date(),
    })
    vi.mocked(shiftAktifSlotSekarang).mockResolvedValue(5)

    const hasil = await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'qris')

    expect(hasil).toEqual({ success: true })
    const data = prismaMock.pesanan.update.mock.calls[0][0].data
    expect(data).toMatchObject({
      metodePembayaran: 'qris',
      statusPembayaran: 'berhasil',
      jumlahBayar: 50000,
      kembalian: 0,
      shiftId: 5,
    })
    expect(triggerPusherMock).toHaveBeenCalled()
  })

  it('menyimpan metode tunai tanpa mengubah status pembayaran', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({
      id: 1,
      statusPembayaran: 'menunggu',
      totalHarga: 50000,
      createdAt: new Date(),
    })

    const hasil = await konfirmasiPembayaranCustomer('PUB-1', 'TOKEN01', 'tunai')

    expect(hasil).toEqual({ success: true })
    const data = prismaMock.pesanan.update.mock.calls[0][0].data
    expect(data).toMatchObject({ metodePembayaran: 'tunai' })
    expect(data).not.toHaveProperty('statusPembayaran')
  })
})

describe('getStatusPesananAktifMeja', () => {
  it('mengembalikan null saat token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    expect(await getStatusPesananAktifMeja('TOKEN-X')).toBeNull()
  })

  it('menandai tidak ada pesanan aktif', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await getStatusPesananAktifMeja('TOKEN01')).toEqual({
      adaPesananAktif: false,
      sudahPilihMetode: false,
    })
  })

  it('menandai pesanan aktif yang sudah memilih metode', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 1, metodePembayaran: 'qris' })

    expect(await getStatusPesananAktifMeja('TOKEN01')).toEqual({
      adaPesananAktif: true,
      sudahPilihMetode: true,
    })
  })

  it('menandai pesanan aktif yang belum memilih metode', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 1, metodePembayaran: null })

    expect(await getStatusPesananAktifMeja('TOKEN01')).toEqual({
      adaPesananAktif: true,
      sudahPilihMetode: false,
    })
  })
})

describe('cancelExpiredOrders', () => {
  it('tidak membatalkan saat tidak ada pesanan', async () => {
    prismaMock.pesanan.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    expect(await cancelExpiredOrders()).toEqual({ success: true })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('membatalkan pesanan ber-metode yang sudah lewat 60 menit', async () => {
    const lama = new Date(Date.now() - 61 * 60 * 1000)
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([
        {
          id: 1,
          mejaId: 2,
          createdAt: lama,
          updatedAt: lama,
          metodePembayaran: 'tunai',
          midtransTransactionId: null,
        },
      ])
      .mockResolvedValueOnce([])

    const hasil = await cancelExpiredOrders()

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1, statusPembayaran: 'menunggu' },
      data: expect.objectContaining({ statusPembayaran: 'dibatalkan', catatan: 'Expired' }),
    })
    expect(prismaMock.meja.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { statusMeja: 'kosong' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_EXPIRED',
      expect.stringContaining('tunai')
    )
  })

  it('melewati pesanan ber-metode yang belum kedaluwarsa', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([
        {
          id: 1,
          mejaId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          metodePembayaran: 'tunai',
          midtransTransactionId: null,
        },
      ])
      .mockResolvedValueOnce([])

    await cancelExpiredOrders()

    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('membatalkan pesanan tanpa metode yang sudah lewat 60 menit', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 2, mejaId: null, createdAt: new Date(Date.now() - 61 * 60 * 1000) },
      ])

    await cancelExpiredOrders()

    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 2, statusPembayaran: 'menunggu' },
      data: expect.objectContaining({ catatan: 'Tidak memilih pembayaran' }),
    })
    expect(prismaMock.meja.update).not.toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_EXPIRED',
      expect.stringContaining('tidak memilih pembayaran')
    )
  })
})

describe('updateNamaPelanggan', () => {
  it('menolak token meja tidak valid', async () => {
    prismaMock.meja.findFirst.mockResolvedValue(null)

    expect(await updateNamaPelanggan('PUB-1', 'TOKEN-X', 'Budi')).toEqual({
      error: 'Token meja tidak valid',
    })
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    expect(await updateNamaPelanggan('PUB-1', 'TOKEN01', 'Budi')).toEqual({
      error: 'Pesanan tidak ditemukan',
    })
  })

  it('memperbarui nama pelanggan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue({ id: 3 })

    expect(await updateNamaPelanggan('PUB-1', 'TOKEN01', 'Budi')).toEqual({ success: true })
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { namaPelanggan: 'Budi' },
    })
  })
})
