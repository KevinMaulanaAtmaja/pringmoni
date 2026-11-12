import { describe, it, expect, vi } from 'vitest'
import {
  MetodePembayaran,
  PrismaClient,
  RoleUser,
  StatusBayar,
  StatusPesanan,
  StatusShift,
} from '@prisma/client'

const { authMock, revalidatePathMock, triggerPusherMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  triggerPusherMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => '127.0.0.1' })) }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'pesanan.orderUpdated', orderPaid: 'pesanan.orderPaid' },
}))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function suffix(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`
}

async function siapkanPesanan(
  prisma: PrismaClient,
  { withShift = true }: { withShift?: boolean } = {}
) {
  const kasir = await prisma.users.create({
    data: {
      username: `tc05_kasir_${suffix()}`,
      password: 'hash-demo',
      role: RoleUser.cashier,
      status: true,
    },
  })

  let shift: { id: number } | null = null
  if (withShift) {
    shift = await prisma.shiftKasir.create({
      data: {
        kasirId: kasir.id,
        tanggal: new Date(),
        waktuMasuk: new Date(),
        uangAwal: 100000,
        statusShift: StatusShift.ACTIVE,
      },
    })
  }

  const meja = await prisma.meja.create({
    data: { nomorMeja: `TC05-${suffix()}`, kapasitas: 4 },
  })
  const pesanan = await prisma.pesanan.create({
    data: {
      mejaId: meja.id,
      kasirId: kasir.id,
      statusPesanan: StatusPesanan.menunggu,
      totalHarga: 50000,
      metodePembayaran: MetodePembayaran.qris,
      statusPembayaran: StatusBayar.menunggu,
      jumlahBayar: null,
      kembalian: 0,
      biayaAdmin: 0,
      ppn: 0,
    },
  })
  return { kasir, shift, meja, pesanan }
}

function authKasir(kasirId: number | string) {
  authMock.mockResolvedValue({
    user: {
      id: String(kasirId),
      name: 'kasir',
      email: null,
      role: RoleUser.cashier,
      username: 'kasir',
      takenOver: false,
    },
  })
}

async function bersihkan(
  prisma: PrismaClient,
  data: { kasirId: number; shiftId: number | null; mejaId: number; pesananId: number }
) {
  await prisma.logs.deleteMany({ where: { userId: data.kasirId } })
  await prisma.detailPesanan.deleteMany({ where: { pesananId: data.pesananId } })
  await prisma.pesanan.deleteMany({ where: { mejaId: data.mejaId } })
  if (data.shiftId !== null) {
    await prisma.shiftKasir.deleteMany({ where: { id: data.shiftId } })
  }
  await prisma.meja.deleteMany({ where: { id: data.mejaId } })
  await prisma.users.deleteMany({ where: { id: data.kasirId } })
}

describeIntegration('Integrasi TC-05: confirmQrisPayment', () => {
  it('mengonfirmasi QRIS dan memperbarui pesanan, shift, serta log di database', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const { kasir, shift, meja, pesanan } = await siapkanPesanan(prisma)
    authKasir(kasir.id)

    try {
      const hasil = await confirmQrisPayment(pesanan.id)
      expect(hasil).toEqual({ success: true })

      const terbaru = await prisma.pesanan.findUniqueOrThrow({ where: { id: pesanan.id } })
      expect(terbaru.statusPembayaran).toBe('berhasil')
      expect(terbaru.statusPesanan).toBe('diproses')
      expect(Number(terbaru.jumlahBayar)).toBe(50000)
      expect(Number(terbaru.kembalian)).toBe(0)
      expect(terbaru.kasirId).toBe(kasir.id)
      expect(terbaru.shiftId).toBe(shift!.id)

      const log = await prisma.logs.findFirst({
        where: { userId: kasir.id, aksi: 'PROCESS_PAYMENT' },
      })
      expect(log).not.toBeNull()
      expect(log?.keterangan).toContain(`Konfirmasi QRIS pesanan #${pesanan.id}`)
    } finally {
      await bersihkan(prisma, { kasirId: kasir.id, shiftId: shift?.id ?? null, mejaId: meja.id, pesananId: pesanan.id })
    }
  })

  it('menolak konfirmasi saat kasir belum membuka shift', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const { kasir, meja, pesanan } = await siapkanPesanan(prisma, { withShift: false })
    authKasir(kasir.id)

    try {
      const hasil = await confirmQrisPayment(pesanan.id)
      expect(hasil).toEqual({
        error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
      })

      const terbaru = await prisma.pesanan.findUniqueOrThrow({ where: { id: pesanan.id } })
      expect(terbaru.statusPembayaran).toBe(StatusBayar.menunggu)
      expect(terbaru.statusPesanan).toBe(StatusPesanan.menunggu)
      expect(terbaru.shiftId).toBeNull()
    } finally {
      await bersihkan(prisma, { kasirId: kasir.id, shiftId: null, mejaId: meja.id, pesananId: pesanan.id })
    }
  })

  it('menolak pesanan yang tidak ditemukan dan yang sudah dikonfirmasi', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const { kasir, shift, meja } = await siapkanPesanan(prisma)
    authKasir(kasir.id)

    const sudahDibayar = await prisma.pesanan.create({
      data: {
        mejaId: meja.id,
        kasirId: kasir.id,
        statusPesanan: StatusPesanan.menunggu,
        totalHarga: 30000,
        metodePembayaran: MetodePembayaran.qris,
        statusPembayaran: StatusBayar.berhasil,
        jumlahBayar: 30000,
        kembalian: 0,
        biayaAdmin: 0,
        ppn: 0,
      },
    })

    try {
      const tidakDitemukan = await confirmQrisPayment(999999)
      expect(tidakDitemukan).toEqual({ error: 'Pesanan tidak ditemukan' })

      const sudahKonfirmasi = await confirmQrisPayment(sudahDibayar.id)
      expect(sudahKonfirmasi).toEqual({ error: 'Pesanan sudah dikonfirmasi' })
    } finally {
      await bersihkan(prisma, {
        kasirId: kasir.id,
        shiftId: shift!.id,
        mejaId: meja.id,
        pesananId: sudahDibayar.id,
      })
    }
  })

  it.each([null, 'owner', 'waiter', 'kitchen'] as const)(
    'menolak role %s saat konfirmasi QRIS',
    async (role) => {
      const prisma = (await import('@/lib/prisma')).default
      const { confirmQrisPayment } = await import('@/app/actions/kasir')

      const { kasir, shift, meja, pesanan } = await siapkanPesanan(prisma)
      authMock.mockResolvedValue(role
        ? { user: { id: String(kasir.id), username: role, role } }
        : null)

      try {
        const hasil = await confirmQrisPayment(pesanan.id)
        expect(hasil).toEqual({ error: 'Unauthorized' })

        const terbaru = await prisma.pesanan.findUniqueOrThrow({ where: { id: pesanan.id } })
        expect(terbaru.statusPembayaran).toBe(StatusBayar.menunggu)
      } finally {
        await bersihkan(prisma, {
          kasirId: kasir.id,
          shiftId: shift!.id,
          mejaId: meja.id,
          pesananId: pesanan.id,
        })
      }
    }
  )

  it('generateQRISCode menandai metode pembayaran QRIS', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { generateQRISCode } = await import('@/app/actions/kasir')

    const { kasir, shift, meja, pesanan } = await siapkanPesanan(prisma)
    authKasir(kasir.id)

    try {
      const hasil = await generateQRISCode(pesanan.id)
      expect(hasil).toMatchObject({
        success: true,
        totalBayar: 50000,
        adminFee: 0,
        expiryMenit: 60,
      })
      expect(typeof hasil.qrUrl).toBe('string')

      const terbaru = await prisma.pesanan.findUnique({ where: { id: pesanan.id } })
      expect(terbaru?.metodePembayaran).toBe('qris')
    } finally {
      await bersihkan(prisma, { kasirId: kasir.id, shiftId: shift!.id, mejaId: meja.id, pesananId: pesanan.id })
    }
  })

  it('prosesPembayaranQRIS membayar pesanan secara langsung', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { prosesPembayaranQRIS } = await import('@/app/actions/kasir')

    const { kasir, shift, meja, pesanan } = await siapkanPesanan(prisma)
    authKasir(kasir.id)

    try {
      const hasil = await prosesPembayaranQRIS(pesanan.id)
      expect(hasil).toEqual({ success: true })

      const terbaru = await prisma.pesanan.findUnique({ where: { id: pesanan.id } })
      expect(terbaru?.statusPembayaran).toBe('berhasil')
      expect(terbaru?.statusPesanan).toBe('diproses')
      expect(terbaru?.kasirId).toBe(kasir.id)
      expect(terbaru?.shiftId).toBe(shift.id)

      const log = await prisma.logs.findFirst({
        where: { userId: kasir.id, aksi: 'PROCESS_PAYMENT' },
      })
      expect(log).not.toBeNull()
    } finally {
      await bersihkan(prisma, { kasirId: kasir.id, shiftId: shift!.id, mejaId: meja.id, pesananId: pesanan.id })
    }
  })

  it('getPembayaranInfo mengembalikan detail pembayaran dan item', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { getPembayaranInfo } = await import('@/app/actions/kasir')

    const { kasir, shift, meja, pesanan } = await siapkanPesanan(prisma)
    authKasir(kasir.id)

    try {
      const info = await getPembayaranInfo(pesanan.id)
      expect(info.id).toBe(pesanan.id)
      expect(info.nomorMeja).toBe(meja.nomorMeja)
      expect(info.totalHarga).toBe(50000)
      expect(typeof info.qrUrl).toBe('string')
      expect(Array.isArray(info.items)).toBe(true)
    } finally {
      await bersihkan(prisma, { kasirId: kasir.id, shiftId: shift!.id, mejaId: meja.id, pesananId: pesanan.id })
    }
  })
})
