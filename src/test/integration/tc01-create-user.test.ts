import { describe, it, expect, vi } from 'vitest'
import { RoleUser } from '@prisma/client'
import bcrypt from 'bcryptjs'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function usernameUnik(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function authOwner() {
  authMock.mockResolvedValue({
    user: { id: '1', username: 'owner', role: 'owner' },
  })
}

const PASSWORD_TIDAK_VALID = [
  { password: 'Rah1!ab', error: 'Password minimal 8 karakter' },
  { password: 'rahasia1!', error: 'Password harus mengandung huruf besar (A-Z)' },
  { password: 'RAHASIA1!', error: 'Password harus mengandung huruf kecil (a-z)' },
  { password: 'Rahasia!!', error: 'Password harus mengandung angka (0-9)' },
  { password: 'Rahasia1', error: 'Password harus mengandung simbol (!@#$%^&*)' },
]

describeIntegration('Integrasi TC-01: users', () => {
  it('membuat kasir dengan email diisi dan password ter-hash', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_user')

    authOwner()

    try {
      const hasil = await createUser({
        username,
        email: 'kasir@pringmoni.test',
        password: 'Rah1!abc',
        role: RoleUser.cashier,
      })

      expect(hasil).toEqual({ success: true })

      const row = await prisma.users.findUnique({ where: { username } })
      expect(row).not.toBeNull()
      expect(row?.email).toBe('kasir@pringmoni.test')
      expect(row?.role).toBe(RoleUser.cashier)
      expect(row?.status).toBe(true)
      expect(await bcrypt.compare('Rah1!abc', row!.password)).toBe(true)
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it.each(['cashier', 'waiter', 'kitchen'])('membuat user dengan role %s', async (role) => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser } = await import('@/app/actions/users')
    const username = usernameUnik(`tc01_${role}`)

    authOwner()

    try {
      const hasil = await createUser({ username, password: 'Rah1!abc', role })

      expect(hasil).toEqual({ success: true })

      const row = await prisma.users.findUnique({ where: { username } })
      expect(row).not.toBeNull()
      expect(row?.role).toBe(role)
      expect(row?.status).toBe(true)
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it.each(PASSWORD_TIDAK_VALID)(
    'menolak password %s dan tidak menulis baris',
    async ({ password, error }) => {
      const prisma = (await import('@/lib/prisma')).default
      const { createUser } = await import('@/app/actions/users')
      const username = usernameUnik('tc01_invalid')

      authOwner()

      try {
        const hasil = await createUser({ username, password, role: RoleUser.cashier })

        expect(hasil).toEqual({ error })
        expect(await prisma.users.findUnique({ where: { username } })).toBeNull()
      } finally {
        await prisma.users.deleteMany({ where: { username } })
      }
    }
  )

  it('menolak username duplikat (constraint Prisma)', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_dup')

    authOwner()

    try {
      const pertama = await createUser({ username, password: 'Rah1!abc', role: RoleUser.cashier })
      expect(pertama).toEqual({ success: true })

      await expect(
        createUser({ username, password: 'Rah1!abc', role: RoleUser.cashier })
      ).rejects.toThrow()
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it('memperbarui profil, role, status, dan password kasir', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, updateUser } = await import('@/app/actions/users')
    const usernameLama = usernameUnik('tc01_lama')
    const usernameBaru = usernameUnik('tc01_baru')

    authOwner()

    try {
      const dibuat = await createUser({
        username: usernameLama,
        password: 'Rah1!abc',
        role: RoleUser.cashier,
      })
      expect(dibuat).toEqual({ success: true })

      const baris = await prisma.users.findUnique({ where: { username: usernameLama } })
      expect(baris).not.toBeNull()

      const diubah = await updateUser({
        id: baris!.id,
        username: usernameBaru,
        email: 'baru@pringmoni.test',
        role: RoleUser.waiter,
        status: false,
        password: 'Baru2!xy',
      })
      expect(diubah).toEqual({ success: true })

      const lama = await prisma.users.findUnique({ where: { username: usernameLama } })
      const terbaru = await prisma.users.findUnique({ where: { username: usernameBaru } })
      expect(lama).toBeNull()
      expect(terbaru).not.toBeNull()
      expect(terbaru?.role).toBe(RoleUser.waiter)
      expect(terbaru?.status).toBe(false)
      expect(terbaru?.email).toBe('baru@pringmoni.test')
      expect(await bcrypt.compare('Baru2!xy', terbaru!.password)).toBe(true)
    } finally {
      await prisma.users.deleteMany({
        where: { username: { in: [usernameLama, usernameBaru] } },
      })
    }
  })

  it('menolak update password lemah tanpa mengubah data', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, updateUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_weak')

    authOwner()

    try {
      const dibuat = await createUser({
        username,
        password: 'Rah1!abc',
        role: RoleUser.cashier,
      })
      expect(dibuat).toEqual({ success: true })

      const baris = await prisma.users.findUnique({ where: { username } })
      const diubah = await updateUser({
        id: baris!.id,
        username,
        email: null,
        role: RoleUser.cashier,
        status: true,
        password: 'lemah',
      })
      expect(diubah).toEqual({ error: 'Password minimal 8 karakter' })

      const tetap = await prisma.users.findUnique({ where: { username } })
      expect(await bcrypt.compare('Rah1!abc', tetap!.password)).toBe(true)
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it('menghapus user non-owner', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, deleteUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_hapus')

    authOwner()

    try {
      await createUser({ username, password: 'Rah1!abc', role: RoleUser.cashier })
      const baris = await prisma.users.findUnique({ where: { username } })

      const hasil = await deleteUser(baris!.id)
      expect(hasil).toBeUndefined()

      expect(await prisma.users.findUnique({ where: { username } })).toBeNull()
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it('menolak hapus owner dan user yang tidak ada', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, deleteUser } = await import('@/app/actions/users')
    const usernameOwner = usernameUnik('tc01_owner')

    authOwner()

    try {
      await createUser({ username: usernameOwner, password: 'Rah1!abc', role: RoleUser.owner })
      const baris = await prisma.users.findUnique({ where: { username: usernameOwner } })

      const hasil = await deleteUser(baris!.id)
      expect(hasil).toEqual({ error: 'Akun owner tidak dapat dihapus' })
      expect(await prisma.users.findUnique({ where: { username: usernameOwner } })).not.toBeNull()

      const tidakAda = await deleteUser(999999)
      expect(tidakAda).toEqual({ error: 'User tidak ditemukan' })
    } finally {
      await prisma.users.deleteMany({ where: { username: usernameOwner } })
    }
  })

  it('mengubah status user secara benar', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, toggleUserStatus } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_status')

    authOwner()

    try {
      await createUser({ username, password: 'Rah1!abc', role: RoleUser.cashier })
      const baris = await prisma.users.findUnique({ where: { username } })

      await toggleUserStatus(baris!.id, false)
      expect((await prisma.users.findUnique({ where: { username } }))?.status).toBe(false)

      await toggleUserStatus(baris!.id, true)
      expect((await prisma.users.findUnique({ where: { username } }))?.status).toBe(true)
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it('mengambil daftar user dan kasir aktif', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser, getUsers, getKasirUsers, toggleUserStatus } = await import('@/app/actions/users')

    const kasirAktif = usernameUnik('tc01_kasir_aktif')
    const kasirNonaktif = usernameUnik('tc01_kasir_nonaktif')
    const pelayan = usernameUnik('tc01_pelayan')

    authOwner()

    try {
      await createUser({ username: kasirAktif, password: 'Rah1!abc', role: RoleUser.cashier, status: true })
      await createUser({ username: kasirNonaktif, password: 'Rah1!abc', role: RoleUser.cashier, status: true })
      await toggleUserStatus((await prisma.users.findUnique({ where: { username: kasirNonaktif } }))!.id, false)
      await createUser({ username: pelayan, password: 'Rah1!abc', role: RoleUser.waiter, status: true })

      const semua = await getUsers()
      expect(semua.map((u) => u.username).sort()).toContain(kasirAktif)
      expect(semua.map((u) => u.username).sort()).toContain(kasirNonaktif)
      expect(semua.map((u) => u.username).sort()).toContain(pelayan)
      expect(semua.every((u) => u.password === undefined)).toBe(true)

      const kasir = await getKasirUsers()
      expect(kasir.map((u) => u.username).sort()).toContain(kasirAktif)
      expect(kasir.map((u) => u.username)).not.toContain(kasirNonaktif)
    } finally {
      await prisma.users.deleteMany({
        where: { username: { in: [kasirAktif, kasirNonaktif, pelayan] } },
      })
    }
  })
})
