import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, createLogMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  revalidatePathMock: vi.fn(),
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
import { voucherFixture } from '@/test/helpers/fixtures'
import {
  createVoucher,
  deleteVoucher,
  getVoucherAktif,
  getVoucherList,
  setStatusVoucher,
  updateVoucher,
  validateVoucher,
} from '@/app/actions/voucher'

const inputValid = {
  kode: 'HEMAT10',
  namaVoucher: 'Hemat 10%',
  diskonPersen: 10,
  minimalBelanja: 50000,
}

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  createLogMock.mockResolvedValue(undefined)
  prismaMock.voucher.findMany.mockResolvedValue([])
  prismaMock.voucher.findFirst.mockResolvedValue(null)
  prismaMock.voucher.findUnique.mockResolvedValue(null)
  prismaMock.voucher.create.mockResolvedValue(voucherFixture())
  prismaMock.voucher.update.mockResolvedValue(voucherFixture())
})

describe('getVoucherList', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getVoucherList()).rejects.toThrow('Unauthorized')
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(getVoucherList()).rejects.toThrow('Unauthorized')
  })

  it('memetakan jumlah pemakaian dan minimal belanja numerik', async () => {
    prismaMock.voucher.findMany.mockResolvedValue([
      {
        ...voucherFixture(),
        minimalBelanja: '50000',
        _count: { pesanan: 3 },
      },
    ])

    const hasil = await getVoucherList()

    expect(hasil[0]).toMatchObject({ kode: 'HEMAT10', minimalBelanja: 50000, jumlahDipakai: 3 })
    expect(prismaMock.voucher.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: { _count: { select: { pesanan: true } } },
      orderBy: { createdAt: 'desc' },
    })
  })
})

describe('getVoucherAktif', () => {
  it('mengembalikan voucher aktif tanpa autentikasi', async () => {
    authMock.mockResolvedValue(null)
    prismaMock.voucher.findMany.mockResolvedValue([
      { id: 1, kode: 'HEMAT10', namaVoucher: 'Hemat', deskripsi: null, diskonPersen: 10, minimalBelanja: '50000' },
    ])

    const hasil = await getVoucherAktif()

    expect(hasil).toEqual([
      { id: 1, kode: 'HEMAT10', namaVoucher: 'Hemat', deskripsi: null, diskonPersen: 10, minimalBelanja: 50000 },
    ])
    expect(prismaMock.voucher.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, statusVoucher: 'aktif' },
      select: {
        id: true,
        kode: true,
        namaVoucher: true,
        deskripsi: true,
        diskonPersen: true,
        minimalBelanja: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })
})

describe('validateVoucher', () => {
  it('menolak kode kosong', async () => {
    const hasil = await validateVoucher('   ', 100000)

    expect(hasil).toEqual({ valid: false, error: 'Kode voucher tidak boleh kosong' })
    expect(prismaMock.voucher.findFirst).not.toHaveBeenCalled()
  })

  it('menormalkan kode ke huruf besar', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture())

    await validateVoucher(' hemat10 ', 100000)

    expect(prismaMock.voucher.findFirst).toHaveBeenCalledWith({
      where: { kode: 'HEMAT10', deletedAt: null },
    })
  })

  it('menolak kode yang tidak ditemukan', async () => {
    const hasil = await validateVoucher('NOPE', 100000)

    expect(hasil).toEqual({ valid: false, error: 'Kode voucher tidak ditemukan' })
  })

  it('menolak voucher tidak aktif', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(
      voucherFixture({ statusVoucher: 'nonaktif' })
    )

    const hasil = await validateVoucher('HEMAT10', 100000)

    expect(hasil).toEqual({ valid: false, error: 'Voucher sedang tidak aktif' })
  })

  it('menolak belanja di bawah minimal', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ minimalBelanja: 50000 }))

    const hasil = await validateVoucher('HEMAT10', 49999)

    expect(hasil).toEqual({
      valid: false,
      error: 'Minimal belanja voucher ini Rp 50.000',
    })
  })

  it('mengembalikan potongan diskon untuk voucher valid', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture())

    const hasil = await validateVoucher('hemat10', 100000)

    expect(hasil).toEqual({
      valid: true,
      kode: 'HEMAT10',
      namaVoucher: 'Hemat 10%',
      diskonPersen: 10,
      minimalBelanja: 50000,
      potongan: 10000,
    })
  })
})

