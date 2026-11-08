import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { authMock, createLogMock, triggerPusherMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  triggerPusherMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'order-updated' },
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  getNotifikasiDashboard,
  getNotifikasiTerlambat,
} from '@/app/actions/notifikasi'

const SEKARANG = new Date('2026-11-05T10:00:00+07:00')
const MENIT = 60 * 1000

function pesananAktif(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    createdAt: new Date(SEKARANG.getTime() - 5 * MENIT),
    mejaId: 1,
    namaPelanggan: 'Budi',
    statusPesanan: 'menunggu',
    statusPembayaran: 'menunggu',
    totalHarga: 25000,
    detailPesanan: [{ jumlah: 2, statusAntar: 'belum' }],
    ...overrides,
  }
}

function pesananRefund(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    createdAt: new Date(SEKARANG.getTime() - 10 * MENIT),
    mejaId: 1,
    namaPelanggan: 'Sari',
    statusPesanan: 'refund',
    statusPembayaran: 'refund',
    totalHarga: 40000,
    detailPesanan: [{ jumlah: 3 }],
    ...overrides,
  }
}

function urutkanSekuens(aktif: unknown[] = [], refund: unknown[] = [], sisaSweep: unknown[] = []) {
  prismaMock.pesanan.findMany
    .mockResolvedValueOnce(sisaSweep)
    .mockResolvedValueOnce(aktif)
    .mockResolvedValueOnce(refund)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(SEKARANG)

  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.pesanan.findMany.mockResolvedValue([])
  prismaMock.pesanan.updateMany.mockResolvedValue({ count: 0 })
  prismaMock.meja.findMany.mockResolvedValue([{ id: 1, nomorMeja: 'K01' }])
  prismaMock.meja.updateMany.mockResolvedValue({ count: 1 })
  prismaMock.stokBahan.findMany.mockResolvedValue([])
  createLogMock.mockResolvedValue(undefined)
  triggerPusherMock.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getNotifikasiDashboard', () => {
  it('mengembalikan kosong tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getNotifikasiDashboard()

    expect(hasil).toEqual({ items: [], total: 0 })
    expect(prismaMock.pesanan.findMany).not.toHaveBeenCalled()
  })

  it('menandai pesanan lebih dari 30 menit sebagai terlambat', async () => {
    urutkanSekuens([
      pesananAktif({ createdAt: new Date(SEKARANG.getTime() - 31 * MENIT) }),
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.total).toBe(1)
    expect(hasil.items[0]).toMatchObject({
      kind: 'terlambat',
      pesananId: 1,
      nomorMeja: 'K01',
      lamaMenit: 31,
      href: '/dashboard/pesanan/1',
    })
  })

  it('mengklasifikasi pesanan belum dibayar di bawah 30 menit', async () => {
    urutkanSekuens([pesananAktif({ id: 2 })])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items[0]).toMatchObject({ kind: 'belum_dibayar', pesananId: 2 })
  })

  it('mengklasifikasi pesanan berhasil menunggu sebagai perlu_diproses', async () => {
    urutkanSekuens([
      pesananAktif({ id: 3, statusPembayaran: 'berhasil', statusPesanan: 'menunggu' }),
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items[0]).toMatchObject({ kind: 'perlu_diproses' })
  })

  it('mengklasifikasi pesanan diproses dengan item belum diantar', async () => {
    urutkanSekuens([
      pesananAktif({
        id: 4,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        detailPesanan: [
          { jumlah: 2, statusAntar: 'belum' },
          { jumlah: 1, statusAntar: 'diantar' },
        ],
      }),
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items[0]).toMatchObject({
      kind: 'belum_diantar',
      jumlahItem: 3,
      itemBelumDiantar: 2,
    })
  })

  it('mengklasifikasi pesanan diproses tanpa item tertunda sebagai siap_selesai', async () => {
    urutkanSekuens([
      pesananAktif({
        id: 5,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        detailPesanan: [{ jumlah: 2, statusAntar: 'diantar' }],
      }),
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items[0]).toMatchObject({ kind: 'siap_selesai', itemBelumDiantar: 0 })
  })

  it('menyaring jenis notifikasi sesuai role waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))
    urutkanSekuens([pesananAktif({ id: 6 })])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items).toEqual([])
  })

  it('menyertakan notifikasi refund untuk role cashier', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    urutkanSekuens([], [pesananRefund()])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items).toHaveLength(1)
    expect(hasil.items[0]).toMatchObject({
      kind: 'refund',
      pesananId: 9,
      jumlahItem: 3,
      nomorMeja: 'K01',
    })
  })

  it('menyertakan stok menipis hanya untuk owner', async () => {
    prismaMock.stokBahan.findMany.mockResolvedValue([
      { id: 3, namaBahan: 'Beras', stokQty: 2, satuan: 'kg', statusStok: 'menipis' },
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items).toContainEqual(
      expect.objectContaining({
        kind: 'stok_menipis',
        namaBahan: 'Beras',
        stokQty: 2,
        href: '/dashboard/stok-bahan',
      })
    )
  })

  it('mengurutkan item berdasarkan prioritas jenis', async () => {
    urutkanSekuens(
      [
        pesananAktif({ id: 10, createdAt: new Date(SEKARANG.getTime() - 2 * MENIT) }),
        pesananAktif({
          id: 11,
          createdAt: new Date(SEKARANG.getTime() - 40 * MENIT),
        }),
      ],
      [pesananRefund()]
    )

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items.map((i) => i.kind)).toEqual([
      'terlambat',
      'refund',
      'belum_dibayar',
    ])
  })

  it('membatalkan pesanan basi saat sweep tengah malam dan mencatat log', async () => {
    prismaMock.pesanan.updateMany.mockResolvedValue({ count: 2 })
    urutkanSekuens([], [], [
      { id: 1, mejaId: 1 },
      { id: 2, mejaId: 1 },
    ])

    const hasil = await getNotifikasiDashboard()

    expect(hasil).toEqual({ items: [], total: 0 })
    expect(prismaMock.pesanan.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusPesanan: 'dibatalkan',
          statusPembayaran: 'dibatalkan',
        }),
      })
    )
    expect(prismaMock.meja.updateMany).toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith(
      'CANCEL_ORDER_EXPIRED',
      expect.stringContaining('Auto-cancel 2 pesanan')
    )
    expect(triggerPusherMock).toHaveBeenCalled()
  })

  it('tidak mencatat log sweep saat tidak ada pesanan basi', async () => {
    prismaMock.pesanan.updateMany.mockResolvedValue({ count: 0 })
    urutkanSekuens([], [], [{ id: 1, mejaId: 1 }])

    await getNotifikasiDashboard()

    expect(createLogMock).not.toHaveBeenCalled()
    expect(triggerPusherMock).not.toHaveBeenCalled()
  })

  it('mengembalikan kosong saat query dashboard gagal', async () => {
    prismaMock.pesanan.findMany
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('db down'))
      .mockResolvedValueOnce([])

    const hasil = await getNotifikasiDashboard()

    expect(hasil).toEqual({ items: [], total: 0 })
  })

  it('memakai fallback id meja saat data meja tidak ditemukan', async () => {
    prismaMock.meja.findMany.mockResolvedValue([])
    urutkanSekuens([pesananAktif({ mejaId: 77 })])

    const hasil = await getNotifikasiDashboard()

    expect(hasil.items[0].nomorMeja).toBe('#77')
  })
})

describe('getNotifikasiTerlambat', () => {
  it('hanya mengembalikan pesanan berstatus terlambat', async () => {
    urutkanSekuens([
      pesananAktif({
        id: 12,
        createdAt: new Date(SEKARANG.getTime() - 90 * MENIT),
      }),
      pesananAktif({ id: 13 }),
    ])

    const hasil = await getNotifikasiTerlambat()

    expect(hasil.total).toBe(1)
    expect(hasil.orders[0]).toMatchObject({
      id: 12,
      nomorMeja: 'K01',
      namaPelanggan: 'Budi',
      statusPesanan: 'menunggu',
      lamaMenit: 90,
    })
  })

  it('mengembalikan daftar kosong tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getNotifikasiTerlambat()

    expect(hasil).toEqual({ orders: [], total: 0 })
  })
})
