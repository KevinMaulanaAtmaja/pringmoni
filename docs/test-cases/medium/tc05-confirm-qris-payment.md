# TC-05 — Pembayaran QRIS (`confirmQrisPayment`)

| Item | Keterangan |
|------|------------|
| Level | Menengah |
| Action | `confirmQrisPayment` — `src/app/actions/kasir.ts:626` |
| Model | `Pesanan`, `ShiftKasir`, `Logs` |
| File unit | `src/test/unit/app/actions/tc05-confirm-qris-payment.test.ts` |
| File integration | `src/test/integration/tc05-confirm-qris-payment.test.ts` |
| Jumlah test | Unit 5 `it`, Integration 2 `it` |

## Tujuan

Membuktikan bahwa konfirmasi QRIS:

1. hanya boleh dilakukan oleh **kasir**,
2. mewajibkan **shift aktif** milik kasir tersebut,
3. menolak pesanan yang tidak ada atau sudah dikonfirmasi,
4. mengubah `statusPembayaran` → `berhasil`, `statusPesanan` → `diproses`,
5. mengisi `jumlahBayar` dan `kembalian = 0`,
6. mengikat pesanan ke `kasirId` + `shiftId`,
7. menulis **log audit** `PROCESS_PAYMENT` dan mengirim event Pusher.

## Alur Action

```ts
const session = await auth()                    // wajib cashier
const shift = await requireShiftAktif()         // wajib shift ACTIVE
const pesanan = await prisma.pesanan.findFirst() // wajib status 'menunggu'
await prisma.pesanan.update({ ...status, kasirId, shiftId })
await createLog('PROCESS_PAYMENT', ...)
await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderPaid, {})
revalidatePath('/dashboard/kasir')
revalidatePath('/dashboard/pesanan')
```

## Unit Test

