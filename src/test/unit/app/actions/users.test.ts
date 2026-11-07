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

const validPassword = 'Rahasia1!'

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  hashMock.mockResolvedValue('hashed-password')
  prismaMock.users.findMany.mockResolvedValue([])
  prismaMock.users.create.mockResolvedValue(userFixture())
  prismaMock.users.update.mockResolvedValue(userFixture())
  prismaMock.users.delete.mockResolvedValue(userFixture())
  prismaMock.users.findUnique.mockResolvedValue(userFixture({ role: 'cashier' }))
})

describe('getUsers', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getUsers()).rejects.toThrow('Unauthorized')
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(getUsers()).rejects.toThrow('Unauthorized')
  })

  it('mengambil user tanpa field password', async () => {
    const daftar = [userFixture({ id: 1 }), userFixture({ id: 2, username: 'kasir' })]
    prismaMock.users.findMany.mockResolvedValue(daftar)

    const hasil = await getUsers()

    expect(hasil).toEqual(daftar)
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
})

describe('createUser', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(
      createUser({ username: 'kasir', password: validPassword, role: 'cashier' })
    ).rejects.toThrow('Unauthorized')
  })

  it.each([
    ['pendek', 'Ra1!', 'Password minimal 8 karakter'],
    ['tanpa huruf besar', 'rahasia1!', 'Password harus mengandung huruf besar (A-Z)'],
    ['tanpa huruf kecil', 'RAHASIA1!', 'Password harus mengandung huruf kecil (a-z)'],
    ['tanpa angka', 'Rahasia!!', 'Password harus mengandung angka (0-9)'],
    ['tanpa simbol', 'Rahasia11', 'Password harus mengandung simbol (!@#$%^&*)'],
  ])('menolak password %s', async (_label, password, pesan) => {
    const hasil = await createUser({ username: 'kasir', password, role: 'cashier' })

    expect(hasil).toEqual({ error: pesan })
    expect(hashMock).not.toHaveBeenCalled()
    expect(prismaMock.users.create).not.toHaveBeenCalled()
  })

  it('membuat user dengan password ter-hash dan email null', async () => {
    const hasil = await createUser({
      username: 'kasir',
      password: validPassword,
      role: 'cashier',
    })

    expect(hasil).toEqual({ success: true })
    expect(hashMock).toHaveBeenCalledWith(validPassword, 10)
    expect(prismaMock.users.create).toHaveBeenCalledWith({
      data: {
        username: 'kasir',
        email: null,
        password: 'hashed-password',
        role: 'cashier',
        status: true,
      },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
  })

  it('menyimpan email bila diberikan', async () => {
    await createUser({
      username: 'kasir',
      email: 'kasir@pringmoni.test',
      password: validPassword,
      role: 'cashier',
    })

    expect(prismaMock.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'kasir@pringmoni.test' }),
      })
    )
  })
})

describe('updateUser', () => {
  const dataDasar = {
    id: 2,
    username: 'kasir',
    role: 'cashier' as const,
    status: true,
  }

  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(updateUser(dataDasar)).rejects.toThrow('Unauthorized')
  })

  it('menolak password baru yang tidak valid', async () => {
    const hasil = await updateUser({ ...dataDasar, password: 'pendek' })

    expect(hasil).toEqual({ error: 'Password minimal 8 karakter' })
    expect(prismaMock.users.update).not.toHaveBeenCalled()
  })

  it('memperbarui tanpa password dan menyimpan email null', async () => {
    const hasil = await updateUser(dataDasar)

    expect(hasil).toEqual({ success: true })
    expect(hashMock).not.toHaveBeenCalled()
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        username: 'kasir',
        email: null,
        role: 'cashier',
        status: true,
      },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
  })

  it('memperbarui dengan password baru yang ter-hash', async () => {
    const hasil = await updateUser({ ...dataDasar, password: validPassword })

    expect(hasil).toEqual({ success: true })
    expect(hashMock).toHaveBeenCalledWith(validPassword, 10)
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: expect.objectContaining({ password: 'hashed-password' }),
    })
  })
})

describe('deleteUser', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(deleteUser(2)).rejects.toThrow('Unauthorized')
  })

  it('mengembalikan error saat user tidak ditemukan', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null)

    const hasil = await deleteUser(2)

    expect(hasil).toEqual({ error: 'User tidak ditemukan' })
    expect(prismaMock.users.delete).not.toHaveBeenCalled()
  })

  it('melindungi akun owner dari penghapusan', async () => {
    prismaMock.users.findUnique.mockResolvedValue(userFixture({ role: 'owner' }))

    const hasil = await deleteUser(1)

    expect(hasil).toEqual({ error: 'Akun owner tidak dapat dihapus' })
    expect(prismaMock.users.delete).not.toHaveBeenCalled()
  })

  it('menghapus user non-owner', async () => {
    const hasil = await deleteUser(2)

    expect(hasil).toBeUndefined()
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { id: 2 } })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
  })
})

describe('toggleUserStatus', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(toggleUserStatus(2, false)).rejects.toThrow('Unauthorized')
  })

  it('mengubah status user', async () => {
    await toggleUserStatus(2, false)

    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: false },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
  })
})

describe('getKasirUsers', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getKasirUsers()).rejects.toThrow('Unauthorized')
  })

  it('hanya mengambil kasir aktif', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ id: 3, username: 'kasir1' }])

    const hasil = await getKasirUsers()

    expect(hasil).toEqual([{ id: 3, username: 'kasir1' }])
    expect(prismaMock.users.findMany).toHaveBeenCalledWith({
      where: { role: 'cashier', status: true },
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    })
  })

  it('mengembalikan array kosong saat query gagal', async () => {
    prismaMock.users.findMany.mockRejectedValue(new Error('db down'))

    const hasil = await getKasirUsers()

    expect(hasil).toEqual([])
  })
})
