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
import {
  createMeja,
  deleteMeja,
  getMeja,
  getNextNomorMeja,
  kosongkanMeja,
  updateMeja,
} from '@/app/actions/meja'

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

describe('getNextNomorMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getNextNomorMeja('kursi')).rejects.toThrow('Unauthorized')
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(getNextNomorMeja('kursi')).rejects.toThrow('Unauthorized')
  })

  it('memakai awalan L untuk lesehan', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ nomor_meja: 'L002' }, { nomor_meja: 'L007' }])

    const hasil = await getNextNomorMeja('lesehan')

    expect(hasil).toBe('L008')
  })

  it('memakai awalan K dan mengabaikan karakter non-angka', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ nomor_meja: 'K01' }, { nomor_meja: 'KX010' }])

    const hasil = await getNextNomorMeja('kursi')

    expect(hasil).toBe('K011')
  })

  it('memulai dari 001 saat belum ada meja', async () => {
    prismaMock.$queryRaw.mockResolvedValue([])

    expect(await getNextNomorMeja('kursi')).toBe('K001')
  })
})

describe('createMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it.each(['0', '21', 'abc'])('menolak kapasitas %s', async (kapasitas) => {
    const hasil = await createMeja(null, formData({ kapasitas, tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('menolak tipe meja tidak dikenal', async () => {
    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'bar' }))

    expect(hasil).toEqual({ error: 'Tipe meja wajib dipilih' })
  })

  it('menolak nomor meja yang sudah ada', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ nomor_meja: 'K001' }])
      .mockResolvedValueOnce([{ id: 1 }])

    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Nomor meja sudah ada' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

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

  it('mengulang token saat terjadi bentrok', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 9 }])
      .mockResolvedValueOnce([])
    randomUuidMock
      .mockReturnValueOnce('aaaaaaaa-0000-0000-0000-000000000000')
      .mockReturnValueOnce('bbbbbbbb-0000-0000-0000-000000000000')

    const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ success: true })
    expect(randomUuidMock).toHaveBeenCalledTimes(2)
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
  })
})

describe('updateMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await updateMeja(1, formData({ kapasitas: '4' }))

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak kapasitas tidak valid', async () => {
    const hasil = await updateMeja(1, formData({ kapasitas: '25' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('memperbarui kapasitas meja', async () => {
    const hasil = await updateMeja(1, formData({ kapasitas: '6' }))

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
  })
})

describe('deleteMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await deleteMeja(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak meja yang sedang terpakai', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ status_meja: 'terpakai' }])

    const hasil = await deleteMeja(1)

    expect(hasil).toEqual({ error: 'Meja sedang digunakan, tidak dapat dihapus' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('melakukan soft delete meja kosong', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ status_meja: 'kosong' }])

    const hasil = await deleteMeja(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
  })
})

describe('kosongkanMeja', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak role kitchen', async () => {
    authMock.mockResolvedValue(sessionUntuk('kitchen'))

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak meja yang tidak ditemukan', async () => {
    prismaMock.$queryRaw.mockResolvedValue([])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ error: 'Meja tidak ditemukan' })
  })

  it('menolak meja yang sudah kosong', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ nomor_meja: 'K01', status_meja: 'kosong' }])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ error: 'Meja sudah kosong' })
  })

  it('membatalkan pesanan belum bayar dan mencatat log', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ nomor_meja: 'K01', status_meja: 'terpakai' }])
      .mockResolvedValueOnce([
        { id: 1, statusPembayaran: 'menunggu', totalHarga: 50000 },
        { id: 2, statusPembayaran: 'berhasil', totalHarga: 20000 },
      ])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
      data: {
        statusPesanan: 'dibatalkan',
        statusPembayaran: 'dibatalkan',
        updatedAt: expect.any(Date),
      },
    })
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('1 pesanan dibatalkan')
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('Rp70.000')
    )
  })

  it('tidak membatalkan pesanan saat tidak ada yang menunggu', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ nomor_meja: 'K01', status_meja: 'terpakai' }])
      .mockResolvedValueOnce([
        { id: 2, statusPembayaran: 'berhasil', totalHarga: 20000 },
      ])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.pesanan.updateMany).not.toHaveBeenCalled()
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('berhasil: 1')
    )
  })

  it('mencatat tidak ada pesanan aktif', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ nomor_meja: 'K01', status_meja: 'terpakai' }])
      .mockResolvedValueOnce([])

    const hasil = await kosongkanMeja(1)

    expect(hasil).toEqual({ success: true })
    expect(createLogMock).toHaveBeenCalledWith(
      'UPDATE_ORDER_STATUS',
      expect.stringContaining('tidak ada pesanan aktif')
    )
  })
})
