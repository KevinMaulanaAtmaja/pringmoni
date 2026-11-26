import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => {
  const state: { config: unknown } = { config: null }
  const nextAuthMock = vi.fn((config: unknown) => {
    state.config = config
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }
  })
  return {
    state,
    nextAuthMock,
    credentialsMock: vi.fn((options: unknown) => options),
    compareMock: vi.fn(),
    ambilVersiSesiMock: vi.fn(),
    catatAktivitasSesiMock: vi.fn(),
    catatVersiSesiMock: vi.fn(),
  }
})

vi.mock('next-auth', () => ({ default: h.nextAuthMock }))
vi.mock('next-auth/providers/credentials', () => ({ default: h.credentialsMock }))
vi.mock('bcryptjs', () => ({ default: { compare: h.compareMock } }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})
vi.mock('@/lib/sesi', () => ({
  ambilVersiSesi: h.ambilVersiSesiMock,
  catatAktivitasSesi: h.catatAktivitasSesiMock,
  catatVersiSesi: h.catatVersiSesiMock,
}))

import '@/lib/auth'
import { prismaMock } from '@/test/helpers/prisma-mock'
import { userFixture } from '@/test/helpers/fixtures'

const config = h.state.config as {
  providers: Array<{ authorize: (credentials: unknown) => Promise<unknown> }>
  callbacks: {
    jwt: (args: {
      token: Record<string, unknown>
      user?: Record<string, unknown>
    }) => Promise<Record<string, unknown>>
    session: (args: {
      session: Record<string, unknown>
      token: Record<string, unknown> | null
    }) => Promise<Record<string, unknown>>
  }
}
const authorize = config.providers[0].authorize
const jwt = config.callbacks.jwt
const session = config.callbacks.session

beforeEach(() => {
  vi.resetAllMocks()
  h.compareMock.mockResolvedValue(true)
  h.ambilVersiSesiMock.mockResolvedValue(null)
  h.catatAktivitasSesiMock.mockResolvedValue(undefined)
  h.catatVersiSesiMock.mockReturnValue(undefined)
})

describe('auth authorize', () => {
  it('menolak kredensial kosong', async () => {
    expect(await authorize({})).toBeNull()
    expect(await authorize(null)).toBeNull()
  })

  it('menolak user yang tidak ditemukan', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null)

    expect(await authorize({ username: 'tidak-ada', password: 'x' })).toBeNull()
  })

  it('menolak user nonaktif', async () => {
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ status: false }))

    expect(await authorize({ username: 'budi', password: 'x' })).toBeNull()
  })

  it('menolak password yang salah', async () => {
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username: 'budi' }))
    h.compareMock.mockResolvedValue(false)

    expect(await authorize({ username: 'budi', password: 'salah' })).toBeNull()
    expect(prismaMock.users.update).not.toHaveBeenCalled()
  })

  it('login sukses dengan device id dan menaikkan versi sesi', async () => {
    prismaMock.users.findFirst.mockResolvedValue(
      userFixture({ id: 42, username: 'budi', email: 'budi@pringmoni.test', role: 'cashier' })
    )
    prismaMock.users.update.mockResolvedValue({ sessionVersion: 5 })

    const hasil = await authorize({
      username: 'budi',
      password: 'rahasia',
      deviceId: 'device-1',
    })

    expect(hasil).toEqual({
      id: '42',
      name: 'budi',
      email: 'budi@pringmoni.test',
      role: 'cashier',
      sessionVersion: 5,
    })
    expect(prismaMock.users.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ username: 'budi' }, { email: 'budi' }],
        },
      })
    )
    expect(prismaMock.users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 42 },
        data: expect.objectContaining({
          sessionVersion: { increment: 1 },
          lastLoginDevice: 'device-1',
        }),
      })
    )
    expect(h.catatVersiSesiMock).toHaveBeenCalledWith(42, 5)
  })

  it('login sukses tanpa device id menyimpan null', async () => {
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ id: 7, username: 'budi' }))
    prismaMock.users.update.mockResolvedValue({ sessionVersion: 2 })

    await authorize({ username: 'budi', password: 'rahasia' })

    expect(prismaMock.users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastLoginDevice: null }),
      })
    )
  })

  it('menerjemahkan error kode P1001 menjadi DATABASE_ERROR', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    prismaMock.users.findFirst.mockRejectedValue({ code: 'P1001', message: 'down' })

    await expect(authorize({ username: 'a', password: 'b' })).rejects.toThrow('DATABASE_ERROR')
  })

  it('menerjemahkan pesan DatabaseNotReachable menjadi DATABASE_ERROR', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    prismaMock.users.findFirst.mockRejectedValue({ message: 'DatabaseNotReachable' })

    await expect(authorize({ username: 'a', password: 'b' })).rejects.toThrow('DATABASE_ERROR')
  })

  it('meneruskan error lain apa adanya', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMock.users.findFirst.mockRejectedValue(new Error('boom'))

    await expect(authorize({ username: 'a', password: 'b' })).rejects.toThrow('boom')
  })
})

