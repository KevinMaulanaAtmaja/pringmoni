import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { authMock, createLogMock, revalidatePathMock, randomUuidMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  randomUuidMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { mejaFixture } from '@/test/helpers/fixtures'
import { createMeja, getMeja, kosongkanMeja } from '@/app/actions/meja'

function formData(nilai: Record<string, string>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(nilai)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  randomUuidMock.mockReturnValue('abcd1234-0000-0000-0000-000000000000')
  createLogMock.mockResolvedValue(undefined)
  prismaMock.$queryRaw.mockResolvedValue([])
  prismaMock.$executeRaw.mockResolvedValue(1)
  prismaMock.pesanan.updateMany.mockResolvedValue({ count: 0 })
  prismaMock.reservasi.findMany.mockResolvedValue([])
  prismaMock.reservasi.updateMany.mockResolvedValue({ count: 0 })

  vi.stubGlobal('crypto', { randomUUID: randomUuidMock })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getMeja()

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
  })

  it('mengembalikan daftar meja aktif', async () => {
    const daftar = [mejaFixture()]
    prismaMock.$queryRaw.mockResolvedValue(daftar)

    const hasil = await getMeja()

    expect(hasil).toEqual(daftar)
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
  })
})

describe('createMeja', () => {
  it('membuat meja dengan token unik', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    expect(randomUuidMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
  })

  it.each(['0', '21', 'abc'])('menolak kapasitas %s', async (kapasitas) => {
    const hasil = await createMeja(null, formData({ kapasitas, tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })
})

describe('kosongkanMeja', () => {
  it('tidak membatalkan pesanan saat tidak ada yang menunggu', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ nomor_meja: 'K01', status_meja: 'terpakai' }])
      .mockResolvedValueOnce([{ id: 2, statusPembayaran: 'berhasil', totalHarga: 20000 }])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.updateMany).not.toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith('UPDATE_ORDER_STATUS', expect.stringContaining('berhasil: 1'))
  })
})
