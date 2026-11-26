import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, createLogMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  createTipeMeja,
  deleteTipeMeja,
  getTipeMejas,
  updateTipeMeja,
} from '@/app/actions/tipe-meja'

function formData(nilai: Record<string, string>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(nilai)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  vi.resetAllMocks()
  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  createLogMock.mockResolvedValue(undefined)
  revalidatePathMock.mockReturnValue(undefined)
  prismaMock.tipeMeja.findFirst.mockResolvedValue(null)
  prismaMock.tipeMeja.findMany.mockResolvedValue([])
  prismaMock.tipeMeja.count.mockResolvedValue(0)
  prismaMock.tipeMeja.create.mockResolvedValue({ id: 1 })
  prismaMock.tipeMeja.update.mockResolvedValue({ id: 1 })
  prismaMock.tipeMeja.updateMany.mockResolvedValue({ count: 0 })
  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })
})

describe('getTipeMejas', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)
    const hasil = await getTipeMejas()
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('memetakan jumlah meja per tipe', async () => {
    prismaMock.tipeMeja.findMany.mockResolvedValue([
      {
        id: 1,
        namaTipe: 'Meja Bebas',
        tokenTipe: 'BEBAS',
        tokenTipeAlias: 'BEBAS12',
        prefixKode: 'M',
        khususSatuCustomer: false,
        modeBebas: true,
        _count: { mejas: 3 },
      },
    ])

    const hasil = await getTipeMejas()

    expect(hasil).toEqual([
      {
        id: 1,
        namaTipe: 'Meja Bebas',
        tokenTipe: 'BEBAS',
        tokenTipeAlias: 'BEBAS12',
        prefixKode: 'M',
        khususSatuCustomer: false,
        modeBebas: true,
        jumlahMeja: 3,
      },
    ])
  })
})

describe('createTipeMeja', () => {
  it('hanya owner yang boleh membuat tipe', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))
    const hasil = await createTipeMeja(null, formData({
      namaTipe: 'VIP',
          }))
    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('membuat tipe dengan token/prefix otomatis', async () => {
    prismaMock.tipeMeja.findMany.mockResolvedValue([])
    prismaMock.tipeMeja.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    const hasil = await createTipeMeja(null, formData({ namaTipe: 'VIP', khususSatuCustomer: 'false', modeBebas: 'false' }))
    expect(hasil).toEqual({ success: true })
    expect(prismaMock.tipeMeja.create).toHaveBeenCalled()
    const arg = prismaMock.tipeMeja.create.mock.calls[0][0]
    expect(arg.data.namaTipe).toBe('VIP')
    expect(arg.data.prefixKode).toBeTruthy()
    expect(arg.data.tokenTipe).toMatch(/^K/)
  })

  it('menonaktifkan tipe Bebas lain saat membuat tipe Bebas baru', async () => {
    const hasil = await createTipeMeja(null, formData({
      namaTipe: 'Meja Bebas Baru',
      khususSatuCustomer: 'false',
      modeBebas: 'true',
    }))

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.tipeMeja.updateMany).toHaveBeenCalledWith({
      where: { modeBebas: true, deletedAt: null },
      data: { modeBebas: false },
    })
    expect(prismaMock.tipeMeja.create).toHaveBeenCalled()
    expect(prismaMock.tipeMeja.create.mock.calls[0][0].data).toMatchObject({
      namaTipe: 'Meja Bebas Baru',
      khususSatuCustomer: false,
      modeBebas: true,
    })
    expect(createLogMock).toHaveBeenCalled()
  })
})

describe('updateTipeMeja', () => {
  it('menolak tipe yang sudah dihapus', async () => {
    prismaMock.tipeMeja.findFirst.mockResolvedValue(null)
    const hasil = await updateTipeMeja(9, formData({
      namaTipe: 'VIP',
          }))
    expect(hasil).toEqual({ error: 'Tipe tidak ditemukan' })
  })

  it('memindah mode Bebas ke tipe ini', async () => {
    prismaMock.tipeMeja.findFirst
      .mockResolvedValueOnce({ id: 2, namaTipe: 'Lama' })
      .mockResolvedValueOnce(null)
    prismaMock.tipeMeja.findMany.mockResolvedValue([])
    const hasil = await updateTipeMeja(2, formData({
      namaTipe: 'Meja Bebas',
      khususSatuCustomer: 'false',
      modeBebas: 'true',
    }))

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.tipeMeja.updateMany).toHaveBeenCalledWith({
      where: { modeBebas: true, deletedAt: null, id: { not: 2 } },
      data: { modeBebas: false },
    })
  })
})

describe('deleteTipeMeja', () => {
  it('menolak menghapus tipe yang masih dipakai meja', async () => {
    prismaMock.tipeMeja.findFirst.mockResolvedValue({
      namaTipe: 'Meja Bebas',
      _count: { mejas: 2 },
    })
    const hasil = await deleteTipeMeja(1)
    expect(hasil.error).toContain('masih dipakai 2 meja')
    expect(prismaMock.tipeMeja.update).not.toHaveBeenCalled()
  })

  it('menghapus tipe kosong secara soft delete', async () => {
    prismaMock.tipeMeja.findFirst.mockResolvedValue({
      namaTipe: 'VIP',
      _count: { mejas: 0 },
    })
    const hasil = await deleteTipeMeja(3)
    expect(hasil).toEqual({ success: true })
    expect(prismaMock.tipeMeja.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3 },
        data: expect.objectContaining({ modeBebas: false }),
      })
    )
  })
})
