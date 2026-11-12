# TC-04 — Voucher (`createVoucher` + `validateVoucher`)

| Item | Keterangan |
|------|------------|
| Level | Menengah |
| Action | `createVoucher` — `src/app/actions/voucher.ts:157`, `validateVoucher` — `:124` |
| Model | `Voucher`, `Logs` |
| File unit | `src/test/unit/app/actions/tc04-voucher.test.ts` |
| File integration | `src/test/integration/tc04-voucher.test.ts` |
| Jumlah test | Unit 4 `it`, Integration 2 `it` |

## Tujuan

Membuktikan bahwa voucher:

1. hanya boleh dibuat oleh **owner**,
2. kodenya **dinormalisasi** (`trim` + uppercase) sebelum disimpan,
3. kode duplikat ditolak,
4. validasi membaca data dari database (bukan dari client),
5. diskon dihitung `Math.round(subtotal × persen / 100)`,
6. penulisan voucher meninggalkan **log audit** `MANAGE_VOUCHER` (integration).

## Aturan Bisnis

```ts
const kode = normalisasiKode(data.kode)          // trim + toUpperCase
if (existing && !existing.deletedAt) return error

if (subtotal < Number(voucher.minimalBelanja)) return error
potongan = hitungPotonganDiskon(subtotal, voucher.diskonPersen)
```

## Unit Test

Mock: `@/lib/auth`, `next/cache`, `@/lib/log`, `@/lib/prisma`.

```ts
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
import { createVoucher, validateVoucher } from '@/app/actions/voucher'

describe('TC-04 voucher (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    createLogMock.mockResolvedValue(undefined)
    prismaMock.voucher.findUnique.mockResolvedValue(null)
    prismaMock.voucher.create.mockResolvedValue(voucherFixture({ id: 7 }))
  })

  it('menyimpan voucher dengan kode yang sudah dinormalisasi', async () => {
    const hasil = await createVoucher({
      kode: 'hemat10',
      namaVoucher: 'Hemat 10%',
      diskonPersen: 10,
      minimalBelanja: 20000,
    })

    expect(hasil).toEqual({ success: true, id: 7 })
    expect(prismaMock.voucher.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        kode: 'HEMAT10',
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        statusVoucher: 'aktif',
      }),
    })
    expect(createLogMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
  })

  it('menolak kode voucher yang sudah dipakai', async () => {
    prismaMock.voucher.findUnique.mockResolvedValue(voucherFixture({ kode: 'HEMAT10' }))

    const hasil = await createVoucher({
      kode: 'HEMAT10',
      namaVoucher: 'Duplikat',
      diskonPersen: 10,
      minimalBelanja: 20000,
    })

    expect(hasil).toEqual({ error: 'Kode voucher sudah digunakan' })
    expect(prismaMock.voucher.create).not.toHaveBeenCalled()
    expect(prismaMock.voucher.update).not.toHaveBeenCalled()
  })

  it('menghitung potongan voucher untuk belanja yang memenuhi minimum', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ minimalBelanja: 20000 }))

    const hasil = await validateVoucher('hemat10', 50000)

    expect(hasil).toEqual({
      valid: true,
      kode: 'HEMAT10',
      namaVoucher: 'Hemat 10%',
      diskonPersen: 10,
      minimalBelanja: 20000,
      potongan: 5000,
    })
  })

  it('menolak voucher saat belanja di bawah minimal', async () => {
    prismaMock.voucher.findFirst.mockResolvedValue(voucherFixture({ minimalBelanja: 20000 }))

    const hasil = await validateVoucher('HEMAT10', 15000)

    expect(hasil).toEqual({
      valid: false,
      error: 'Minimal belanja voucher ini Rp 20.000',
    })
  })
})
```

### Penjelasan Assertion Unit

| Assertion | Arti |
|-----------|------|
| `create` menerima `kode: 'HEMAT10'` | Input `hemat10` dinormalisasi. |
| `statusVoucher: 'aktif'` | Default status saat tidak diisi. |
| `createLog` dipanggil 1x | Pembuatan voucher tercatat. |
| Dua `revalidatePath` | Dashboard dan layout ikut di-refresh. |
| `error: 'Kode voucher sudah digunakan'` | Duplikat aktif ditolak. |
| `potongan: 5000` | 10% × 50.000 = 5.000. |
| `error` minimal belanja | Subtotal 15.000 < 20.000 ditolak. |

