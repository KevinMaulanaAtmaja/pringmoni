import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'

const { authMock, revalidatePathMock, createLogMock, deleteAllMenuFotosMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  createLogMock: vi.fn(),
  deleteAllMenuFotosMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/app/actions/menu-foto', () => ({ deleteAllMenuFotos: deleteAllMenuFotosMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { kategoriMenuFixture, menuFixture } from '@/test/helpers/fixtures'
import {
  createKategori,
  createMenu,
  deleteKategori,
  deleteMenu,
  getKategoriMenus,
  getMenus,
  setAllStokMenuHarian,
  setStokMenuHarianByKategori,
  toggleStatusMenu,
  updateKategori,
  updateMenu,
  updateStokMenuHarian,
} from '@/app/actions/menu'

const INPUT_MENU = {
  namaMenu: 'Nasi Goreng Demo',
  harga: 25000,
  kategoriId: 1,
  statusMenu: 'tersedia' as const,
  stokManual: 5,
}

function dataCreateMenu(): Record<string, unknown> {
  return prismaMock.menu.create.mock.calls[0][0].data
}

describe('TC-03 menu (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    createLogMock.mockResolvedValue(undefined)
    deleteAllMenuFotosMock.mockResolvedValue(undefined)
    prismaMock.menu.create.mockResolvedValue(menuFixture({ id: 9 }))
    prismaMock.menu.update.mockResolvedValue(menuFixture({ id: 9 }))
  })

  describe('createMenu', () => {
    it('membuat menu dengan harga Decimal dan status tersedia', async () => {
      const hasil = await createMenu(INPUT_MENU)

      expect(hasil).toEqual({ id: 9 })

      const data = dataCreateMenu()
      expect(data).toMatchObject({
        namaMenu: 'Nasi Goreng Demo',
        kategoriId: 1,
        statusMenu: 'tersedia',
        stokManual: 5,
      })
      expect(data.harga).toBeInstanceOf(Prisma.Decimal)
      expect(Number(data.harga)).toBe(25000)
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    })

    it('menandai menu habis saat stok manual 0', async () => {
      await createMenu({ ...INPUT_MENU, stokManual: 0 })

      expect(dataCreateMenu()).toMatchObject({ statusMenu: 'habis', stokManual: 0 })
    })

    it('memaksa status tersedia saat stok diisi lebih dari 0', async () => {
      await createMenu({ ...INPUT_MENU, statusMenu: 'habis', stokManual: 3 })

      expect(dataCreateMenu()).toMatchObject({ statusMenu: 'tersedia', stokManual: 3 })
    })

    it('mempertahankan status nonaktif apa pun stoknya', async () => {
      await createMenu({ ...INPUT_MENU, statusMenu: 'nonaktif', stokManual: 5 })

      expect(dataCreateMenu()).toMatchObject({ statusMenu: 'nonaktif', stokManual: 5 })
    })

    it('memakai stok 0 saat stok tidak dikirim dan status default tersedia', async () => {
      await createMenu({
        namaMenu: 'Menu Tanpa Stok',
        harga: 10000,
        kategoriId: 1,
      })

      expect(dataCreateMenu()).toMatchObject({ stokManual: 0, statusMenu: 'tersedia' })
    })

    it.each([
      { stok: -3, harapan: 0 },
      { stok: 3.9, harapan: 3 },
    ])('menormalkan stok $stok menjadi $harapan', async ({ stok, harapan }) => {
      await createMenu({ ...INPUT_MENU, stokManual: stok })

      expect(dataCreateMenu()).toMatchObject({ stokManual: harapan })
    })

    it('memvalidasi nama menu sebelum harga', async () => {
      const hasil = await createMenu({ ...INPUT_MENU, namaMenu: '   ', harga: 0 })

      expect(hasil).toEqual({ error: 'Nama menu wajib diisi' })
      expect(prismaMock.menu.create).not.toHaveBeenCalled()
    })

    it.each([0, -5000])('menolak harga %s tanpa menyentuh database', async (harga) => {
      const hasil = await createMenu({ ...INPUT_MENU, harga })

      expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' })
      expect(prismaMock.menu.create).not.toHaveBeenCalled()
      expect(revalidatePathMock).not.toHaveBeenCalled()
    })

    it.each(['owner', 'kitchen'] as const)('mengizinkan role %s', async (role) => {
      authMock.mockResolvedValue(sessionUntuk(role))

      await expect(createMenu(INPUT_MENU)).resolves.toEqual({ id: 9 })
    })

    it.each([null, 'cashier', 'waiter'] as const)('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(createMenu(INPUT_MENU)).rejects.toThrow('Unauthorized')
      expect(prismaMock.menu.create).not.toHaveBeenCalled()
    })
  })

  describe('updateMenu', () => {
    it('memperbarui field parsial dan mengubah harga menjadi Decimal', async () => {
      await updateMenu({ id: 9, namaMenu: 'Menu Baru', harga: 30000 })

      const arg = prismaMock.menu.update.mock.calls[0][0]
      expect(arg.where).toEqual({ id: 9 })
      expect(arg.data.namaMenu).toBe('Menu Baru')
      expect(arg.data.harga).toBeInstanceOf(Prisma.Decimal)
      expect(Number(arg.data.harga)).toBe(30000)
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    })

    it('menghitung ulang status dari stok harian', async () => {
      await updateMenu({ id: 9, statusMenu: 'tersedia', stokManual: 0 })
      expect(prismaMock.menu.update.mock.calls[0][0].data).toMatchObject({
        statusMenu: 'habis',
        stokManual: 0,
      })

      vi.resetAllMocks()
      authMock.mockResolvedValue(sessionUntuk('owner'))
      prismaMock.menu.update.mockResolvedValue(menuFixture())

      await updateMenu({ id: 9, statusMenu: 'habis', stokManual: 4 })
      expect(prismaMock.menu.update.mock.calls[0][0].data).toMatchObject({
        statusMenu: 'tersedia',
        stokManual: 4,
      })
    })

    it('mempertahankan status nonaktif', async () => {
      await updateMenu({ id: 9, statusMenu: 'nonaktif', stokManual: 0 })

      expect(prismaMock.menu.update.mock.calls[0][0].data).toMatchObject({
        statusMenu: 'nonaktif',
      })
    })

    it('menolak nama kosong dan harga tidak valid', async () => {
      expect(await updateMenu({ id: 9, namaMenu: '  ' })).toEqual({
        error: 'Nama menu tidak boleh kosong',
      })
      expect(await updateMenu({ id: 9, harga: 0 })).toEqual({
        error: 'Harga harus lebih dari 0',
      })
      expect(prismaMock.menu.update).not.toHaveBeenCalled()
    })

    it('mengizinkan kitchen dan menolak role lain', async () => {
      authMock.mockResolvedValue(sessionUntuk('kitchen'))
      await expect(updateMenu({ id: 9, namaMenu: 'Baru' })).resolves.toBeUndefined()

      authMock.mockResolvedValue(sessionUntuk('cashier'))
      await expect(updateMenu({ id: 9, namaMenu: 'Baru' })).rejects.toThrow('Unauthorized')
    })
  })

  describe('deleteMenu', () => {
    it('menghapus foto lalu melakukan soft delete', async () => {
      const hasil = await deleteMenu(9)

      expect(hasil).toEqual({ success: true })
      expect(deleteAllMenuFotosMock).toHaveBeenCalledWith(9)
      expect(prismaMock.menu.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { deletedAt: expect.any(Date) },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    })

    it('mengembalikan pesan error saat penghapusan gagal', async () => {
      prismaMock.menu.update.mockRejectedValue(new Error('db down'))

      const hasil = await deleteMenu(9)

      expect(hasil).toEqual({ error: 'db down' })
    })

    it('menangkap Unauthorized sebagai hasil error', async () => {
      authMock.mockResolvedValue(sessionUntuk('waiter'))

      const hasil = await deleteMenu(9)

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(deleteAllMenuFotosMock).not.toHaveBeenCalled()
    })
  })

  describe('toggleStatusMenu', () => {
    it('mengubah status menu', async () => {
      await toggleStatusMenu(9, 'habis')

      expect(prismaMock.menu.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { statusMenu: 'habis' },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    })

    it('menolak role selain owner', async () => {
      authMock.mockResolvedValue(sessionUntuk('kitchen'))

      await expect(toggleStatusMenu(9, 'habis')).rejects.toThrow('Unauthorized')
    })
  })

  describe('getMenus / getKategoriMenus', () => {
    it('mengubah Decimal dan foto menjadi bentuk siap tampil', async () => {
      prismaMock.menu.findMany.mockResolvedValue([
        {
          ...menuFixture({ id: 1, harga: 25000 }),
          harga: new Prisma.Decimal(25000),
          menuFoto: [
            { id: 1, fotoUrl: 'foto-1.jpg', urutan: 0 },
            { id: 2, fotoUrl: 'foto-2.jpg', urutan: 1 },
          ],
        },
      ])

      const hasil = await getMenus()

      expect(hasil[0]).toMatchObject({
        id: 1,
        harga: 25000,
        fotoUrl: 'foto-1.jpg',
        fotoUrls: ['foto-1.jpg', 'foto-2.jpg'],
        adaResep: false,
        resepLengkap: true,
        porsiTersedia: 0,
        bahanPembatas: [],
      })
    })

    it('menolak tanpa session', async () => {
      authMock.mockResolvedValue(null)

      await expect(getMenus()).rejects.toThrow('Unauthorized')
    })

    it('mengambil kategori aktif tanpa autentikasi', async () => {
      prismaMock.kategoriMenu.findMany.mockResolvedValue([kategoriMenuFixture()])

      await expect(getKategoriMenus()).resolves.toEqual([kategoriMenuFixture()])
    })
  })

  describe('kategori', () => {
    it('membuat kategori baru dengan nilai default', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

      const hasil = await createKategori({ namaKategori: 'Minuman' })

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.kategoriMenu.create).toHaveBeenCalledWith({
        data: { namaKategori: 'Minuman', lokasi: 'resto', icon: null, pilihanSuhu: false },
      })
    })

    it('menolak kategori aktif dengan nama yang sama', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: null,
      })

      const hasil = await createKategori({ namaKategori: 'Minuman' })

      expect(hasil).toEqual({ error: 'Kategori dengan nama ini sudah ada' })
      expect(prismaMock.kategoriMenu.create).not.toHaveBeenCalled()
    })

    it('mengembalikan kategori yang sudah di-soft-delete', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue({
        id: 3,
        deletedAt: new Date(),
      })

      const hasil = await createKategori({ namaKategori: 'Minuman', icon: '  ' })

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          deletedAt: null,
          namaKategori: 'Minuman',
          lokasi: 'resto',
          icon: null,
          pilihanSuhu: false,
        },
      })
      expect(prismaMock.kategoriMenu.create).not.toHaveBeenCalled()
    })

    it('menolak update kategori yang bentrok nama', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue({ id: 2 })

      const hasil = await updateKategori(3, { namaKategori: 'Minuman' })

      expect(hasil).toEqual({ error: 'Kategori dengan nama ini sudah ada' })
      expect(prismaMock.kategoriMenu.update).not.toHaveBeenCalled()
    })

    it('memperbarui kategori dengan pilihan suhu dan icon', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

      const hasil = await updateKategori(3, {
        namaKategori: 'Minuman Dingin',
        lokasi: 'cafe',
        icon: 'es',
        pilihanSuhu: true,
      })

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          namaKategori: 'Minuman Dingin',
          lokasi: 'cafe',
          icon: 'es',
          pilihanSuhu: true,
        },
      })
    })

    it('menolak hapus kategori yang masih dipakai menu aktif', async () => {
      prismaMock.menu.count.mockResolvedValue(2)

      const hasil = await deleteKategori(3)

      expect(hasil).toEqual({ error: 'Kategori masih digunakan oleh 2 menu aktif' })
      expect(prismaMock.kategoriMenu.update).not.toHaveBeenCalled()
    })

    it('melakukan soft delete kategori yang tidak dipakai', async () => {
      prismaMock.menu.count.mockResolvedValue(0)

      const hasil = await deleteKategori(3)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { deletedAt: expect.any(Date) },
      })
    })

    it('menolak operasi kategori oleh non-owner', async () => {
      authMock.mockResolvedValue(sessionUntuk('kitchen'))

      await expect(createKategori({ namaKategori: 'X' })).rejects.toThrow('Unauthorized')
      await expect(updateKategori(1, { namaKategori: 'X' })).rejects.toThrow('Unauthorized')
      await expect(deleteKategori(1)).rejects.toThrow('Unauthorized')
    })
  })

  describe('stok harian', () => {
    it.each([-1, 1.5])('menolak jumlah %s', async (jumlah) => {
      const hasil = await updateStokMenuHarian(9, jumlah)

      expect(hasil).toEqual({ error: 'Stok harus berupa angka tidak negatif' })
      expect(prismaMock.menu.findUnique).not.toHaveBeenCalled()
    })

    it('menolak menu yang tidak ditemukan', async () => {
      prismaMock.menu.findUnique.mockResolvedValue(null)

      const hasil = await updateStokMenuHarian(9, 5)

      expect(hasil).toEqual({ error: 'Menu tidak ditemukan' })
    })

    it('menolak menu nonaktif', async () => {
      prismaMock.menu.findUnique.mockResolvedValue({
        id: 9,
        statusMenu: 'nonaktif',
        namaMenu: 'Menu Lama',
      })

      const hasil = await updateStokMenuHarian(9, 5)

      expect(hasil).toEqual({ error: 'Menu nonaktif tidak bisa diatur stok hariannya' })
    })

    it('mengubah stok menjadi tersedia dan mencatat log', async () => {
      prismaMock.menu.findUnique.mockResolvedValue({
        id: 9,
        statusMenu: 'habis',
        namaMenu: 'Nasi Goreng',
      })

      const hasil = await updateStokMenuHarian(9, 5)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.menu.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { stokManual: 5, statusMenu: 'tersedia' },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'UPDATE_ORDER_STATUS',
        'Atur stok harian Nasi Goreng menjadi 5',
        1
      )
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard')
    })

    it('menandai habis saat stok diubah menjadi 0', async () => {
      prismaMock.menu.findUnique.mockResolvedValue({
        id: 9,
        statusMenu: 'tersedia',
        namaMenu: 'Nasi Goreng',
      })

      await updateStokMenuHarian(9, 0)

      expect(prismaMock.menu.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { stokManual: 0, statusMenu: 'habis' },
      })
    })

    it('mengizinkan kitchen dan menolak cashier', async () => {
      prismaMock.menu.findUnique.mockResolvedValue({
        id: 9,
        statusMenu: 'tersedia',
        namaMenu: 'Nasi Goreng',
      })
      authMock.mockResolvedValue(sessionUntuk('kitchen'))
      await expect(updateStokMenuHarian(9, 5)).resolves.toEqual({ success: true })

      authMock.mockResolvedValue(sessionUntuk('cashier'))
      await expect(updateStokMenuHarian(9, 5)).rejects.toThrow('Unauthorized')
    })

    it('mengatur stok semua menu nonaktif-dikecualikan', async () => {
      const hasil = await setAllStokMenuHarian(10)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.menu.updateMany).toHaveBeenCalledWith({
        where: { deletedAt: null, statusMenu: { not: 'nonaktif' } },
        data: { stokManual: 10, statusMenu: 'tersedia' },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'UPDATE_ORDER_STATUS',
        expect.stringContaining('semua menu'),
        1
      )
    })

    it('menolak set semua stok dengan jumlah tidak valid', async () => {
      expect(await setAllStokMenuHarian(-2)).toEqual({
        error: 'Stok harus berupa angka tidak negatif',
      })
      expect(prismaMock.menu.updateMany).not.toHaveBeenCalled()
    })

    it('menolak set stok per kategori yang tidak ditemukan', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

      const hasil = await setStokMenuHarianByKategori(3, 5)

      expect(hasil).toEqual({ error: 'Kategori tidak ditemukan' })
      expect(prismaMock.menu.updateMany).not.toHaveBeenCalled()
    })

    it('mengatur stok per kategori dan mencatat nama kategori', async () => {
      prismaMock.kategoriMenu.findFirst.mockResolvedValue({ namaKategori: 'Minuman' })

      const hasil = await setStokMenuHarianByKategori(3, 0)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.menu.updateMany).toHaveBeenCalledWith({
        where: { deletedAt: null, statusMenu: { not: 'nonaktif' }, kategoriId: 3 },
        data: { stokManual: 0, statusMenu: 'habis' },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'UPDATE_ORDER_STATUS',
        expect.stringContaining('kategori Minuman'),
        1
      )
    })

    it('menolak set stok oleh cashier', async () => {
      authMock.mockResolvedValue(sessionUntuk('cashier'))

      await expect(setAllStokMenuHarian(5)).rejects.toThrow('Unauthorized')
      await expect(setStokMenuHarianByKategori(1, 5)).rejects.toThrow('Unauthorized')
    })
  })
})
