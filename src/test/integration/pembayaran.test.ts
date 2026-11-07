import { describe, it, expect, vi } from 'vitest'
import { StatusPesanan, StatusBayar, MetodePembayaran, RoleUser, StatusShift } from '@prisma/client'

const { authMock, triggerPusherMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  triggerPusherMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'pesanan.orderUpdated', orderPaid: 'pesanan.orderPaid' },
}))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn() }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

describeIntegration('Integrasi: alur pesanan + pembayaran', () => {
  it('kasir mengkonfirmasi QRIS: status pesanan diproses dan shift terkait', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const kasir = await prisma.users.create({
      data: {
        username: `kasir_${Date.now()}`,
        password: 'password',
        role: RoleUser.cashier,
        status: true,
        email: `kasir_${Date.now()}@test.local`,
      },
    })

    const shift = await prisma.shiftKasir.create({
      data: {
        kasirId: kasir.id,
        tanggal: new Date(),
        waktuMasuk: new Date(),
        uangAwal: 100000,
        statusShift: StatusShift.ACTIVE,
      },
    })

    const meja = await prisma.meja.create({
      data: { nomorMeja: `A-${Date.now()}`, kapasitas: 4 },
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

    authMock.mockResolvedValue({
      user: {
        id: String(kasir.id),
        name: kasir.username,
        email: kasir.email ?? null,
        role: RoleUser.cashier,
        username: kasir.username,
        takenOver: false,
      },
    })

    const hasil = await confirmQrisPayment(pesanan.id)
    expect(hasil).toEqual({ success: true })

    const terbaru = await prisma.pesanan.findFirst({ where: { id: pesanan.id, deletedAt: null } })
    expect(terbaru).not.toBeNull()
    expect(terbaru?.statusPembayaran).toBe('berhasil')
    expect(terbaru?.statusPesanan).toBe('diproses')
    expect(Number(terbaru?.jumlahBayar ?? 0)).toBe(50000)
    expect(terbaru?.shiftId).toBe(shift.id)

    await prisma.pesanan.delete({ where: { id: pesanan.id } })
    await prisma.shiftKasir.delete({ where: { id: shift.id } })
    await prisma.meja.delete({ where: { id: meja.id } })
    await prisma.logs.deleteMany({ where: { userId: kasir.id } })
    await prisma.users.delete({ where: { id: kasir.id } })
  })
})
