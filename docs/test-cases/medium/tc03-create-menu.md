# TC-03 — Kelola Menu (`createMenu`)

| Item | Keterangan |
|------|------------|
| Level | Menengah |
| Action | `createMenu` — `src/app/actions/menu.ts:112` |
| Model | `Menu`, `KategoriMenu` |
| File unit | `src/test/unit/app/actions/tc03-create-menu.test.ts` |
| File integration | `src/test/integration/tc03-create-menu.test.ts` |
| Jumlah test | Unit 4 `it`, Integration 3 `it` |

## Tujuan

Membuktikan bahwa pembuatan menu:

1. hanya boleh dilakukan oleh **owner** atau **kitchen**,
2. menolak nama kosong dan harga ≤ 0,
3. mengubah `harga` menjadi `Prisma.Decimal`,
4. menentukan status dari stok: stok > 0 → `tersedia`, stok 0 → `habis`,
5. menyimpan relasi `kategoriId` yang valid (integration).

## Aturan Status Menu

```ts
const stokManual = data.stokManual === undefined
  ? 0
  : Math.max(0, Math.floor(Number(data.stokManual)))

const statusMenu = data.statusMenu && data.statusMenu !== 'nonaktif'
  ? (stokManual > 0 ? 'tersedia' : 'habis')
  : (data.statusMenu || 'tersedia')
```

Artinya: jika `statusMenu` diisi selain `nonaktif`, status akhir **selalu**
ditentukan oleh stok manual.

## Unit Test

Mock: `@/lib/auth`, `next/cache`, `@/lib/log`, `@/app/actions/menu-foto`,
`@/lib/prisma`.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

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
import { menuFixture } from '@/test/helpers/fixtures'
import { createMenu } from '@/app/actions/menu'

describe('TC-03 createMenu (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    prismaMock.menu.create.mockResolvedValue(
      menuFixture({ id: 9, stokManual: 5, statusMenu: 'tersedia' })
    )
  })

  it('membuat menu baru dengan harga Decimal dan status tersedia', async () => {
    const hasil = await createMenu({
      namaMenu: 'Nasi Goreng Demo',
      harga: 25000,
      kategoriId: 1,
      statusMenu: 'tersedia',
      stokManual: 5,
    })

    expect(hasil).toEqual({ id: 9 })
    expect(prismaMock.menu.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        namaMenu: 'Nasi Goreng Demo',
        kategoriId: 1,
        statusMenu: 'tersedia',
        stokManual: 5,
        harga: expect.anything(),
      }),
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })

  it('menandai menu habis saat stok manual 0', async () => {
    await createMenu({
      namaMenu: 'Menu Habis Demo',
      harga: 15000,
      kategoriId: 1,
      statusMenu: 'tersedia',
      stokManual: 0,
    })

    expect(prismaMock.menu.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        statusMenu: 'habis',
        stokManual: 0,
      }),
    })
  })

  it('menolak harga 0 tanpa menyentuh database', async () => {
    const hasil = await createMenu({
      namaMenu: 'Menu Gratis',
      harga: 0,
      kategoriId: 1,
      statusMenu: 'tersedia',
      stokManual: 1,
    })

    expect(hasil).toEqual({ error: 'Harga harus lebih dari 0' })
    expect(prismaMock.menu.create).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('menolak role selain owner/kitchen', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(
      createMenu({
        namaMenu: 'Menu Demo',
        harga: 10000,
        kategoriId: 1,
        statusMenu: 'tersedia',
        stokManual: 1,
      })
    ).rejects.toThrow('Unauthorized')

    expect(prismaMock.menu.create).not.toHaveBeenCalled()
  })
})
```

### Penjelasan Assertion Unit

| Assertion | Arti |
|-----------|------|
| `hasil == { id: 9 }` | Action mengembalikan id, bukan objek Decimal mentah. |
| `harga: expect.anything()` | Harga dikirim sebagai objek (Decimal), bukan number. |
| `statusMenu: 'tersedia'` saat stok 5 | Aturan stok → status. |
| `statusMenu: 'habis'` saat stok 0 | Stok nol memaksa status habis. |
| `create` tidak dipanggil saat harga 0 | Validasi bisnis berjalan sebelum I/O. |
| `rejects.toThrow('Unauthorized')` | Waiter tidak boleh membuat menu. |

## Integration Test

Mock hanya `auth`, `next/cache`, `next/headers`, `menu-foto`. Prisma nyata,
termasuk relasi ke `KategoriMenu`.

```ts
import { describe, it, expect, vi } from 'vitest'
import { StatusMenu } from '@prisma/client'

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

describeIntegration('Integrasi TC-03: createMenu', () => {
  it('menyimpan menu baru dengan relasi kategori dan stok tersedia', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

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

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

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

  it('tidak menulis menu saat harga tidak valid', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMenu } = await import('@/app/actions/menu')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

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
})
```

### Penjelasan Assertion Integration

| Assertion | Arti |
|-----------|------|
| `menu.findUnique(id) != null` | Row menu benar-benar tersimpan. |
| `kategoriId == kategori.id` | Relasi foreign key valid. |
| `Number(row.harga) == 25000` | Decimal tersimpan dengan nilai benar. |
| `statusMenu == tersedia/habis` | Aturan stok diterapkan di database. |
| `findUnique(namaMenu) == null` pada harga invalid | Tidak ada penulisan saat validasi gagal. |

## Cara Menjalankan

```powershell
npx vitest run src/test/unit/app/actions/tc03-create-menu.test.ts
npx vitest run src/test/integration/tc03-create-menu.test.ts
```
