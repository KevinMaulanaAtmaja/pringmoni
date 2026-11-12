import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, revalidatePathMock, createLogMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
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

const INPUT_VOUCHER = {
  kode: 'hemat10',
  namaVoucher: 'Hemat 10%',
  diskonPersen: 10,
  minimalBelanja: 20000,
}

const ROLE_NON_OWNER = ['cashier', 'waiter', 'kitchen'] as const

const INPUT_TIDAK_VALID = [
  { input: { kode: '' }, error: 'Kode voucher wajib diisi' },
  { input: { kode: 'A'.repeat(31) }, error: 'Kode voucher maksimal 30 karakter' },
  { input: { namaVoucher: '   ' }, error: 'Nama voucher wajib diisi' },
  { input: { namaVoucher: 'N'.repeat(101) }, error: 'Nama voucher maksimal 100 karakter' },
  {
    input: { diskonPersen: 0 },
    error: 'Diskon harus berupa bilangan bulat antara 1 sampai 100',
  },
  {
    input: { diskonPersen: 101 },
    error: 'Diskon harus berupa bilangan bulat antara 1 sampai 100',
  },
  {
    input: { diskonPersen: 10.5 },
    error: 'Diskon harus berupa bilangan bulat antara 1 sampai 100',
  },
  { input: { minimalBelanja: -1 }, error: 'Minimal belanja tidak boleh negatif' },
]