describe('auth jwt callback', () => {
  it('menyimpan data user ke token saat login', async () => {
    const token: Record<string, unknown> = {}

    const hasil = await jwt({
      token,
      user: { id: '42', name: 'budi', role: 'cashier', sessionVersion: 5 },
    })

    expect(hasil).toMatchObject({
      role: 'cashier',
      id: '42',
      username: 'budi',
      sessionVersion: 5,
    })
  })

  it('menandai takenOver saat versi sesi berbeda', async () => {
    h.ambilVersiSesiMock.mockResolvedValue(6)
    const token: Record<string, unknown> = { id: '42', sessionVersion: 5 }

    await jwt({ token })

    expect(token.takenOver).toBe(true)
    expect(h.catatAktivitasSesiMock).not.toHaveBeenCalled()
  })

  it('mencatat aktivitas saat versi sesi masih sama', async () => {
    h.ambilVersiSesiMock.mockResolvedValue(5)
    const token: Record<string, unknown> = { id: '42', sessionVersion: 5 }

    await jwt({ token })

    expect(token.takenOver).toBeUndefined()
    expect(h.catatAktivitasSesiMock).toHaveBeenCalledWith(42)
  })

  it('mencatat aktivitas saat versi sesi di database null', async () => {
    h.ambilVersiSesiMock.mockResolvedValue(null)
    const token: Record<string, unknown> = { id: '42', sessionVersion: 5 }

    await jwt({ token })

    expect(h.catatAktivitasSesiMock).toHaveBeenCalledWith(42)
  })

  it('melewati pengecekan saat id token bukan angka', async () => {
    const token: Record<string, unknown> = { id: 'abc', sessionVersion: 1 }

    await jwt({ token })

    expect(h.ambilVersiSesiMock).not.toHaveBeenCalled()
  })

  it('memperlakukan sessionVersion non-angka sebagai nol', async () => {
    h.ambilVersiSesiMock.mockResolvedValue(0)
    const token: Record<string, unknown> = { id: '42', sessionVersion: '5' }

    await jwt({ token })

    expect(h.catatAktivitasSesiMock).toHaveBeenCalledWith(42)
  })
})

describe('auth session callback', () => {
  it('menyalin data token ke session', async () => {
    const hasil = await session({
      session: { user: {} },
      token: { role: 'cashier', id: '42', username: 'budi', takenOver: true },
    })

    expect(hasil.user).toMatchObject({
      role: 'cashier',
      id: '42',
      username: 'budi',
      takenOver: true,
    })
  })

  it('memakai nilai default saat token tidak lengkap', async () => {
    const hasil = await session({ session: { user: {} }, token: {} })

    expect(hasil.user).toMatchObject({ role: 'waiter', id: '', takenOver: false })
  })

  it('mengembalikan session apa adanya saat token null', async () => {
    const asli = { user: { role: 'owner', id: '1' } }

    await expect(session({ session: asli, token: null })).resolves.toBe(asli)
  })
})
