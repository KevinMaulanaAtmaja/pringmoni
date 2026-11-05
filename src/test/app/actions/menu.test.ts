import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, createLogMock, revalidatePathMock, deleteAllMenuFotosMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    createLogMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    deleteAllMenuFotosMock: vi.fn(),
  })
)

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/app/actions/menu-foto', () => ({ deleteAllMenuFotos: deleteAllMenuFotosMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { kategoriMenuFixture, menuFixture } from '@/test/helpers/fixtures'
import {
  setAllStokMenuHarian,
  setStokMenuHarianByKategori,
  updateStokMenuHarian,
} from '@/app/actions/menu'

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.menu.findUnique.mockResolvedValue(
    menuFixture({ id: 7, namaMenu: 'Nasi Goreng', statusMenu: 'tersedia' })
  )
  prismaMock.menu.update.mockResolvedValue({})
  prismaMock.menu.updateMany.mockResolvedValue({ count: 3 })
  prismaMock.kategoriMenu.findFirst.mockResolvedValue(kategoriMenuFixture())
  createLogMock.mockResolvedValue(undefined)
})

describe('updateStokMenuHarian', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(updateStokMenuHarian(7, 5)).rejects.toThrow('Unauthorized')
  })

  it('menolak role selain owner/kitchen', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(updateStokMenuHarian(7, 5)).rejects.toThrow('Unauthorized')
  })

  it('menolak stok negatif tanpa query menu', async () => {
    const hasil = await updateStokMenuHarian(7, -1)

    expect(hasil).toEqual({ error: 'Stok harus berupa angka tidak negatif' })
    expect(prismaMock.menu.findUnique).not.toHaveBeenCalled()
  })

  it('menolak stok bukan bilangan bulat', async () => {
    const hasil = await updateStokMenuHarian(7, 1.5)

    expect(hasil).toEqual({ error: 'Stok harus berupa angka tidak negatif' })
    expect(prismaMock.menu.findUnique).not.toHaveBeenCalled()
  })

  it('menolak menu yang tidak ditemukan', async () => {
    prismaMock.menu.findUnique.mockResolvedValue(null)

    const hasil = await updateStokMenuHarian(7, 5)

    expect(hasil).toEqual({ error: 'Menu tidak ditemukan' })
  })

  it('menolak menu nonaktif', async () => {
    prismaMock.menu.findUnique.mockResolvedValue(
      menuFixture({ id: 7, statusMenu: 'nonaktif' })
    )

    const hasil = await updateStokMenuHarian(7, 5)

    expect(hasil).toEqual({ error: 'Menu nonaktif tidak bisa diatur stok hariannya' })
    expect(prismaMock.menu.update).not.toHaveBeenCalled()
  })

  it('mengatur stok menjadi habis saat jumlah 0', async () => {
    const hasil = await updateStokMenuHarian(7, 0)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { stokManual: 0, statusMenu: 'habis' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      'Atur stok harian Nasi Goreng menjadi 0',
      1
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard')
  })

  it('mengatur stok menjadi tersedia saat jumlah positif', async () => {
    const hasil = await updateStokMenuHarian(7, 5)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { stokManual: 5, statusMenu: 'tersedia' },
    })
  })

  it('mencatat log tanpa userId bila session tidak punya id', async () => {
    authMock.mockResolvedValue(sessionUntuk('kitchen', { id: '' }))

    const hasil = await updateStokMenuHarian(7, 5)

    expect(hasil).toEqual({ success: true })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      'Atur stok harian Nasi Goreng menjadi 5',
      undefined
    )
  })
})

describe('setAllStokMenuHarian', () => {
  it('menolak stok negatif', async () => {
    const hasil = await setAllStokMenuHarian(-1)

    expect(hasil).toEqual({ error: 'Stok harus berupa angka tidak negatif' })
    expect(prismaMock.menu.updateMany).not.toHaveBeenCalled()
  })

  it('mengatur stok semua menu nonaktif dikecualikan', async () => {
    const hasil = await setAllStokMenuHarian(0)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.menu.updateMany).toHaveBeenCalledWith({
      where: { deletedAt: null, statusMenu: { not: 'nonaktif' } },
      data: { stokManual: 0, statusMenu: 'habis' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      'Atur stok harian semua menu (nonaktif dikecualikan) menjadi 0',
      1
    )
  })

  it('mengatur stok semua menu menjadi tersedia saat jumlah positif', async () => {
    await setAllStokMenuHarian(10)

    expect(prismaMock.menu.updateMany).toHaveBeenCalledWith({
      where: { deletedAt: null, statusMenu: { not: 'nonaktif' } },
      data: { stokManual: 10, statusMenu: 'tersedia' },
    })
  })
})

describe('setStokMenuHarianByKategori', () => {
  it('menolak kategori yang tidak ditemukan', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

    const hasil = await setStokMenuHarianByKategori(99, 5)

    expect(hasil).toEqual({ error: 'Kategori tidak ditemukan' })
    expect(prismaMock.menu.updateMany).not.toHaveBeenCalled()
  })

  it('mengatur stok hanya untuk kategori terpilih', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(
      kategoriMenuFixture({ id: 3, namaKategori: 'Minuman' })
    )

    const hasil = await setStokMenuHarianByKategori(3, 5)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.menu.updateMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        statusMenu: { not: 'nonaktif' },
        kategoriId: 3,
      },
      data: { stokManual: 5, statusMenu: 'tersedia' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      'Atur stok harian kategori Minuman menjadi 5',
      1
    )
  })
})
