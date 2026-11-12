# TC-01 — Kelola User (`createUser`)

| Item | Keterangan |
|------|------------|
| Level | Menengah |
| Action | `createUser` — `src/app/actions/users.ts:42` |
| Model | `Users` |
| File unit | `src/test/unit/app/actions/tc01-create-user.test.ts` |
| File integration | `src/test/integration/tc01-create-user.test.ts` |
| Jumlah test | Unit 3 `it`, Integration 2 `it` |

## Tujuan

Membuktikan bahwa pembuatan user:

1. hanya boleh dilakukan oleh **owner**,
2. memvalidasi kekuatan password sebelum menyentuh database,
3. menyimpan password sebagai **hash bcrypt**, bukan plaintext,
4. menulis row baru ke tabel `users` (integration).

## Unit Test

Mock: `@/lib/auth`, `bcryptjs`, `next/cache`, `@/lib/prisma`.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, hashMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  hashMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('bcryptjs', () => ({ default: { hash: hashMock } }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import { userFixture } from '@/test/helpers/fixtures'
import { createUser } from '@/app/actions/users'

const PASSWORD_VALID = 'Rahasia1!'

describe('TC-01 createUser (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    hashMock.mockResolvedValue('hashed-password')
    prismaMock.users.create.mockResolvedValue(userFixture())
  })

  it('menyimpan user baru dengan password ter-hash dan email null', async () => {
    const hasil = await createUser({
      username: 'kasir_demo',
      password: PASSWORD_VALID,
      role: 'cashier',
    })

    expect(hasil).toEqual({ success: true })
    expect(hashMock).toHaveBeenCalledWith(PASSWORD_VALID, 10)
    expect(prismaMock.users.create).toHaveBeenCalledWith({
      data: {
        username: 'kasir_demo',
        email: null,
        password: 'hashed-password',
        role: 'cashier',
        status: true,
      },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/users')
  })

  it('menolak password lemah tanpa menyentuh database', async () => {
    const hasil = await createUser({
      username: 'kasir_demo',
      password: 'lemah',
      role: 'cashier',
    })

    expect(hasil).toEqual({ error: 'Password minimal 8 karakter' })
    expect(hashMock).not.toHaveBeenCalled()
    expect(prismaMock.users.create).not.toHaveBeenCalled()
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(
      createUser({ username: 'kasir_demo', password: PASSWORD_VALID, role: 'cashier' })
    ).rejects.toThrow('Unauthorized')

    expect(prismaMock.users.create).not.toHaveBeenCalled()
  })
})
```

### Penjelasan Assertion Unit

| Assertion | Arti |
|-----------|------|
| `hasil == { success: true }` | Action melaporkan sukses ke UI. |
| `hashMock` dipanggil dengan `(password, 10)` | Password wajib melewati bcrypt cost 10. |
| `users.create` menerima `password: 'hashed-password'` | Yang dikirim ke Prisma bukan password asli. |
| `email: null` | Email opsional dinormalisasi menjadi `null`. |
| `revalidatePath('/dashboard/users')` | Cache halaman user di-refresh. |
| `create` tidak dipanggil saat password lemah | Validasi berhenti sebelum I/O. |
| `rejects.toThrow('Unauthorized')` | Role selain owner ditolak oleh `requireOwner`. |

## Integration Test

Mock hanya boundary: `auth`, `next/cache`, `next/headers`. Prisma **nyata**.

```ts
import { describe, it, expect, vi } from 'vitest'
import { RoleUser } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

function usernameUnik(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

describeIntegration('Integrasi TC-01: createUser', () => {
  it('menulis user baru ke database dengan password ter-hash', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_user')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    try {
      const hasil = await createUser({
        username,
        password: 'Rahasia1!',
        role: RoleUser.cashier,
      })

      expect(hasil).toEqual({ success: true })

      const row = await prisma.users.findUnique({ where: { username } })
      expect(row).not.toBeNull()
      expect(row?.email).toBeNull()
      expect(row?.role).toBe(RoleUser.cashier)
      expect(row?.status).toBe(true)
      expect(row?.password).not.toBe('Rahasia1!')
      expect(await bcrypt.compare('Rahasia1!', row!.password)).toBe(true)
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })

  it('tidak menulis apa pun saat password ditolak validasi', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createUser } = await import('@/app/actions/users')
    const username = usernameUnik('tc01_invalid')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    try {
      const hasil = await createUser({
        username,
        password: 'lemah',
        role: RoleUser.cashier,
      })

      expect(hasil).toEqual({ error: 'Password minimal 8 karakter' })
      expect(await prisma.users.findUnique({ where: { username } })).toBeNull()
    } finally {
      await prisma.users.deleteMany({ where: { username } })
    }
  })
})
```

### Alur Integration

1. `TEST_DATABASE_URL` disalin ke `DATABASE_URL` **sebelum** `@/lib/prisma`
   di-import dinamis (pola yang sama dengan `pembayaran.test.ts`).
2. Bila env tidak valid, seluruh suite `describe.skip`.
3. Setiap test membuat `username` unik, memanggil action, lalu membaca ulang
   row lewat Prisma nyata.
4. Cleanup dilakukan di `finally` (delete berdasarkan username), sehingga test
   lain yang berjalan paralel tidak terganggu.

### Penjelasan Assertion Integration

| Assertion | Arti |
|-----------|------|
| `row != null` | Data benar-benar tersimpan. |
| `row.password != plaintext` | Tidak ada kebocoran password. |
| `bcrypt.compare(...) == true` | Hash valid dan bisa diverifikasi. |
| `users.count() == 0` pada kasus invalid | Validasi mencegah penulisan. |

## Cara Menjalankan

```powershell
npx vitest run src/test/unit/app/actions/tc01-create-user.test.ts
npx vitest run src/test/integration/tc01-create-user.test.ts
```
