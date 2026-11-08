import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { stokBahanFixture } from '@/test/helpers/fixtures'
import {
  createStokBahan,
  deleteStokBahan,
  getBahanDapurList,
  getRiwayatStok,
  getStokBahanList,
  hapusResepBahan,
  resetAllStokBahan,
  restockBahan,
  transferStokBahan,
  updateStokBahan,
} from '@/app/actions/stok-bahan'

const INPUT_BARU = {
  tipe: 'gudang' as const,
  namaBahan: 'Beras',
  kategori: 'bahan_utama' as const,
  stokQty: 50,
  satuan: 'kg' as const,
  stokMinimum: 10,
  hargaPerSatuan: 12000,
}

beforeEach(() => {
  vi.resetAllMocks()

  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.stokBahan.findMany.mockResolvedValue([])
  prismaMock.stokBahan.findFirst.mockResolvedValue(null)
  prismaMock.stokBahan.findUnique.mockResolvedValue(stokBahanFixture())
  prismaMock.stokBahan.create.mockResolvedValue(stokBahanFixture({ id: 9 }))
  prismaMock.stokBahan.update.mockResolvedValue(stokBahanFixture())
  prismaMock.stokBahan.updateMany.mockResolvedValue({ count: 1 })
  prismaMock.riwayatStok.create.mockResolvedValue({})
  prismaMock.riwayatStok.createMany.mockResolvedValue({ count: 2 })
  prismaMock.riwayatStok.findMany.mockResolvedValue([])
  prismaMock.resepMenu.count.mockResolvedValue(0)
  prismaMock.resepMenu.findUnique.mockResolvedValue({ id: 1 })
  prismaMock.resepMenu.deleteMany.mockResolvedValue({ count: 1 })
})

describe('getStokBahanList', () => {
  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(getStokBahanList('gudang')).rejects.toThrow('Unauthorized')
  })

  it('menghitung status stok otomatis dan mengubah nilai ke number', async () => {
    prismaMock.stokBahan.findMany.mockResolvedValue([
      stokBahanFixture({ id: 1, stokQty: 0, stokMinimum: 10 }),
      stokBahanFixture({ id: 2, stokQty: 10, stokMinimum: 10 }),
      stokBahanFixture({ id: 3, stokQty: 11, stokMinimum: 10 }),
    ])

    const hasil = await getStokBahanList('gudang')

    expect(hasil.map((h) => h.statusStok)).toEqual(['habis', 'menipis', 'tersedia'])
    expect(hasil[0].stokQty).toBe(0)
  })
})

describe('createStokBahan', () => {
  it('mengembalikan error Unauthorized untuk non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await createStokBahan(INPUT_BARU)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak nama kosong', async () => {
    const hasil = await createStokBahan({ ...INPUT_BARU, namaBahan: '   ' })

    expect(hasil).toEqual({ error: 'Nama bahan tidak boleh kosong' })
  })

  it('menolak nama duplikat yang masih aktif', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(stokBahanFixture())

    const hasil = await createStokBahan(INPUT_BARU)

    expect(hasil).toEqual({ error: 'Nama bahan sudah ada di bagian ini' })
    expect(prismaMock.stokBahan.create).not.toHaveBeenCalled()
  })

  it('memulihkan bahan yang sebelumnya dihapus', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(
      stokBahanFixture({ id: 4, deletedAt: new Date() })
    )
    prismaMock.stokBahan.update.mockResolvedValue(stokBahanFixture({ id: 4 }))

    const hasil = await createStokBahan(INPUT_BARU)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 4 },
        data: expect.objectContaining({ deletedAt: null, stokQty: 50 }),
      })
    )
    expect(prismaMock.riwayatStok.create).toHaveBeenCalled()
  })

  it('membuat bahan baru dan mencatat stok awal', async () => {
    const hasil = await createStokBahan({ ...INPUT_BARU, keterangan: 'beli pasar' })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        namaBahan: 'Beras',
        stokQty: 50,
        statusStok: 'tersedia',
      }),
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stokBahanId: 9,
        jumlahPerubahan: 50,
        jenisPerubahan: 'restock',
        keterangan: 'Stok awal: beli pasar',
      }),
    })
  })

  it('mencatat koreksi saat stok awal nol', async () => {
    await createStokBahan({ ...INPUT_BARU, stokQty: 0 })

    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jenisPerubahan: 'koreksi',
        keterangan: 'Stok awal baru',
      }),
    })
  })

  it('mengembalikan pesan error saat penyimpanan gagal', async () => {
    prismaMock.stokBahan.create.mockRejectedValue(new Error('insert gagal'))

    const hasil = await createStokBahan(INPUT_BARU)

    expect(hasil).toEqual({ error: 'insert gagal' })
  })
})