describe('createVoucher', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(createVoucher(inputValid)).rejects.toThrow('Unauthorized')
  })

  it.each([
    [{ ...inputValid, kode: '  ' }, 'Kode voucher wajib diisi'],
    [{ ...inputValid, kode: 'A'.repeat(31) }, 'Kode voucher maksimal 30 karakter'],
    [{ ...inputValid, namaVoucher: '' }, 'Nama voucher wajib diisi'],
    [{ ...inputValid, namaVoucher: 'N'.repeat(101) }, 'Nama voucher maksimal 100 karakter'],
    [{ ...inputValid, diskonPersen: 0 }, 'Diskon harus berupa bilangan bulat antara 1 sampai 100'],
    [{ ...inputValid, diskonPersen: 101 }, 'Diskon harus berupa bilangan bulat antara 1 sampai 100'],
    [{ ...inputValid, diskonPersen: 1.5 }, 'Diskon harus berupa bilangan bulat antara 1 sampai 100'],
    [{ ...inputValid, minimalBelanja: -1 }, 'Minimal belanja tidak boleh negatif'],
    [{ ...inputValid, minimalBelanja: Number.POSITIVE_INFINITY }, 'Minimal belanja tidak boleh negatif'],
  ])('menolak input tidak valid (%#)', async (data, pesan) => {
    const hasil = await createVoucher(data)

    expect(hasil).toEqual({ error: pesan })
    expect(prismaMock.voucher.create).not.toHaveBeenCalled()
  })

  it('menolak kode yang masih aktif', async () => {
    prismaMock.voucher.findUnique.mockResolvedValue(voucherFixture())

    const hasil = await createVoucher(inputValid)

    expect(hasil).toEqual({ error: 'Kode voucher sudah digunakan' })
    expect(prismaMock.voucher.create).not.toHaveBeenCalled()
    expect(prismaMock.voucher.update).not.toHaveBeenCalled()
  })

  it('membuat voucher baru dengan kode ternormalisasi', async () => {
    const hasil = await createVoucher({
      kode: ' hemat10 ',
      namaVoucher: ' Hemat 10% ',
      deskripsi: '  promo  ',
      diskonPersen: 10,
      minimalBelanja: 50000,
    })

    expect(hasil).toEqual({ success: true, id: 1 })
    expect(prismaMock.voucher.create).toHaveBeenCalledWith({
      data: {
        kode: 'HEMAT10',
        namaVoucher: 'Hemat 10%',
        deskripsi: 'promo',
        diskonPersen: 10,
        minimalBelanja: 50000,
        statusVoucher: 'aktif',
      },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'MANAGE_VOUCHER',
      'Membuat voucher HEMAT10 (10%, min Rp 50.000)'
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
  })

  it('memulihkan voucher yang pernah dihapus', async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      ...voucherFixture({ id: 7 }),
      deletedAt: new Date('2026-01-01'),
    })
    prismaMock.voucher.update.mockResolvedValue(voucherFixture({ id: 7 }))

    const hasil = await createVoucher(inputValid)

    expect(hasil).toEqual({ success: true, id: 7 })
    expect(prismaMock.voucher.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({ deletedAt: null, kode: 'HEMAT10' }),
    })
    expect(prismaMock.voucher.create).not.toHaveBeenCalled()
  })
})

describe('updateVoucher', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(updateVoucher(1, inputValid)).rejects.toThrow('Unauthorized')
  })

  it('menolak input tidak valid', async () => {
    const hasil = await updateVoucher(1, { ...inputValid, diskonPersen: 200 })

    expect(hasil).toEqual({ error: 'Diskon harus berupa bilangan bulat antara 1 sampai 100' })
    expect(prismaMock.voucher.update).not.toHaveBeenCalled()
  })

  it('menolak kode yang dipakai voucher lain', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ id: 2 }))

    const hasil = await updateVoucher(1, inputValid)

    expect(hasil).toEqual({ error: 'Kode voucher sudah digunakan' })
    expect(prismaMock.voucher.update).not.toHaveBeenCalled()
  })

  it('memperbarui voucher tanpa mengubah status bila tidak dikirim', async () => {
    const hasil = await updateVoucher(1, inputValid)

    expect(hasil).toEqual({ success: true, id: 1 })
    expect(prismaMock.voucher.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        kode: 'HEMAT10',
        namaVoucher: 'Hemat 10%',
        deskripsi: null,
        diskonPersen: 10,
        minimalBelanja: 50000,
      },
    })
    expect(createLogMock).toHaveBeenCalledWith('MANAGE_VOUCHER', 'Mengubah voucher HEMAT10')
  })

  it('menyertakan status saat dikirim', async () => {
    await updateVoucher(1, { ...inputValid, statusVoucher: 'nonaktif' })

    expect(prismaMock.voucher.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ statusVoucher: 'nonaktif' }),
    })
  })
})

describe('setStatusVoucher', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(setStatusVoucher(1, 'nonaktif')).rejects.toThrow('Unauthorized')
  })

  it('mengubah status dan mencatat log', async () => {
    const hasil = await setStatusVoucher(1, 'nonaktif')

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.voucher.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statusVoucher: 'nonaktif' },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'MANAGE_VOUCHER',
      'Mengubah status voucher HEMAT10 menjadi nonaktif'
    )
  })
})

describe('deleteVoucher', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(deleteVoucher(1)).rejects.toThrow('Unauthorized')
  })

  it('melakukan soft delete dan mencatat log', async () => {
    const hasil = await deleteVoucher(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.voucher.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    })
    expect(createLogMock).toHaveBeenCalledWith('MANAGE_VOUCHER', 'Menghapus voucher HEMAT10')
  })
})
