import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { authMock, revalidatePathMock, randomUuidMock, createLogMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  randomUuidMock: vi.fn(),
  createLogMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  createMeja,
  deleteMeja,
  getMeja,
  getNextNomorMeja,
  kosongkanMeja,
  updateMeja,
} from '@/app/actions/meja'

function formDataMeja(nilai: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(nilai).forEach(([kunci, isi]) => data.set(kunci, isi))
  return data
}

function queueQueryRaw(...results: unknown[][]) {
  let index = 0
  prismaMock.$queryRaw.mockImplementation(async () => {
    const hasil = results[Math.min(index, results.length - 1)] ?? []
    index += 1
    return hasil
  })
}

function nilaiExecuteRaw(): unknown[] {
  return prismaMock.$executeRaw.mock.calls[0]?.slice(1) ?? []
}

const ROLE_NON_OWNER = ['cashier', 'waiter', 'kitchen'] as const

describe('TC-02 meja (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    randomUuidMock.mockReturnValue('abcd1234-0000-0000-0000-000000000000')
    createLogMock.mockResolvedValue(undefined)
    prismaMock.$queryRaw.mockResolvedValue([])
    prismaMock.$executeRaw.mockResolvedValue(1)

    vi.stubGlobal('crypto', { randomUUID: randomUuidMock })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('createMeja', () => {
    it('membuat meja kursi dengan nomor urut, token, dan status kosong', async () => {
      queueQueryRaw([{ nomor_meja: 'K009' }], [], [])

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

      expect(hasil).toEqual({ success: true })
      expect(randomUuidMock).toHaveBeenCalledTimes(1)
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      expect(nilaiExecuteRaw()).toEqual(['K010', 4, 'ABCD1234'])
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
    })

    it('memakai prefix L untuk meja lesehan', async () => {
      queueQueryRaw([{ nomor_meja: 'L002' }], [], [])

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '6', tipeMeja: 'lesehan' }))

      expect(hasil).toEqual({ success: true })
      expect(nilaiExecuteRaw()).toEqual(['L003', 6, 'ABCD1234'])
    })

    it.each(['1', '20'])('menerima kapasitas batas %s', async (kapasitas) => {
      const hasil = await createMeja(
        null,
        formDataMeja({ kapasitas, tipeMeja: 'kursi' })
      )

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    })

    it.each(['0', '21', 'abc', ''])('menolak kapasitas %s tanpa menulis', async (kapasitas) => {
      const hasil = await createMeja(
        null,
        formDataMeja({ kapasitas, tipeMeja: 'kursi' })
      )

      expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it.each(['', 'bar'])('menolak tipe meja "%s"', async (tipeMeja) => {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja }))

      expect(hasil).toEqual({ error: 'Tipe meja wajib dipilih' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('menolak tipe meja yang tidak dikirim', async () => {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4' }))

      expect(hasil).toEqual({ error: 'Tipe meja wajib dipilih' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('menolak nomor meja yang sudah ada', async () => {
      queueQueryRaw([], [{ id: 1 }])

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

      expect(hasil).toEqual({ error: 'Nomor meja sudah ada' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('mengulang generate token saat token sudah dipakai', async () => {
      queueQueryRaw([], [], [{ id: 1 }], [])
      randomUuidMock
        .mockReturnValueOnce('aaaaaaaa-0000-0000-0000-000000000000')
        .mockReturnValueOnce('bbbbbbbb-0000-0000-0000-000000000000')

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

      expect(hasil).toEqual({ success: true })
      expect(randomUuidMock).toHaveBeenCalledTimes(2)
      expect(nilaiExecuteRaw()).toEqual(['K001', 4, 'BBBBBBBB'])
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })
  })

  describe('getNextNomorMeja', () => {
    it('menghitung nomor berikutnya dari nomor terbesar yang ada', async () => {
      queueQueryRaw([{ nomor_meja: 'K002' }, { nomor_meja: 'K010' }])

      await expect(getNextNomorMeja('kursi')).resolves.toBe('K011')
    })

    it('memakai prefix lesehan', async () => {
      queueQueryRaw([{ nomor_meja: 'L007' }])

      await expect(getNextNomorMeja('lesehan')).resolves.toBe('L008')
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(getNextNomorMeja('kursi')).rejects.toThrow('Unauthorized')
    })
  })

  describe('getMeja', () => {
    it('mengembalikan daftar meja aktif', async () => {
      queueQueryRaw([{ id: 1, nomorMeja: 'K001', statusMeja: 'kosong' }])

      const hasil = await getMeja()

      expect(hasil).toEqual([{ id: 1, nomorMeja: 'K001', statusMeja: 'kosong' }])
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
    })

    it('menolak session kosong', async () => {
      authMock.mockResolvedValue(null)

      await expect(getMeja()).resolves.toEqual({ error: 'Unauthorized' })
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    })
  })

  describe('updateMeja', () => {
    it('memperbarui kapasitas meja', async () => {
      const hasil = await updateMeja(3, formDataMeja({ kapasitas: '8' }))

      expect(hasil).toEqual({ success: true })
      expect(nilaiExecuteRaw()).toEqual([8, 3])
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
    })

    it.each(['0', '21', 'abc'])('menolak kapasitas %s', async (kapasitas) => {
      const hasil = await updateMeja(3, formDataMeja({ kapasitas }))

      expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      const hasil = await updateMeja(3, formDataMeja({ kapasitas: '8' }))

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })
  })

  describe('deleteMeja', () => {
    it('melakukan soft delete meja yang tidak terpakai', async () => {
      queueQueryRaw([{ status_meja: 'kosong' }])

      const hasil = await deleteMeja(3)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
    })

    it('menolak hapus meja yang sedang terpakai', async () => {
      queueQueryRaw([{ status_meja: 'terpakai' }])

      const hasil = await deleteMeja(3)

      expect(hasil).toEqual({ error: 'Meja sedang digunakan, tidak dapat dihapus' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      const hasil = await deleteMeja(3)

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    })
  })

  describe('kosongkanMeja', () => {
    it('mengosongkan meja tanpa pesanan aktif dan mencatat log', async () => {
      queueQueryRaw([{ nomor_meja: 'K01', status_meja: 'terpakai' }], [])

      const hasil = await kosongkanMeja(1)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.pesanan.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      expect(createLogMock).toHaveBeenCalledWith(
        'UPDATE_ORDER_STATUS',
        expect.stringContaining('tidak ada pesanan aktif')
      )
    })

    it('membatalkan pesanan yang belum dibayar saat meja dikosongkan', async () => {
      queueQueryRaw(
        [{ nomor_meja: 'K02', status_meja: 'terpakai' }],
        [
          { id: 10, statusPembayaran: 'menunggu', totalHarga: 50000 },
          { id: 11, statusPembayaran: 'berhasil', totalHarga: 25000 },
        ]
      )

      const hasil = await kosongkanMeja(2)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.pesanan.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [10] } },
        data: expect.objectContaining({
          statusPesanan: 'dibatalkan',
          statusPembayaran: 'dibatalkan',
        }),
      })

      const logMessage = createLogMock.mock.calls[0][1] as string
      expect(logMessage).toContain('1 pesanan dibatalkan')
      expect(logMessage).toContain('menunggu: 1')
      expect(logMessage).toContain('berhasil: 1')
    })

    it('menolak meja yang tidak ditemukan', async () => {
      queueQueryRaw([])

      const hasil = await kosongkanMeja(99)

      expect(hasil).toEqual({ error: 'Meja tidak ditemukan' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('menolak meja yang sudah kosong', async () => {
      queueQueryRaw([{ nomor_meja: 'K01', status_meja: 'kosong' }])

      const hasil = await kosongkanMeja(1)

      expect(hasil).toEqual({ error: 'Meja sudah kosong' })
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it.each(['owner', 'cashier', 'waiter'] as const)('mengizinkan role %s', async (role) => {
      authMock.mockResolvedValue(sessionUntuk(role))
      queueQueryRaw([{ nomor_meja: 'K01', status_meja: 'terpakai' }], [])

      await expect(kosongkanMeja(1)).resolves.toEqual({ success: true })
    })

    it.each([null, 'kitchen'] as const)('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      const hasil = await kosongkanMeja(1)

      expect(hasil).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    })
  })
})