describe('updateStokBahan', () => {
  const input = {
    id: 1,
    namaBahan: 'Beras',
    kategori: 'bahan_utama' as const,
    stokQty: 60,
    satuan: 'kg' as const,
    stokMinimum: 10,
    hargaPerSatuan: 12000,
  }

  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await updateStokBahan(input)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak nama kosong', async () => {
    const hasil = await updateStokBahan({ ...input, namaBahan: ' ' })

    expect(hasil).toEqual({ error: 'Nama bahan tidak boleh kosong' })
  })

  it('menolak bahan yang tidak ditemukan atau sudah dihapus', async () => {
    prismaMock.stokBahan.findUnique.mockResolvedValue(null)

    const hasil = await updateStokBahan(input)

    expect(hasil).toEqual({ error: 'Bahan tidak ditemukan' })
  })

  it('menolak nama yang bentrok dengan bahan lain', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(stokBahanFixture({ id: 2 }))

    const hasil = await updateStokBahan(input)

    expect(hasil).toEqual({ error: 'Nama bahan sudah digunakan di bagian ini' })
  })

  it('menolak stok negatif', async () => {
    const hasil = await updateStokBahan({ ...input, stokQty: -5 })

    expect(hasil).toEqual({ error: 'Jumlah stok tidak valid' })
  })

  it('menyimpan perubahan dan mencatat koreksi stok', async () => {
    const hasil = await updateStokBahan(input)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ stokQty: 60, statusStok: 'tersedia' }),
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stokSebelum: 50,
        stokSesudah: 60,
        jumlahPerubahan: 10,
        jenisPerubahan: 'koreksi',
      }),
    })
  })

  it('tidak mencatat riwayat saat jumlah stok tidak berubah', async () => {
    await updateStokBahan({ ...input, stokQty: 50 })

    expect(prismaMock.riwayatStok.create).not.toHaveBeenCalled()
  })
})

describe('deleteStokBahan', () => {
  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await deleteStokBahan(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak bahan yang tidak ditemukan', async () => {
    prismaMock.stokBahan.findUnique.mockResolvedValue(null)

    const hasil = await deleteStokBahan(1)

    expect(hasil).toEqual({ error: 'Bahan tidak ditemukan' })
  })

  it('menolak bahan yang dipakai resep', async () => {
    prismaMock.resepMenu.count.mockResolvedValue(2)

    const hasil = await deleteStokBahan(1)

    expect(hasil).toEqual({
      error: 'Bahan ini dipakai pada resep menu, tidak dapat dihapus',
    })
  })

  it('melakukan soft delete', async () => {
    const hasil = await deleteStokBahan(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    })
  })
})

describe('resetAllStokBahan', () => {
  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await resetAllStokBahan()

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('melakukan soft delete untuk semua bahan aktif', async () => {
    const hasil = await resetAllStokBahan()

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.updateMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    })
  })
})

describe('restockBahan', () => {
  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(null)

    const hasil = await restockBahan(1, 10)

    expect(hasil).toEqual({ error: 'Unauthorized' })
  })

  it('menolak bahan yang tidak ditemukan', async () => {
    prismaMock.stokBahan.findUnique.mockResolvedValue(null)

    const hasil = await restockBahan(1, 10)

    expect(hasil).toEqual({ error: 'Bahan tidak ditemukan' })
  })

  it('menolak jumlah restock nol atau negatif', async () => {
    expect(await restockBahan(1, 0)).toEqual({
      error: 'Jumlah restock harus lebih dari 0',
    })
    expect(await restockBahan(1, -3)).toEqual({
      error: 'Jumlah restock harus lebih dari 0',
    })
  })

  it('menambah stok dan mencatat riwayat restock', async () => {
    const hasil = await restockBahan(1, 20, 'kulakan')

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stokQty: 70, statusStok: 'tersedia' },
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stokSebelum: 50,
        stokSesudah: 70,
        jumlahPerubahan: 20,
        jenisPerubahan: 'restock',
        keterangan: 'kulakan',
      }),
    })
  })
})

