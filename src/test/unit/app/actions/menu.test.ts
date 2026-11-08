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
  createKategori,
  createMenu,
  deleteKategori,
  deleteMenu,
  getMenus,
  setAllStokMenuHarian,
  setStokMenuHarianByKategori,
  toggleStatusMenu,
  updateKategori,
  updateMenu,
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
  prismaMock.menu.create.mockResolvedValue(menuFixture({ id: 9 }))
  prismaMock.menu.findMany.mockResolvedValue([])
  prismaMock.menu.count.mockResolvedValue(0)
  prismaMock.kategoriMenu.create.mockResolvedValue(kategoriMenuFixture())
  prismaMock.kategoriMenu.update.mockResolvedValue(kategoriMenuFixture())
  prismaMock.kategoriMenu.findFirst.mockResolvedValue(kategoriMenuFixture())
  createLogMock.mockResolvedValue(undefined)
  deleteAllMenuFotosMock.mockResolvedValue(undefined)
})

describe('getMenus', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getMenus()).rejects.toThrow('Unauthorized')
  })

  it('memetakan foto dan harga numerik', async () => {
    prismaMock.menu.findMany.mockResolvedValue([
      {
        ...menuFixture({ id: 4, harga: 25000 }),
        menuFoto: [
          { id: 1, fotoUrl: 'a.jpg', urutan: 0 },
          { id: 2, fotoUrl: 'b.jpg', urutan: 1 },
        ],
      },
    ])

    const hasil = await getMenus()

    expect(hasil[0]).toMatchObject({
      id: 4,
      harga: 25000,
      fotoUrl: 'a.jpg',
      fotoUrls: ['a.jpg', 'b.jpg'],
      adaResep: false,
      resepLengkap: true,
      porsiTersedia: 0,
      bahanPembatas: [],
    })
  })
})

describe('createMenu', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(
      createMenu({ namaMenu: 'Menu', harga: 10000, kategoriId: 1 })
    ).rejects.toThrow('Unauthorized')
  })

  it('menolak role selain owner/kitchen', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(
      createMenu({ namaMenu: 'Menu', harga: 10000, kategoriId: 1 })
    ).rejects.toThrow('Unauthorized')
  })

  it('menolak nama kosong', async () => {
    const hasil = await createMenu({ namaMenu: '   ', harga: 10000, kategoriId: 1 })

    expect(hasil).toEqual({ error: 'Nama menu wajib diisi' })
    expect(prismaMock.menu.create).not.toHaveBeenCalled()
  })

  it('menolak harga nol atau negatif', async () => {
    const hasil = await createMenu({ namaMenu: 'Menu', harga: 0, kategoriId: 1 })

    expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' })
    expect(prismaMock.menu.create).not.toHaveBeenCalled()
  })

  it('membuat menu dengan stok default nol', async () => {
    const hasil = await createMenu({ namaMenu: 'Menu', harga: 25000, kategoriId: 1 })

    expect(hasil).toEqual({ id: 9 })
    const data = prismaMock.menu.create.mock.calls[0][0].data
    expect(data).toMatchObject({ namaMenu: 'Menu', kategoriId: 1, stokManual: 0, statusMenu: 'tersedia' })
    expect(data.harga.toString()).toBe('25000')
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })

  it('menentukan status tersedia saat stok tersedia', async () => {
    await createMenu({
      namaMenu: 'Menu',
      harga: 25000,
      kategoriId: 1,
      statusMenu: 'tersedia',
      stokManual: 5,
    })

    expect(prismaMock.menu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stokManual: 5, statusMenu: 'tersedia' }),
      })
    )
  })

  it('menentukan status habis saat stok nol', async () => {
    await createMenu({
      namaMenu: 'Menu',
      harga: 25000,
      kategoriId: 1,
      statusMenu: 'tersedia',
      stokManual: 0,
    })

    expect(prismaMock.menu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stokManual: 0, statusMenu: 'habis' }),
      })
    )
  })

  it('mempertahankan status nonaktif', async () => {
    await createMenu({
      namaMenu: 'Menu',
      harga: 25000,
      kategoriId: 1,
      statusMenu: 'nonaktif',
      stokManual: 5,
    })

    expect(prismaMock.menu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ statusMenu: 'nonaktif' }),
      })
    )
  })

  it('membulatkan stok negatif menjadi nol', async () => {
    await createMenu({
      namaMenu: 'Menu',
      harga: 25000,
      kategoriId: 1,
      stokManual: -3.7,
    })

    expect(prismaMock.menu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stokManual: 0 }),
      })
    )
  })
})

