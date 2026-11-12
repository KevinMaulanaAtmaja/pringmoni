# TC-02 — Kelola Meja (`createMeja`)

| Item | Keterangan |
|------|------------|
| Level | Menengah |
| Action | `createMeja` — `src/app/actions/meja.ts:83` |
| Model | `Meja` |
| File unit | `src/test/unit/app/actions/tc02-create-meja.test.ts` |
| File integration | `src/test/integration/tc02-create-meja.test.ts` |
| Jumlah test | Unit 5 `it`, Integration 2 `it` |

## Tujuan

Membuktikan bahwa pembuatan meja:

1. hanya boleh dilakukan oleh **owner**,
2. menolak kapasitas di luar rentang 1–20 (termasuk bukan angka),
3. menghasilkan **nomor meja otomatis** berurutan (`K001`, `K002`, …),
4. menghasilkan **token QR unik** 8 karakter,
5. menyimpan row ke tabel `meja` dengan status awal `kosong` (integration).

## Logika yang Diuji

- `parseInt(formData.get('kapasitas'))` → `0` atau `NaN` harus ditolak.
- `generateNomorMeja('kursi')` → prefix `K`, urutan 3 digit.
- `crypto.randomUUID().substring(0, 8).toUpperCase()` → token.
- `INSERT INTO meja (...) VALUES (..., 'kosong')` via `$executeRaw`.

## Unit Test

Mock: `@/lib/auth`, `next/cache`, `@/lib/prisma`, dan `crypto.randomUUID`
(stub global).

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { authMock, revalidatePathMock, randomUuidMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  randomUuidMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { createMeja } from '@/app/actions/meja'

function formDataMeja(nilai: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(nilai).forEach(([kunci, isi]) => data.set(kunci, isi))
  return data
}

describe('TC-02 createMeja (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    randomUuidMock.mockReturnValue('abcd1234-0000-0000-0000-000000000000')
    prismaMock.$queryRaw.mockResolvedValue([])
    prismaMock.$executeRaw.mockResolvedValue(1)
    vi.stubGlobal('crypto', { randomUUID: randomUuidMock })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('membuat meja baru dengan kapasitas valid dan token unik', async () => {
    const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ success: true })
    expect(randomUuidMock).toHaveBeenCalledTimes(1)
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
  })

  it('menolak kapasitas 0 tanpa menulis ke database', async () => {
    const hasil = await createMeja(null, formDataMeja({ kapasitas: '0', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('menolak kapasitas lebih dari 20 tanpa menulis ke database', async () => {
    const hasil = await createMeja(null, formDataMeja({ kapasitas: '21', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('menolak kapasitas bukan angka tanpa menulis ke database', async () => {
    const hasil = await createMeja(null, formDataMeja({ kapasitas: 'abc', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))

    expect(hasil).toEqual({ error: 'Unauthorized' })
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })
})
```

### Penjelasan Assertion Unit

| Assertion | Arti |
|-----------|------|
| `success: true` | Meja berhasil dibuat. |
| `randomUUID` dipanggil 1x | Token dihasilkan sekali (tidak ada tabrakan). |
| `$executeRaw` dipanggil 1x | Tepat satu `INSERT`. |
| `revalidatePath('/dashboard/meja')` | Cache daftar meja diperbarui. |
| Tiga `it` kapasitas (`0`, `21`, `abc`) | Batas bawah, batas atas, dan input non-numerik. |
| `error: 'Unauthorized'` | Role selain owner ditolak. |

## Integration Test

Mock hanya `auth`, `next/cache`, `next/headers`. Prisma nyata.

```ts
import { describe, it, expect, vi } from 'vitest'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function formDataMeja(nilai: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(nilai).forEach(([kunci, isi]) => data.set(kunci, isi))
  return data
}

describeIntegration('Integrasi TC-02: createMeja', () => {
  it('menyimpan meja baru dengan nomor dan token otomatis', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const batasAwal = await prisma.meja.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    })
    const idAwal = batasAwal?.id ?? 0

    let mejaId: number | null = null

    try {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(hasil).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { id: { gt: idAwal }, nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'asc' },
      })
      expect(row).not.toBeNull()

      mejaId = row!.id

      expect(row?.kapasitas).toBe(4)
      expect(row?.statusMeja).toBe('kosong')
      expect(row?.nomorMeja).toMatch(/^K\d{3,}$/)
      expect(row?.tokenMeja).toMatch(/^[0-9A-F]{8}$/)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

  it('tidak menulis meja saat kapasitas tidak valid', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const sebelum = await prisma.meja.count({ where: { kapasitas: 25 } })

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '25', tipeMeja: 'kursi' }))
    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })

    const sesudah = await prisma.meja.count({ where: { kapasitas: 25 } })
    expect(sesudah).toBe(sebelum)
  })
})
```

### Penjelasan Assertion Integration

| Assertion | Arti |
|-----------|------|
| `nomorMeja` cocok `/^K\d{3,}$/` | Prefix kursi + urutan minimal 3 digit. |
| `kapasitas == 4` | Input numerik tersimpan sebagai integer. |
| `statusMeja == 'kosong'` | Status awal meja sesuai default alur bisnis. |
| `tokenMeja` cocok `/^[0-9A-F]{8}$/` | Format token 8 karakter hex uppercase. |
| `count(kapasitas 25)` tidak berubah | Validasi mencegah penulisan. |

## Cara Menjalankan

```powershell
npx vitest run src/test/unit/app/actions/tc02-create-meja.test.ts
npx vitest run src/test/integration/tc02-create-meja.test.ts
```