describe('transferStokBahan', () => {
  it('menolak jumlah tidak valid', async () => {
    expect(await transferStokBahan(1, 0)).toEqual({
      error: 'Jumlah transfer harus lebih dari 0',
    })
    expect(await transferStokBahan(1, Number.NaN)).toEqual({
      error: 'Jumlah transfer harus lebih dari 0',
    })
  })

  it('menolak bahan yang tidak ditemukan', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(null)

    const hasil = await transferStokBahan(1, 5)

    expect(hasil).toEqual({ error: 'Bahan tidak ditemukan' })
  })

  it('menolak transfer dari dapur', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(stokBahanFixture({ tipe: 'dapur' }))

    const hasil = await transferStokBahan(1, 5)

    expect(hasil).toEqual({
      error: 'Hanya bahan di Gudang yang bisa dipindahkan ke Dapur',
    })
  })

  it('menolak jumlah melebihi stok gudang', async () => {
    prismaMock.stokBahan.findFirst.mockResolvedValue(
      stokBahanFixture({ id: 1, tipe: 'gudang', stokQty: 50 })
    )

    const hasil = await transferStokBahan(1, 51)

    expect(hasil).toEqual({ error: 'Jumlah melebihi stok gudang (50 kg)' })
  })

  it('membuat baris dapur baru saat belum ada', async () => {
    prismaMock.stokBahan.findFirst
      .mockResolvedValueOnce(stokBahanFixture({ id: 1, tipe: 'gudang', stokQty: 50 }))
      .mockResolvedValueOnce(null)
    prismaMock.stokBahan.create.mockResolvedValue(stokBahanFixture({ id: 5, tipe: 'dapur', stokQty: 0 }))

    const hasil = await transferStokBahan(1, 10)

    expect(hasil).toEqual({ success: true, dipindah: 10 })
    expect(prismaMock.stokBahan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tipe: 'dapur', stokQty: 0, statusStok: 'habis' }),
    })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ stokQty: 40 }),
    })
    expect(prismaMock.riwayatStok.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ stokBahanId: 1, jumlahPerubahan: -10 }),
        expect.objectContaining({ stokBahanId: 5, jumlahPerubahan: 10 }),
      ],
    })
  })

  it('menambah stok baris dapur yang sudah ada', async () => {
    prismaMock.stokBahan.findFirst
      .mockResolvedValueOnce(stokBahanFixture({ id: 1, tipe: 'gudang', stokQty: 50 }))
      .mockResolvedValueOnce(
        stokBahanFixture({ id: 6, tipe: 'dapur', stokQty: 2, stokMinimum: 5, satuan: 'kg' })
      )

    const hasil = await transferStokBahan(1, 10)

    expect(hasil).toEqual({ success: true, dipindah: 10 })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: { stokQty: 12, statusStok: 'tersedia', updatedAt: expect.any(Date) },
    })
  })
})

describe('hapusResepBahan', () => {
  it('menolak resep yang tidak ditemukan', async () => {
    prismaMock.resepMenu.findUnique.mockResolvedValue(null)

    const hasil = await hapusResepBahan(99)

    expect(hasil).toEqual({ error: 'Bahan resep tidak ditemukan' })
  })

  it('menghapus bahan dari resep', async () => {
    const hasil = await hapusResepBahan(1)

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.resepMenu.deleteMany).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})

describe('getRiwayatStok', () => {
  it('mengembalikan array kosong saat non-owner', async () => {
    authMock.mockResolvedValue(sessionUtil('waiter'))

    const hasil = await getRiwayatStok(1)

    expect(hasil).toEqual([])
  })

  it('memetakan riwayat dan format tanggal', async () => {
    prismaMock.riwayatStok.findMany.mockResolvedValue([
      {
        id: 1,
        stokBahanId: 1,
        stokSebelum: 40,
        stokSesudah: 50,
        jumlahPerubahan: 10,
        jenisPerubahan: 'restock',
        keterangan: null,
        createdAt: new Date('2026-11-05T03:04:05.000Z'),
        stokBahan: { namaBahan: 'Beras' },
        user: { username: 'owner' },
      },
    ])

    const hasil = await getRiwayatStok(1)

    expect(hasil[0]).toMatchObject({
      namaBahan: 'Beras',
      userName: 'owner',
      createdAt: '2026-11-05 03:04:05',
    })
  })
})

describe('getBahanDapurList', () => {
  it('menolak non-owner', async () => {
    authMock.mockResolvedValue(null)

    await expect(getBahanDapurList()).rejects.toThrow('Unauthorized')
  })

  it('mengembalikan bahan dapur dengan status terhitung', async () => {
    prismaMock.stokBahan.findMany.mockResolvedValue([
      stokBahanFixture({ id: 1, tipe: 'dapur', stokQty: 3, stokMinimum: 5 }),
    ])

    const hasil = await getBahanDapurList()

    expect(hasil[0]).toMatchObject({ tipe: 'dapur', statusStok: 'menipis' })
  })
})

function sessionUtil(role: 'owner' | 'cashier' | 'waiter' | 'kitchen') {
  return sessionUntuk(role)
}