describe('updateMenu', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(updateMenu({ id: 1, namaMenu: 'Baru' })).rejects.toThrow('Unauthorized')
  })

  it('menolak nama kosong', async () => {
    const hasil = await updateMenu({ id: 1, namaMenu: '  ' })

    expect(hasil).toEqual({ error: 'Nama menu tidak boleh kosong' })
    expect(prismaMock.menu.update).not.toHaveBeenCalled()
  })

  it('menolak harga tidak valid', async () => {
    const hasil = await updateMenu({ id: 1, harga: -1 })

    expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' })
    expect(prismaMock.menu.update).not.toHaveBeenCalled()
  })

  it('menentukan status dari stok baru', async () => {
    await updateMenu({ id: 1, statusMenu: 'tersedia', stokManual: 0 })

    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ stokManual: 0, statusMenu: 'habis' }),
    })
  })

  it('mempertahankan status nonaktif saat stok diubah', async () => {
    await updateMenu({ id: 1, statusMenu: 'nonaktif', stokManual: 5 })

    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ stokManual: 5, statusMenu: 'nonaktif' }),
    })
  })

  it('mengirim harga sebagai Decimal saat diberikan', async () => {
    await updateMenu({ id: 1, harga: 30000 })

    const data = prismaMock.menu.update.mock.calls[0][0].data
    expect(data.harga.toString()).toBe('30000')
    expect(data.stokManual).toBeUndefined()
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })
})

describe('deleteMenu', () => {
  it('mengembalikan error Unauthorized tanpa menghapus', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await deleteMenu(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.menu.update).not.toHaveBeenCalled()
  })

  it('menghapus foto lalu melakukan soft delete', async () => {
    const hasil = await deleteMenu(1)

    expect(hasil).toEqual({ success: true })
    expect(deleteAllMenuFotosMock).toHaveBeenCalledWith(1)
    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })
})

describe('toggleStatusMenu', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(toggleStatusMenu(1, 'habis')).rejects.toThrow('Unauthorized')
  })

  it('mengubah status menu', async () => {
    await toggleStatusMenu(1, 'habis')

    expect(prismaMock.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusMenu: 'habis' },
    })
  })
})

describe('createKategori', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(createKategori({ namaKategori: 'Snack' })).rejects.toThrow('Unauthorized')
  })

  it('menolak nama yang sudah aktif', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(
      kategoriMenuFixture({ id: 1, deletedAt: null })
    )

    const hasil = await createKategori({ namaKategori: 'Makanan' })

    expect(hasil).toEqual({ error: 'Kategori dengan nama ini sudah ada' })
    expect(prismaMock.kategoriMenu.create).not.toHaveBeenCalled()
  })

  it('memulihkan kategori yang pernah dihapus', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(
      kategoriMenuFixture({ id: 5, deletedAt: new Date('2026-01-01') })
    )

    const hasil = await createKategori({
      namaKategori: 'Snack',
      lokasi: 'cafe',
      icon: '  🍟  ',
      pilihanSuhu: true,
    })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        deletedAt: null,
        namaKategori: 'Snack',
        lokasi: 'cafe',
        icon: '🍟',
        pilihanSuhu: true,
      },
    })
    expect(prismaMock.kategoriMenu.create).not.toHaveBeenCalled()
  })

  it('membuat kategori baru dengan nilai default', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

    const hasil = await createKategori({ namaKategori: 'Snack' })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.kategoriMenu.create).toHaveBeenCalledWith({
      data: { namaKategori: 'Snack', lokasi: 'resto', icon: null, pilihanSuhu: false },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })
})

describe('updateKategori', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(updateKategori(1, { namaKategori: 'Snack' })).rejects.toThrow('Unauthorized')
  })

  it('menolak nama yang dipakai kategori lain', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(kategoriMenuFixture({ id: 2 }))

    const hasil = await updateKategori(1, { namaKategori: 'Makanan' })

    expect(hasil).toEqual({ error: 'Kategori dengan nama ini sudah ada' })
    expect(prismaMock.kategoriMenu.update).not.toHaveBeenCalled()
  })

  it('memperbarui kategori dan menormalkan icon', async () => {
    prismaMock.kategoriMenu.findFirst.mockResolvedValue(null)

    const hasil = await updateKategori(1, {
      namaKategori: 'Snack',
      lokasi: 'cafe',
      icon: '  🍟 ',
    })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        namaKategori: 'Snack',
        lokasi: 'cafe',
        icon: '🍟',
        pilihanSuhu: false,
      },
    })
  })
})

describe('deleteKategori', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(deleteKategori(1)).rejects.toThrow('Unauthorized')
  })

  it('menolak kategori yang masih dipakai menu aktif', async () => {
    prismaMock.menu.count.mockResolvedValue(2)

    const hasil = await deleteKategori(1)

    expect(hasil).toEqual({ error: 'Kategori masih digunakan oleh 2 menu aktif' })
    expect(prismaMock.kategoriMenu.update).not.toHaveBeenCalled()
  })

  it('melakukan soft delete kategori yang tidak dipakai', async () => {
    const hasil = await deleteKategori(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.kategoriMenu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    })
  })
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