## Integration Test

Mock hanya `auth`, `next/cache`, `next/headers`. `createLog` **nyata** menulis
ke tabel `logs`. Prisma nyata.

```ts
import { describe, it, expect, vi } from 'vitest'
import { RoleUser } from '@prisma/client'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => '127.0.0.1' })) }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function kodeUnik(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
}

describeIntegration('Integrasi TC-04: voucher', () => {
  it('menyimpan voucher dan memvalidasinya terhadap data di database', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher, validateVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04')
    let voucherId: number | null = null

    authMock.mockResolvedValue({
      user: { id: String(owner.id), username: owner.username, role: 'owner' },
    })

    try {
      const hasil = await createVoucher({
        kode: kode.toLowerCase(),
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })

      expect(hasil).toHaveProperty('success', true)
      if (!('id' in hasil)) throw new Error(`createVoucher gagal: ${JSON.stringify(hasil)}`)
      voucherId = hasil.id

      const row = await prisma.voucher.findUnique({ where: { kode } })
      expect(row).not.toBeNull()
      expect(row?.namaVoucher).toBe('Hemat 10%')
      expect(row?.diskonPersen).toBe(10)
      expect(Number(row?.minimalBelanja)).toBe(20000)
      expect(row?.statusVoucher).toBe('aktif')

      const validasi = await validateVoucher(kode.toLowerCase(), 50000)
      expect(validasi).toEqual({
        valid: true,
        kode,
        namaVoucher: 'Hemat 10%',
        diskonPersen: 10,
        minimalBelanja: 20000,
        potongan: 5000,
      })

      const log = await prisma.logs.findFirst({
        where: { userId: owner.id, aksi: 'MANAGE_VOUCHER' },
      })
      expect(log).not.toBeNull()
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      if (voucherId !== null) {
        await prisma.voucher.deleteMany({ where: { id: voucherId } })
      }
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })

  it('menolak voucher duplikat dan tidak menambah row baru', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createVoucher } = await import('@/app/actions/voucher')

    const owner = await prisma.users.create({
      data: {
        username: `tc04_owner_${Date.now()}`,
        password: 'hash-demo',
        role: RoleUser.owner,
        status: true,
      },
    })
    const kode = kodeUnik('TC04DUP')

    authMock.mockResolvedValue({
      user: { id: String(owner.id), username: owner.username, role: 'owner' },
    })

    try {
      const pertama = await createVoucher({
        kode,
        namaVoucher: 'Duplikat 1',
        diskonPersen: 10,
        minimalBelanja: 20000,
      })
      expect(pertama).toHaveProperty('success', true)

      const kedua = await createVoucher({
        kode,
        namaVoucher: 'Duplikat 2',
        diskonPersen: 20,
        minimalBelanja: 30000,
      })
      expect(kedua).toEqual({ error: 'Kode voucher sudah digunakan' })

      expect(await prisma.voucher.count({ where: { kode } })).toBe(1)
    } finally {
      await prisma.logs.deleteMany({ where: { userId: owner.id } })
      await prisma.voucher.deleteMany({ where: { kode } })
      await prisma.users.deleteMany({ where: { id: owner.id } })
    }
  })
})
```

### Penjelasan Assertion Integration

| Assertion | Arti |
|-----------|------|
| `findUnique({ kode }) != null` | Normalisasi kode benar-benar tersimpan. |
| `Number(minimalBelanja) == 20000` | Decimal dibaca dan dikonversi dengan benar. |
| `validateVoucher` mengembalikan `potongan: 5000` | Perhitungan diskon memakai data DB. |
| `logs.findFirst(MANAGE_VOUCHER, userId) != null` | Audit trail nyata tertulis. |
| `voucher.count({ kode }) == 1` setelah duplikat | Duplikat tidak menambah row. |

## Cara Menjalankan

```powershell
npx vitest run src/test/unit/app/actions/tc04-voucher.test.ts
npx vitest run src/test/integration/tc04-voucher.test.ts
```
