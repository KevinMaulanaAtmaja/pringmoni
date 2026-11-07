import { describe, it, expect, vi, beforeEach } from 'vitest'

const { signInMock, createLogMock, cookieGetMock, bcryptCompareMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  createLogMock: vi.fn(),
  cookieGetMock: vi.fn(),
  bcryptCompareMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  signIn: signInMock,
}))

vi.mock('@/lib/log', () => ({
  createLog: createLogMock,
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: cookieGetMock }),
}))

vi.mock('bcryptjs', () => ({
  default: { compare: bcryptCompareMock },
}))

vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { checkRateLimit, recordFailedAttempt } from '@/lib/rate-limiter'
import { userFixture } from '@/test/helpers/fixtures'
import { loginAction, type LoginState } from '@/app/actions/login'

const STATE_AWAL: LoginState = {
  error: '',
  success: false,
  perluKonfirmasi: false,
  info: '',
}

function uniqueUsername() {
  return `s1-${crypto.randomUUID()}`
}

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('loginAction', () => {
  it('menolak lebih dulu saat rate limit aktif tanpa menyentuh database', async () => {
    const username = uniqueUsername()
    for (let i = 0; i < 5; i++) recordFailedAttempt(username)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toContain('Terlalu banyak percobaan login')
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
    expect(signInMock).not.toHaveBeenCalled()
  })

  it('menolak kredensial kosong tanpa query database dan mencatat kegagalan', async () => {
    const username = uniqueUsername()

    const hasil = await loginAction(STATE_AWAL, form({ username, password: '' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })

  it('menolak user yang tidak ditemukan', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(null)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })

  it('menolak user nonaktif tanpa membandingkan password', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username, status: false }))

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(bcryptCompareMock).not.toHaveBeenCalled()
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })

  it('menolak password yang salah', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(false)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'salah' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(signInMock).not.toHaveBeenCalled()
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })

  it('menampilkan error database saat koneksi gagal (P1001) tanpa mencatat kegagalan', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockRejectedValue(
      Object.assign(new Error('DatabaseNotReachable'), { code: 'P1001' })
    )

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Database tidak dapat dihubungi. Silakan coba lagi.')
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('mengembalikan error umum saat query database melempar error tak terduga', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockRejectedValue(new Error('boom'))

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Terjadi kesalahan saat menghubungi database. Silakan coba lagi.')
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('login valid membuat sesi, mencatat log, dan mereset rate limit', async () => {
    const username = uniqueUsername()
    recordFailedAttempt(username)
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue(undefined)
    signInMock.mockResolvedValue(undefined)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil).toEqual({ error: '', success: true, perluKonfirmasi: false, info: '' })
    expect(signInMock).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({
        username,
        password: 'rahasia123',
        deviceId: '',
        redirect: false,
      })
    )
    expect(createLogMock).toHaveBeenCalledWith('LOGIN', `User ${username} login ke sistem`)
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('meminta konfirmasi saat sesi lain masih aktif di perangkat berbeda', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(
      userFixture({
        username,
        lastSeenAt: new Date(Date.now() - 60_000),
        lastLoginDevice: 'device-a',
      })
    )
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue({ value: 'device-b' })

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.perluKonfirmasi).toBe(true)
    expect(hasil.info).toContain('Sesi akun ini masih aktif di perangkat lain')
    expect(signInMock).not.toHaveBeenCalled()
    expect(createLogMock).not.toHaveBeenCalled()
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('melewati konfirmasi saat pengguna memilih ambil alih sesi', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(
      userFixture({
        username,
        lastSeenAt: new Date(Date.now() - 60_000),
        lastLoginDevice: 'device-a',
      })
    )
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue({ value: 'device-b' })
    signInMock.mockResolvedValue(undefined)

    const hasil = await loginAction(
      STATE_AWAL,
      form({ username, password: 'rahasia123', takeover: '1' })
    )

    expect(hasil.success).toBe(true)
    expect(hasil.perluKonfirmasi).toBe(false)
    expect(signInMock).toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith(
      'LOGIN',
      `User ${username} login ke sistem (menggantikan sesi di perangkat lain)`
    )
  })

  it('tidak meminta konfirmasi saat login dari perangkat yang sama', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(
      userFixture({
        username,
        lastSeenAt: new Date(Date.now() - 60_000),
        lastLoginDevice: 'device-a',
      })
    )
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue({ value: 'device-a' })
    signInMock.mockResolvedValue(undefined)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.success).toBe(true)
    expect(hasil.perluKonfirmasi).toBe(false)
    expect(createLogMock).toHaveBeenCalledWith('LOGIN', `User ${username} login ke sistem`)
  })

  it('mencatat penggantian sesi saat perangkat login terakhir berbeda walau sesi sudah tidak aktif', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(
      userFixture({
        username,
        lastSeenAt: null,
        lastLoginDevice: 'device-a',
      })
    )
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue({ value: 'device-b' })
    signInMock.mockResolvedValue(undefined)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.success).toBe(true)
    expect(createLogMock).toHaveBeenCalledWith(
      'LOGIN',
      `User ${username} login ke sistem (menggantikan sesi di perangkat lain)`
    )
  })

  it('menolak login saat signIn mengembalikan URL error', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue(undefined)
    signInMock.mockResolvedValue(
      'http://localhost:3000/api/auth/error?error=CredentialsSignin'
    )

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(hasil.success).toBe(false)
    expect(createLogMock).not.toHaveBeenCalled()
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })

  it('menampilkan error database saat signIn melempar DATABASE_ERROR', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue(undefined)
    signInMock.mockRejectedValue(new Error('DATABASE_ERROR'))

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Database tidak dapat dihubungi. Silakan coba lagi.')
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('mengambil pesan DATABASE_ERROR dari cause bila message kosong', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue(undefined)

    const error = Object.assign(new Error(''), {
      cause: new Error('DATABASE_ERROR'),
    })
    signInMock.mockRejectedValue(error)

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Database tidak dapat dihubungi. Silakan coba lagi.')
    expect(checkRateLimit(username).remainingAttempts).toBe(5)
  })

  it('mencatat kegagalan saat signIn melempar error umum', async () => {
    const username = uniqueUsername()
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username }))
    bcryptCompareMock.mockResolvedValue(true)
    cookieGetMock.mockReturnValue(undefined)
    signInMock.mockRejectedValue(new Error('network error'))

    const hasil = await loginAction(STATE_AWAL, form({ username, password: 'rahasia123' }))

    expect(hasil.error).toBe('Username/Email atau password salah')
    expect(checkRateLimit(username).remainingAttempts).toBe(4)
  })
})
