import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { stokBahanFixture } from '@/test/helpers/fixtures'
import { potongStokDapur } from '@/lib/stok'

function pesananDenganResep(
  detail: Array<{ jumlah: number; resep: Array<{ stokBahanId: number; jumlah: string | number }> }>,
  overrides: Record<string, unknown> = {}
) {
  return {
    id: 1,
    stokDeducted: false,
    detailPesanan: detail.map((d, i) => ({
      id: i + 1,
      jumlah: d.jumlah,
      menu: { resep: d.resep },
    })),
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()

  prismaMock.pesanan.findFirst.mockResolvedValue(null)
  prismaMock.pesanan.update.mockResolvedValue({})
  prismaMock.stokBahan.findMany.mockResolvedValue([])
  prismaMock.stokBahan.update.mockResolvedValue({})
  prismaMock.riwayatStok.create.mockResolvedValue({})
})

describe('potongStokDapur', () => {
  it('melewati pesanan yang tidak ditemukan', async () => {
    const hasil = await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1)

    expect(hasil).toEqual({ deducted: false })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('melewati pesanan yang stoknya sudah dipotong', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([{ jumlah: 1, resep: [{ stokBahanId: 1, jumlah: 1 }] }], {
        stokDeducted: true,
      })
    )

    const hasil = await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1)

    expect(hasil).toEqual({ deducted: false })
    expect(prismaMock.stokBahan.findMany).not.toHaveBeenCalled()
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('menandai pesanan tanpa resep agar tidak diproses ulang', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([{ jumlah: 1, resep: [] }])
    )

    const hasil = await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1, 9)

    expect(hasil).toEqual({ deducted: false })
    expect(prismaMock.stokBahan.findMany).not.toHaveBeenCalled()
    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stokDeducted: true, updatedAt: expect.any(Date) },
    })
  })

  it('menggabungkan kebutuhan resep dari beberapa item', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([
        { jumlah: 2, resep: [{ stokBahanId: 1, jumlah: '0.5' }] },
        { jumlah: 3, resep: [{ stokBahanId: 1, jumlah: 1 }] },
      ])
    )
    prismaMock.stokBahan.findMany.mockResolvedValue([
      stokBahanFixture({ id: 1, stokQty: 10, stokMinimum: 2 }),
    ])

    const hasil = await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1)

    expect(hasil).toEqual({ deducted: true })
    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stokQty: 6, statusStok: 'tersedia' },
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stokBahanId: 1,
        stokSebelum: 10,
        stokSesudah: 6,
        jumlahPerubahan: 4,
        jenisPerubahan: 'otomatis',
        userId: null,
      }),
    })
  })

  it('membatasi stok di nol dan menandai habis', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([{ jumlah: 5, resep: [{ stokBahanId: 2, jumlah: 1 }] }])
    )
    prismaMock.stokBahan.findMany.mockResolvedValue([
      stokBahanFixture({ id: 2, stokQty: 3, stokMinimum: 1 }),
    ])

    await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1)

    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { stokQty: 0, statusStok: 'habis' },
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ jumlahPerubahan: 3 }),
    })
  })

  it('menandai menipis saat stok tersisa di batas minimum', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([{ jumlah: 1, resep: [{ stokBahanId: 3, jumlah: 1 }] }])
    )
    prismaMock.stokBahan.findMany.mockResolvedValue([
      stokBahanFixture({ id: 3, stokQty: 5, stokMinimum: 5 }),
    ])

    await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1, 7)

    expect(prismaMock.stokBahan.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { stokQty: 4, statusStok: 'menipis' },
    })
    expect(prismaMock.riwayatStok.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 7 }),
    })
  })

  it('memfilter bahan tipe gudang dan yang terhapus', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananDenganResep([{ jumlah: 1, resep: [{ stokBahanId: 4, jumlah: 1 }] }])
    )

    await potongStokDapur(prismaMock as unknown as Parameters<typeof potongStokDapur>[0], 1)

    expect(prismaMock.stokBahan.findMany).toHaveBeenCalledWith({
      where: { id: { in: [4] }, tipe: 'dapur', deletedAt: null },
    })
  })
})
