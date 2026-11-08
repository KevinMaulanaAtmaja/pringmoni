import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { clearLogs, getLogCount, getLogs, getUniqueUsers } from '@/app/actions/logs'

const waktu = new Date('2026-11-05T10:15:30.000Z')

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.logs.findMany.mockResolvedValue([])
  prismaMock.logs.count.mockResolvedValue(0)
  prismaMock.logs.deleteMany.mockResolvedValue({ count: 0 })
})

describe('getLogs', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await getLogs()

    expect(hasil).toEqual({ error: 'Unauthorized', data: [] })
    expect(prismaMock.logs.findMany).not.toHaveBeenCalled()
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await getLogs()

    expect(hasil).toEqual({ error: 'Unauthorized', data: [] })
  })

  it('memetakan log dengan fallback System dan ip "-"', async () => {
    prismaMock.logs.findMany.mockResolvedValue([
      {
        id: 1,
        userId: null,
        aksi: 'LOGIN',
        keterangan: 'login sukses',
        ipAddress: null,
        createdAt: waktu,
        user: null,
      },
      {
        id: 2,
        userId: 2,
        aksi: 'CREATE_ORDER',
        keterangan: null,
        ipAddress: '10.0.0.1',
        createdAt: waktu,
        user: { username: 'kasir1' },
      },
    ])

    const hasil = await getLogs()

    expect(hasil).toEqual({
      data: [
        {
          id: 1,
          userId: null,
          userName: 'System',
          aksi: 'LOGIN',
          keterangan: 'login sukses',
          ipAddress: '-',
          createdAt: '2026-11-05 10:15:30',
        },
        {
          id: 2,
          userId: 2,
          userName: 'kasir1',
          aksi: 'CREATE_ORDER',
          keterangan: null,
          ipAddress: '10.0.0.1',
          createdAt: '2026-11-05 10:15:30',
        },
      ],
    })
  })

  it('memakai limit default 200', async () => {
    await getLogs()

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    )
  })

  it('memakai limit kustom', async () => {
    await getLogs({ limit: 25 })

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 25 })
    )
  })

  it('memfilter kategori dengan satu aksi', async () => {
    await getLogs({ aksi: 'Meja' })

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { aksi: 'EMPTY_TABLE' } })
    )
  })

  it('tidak memfilter aksi untuk kategori berisi banyak nilai', async () => {
    await getLogs({ aksi: 'Auth' })

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    )
  })

  it('mengabaikan filter "Semua"', async () => {
    await getLogs({ aksi: 'Semua' })

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    )
  })

  it('memfilter keterangan secara case-insensitive', async () => {
    await getLogs({ search: 'budi' })

    expect(prismaMock.logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { keterangan: { contains: 'budi', mode: 'insensitive' } },
      })
    )
  })
})

describe('getUniqueUsers', () => {
  it('mengembalikan array kosong untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    expect(await getUniqueUsers()).toEqual([])
    expect(prismaMock.logs.findMany).not.toHaveBeenCalled()
  })

  it('mengembalikan username unik', async () => {
    prismaMock.logs.findMany.mockResolvedValue([
      { user: { username: 'kasir1' } },
      { user: { username: 'owner' } },
      { user: { username: 'kasir1' } },
      { user: null },
    ])

    const hasil = await getUniqueUsers()

    expect(hasil).toEqual(['kasir1', 'owner'])
    expect(prismaMock.logs.findMany).toHaveBeenCalledWith({
      select: { user: { select: { username: true } } },
      distinct: ['userId'],
      where: { userId: { not: null } },
    })
  })
})

describe('getLogCount', () => {
  it('mengembalikan nol untuk non-owner', async () => {
    authMock.mockResolvedValue(null)

    expect(await getLogCount()).toBe(0)
    expect(prismaMock.logs.count).not.toHaveBeenCalled()
  })

  it('mengembalikan jumlah log', async () => {
    prismaMock.logs.count.mockResolvedValue(42)

    expect(await getLogCount()).toBe(42)
  })
})

describe('clearLogs', () => {
  it('menolak non-owner tanpa menghapus', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await clearLogs()

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.logs.deleteMany).not.toHaveBeenCalled()
  })

  it('menghapus seluruh log untuk owner', async () => {
    const hasil = await clearLogs()

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.logs.deleteMany).toHaveBeenCalled()
  })
})
