import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, headersMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  headersMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: headersMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { createLog, createLogNoSession } from '@/lib/log'

function headerBag(nilai: Record<string, string>) {
  return { get: (key: string) => nilai[key] ?? null }
}

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '2', username: 'owner' }))
  headersMock.mockResolvedValue(headerBag({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' }))
  prismaMock.logs.create.mockResolvedValue({ id: 1 })
})

describe('createLog', () => {
  it('menyimpan log dengan userId eksplisit dan ip dari x-forwarded-for', async () => {
    await createLog('LOGIN', 'Login sukses', 7)

    expect(authMock).not.toHaveBeenCalled()
    expect(prismaMock.logs.create).toHaveBeenCalledWith({
      data: { userId: 7, aksi: 'LOGIN', keterangan: 'Login sukses', ipAddress: '10.0.0.1' },
    })
  })

  it('memakai x-real-ip saat x-forwarded-for tidak ada', async () => {
    headersMock.mockResolvedValue(headerBag({ 'x-real-ip': '192.168.1.2' }))

    await createLog('LOGOUT', 'Keluar', 1)

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ipAddress: '192.168.1.2' }) })
    )
  })

  it('mengambil userId dari session bila tidak diberikan', async () => {
    await createLog('CREATE_ORDER', 'Pesanan baru')

    expect(authMock).toHaveBeenCalled()
    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 2 }) })
    )
  })

  it('memakai userId null bila session tidak ada', async () => {
    authMock.mockResolvedValue(null)

    await createLog('CREATE_ORDER', 'Pesanan customer')

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: null }) })
    )
  })

  it('memakai userId null bila id session kosong', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '' }))

    await createLog('CREATE_ORDER', 'Tanpa id')

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: null }) })
    )
  })

  it('memakai ip null saat headers gagal dibaca', async () => {
    headersMock.mockRejectedValue(new Error('no request scope'))

    await createLog('LOGIN', 'Login', 1)

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ipAddress: null }) })
    )
  })

  it('memakai ip null saat headers tidak memuat ip', async () => {
    headersMock.mockResolvedValue(headerBag({}))

    await createLog('LOGIN', 'Login', 1)

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ipAddress: null }) })
    )
  })

  it('menelan error saat penyimpanan log gagal', async () => {
    prismaMock.logs.create.mockRejectedValue(new Error('db down'))

    await expect(createLog('LOGIN', 'Login', 1)).resolves.toBeUndefined()
  })
})

describe('createLogNoSession', () => {
  it('menyimpan log dengan ip yang diberikan', async () => {
    await createLogNoSession('LOGIN', 'Login customer', 3, '172.16.0.1')

    expect(authMock).not.toHaveBeenCalled()
    expect(headersMock).not.toHaveBeenCalled()
    expect(prismaMock.logs.create).toHaveBeenCalledWith({
      data: { userId: 3, aksi: 'LOGIN', keterangan: 'Login customer', ipAddress: '172.16.0.1' },
    })
  })

  it('memakai ip null bila tidak diberikan', async () => {
    await createLogNoSession('LOGOUT', 'Keluar')

    expect(prismaMock.logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ipAddress: null }) })
    )
  })

  it('menelan error saat penyimpanan log gagal', async () => {
    prismaMock.logs.create.mockRejectedValue(new Error('db down'))

    await expect(createLogNoSession('LOGOUT', 'Keluar', 1)).resolves.toBeUndefined()
  })
})
