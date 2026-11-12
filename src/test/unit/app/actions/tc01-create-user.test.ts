import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, hashMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  hashMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('bcryptjs', () => ({ default: { hash: hashMock } }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { userFixture } from '@/test/helpers/fixtures'
import {
  createUser,
  deleteUser,
  getKasirUsers,
  getUsers,
  toggleUserStatus,
  updateUser,
} from '@/app/actions/users'

const PASSWORD_VALID = 'Rah1!abc'
const ROLE_NON_OWNER = ['cashier', 'waiter', 'kitchen'] as const

const PASSWORD_TIDAK_VALID = [
  { password: 'Rah1!ab', error: 'Password minimal 8 karakter' },
  { password: 'Rahasia1', error: 'Password harus mengandung simbol (!@#$%^&*)' },
  { password: 'RAHASIA1!', error: 'Password harus mengandung huruf kecil (a-z)' },
  { password: 'rahasia1!', error: 'Password harus mengandung huruf besar (A-Z)' },
  { password: 'Rahasia!!', error: 'Password harus mengandung angka (0-9)' },
]

describe('TC-01 users (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    hashMock.mockResolvedValue('hashed-password')
    prismaMock.users.create.mockResolvedValue(userFixture())
    prismaMock.users.update.mockResolvedValue(userFixture())
  })

  describe('createUser', () => {
    it('menyimpan user baru dengan password ter-hash dan email null', async () => {
      const hasil = await createUser({
        username: 'kasir_demo',
        password: PASSWORD_VALID,
        role: 'cashier',
      })

      expect(hasil).toEqual({ success: true })
      expect(hashMock).toHaveBeenCalledWith(PASSWORD_VALID, 10)
      expect(prismaMock.users.create).toHaveBeenCalledWith({
        data: {
          username: 'kasir_demo',
          email: null,
          password: 'hashed-password',
          role: 'cashier',
          status: true,
        },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
    })

    it('menyimpan email saat diisi (bukan null)', async () => {
      await createUser({
        username: 'kasir_email',
        email: 'kasir@pringmoni.test',
        password: PASSWORD_VALID,
        role: 'cashier',
      })

      expect(prismaMock.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'kasir@pringmoni.test' }),
      })
    })

    it('meneruskan role target apa pun yang dipilih owner', async () => {
      await createUser({ username: 'u1', password: PASSWORD_VALID, role: 'owner' })
      await createUser({ username: 'u2', password: PASSWORD_VALID, role: 'kitchen' })
      await createUser({ username: 'u3', password: PASSWORD_VALID, role: 'waiter' })

      expect(prismaMock.users.create.mock.calls.map(([arg]) => arg.data.role)).toEqual([
        'owner',
        'kitchen',
        'waiter',
      ])
    })

    it.each(PASSWORD_TIDAK_VALID)(
      'menolak password "$password" dengan pesan "$error"',
      async ({ password, error }) => {
        const hasil = await createUser({ username: 'kasir_demo', password, role: 'cashier' })

        expect(hasil).toEqual({ error })
        expect(hashMock).not.toHaveBeenCalled()
        expect(prismaMock.users.create).not.toHaveBeenCalled()
      }
    )

    it('menerima tepat 8 karakter selama semua aturan terpenuhi', async () => {
      const hasil = await createUser({
        username: 'kasir_demo',
        password: 'Rah1!abc',
        role: 'cashier',
      })

      expect(hasil).toEqual({ success: true })
      expect(hashMock).toHaveBeenCalledWith('Rah1!abc', 10)
    })

    it('memeriksa aturan secara berurutan: panjang -> besar -> kecil -> angka -> simbol', async () => {
      expect(
        await createUser({ username: 'u', password: 'abcdefgh', role: 'cashier' })
      ).toEqual({ error: 'Password harus mengandung huruf besar (A-Z)' })

      expect(
        await createUser({ username: 'u', password: 'ABCDEFGH', role: 'cashier' })
      ).toEqual({ error: 'Password harus mengandung huruf kecil (a-z)' })

      expect(
        await createUser({ username: 'u', password: 'Abcdefgh', role: 'cashier' })
      ).toEqual({ error: 'Password harus mengandung angka (0-9)' })

      expect(
        await createUser({ username: 'u', password: 'Abcdefg1', role: 'cashier' })
      ).toEqual({ error: 'Password harus mengandung simbol (!@#$%^&*)' })
    })

    it('membiarkan error unique constraint username naik ke pemanggil', async () => {
      prismaMock.users.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed on the fields: (`username`)'), {
          code: 'P2002',
        })
      )

      await expect(
        createUser({ username: 'duplikat', password: PASSWORD_VALID, role: 'cashier' })
      ).rejects.toThrow('Unique constraint failed')
      expect(revalidatePathMock).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(
        createUser({ username: 'kasir_demo', password: PASSWORD_VALID, role: 'cashier' })
      ).rejects.toThrow('Unauthorized')

      expect(prismaMock.users.create).not.toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    it('memperbarui profil tanpa menyentuh password bila password tidak diisi', async () => {
      const hasil = await updateUser({
        id: 2,
        username: 'kasir_baru',
        email: 'kasir@pringmoni.test',
        role: 'waiter',
        status: false,
      })

      expect(hasil).toEqual({ success: true })
      expect(hashMock).not.toHaveBeenCalled()
      expect(prismaMock.users.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          username: 'kasir_baru',
          email: 'kasir@pringmoni.test',
          role: 'waiter',
          status: false,
        },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
    })

    it('mengosongkan email menjadi null bila string kosong', async () => {
      await updateUser({ id: 2, username: 'kasir', email: '', role: 'cashier', status: true })

      expect(prismaMock.users.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ email: null }),
      })
    })

    it('meng-hash password baru sebelum disimpan', async () => {
      await updateUser({
        id: 2,
        username: 'kasir',
        role: 'cashier',
        status: true,
        password: 'Baru1!xy',
      })

      expect(hashMock).toHaveBeenCalledWith('Baru1!xy', 10)
      expect(prismaMock.users.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ password: 'hashed-password' }),
      })
    })

    it.each(PASSWORD_TIDAK_VALID)(
      'menolak password baru "$password" dengan pesan "$error"',
      async ({ password, error }) => {
        const hasil = await updateUser({
          id: 2,
          username: 'kasir',
          role: 'cashier',
          status: true,
          password,
        })

        expect(hasil).toEqual({ error })
        expect(hashMock).not.toHaveBeenCalled()
        expect(prismaMock.users.update).not.toHaveBeenCalled()
      }
    )

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(
        updateUser({ id: 2, username: 'kasir', role: 'cashier', status: true })
      ).rejects.toThrow('Unauthorized')

      expect(prismaMock.users.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteUser', () => {
    it('menolak menghapus akun owner', async () => {
      prismaMock.users.findUnique.mockResolvedValue({ role: 'owner' })

      const hasil = await deleteUser(1)

      expect(hasil).toEqual({ error: 'Akun owner tidak dapat dihapus' })
      expect(prismaMock.users.delete).not.toHaveBeenCalled()
    })

    it('menolak menghapus user yang tidak ada', async () => {
      prismaMock.users.findUnique.mockResolvedValue(null)

      const hasil = await deleteUser(99)

      expect(hasil).toEqual({ error: 'User tidak ditemukan' })
      expect(prismaMock.users.delete).not.toHaveBeenCalled()
    })

    it('menghapus user non-owner dan me-refresh cache', async () => {
      prismaMock.users.findUnique.mockResolvedValue({ role: 'cashier' })

      const hasil = await deleteUser(2)

      expect(hasil).toBeUndefined()
      expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { id: 2 } })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(deleteUser(2)).rejects.toThrow('Unauthorized')
      expect(prismaMock.users.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('toggleUserStatus', () => {
    it('mengubah status user dan me-refresh cache', async () => {
      const hasil = await toggleUserStatus(2, false)

      expect(hasil).toBeUndefined()
      expect(prismaMock.users.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: false },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(toggleUserStatus(2, false)).rejects.toThrow('Unauthorized')
      expect(prismaMock.users.update).not.toHaveBeenCalled()
    })
  })

  describe('getUsers', () => {
    it('mengambil semua user tanpa kolom password', async () => {
      prismaMock.users.findMany.mockResolvedValue([userFixture({ id: 2, role: 'cashier' })])

      const hasil = await getUsers()

      expect(hasil).toHaveLength(1)
      expect(prismaMock.users.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          password: false,
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(getUsers()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getKasirUsers', () => {
    it('hanya mengambil kasir aktif dengan urutan username', async () => {
      prismaMock.users.findMany.mockResolvedValue([{ id: 2, username: 'kasir' }])

      const hasil = await getKasirUsers()

      expect(hasil).toEqual([{ id: 2, username: 'kasir' }])
      expect(prismaMock.users.findMany).toHaveBeenCalledWith({
        where: { role: 'cashier', status: true },
        select: { id: true, username: true },
        orderBy: { username: 'asc' },
      })
    })

    it('mengembalikan array kosong saat query gagal', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      prismaMock.users.findMany.mockRejectedValue(new Error('db down'))

      await expect(getKasirUsers()).resolves.toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(getKasirUsers()).rejects.toThrow('Unauthorized')
    })
  })
})