describe('TC-04 voucher (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    createLogMock.mockResolvedValue(undefined)
    prismaMock.voucher.findUnique.mockResolvedValue(null)
    prismaMock.voucher.findFirst.mockResolvedValue(null)
    prismaMock.voucher.create.mockResolvedValue(voucherFixture({ id: 7 }))
    prismaMock.voucher.update.mockResolvedValue(voucherFixture({ id: 7 }))
  })

  describe('createVoucher', () => {
    it('menormalisasi kode, memangkas teks, dan menyimpan default aktif', async () => {
      const hasil = await createVoucher({
        kode: '  hemat10  ',
        namaVoucher: '  Hemat 10%  ',
        deskripsi: '  Diskon akhir tahun  ',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })

      expect(hasil).toEqual({ success: true, id: 7 })
      expect(prismaMock.voucher.findUnique).toHaveBeenCalledWith({ where: { kode: 'HEMAT10' } })
      expect(prismaMock.voucher.create).toHaveBeenCalledWith({
        data: {
          kode: 'HEMAT10',
          namaVoucher: 'Hemat 10%',
          deskripsi: 'Diskon akhir tahun',
          diskonPersen: 10,
          minimalBelanja: 20000,
          statusVoucher: 'aktif',
        },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'MANAGE_VOUCHER',
        expect.stringContaining('Membuat voucher HEMAT10')
      )
      expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    })

    it('menyimpan deskripsi kosong sebagai null dan status kustom', async () => {
      await createVoucher({ ...INPUT_VOUCHER, deskripsi: '   ', statusVoucher: 'nonaktif' })

      expect(prismaMock.voucher.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ deskripsi: null, statusVoucher: 'nonaktif' }),
      })
    })

    it.each(INPUT_TIDAK_VALID)('menolak input $input dengan pesan "$error"', async ({ input, error }) => {
      const hasil = await createVoucher({ ...INPUT_VOUCHER, ...input })

      expect(hasil).toEqual({ error })
      expect(prismaMock.voucher.findUnique).not.toHaveBeenCalled()
      expect(prismaMock.voucher.create).not.toHaveBeenCalled()
    })

    it('menolak kode voucher aktif yang sudah dipakai', async () => {
      prismaMock.voucher.findUnique.mockResolvedValue(
        voucherFixture({ kode: 'HEMAT10', deletedAt: null })
      )

      const hasil = await createVoucher(INPUT_VOUCHER)

      expect(hasil).toEqual({ error: 'Kode voucher sudah digunakan' })
      expect(prismaMock.voucher.create).not.toHaveBeenCalled()
      expect(prismaMock.voucher.update).not.toHaveBeenCalled()
    })

    it('mengembalikan voucher yang sudah di-soft-delete', async () => {
      prismaMock.voucher.findUnique.mockResolvedValue(
        voucherFixture({ id: 5, kode: 'HEMAT10', deletedAt: new Date() })
      )

      const hasil = await createVoucher(INPUT_VOUCHER)

      expect(hasil).toEqual({ success: true, id: 7 })
      expect(prismaMock.voucher.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: expect.objectContaining({ kode: 'HEMAT10', deletedAt: null }),
      })
      expect(prismaMock.voucher.create).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(createVoucher(INPUT_VOUCHER)).rejects.toThrow('Unauthorized')
      expect(prismaMock.voucher.create).not.toHaveBeenCalled()
    })
  })

  describe('updateVoucher', () => {
    it('memperbarui voucher dan mencatat log', async () => {
      const hasil = await updateVoucher(7, INPUT_VOUCHER)

      expect(hasil).toEqual({ success: true, id: 7 })
      expect(prismaMock.voucher.findFirst).toHaveBeenCalledWith({
        where: { kode: 'HEMAT10', id: { not: 7 }, deletedAt: null },
      })
      expect(prismaMock.voucher.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: expect.objectContaining({ kode: 'HEMAT10', namaVoucher: 'Hemat 10%' }),
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'MANAGE_VOUCHER',
        expect.stringContaining('Mengubah voucher')
      )
    })

    it('menolak kode yang bentrok dengan voucher aktif lain', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ id: 8 }))

      const hasil = await updateVoucher(7, INPUT_VOUCHER)

      expect(hasil).toEqual({ error: 'Kode voucher sudah digunakan' })
      expect(prismaMock.voucher.update).not.toHaveBeenCalled()
    })

    it('tidak mengirim statusVoucher bila tidak diisi', async () => {
      await updateVoucher(7, INPUT_VOUCHER)

      const data = prismaMock.voucher.update.mock.calls[0][0].data
      expect(data).not.toHaveProperty('statusVoucher')
    })

    it('mengirim statusVoucher bila diisi', async () => {
      await updateVoucher(7, { ...INPUT_VOUCHER, statusVoucher: 'nonaktif' })

      expect(prismaMock.voucher.update.mock.calls[0][0].data).toMatchObject({
        statusVoucher: 'nonaktif',
      })
    })

    it('menolak input tidak valid sebelum query bentrok', async () => {
      const hasil = await updateVoucher(7, { ...INPUT_VOUCHER, diskonPersen: 0 })

      expect(hasil).toEqual({ error: 'Diskon harus berupa bilangan bulat antara 1 sampai 100' })
      expect(prismaMock.voucher.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.voucher.update).not.toHaveBeenCalled()
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(updateVoucher(7, INPUT_VOUCHER)).rejects.toThrow('Unauthorized')
    })
  })

  describe('setStatusVoucher / deleteVoucher', () => {
    it('mengubah status voucher', async () => {
      const hasil = await setStatusVoucher(7, 'nonaktif')

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.voucher.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { statusVoucher: 'nonaktif' },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'MANAGE_VOUCHER',
        expect.stringContaining('menjadi nonaktif')
      )
    })

    it('melakukan soft delete voucher', async () => {
      const hasil = await deleteVoucher(7)

      expect(hasil).toEqual({ success: true })
      expect(prismaMock.voucher.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { deletedAt: expect.any(Date) },
      })
      expect(createLogMock).toHaveBeenCalledWith(
        'MANAGE_VOUCHER',
        expect.stringContaining('Menghapus voucher')
      )
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(setStatusVoucher(7, 'nonaktif')).rejects.toThrow('Unauthorized')
      await expect(deleteVoucher(7)).rejects.toThrow('Unauthorized')
      expect(prismaMock.voucher.update).not.toHaveBeenCalled()
    })
  })

  describe('validateVoucher', () => {
    it.each(['', '   '])('menolak kode kosong "%s" tanpa query', async (kode) => {
      await expect(validateVoucher(kode, 50000)).resolves.toEqual({
        valid: false,
        error: 'Kode voucher tidak boleh kosong',
      })
      expect(prismaMock.voucher.findFirst).not.toHaveBeenCalled()
    })

    it('mencari kode yang sudah dinormalisasi dan belum dihapus', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture())

      await validateVoucher('  hemat10  ', 50000)

      expect(prismaMock.voucher.findFirst).toHaveBeenCalledWith({
        where: { kode: 'HEMAT10', deletedAt: null },
      })
    })

    it('menolak kode yang tidak ditemukan', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(null)

      await expect(validateVoucher('TIDAKADA', 50000)).resolves.toEqual({
        valid: false,
        error: 'Kode voucher tidak ditemukan',
      })
    })

    it('menolak voucher yang tidak aktif', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(
        voucherFixture({ statusVoucher: 'nonaktif' })
      )

      await expect(validateVoucher('HEMAT10', 50000)).resolves.toEqual({
        valid: false,
        error: 'Voucher sedang tidak aktif',
      })
    })

    it('menolak belanja di bawah minimal dengan format rupiah', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ minimalBelanja: 20000 }))

      await expect(validateVoucher('HEMAT10', 15000)).resolves.toEqual({
        valid: false,
        error: 'Minimal belanja voucher ini Rp 20.000',
      })
    })

    it('menerima belanja tepat di batas minimal', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(
        voucherFixture({ minimalBelanja: 20000, diskonPersen: 10 })
      )

      const hasil = await validateVoucher('HEMAT10', 20000)

      expect(hasil).toEqual({
        valid: true,
        kode: 'HEMAT10',
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        minimalBelanja: 20000,
        potongan: 2000,
      })
    })

    it('membulatkan potongan ke rupiah terdekat', async () => {
      prismaMock.voucher.findFirst.mockResolvedValue(
        voucherFixture({ minimalBelanja: 0, diskonPersen: 10 })
      )

      const hasil = await validateVoucher('HEMAT10', 33333)

      expect(hasil.potongan).toBe(3333)
      expect(hasil.minimalBelanja).toBe(0)
    })
  })

  describe('getVoucherList / getVoucherAktif', () => {
    it('memetakan jumlah pemakaian dan minimal belanja untuk owner', async () => {
      prismaMock.voucher.findMany.mockResolvedValue([
        {
          ...voucherFixture({ id: 1 }),
          minimalBelanja: '20000',
          deskripsi: null,
          createdAt: new Date(),
          updatedAt: null,
          _count: { pesanan: 3 },
        },
      ])

      const hasil = await getVoucherList()

      expect(hasil[0]).toMatchObject({ id: 1, minimalBelanja: 20000, jumlahDipakai: 3 })
    })

    it('mengambil voucher aktif untuk publik tanpa autentikasi', async () => {
      authMock.mockResolvedValue(null)
      prismaMock.voucher.findMany.mockResolvedValue([
        {
          id: 1,
          kode: 'HEMAT10',
          namaVoucher: 'Hemat 10%',
          deskripsi: null,
          diskonPersen: 10,
          minimalBelanja: '20000',
        },
      ])

      const hasil = await getVoucherAktif()

      expect(hasil).toEqual([
        {
          id: 1,
          kode: 'HEMAT10',
          namaVoucher: 'Hemat 10%',
          deskripsi: null,
          diskonPersen: 10,
          minimalBelanja: 20000,
        },
      ])
      expect(prismaMock.voucher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, statusVoucher: 'aktif' },
        })
      )
    })

    it.each([null, ...ROLE_NON_OWNER])('menolak getVoucherList untuk session %s', async (role) => {
      authMock.mockResolvedValue(role ? sessionUntuk(role) : null)

      await expect(getVoucherList()).rejects.toThrow('Unauthorized')
    })
  })
})
