import { describe, it, expect, vi } from 'vitest'
import { RoleUser, StatusMenu } from '@prisma/client'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))
vi.mock('@/app/actions/menu-foto', () => ({ deleteAllMenuFotos: vi.fn() }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function namaUnik(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 8)}`
}

function authOwner() {
  authMock.mockResolvedValue({
    user: { id: '1', username: 'owner', role: 'owner' },
  })
}

describeIntegration('Integrasi TC-03: menu', () => {
  it('menyimpan menu baru dengan relasi kategori dan stok tersedia', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu TC03')
    let menuId: number | null = null

    try {
      const hasil = await createMenu({
        namaMenu,
        harga: 25000,
        kategoriId: kategori.id,
        statusMenu: StatusMenu.tersedia,
        stokManual: 5,
      })

      expect(hasil).toHaveProperty('id')
      if (!('id' in hasil)) throw new Error(`createMenu gagal: ${JSON.stringify(hasil)}`)
      menuId = hasil.id

      const row = await prisma.menu.findUnique({ where: { id: menuId } })
      expect(row).not.toBeNull()
      expect(row?.namaMenu).toBe(namaMenu)
      expect(Number(row?.harga)).toBe(25000)
      expect(row?.kategoriId).toBe(kategori.id)
      expect(row?.statusMenu).toBe(StatusMenu.tersedia)
      expect(row?.stokManual).toBe(5)
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('menyimpan status habis saat stok manual 0', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Habis TC03')
    let menuId: number | null = null

    try {
      const hasil = await createMenu({
        namaMenu,
        harga: 15000,
        kategoriId: kategori.id,
        statusMenu: StatusMenu.tersedia,
        stokManual: 0,
      })

      if (!('id' in hasil)) throw new Error(`createMenu gagal: ${JSON.stringify(hasil)}`)
      menuId = hasil.id

      const row = await prisma.menu.findUnique({ where: { id: menuId } })
      expect(row?.statusMenu).toBe(StatusMenu.habis)
      expect(row?.stokManual).toBe(0)
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('menyimpan menu tanpa stok (stok manual default 0, status tersedia)', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Tanpa Stok TC03')
    let menuId: number | null = null

    try {
      const hasil = await createMenu({
        namaMenu,
        harga: 10000,
        kategoriId: kategori.id,
      })

      if (!('id' in hasil)) throw new Error(`createMenu gagal: ${JSON.stringify(hasil)}`)
      menuId = hasil.id

      const row = await prisma.menu.findUnique({ where: { id: menuId } })
      expect(row?.stokManual).toBe(0)
      expect(row?.statusMenu).toBe(StatusMenu.tersedia)
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('mengizinkan kitchen membuat menu', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'dapur', role: 'kitchen' },
    })

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Dapur TC03')
    let menuId: number | null = null

    try {
      const hasil = await createMenu({
        namaMenu,
        harga: 12000,
        kategoriId: kategori.id,
        stokManual: 2,
      })
      expect(hasil).toHaveProperty('id')
      if ('id' in hasil) menuId = hasil.id
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('menolak waiter membuat menu', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'pelayan', role: 'waiter' },
    })

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })

    try {
      const hasil = await createMenu({
        namaMenu: namaUnik('Menu Pelayan TC03'),
        harga: 10000,
        kategoriId: kategori.id,
        stokManual: 1,
      })
      expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' }) // never reached if Unauthorized thrown
    } catch (error) {
      expect((error as Error).message).toBe('Unauthorized')
    } finally {
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('tidak menulis menu saat harga tidak valid', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Gratis TC03')

    try {
      const hasil = await createMenu({
        namaMenu,
        harga: 0,
        kategoriId: kategori.id,
        statusMenu: StatusMenu.tersedia,
        stokManual: 1,
      })

      expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' })
      expect(await prisma.menu.findUnique({ where: { namaMenu } })).toBeNull()
    } finally {
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('memperbarui menu, harga Decimal, dan status stok', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu, updateMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Update TC03')
    let menuId: number | null = null

    try {
      const dibuat = await createMenu({
        namaMenu,
        harga: 20000,
        kategoriId: kategori.id,
        stokManual: 1,
      })
      if (!('id' in dibuat)) throw new Error(`createMenu gagal: ${JSON.stringify(dibuat)}`)
      menuId = dibuat.id

      const diubah = await updateMenu({
        id: menuId,
        namaMenu: `${namaMenu} Baru`,
        harga: 35000,
        statusMenu: StatusMenu.tersedia,
        stokManual: 0,
      })
      expect(diubah).toBeUndefined()

      const row = await prisma.menu.findUnique({ where: { id: menuId } })
      expect(row?.namaMenu).toBe(`${namaMenu} Baru`)
      expect(Number(row?.harga)).toBe(35000)
      expect(row?.stokManual).toBe(0)
      expect(row?.statusMenu).toBe(StatusMenu.habis)
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('mengubah status menu dan melakukan soft delete', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu, toggleStatusMenu, deleteMenu } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Toggle TC03')
    let menuId: number | null = null

    try {
      const dibuat = await createMenu({
        namaMenu,
        harga: 15000,
        kategoriId: kategori.id,
        stokManual: 3,
      })
      if (!('id' in dibuat)) throw new Error(`createMenu gagal: ${JSON.stringify(dibuat)}`)
      menuId = dibuat.id

      await toggleStatusMenu(menuId, StatusMenu.habis)
      expect((await prisma.menu.findUnique({ where: { id: menuId } }))?.statusMenu).toBe(
        StatusMenu.habis
      )

      const dihapus = await deleteMenu(menuId)
      expect(dihapus).toEqual({ success: true })
      expect((await prisma.menu.findUnique({ where: { id: menuId } }))?.deletedAt).not.toBeNull()
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('membuat, mengembalikan, dan menghapus kategori dengan aman', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createKategori, deleteKategori } = await import('@/app/actions/menu')
    const namaKategori = namaUnik('Kategori Aman')

    authOwner()

    const dibuat = await createKategori({ namaKategori })
    expect(dibuat).toEqual({ success: true })

    const duplikat = await createKategori({ namaKategori })
    expect(duplikat).toEqual({ error: 'Kategori dengan nama ini sudah ada' })

    const kategori = await prisma.kategoriMenu.findFirst({ where: { namaKategori } })
    expect(kategori).not.toBeNull()

    const dihapus = await deleteKategori(kategori!.id)
    expect(dihapus).toEqual({ success: true })
    expect((await prisma.kategoriMenu.findUnique({ where: { id: kategori!.id } }))?.deletedAt).not
      .toBeNull()

    const kembali = await createKategori({ namaKategori })
    expect(kembali).toEqual({ success: true })
    const dipulihkan = await prisma.kategoriMenu.findFirst({ where: { namaKategori } })
    expect(dipulihkan?.deletedAt).toBeNull()

    await prisma.kategoriMenu.deleteMany({ where: { namaKategori } })
  })

  it('menolak hapus kategori yang masih dipakai menu aktif', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu, deleteKategori } = await import('@/app/actions/menu')

    authOwner()

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori Digunakan') },
    })
    const namaMenu = namaUnik('Menu Pengguna')
    let menuId: number | null = null

    try {
      const dibuat = await createMenu({
        namaMenu,
        harga: 10000,
        kategoriId: kategori.id,
        stokManual: 1,
      })
      if (!('id' in dibuat)) throw new Error(`createMenu gagal: ${JSON.stringify(dibuat)}`)
      menuId = dibuat.id

      const ditolak = await deleteKategori(kategori.id)
      expect(ditolak).toEqual({ error: 'Kategori masih digunakan oleh 1 menu aktif' })
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
    }
  })

  it('mengatur ulang stok harian menu dari tersedia menjadi habis dan sebaliknya', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu, updateStokMenuHarian } = await import('@/app/actions/menu')

    const owner = await prisma.users.create({
      data: {
        username: `tc03_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    authMock.mockResolvedValue({
      user: { id: String(owner.id), username: owner.username, role: 'owner' },
    })

    const kategori = await prisma.kategoriMenu.create({
      data: { namaKategori: namaUnik('Kategori TC03') },
    })
    const namaMenu = namaUnik('Menu Stok TC03')
    let menuId: number | null = null

    try {
      const dibuat = await createMenu({
        namaMenu,
        harga: 10000,
        kategoriId: kategori.id,
        stokManual: 0,
      })
      if (!('id' in dibuat)) throw new Error(`createMenu gagal: ${JSON.stringify(dibuat)}`)
      menuId = dibuat.id

      const diisi = await updateStokMenuHarian(menuId, 5)
      expect(diisi).toEqual({ success: true })
      expect((await prisma.menu.findUnique({ where: { id: menuId } }))?.statusMenu).toBe(
        StatusMenu.tersedia
      )

      const habis = await updateStokMenuHarian(menuId, 0)
      expect(habis).toEqual({ success: true })
      expect((await prisma.menu.findUnique({ where: { id: menuId } }))?.statusMenu).toBe(
        StatusMenu.habis
      )

      const tidakValid = await updateStokMenuHarian(menuId, -2)
      expect(tidakValid).toEqual({ error: 'Stok harus berupa angka tidak negatif' })
    } finally {
      if (menuId !== null) {
        await prisma.menu.deleteMany({ where: { id: menuId } })
      }
      await prisma.kategoriMenu.deleteMany({ where: { id: kategori.id } })
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })
})