Mock: `@/lib/auth`, `@/lib/shift`, `@/lib/log`, `next/cache`, `@/lib/pusher`,
`@/lib/prisma`.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, shiftMock, createLogMock, triggerPusherMock, revalidatePathMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    shiftMock: vi.fn(),
    createLogMock: vi.fn(),
    triggerPusherMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  })
)

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/shift', () => ({ requireShiftAktif: shiftMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/pusher', () => ({
  triggerPusher: triggerPusherMock,
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { orderUpdated: 'pesanan.orderUpdated', orderPaid: 'pesanan.orderPaid' },
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { pesananFixture } from '@/test/helpers/fixtures'
import { confirmQrisPayment } from '@/app/actions/kasir'

describe('TC-05 confirmQrisPayment (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir' }))
    shiftMock.mockResolvedValue({ shiftId: 9, kasirId: 2, kasirUsername: 'kasir' })
    createLogMock.mockResolvedValue(undefined)
    triggerPusherMock.mockResolvedValue(undefined)
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ id: 1, totalHarga: 50000, statusPembayaran: 'menunggu' })
    )
    prismaMock.pesanan.update.mockResolvedValue(pesananFixture({ id: 1 }))
  })

  it('mengonfirmasi QRIS dan mengikat pesanan ke kasir + shift aktif', async () => {
    const hasil = await confirmQrisPayment(1)
    expect(hasil).toEqual({ success: true })

    expect(prismaMock.pesanan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        jumlahBayar: 50000,
        kembalian: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: 2,
        shiftId: 9,
      }),
    })

    expect(createLogMock).toHaveBeenCalledWith(
      'PROCESS_PAYMENT',
      expect.stringContaining('Konfirmasi QRIS pesanan #1')
    )
    expect(triggerPusherMock).toHaveBeenCalledWith('orders', 'pesanan.orderPaid', {})
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/kasir')
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/pesanan')
  })

  it('menolak role selain kasir tanpa menyentuh database', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    const hasil = await confirmQrisPayment(1)

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
    expect(createLogMock).not.toHaveBeenCalled()
  })

  it('menolak konfirmasi saat kasir belum membuka shift', async () => {
    shiftMock.mockResolvedValue({
      error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
    })

    const hasil = await confirmQrisPayment(1)

    expect(hasil).toEqual({
      error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
    })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('menolak pesanan yang sudah dikonfirmasi sebelumnya', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(
      pesananFixture({ id: 1, totalHarga: 50000, statusPembayaran: 'berhasil' })
    )

    const hasil = await confirmQrisPayment(1)

    expect(hasil).toEqual({ error: 'Pesanan sudah dikonfirmasi' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })

  it('menolak pesanan yang tidak ditemukan', async () => {
    prismaMock.pesanan.findFirst.mockResolvedValue(null)

    const hasil = await confirmQrisPayment(999)

    expect(hasil).toEqual({ error: 'Pesanan tidak ditemukan' })
    expect(prismaMock.pesanan.update).not.toHaveBeenCalled()
  })
})
```

### Penjelasan Assertion Unit

| Assertion | Arti |
|-----------|------|
| `success: true` | Konfirmasi berhasil. |
| `jumlahBayar == 50000` | Nominal mengikuti `totalHarga` pesanan. |
| `kembalian == 0` | QRIS tidak menghasilkan kembalian. |
| `statusPembayaran/statusPesanan` | Alur pesanan berpindah ke `diproses`. |
| `kasirId` & `shiftId` | Transaksi terikat ke kasir dan shift yang benar. |
| `createLog('PROCESS_PAYMENT', ...)` | Audit trail dibuat. |
| `triggerPusher(..., 'pesanan.orderPaid', ...)` | Dashboard realtime diberi tahu. |
| Dua `revalidatePath` | Halaman kasir & pesanan di-refresh. |
| `error: 'Unauthorized'` | Non-kasir ditolak sebelum I/O. |
| `error: 'Shift belum dibuka...'` | Shift aktif wajib. |
| `error: 'Pesanan sudah dikonfirmasi'` | Cegah double payment. |
| `error: 'Pesanan tidak ditemukan'` | Id tidak valid ditolak. |

## Integration Test

Mock hanya `auth`, `next/cache`, `next/headers`, `pusher`. Prisma dan
`requireShiftAktif` **nyata**, sehingga shift benar-benar dibaca dari database.

```ts
import { describe, it, expect, vi } from 'vitest'
import {
  MetodePembayaran,
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

describeIntegration('Integrasi TC-05: confirmQrisPayment', () => {
  it('mengonfirmasi QRIS dan memperbarui pesanan, shift, serta log di database', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const kasir = await prisma.users.create({
      data: {
        username: `tc05_kasir_${suffix()}`,
        password: 'hash-demo',
        role: RoleUser.cashier,
        status: true,
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

    try {
      const hasil = await confirmQrisPayment(pesanan.id)
      expect(hasil).toEqual({ success: true })

      const terbaru = await prisma.pesanan.findUniqueOrThrow({ where: { id: pesanan.id } })
      expect(terbaru.statusPembayaran).toBe('berhasil')
      expect(terbaru.statusPesanan).toBe('diproses')
      expect(Number(terbaru.jumlahBayar)).toBe(50000)
      expect(terbaru.kembalian).toBe(0)
      expect(terbaru.kasirId).toBe(kasir.id)
      expect(terbaru.shiftId).toBe(shift.id)

      const log = await prisma.logs.findFirst({
        where: { userId: kasir.id, aksi: 'PROCESS_PAYMENT' },
      })
      expect(log).not.toBeNull()
      expect(log?.keterangan).toContain(`Konfirmasi QRIS pesanan #${pesanan.id}`)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: kasir.id } })
      await prisma.pesanan.deleteMany({ where: { id: pesanan.id } })
      await prisma.shiftKasir.deleteMany({ where: { id: shift.id } })
      await prisma.meja.deleteMany({ where: { id: meja.id } })
      await prisma.users.deleteMany({ where: { id: kasir.id } })
    }
  })

  it('menolak konfirmasi saat kasir belum membuka shift', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { confirmQrisPayment } = await import('@/app/actions/kasir')

    const kasir = await prisma.users.create({
      data: {
        username: `tc05_kasir_${suffix()}`,
        password: 'hash-demo',
        role: RoleUser.cashier,
        status: true,
      },
    })
    const meja = await prisma.meja.create({
      data: { nomorMeja: `TC05N-${suffix()}`, kapasitas: 4 },
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
      await prisma.logs.deleteMany({ where: { userId: kasir.id } })
      await prisma.pesanan.deleteMany({ where: { id: pesanan.id } })
      await prisma.meja.deleteMany({ where: { id: meja.id } })
      await prisma.users.deleteMany({ where: { id: kasir.id } })
    }
  })
})
```

### Penjelasan Assertion Integration

| Assertion | Arti |
|-----------|------|
| `statusPembayaran == 'berhasil'` | Perubahan status benar-benar tersimpan. |
| `statusPesanan == 'diproses'` | Pesanan masuk antrean dapur. |
| `Number(jumlahBayar) == 50000` | Nominal terisi dari `totalHarga`. |
| `kembalian == 0` | Tidak ada kembalian untuk QRIS. |
| `kasirId` & `shiftId` | Relasi transaksi valid di database. |
| `logs(PROCESS_PAYMENT)` milik kasir ada | Audit trail nyata. |
| `shiftId == null` saat tanpa shift | Tidak ada update saat prasyarat gagal. |

## Cara Menjalankan

```powershell
npx vitest run src/test/unit/app/actions/tc05-confirm-qris-payment.test.ts
npx vitest run src/test/integration/tc05-confirm-qris-payment.test.ts
```
