import { describe, it, expect, vi } from 'vitest'
import { RoleUser } from '@prisma/client'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => '127.0.0.1' })) }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function kodeUnik(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
}

function authOwner(ownerId: number | string) {
  authMock.mockResolvedValue({
    user: { id: String(ownerId), username: 'owner', role: 'owner' },
  })
}

describeIntegration('Integrasi TC-04: voucher', () => {
  it('menyimpan voucher dan memvalidasinya terhadap data di database', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, validateVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04')
    let voucherId: number | null = null

    authOwner(owner.id)

    try {
      const hasil = await createVoucher({
        kode: kode.toLowerCase(),
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })

      expect(hasil).toHaveProperty('success', true)
      if (!('id' in hasil)) throw new Error(`createVoucher gagal: ${JSON.stringify(hasil)}`)
      voucherId = hasil.id

      const row = await prisma.voucher.findUnique({ where: { kode } })
      expect(row).not.toBeNull()
      expect(row?.namaVoucher).toBe('Hemat 10%')
      expect(row?.diskonPersen).toBe(10)
      expect(Number(row?.minimalBelanja)).toBe(20000)
      expect(row?.statusVoucher).toBe('aktif')

      const validasi = await validateVoucher(kode.toLowerCase(), 50000)
      expect(validasi).toEqual({
        valid: true,
        kode,
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        minimalBelanja: 20000,
        potongan: 5000,
      })

      const log = await prisma.logs.findFirst({
        where: { userId: owner.id, aksi: 'MANAGE_VOUCHER' },
      })
      expect(log).not.toBeNull()
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (voucherId !== null) {
        await prisma.voucher.deleteMany({ where: { id: voucherId } })
      }
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('menolak voucher duplikat dan tidak menambah row baru', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04DUP')

    authOwner(owner.id)

    try {
      const pertama = await createVoucher({
        kode,
        namaVoucher: 'Duplikat 1',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })
      expect(pertama).toHaveProperty('success', true)

      const kedua = await createVoucher({
        kode,
        namaVoucher: 'Duplikat 2',
        diskonPersen: 20,
        minimalBelanja: 30000,
      })
      expect(kedua).toEqual({ error: 'Kode voucher sudah digunakan' })

      expect(await prisma.voucher.count({ where: { kode } })).toBe(1)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      await prisma.voucher.deleteMany({ where: { kode } })
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('mengembalikan voucher yang sudah di-soft-delete', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, deleteVoucher, validateVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04RESTORE')
    let voucherId: number | null = null

    authOwner(owner.id)

    try {
      const pertama = await createVoucher({
        kode,
        namaVoucher: 'Awal',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })
      if (!('id' in pertama)) throw new Error(`createVoucher gagal: ${JSON.stringify(pertama)}`)
      voucherId = pertama.id

      const dihapus = await deleteVoucher(voucherId)
      expect(dihapus).toEqual({ success: true })
      expect((await prisma.voucher.findUnique({ where: { kode } }))?.deletedAt).not.toBeNull()

      const kembali = await createVoucher({
        kode,
        namaVoucher: 'Kembali',
        diskonPersen: 15,
        minimalBelanja: 30000,
      })
      expect(kembali).toHaveProperty('success', true)

      const row = await prisma.voucher.findUnique({ where: { kode } })
      expect(row?.deletedAt).toBeNull()
      expect(row?.namaVoucher).toBe('Kembali')
      expect(row?.diskonPersen).toBe(15)

      const validasi = await validateVoucher(kode, 50000)
      expect(validasi.valid).toBe(true)
      expect(validasi.potongan).toBe(7500)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (voucherId !== null) {
        await prisma.voucher.deleteMany({ where: { id: voucherId } })
      }
      await prisma.voucher.deleteMany({ where: { kode } })
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('mengubah status voucher menjadi tidak aktif dan kembali', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, setStatusVoucher, validateVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04STATUS')
    let voucherId: number | null = null

    authOwner(owner.id)

    try {
      const dibuat = await createVoucher({
        kode,
        namaVoucher: 'Status',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })
      if (!('id' in dibuat)) throw new Error(`createVoucher gagal: ${JSON.stringify(dibuat)}`)
      voucherId = dibuat.id

      const nonaktifkan = await setStatusVoucher(voucherId, 'nonaktif')
      expect(nonaktifkan).toEqual({ success: true })
      expect((await validateVoucher(kode, 50000)).error).toBe('Voucher sedang tidak aktif')

      const aktifkan = await setStatusVoucher(voucherId, 'aktif')
      expect(aktifkan).toEqual({ success: true })
      expect((await validateVoucher(kode, 50000)).valid).toBe(true)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (voucherId !== null) {
        await prisma.voucher.deleteMany({ where: { id: voucherId } })
      }
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('menghapus voucher sehingga hilang dari daftar aktif', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, deleteVoucher, getVoucherAktif, getVoucherList } = await import(
      '@/app/actions/voucher'
    )

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04DELETE')
    let voucherId: number | null = null

    authOwner(owner.id)

    try {
      const dibuat = await createVoucher({
        kode,
        namaVoucher: 'Hapus',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })
      if (!('id' in dibuat)) throw new Error(`createVoucher gagal: ${JSON.stringify(dibuat)}`)
      voucherId = dibuat.id

      const dihapus = await deleteVoucher(voucherId)
      expect(dihapus).toEqual({ success: true })

      const aktif = await getVoucherAktif()
      expect(aktif.some((v) => v.kode === kode)).toBe(false)

      const daftar = await getVoucherList()
      expect(daftar.some((v) => v.kode === kode)).toBe(false)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (voucherId !== null) {
        await prisma.voucher.deleteMany({ where: { id: voucherId } })
      }
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('menolak update voucher yang bentrok kode dengan voucher lain', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, updateVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kodeA = kodeUnik('TC04A')
    const kodeB = kodeUnik('TC04B')
    let idA: number | null = null
    let idB: number | null = null

    authOwner(owner.id)

    try {
      const a = await createVoucher({ kode: kodeA, namaVoucher: 'A', diskonPersen: 10, minimalBelanja: 10000 })
      if (!('id' in a)) throw new Error(`createVoucher gagal: ${JSON.stringify(a)}`)
      idA = a.id

      const b = await createVoucher({ kode: kodeB, namaVoucher: 'B', diskonPersen: 20, minimalBelanja: 20000 })
      if (!('id' in b)) throw new Error(`createVoucher gagal: ${JSON.stringify(b)}`)
      idB = b.id

      const bentrok = await updateVoucher(idA, { kode: kodeB, namaVoucher: 'A Ubah', diskonPersen: 10, minimalBelanja: 10000 })
      expect(bentrok).toEqual({ error: 'Kode voucher sudah digunakan' })
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (idA !== null) await prisma.voucher.deleteMany({ where: { id: idA } })
      if (idB !== null) await prisma.voucher.deleteMany({ where: { id: idB } })
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('menolak input tidak valid tanpa menulis baris', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })

    authOwner(owner.id)

    try {
      const sebelum = await prisma.voucher.count()

      const hasil = await createVoucher({
        kode: '',
        namaVoucher: 'X',
        diskonPersen: 0,
        minimalBelanja: -5,
      })
      expect(hasil).toEqual({ error: 'Kode voucher wajib diisi' })

      const sesudah = await prisma.voucher.count()
      expect(sesudah).toBe(sebelum)
    } finally {
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })
})
