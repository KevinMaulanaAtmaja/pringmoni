# Demo Test Case — Level Menengah (5 TC)

Dokumen ini adalah **index** untuk 5 test case tingkat menengah yang dipakai
saat demo per individu. Setiap test case punya **unit test** dan **integration
test** (I/O database nyata).

## Ringkasan

| TC | Fitur | Service / Action | Model Prisma | File Unit | File Integration |
|----|-------|------------------|--------------|-----------|-------------------|
| TC-01 | Kelola user | `createUser` | `Users` | [lihat](medium/tc01-create-user.md) | [lihat](medium/tc01-create-user.md) |
| TC-02 | Kelola meja | `createMeja` | `Meja` | [lihat](medium/tc02-create-meja.md) | [lihat](medium/tc02-create-meja.md) |
| TC-03 | Kelola menu | `createMenu` | `Menu`, `KategoriMenu` | [lihat](medium/tc03-create-menu.md) | [lihat](medium/tc03-create-menu.md) |
| TC-04 | Voucher | `createVoucher`, `validateVoucher` | `Voucher`, `Logs` | [lihat](medium/tc04-voucher.md) | [lihat](medium/tc04-voucher.md) |
| TC-05 | Pembayaran QRIS | `confirmQrisPayment` | `Pesanan`, `ShiftKasir`, `Logs` | [lihat](medium/tc05-confirm-qris-payment.md) | [lihat](medium/tc05-confirm-qris-payment.md) |

## Struktur Folder Test

Unit test mengikuti konvensi folder action yang sudah ada. Integration test
diletakkan bersama `pembayaran.test.ts` di `src/test/integration/`.

```
src/test/unit/app/actions/
├── tc01-create-user.test.ts
├── tc02-create-meja.test.ts
├── tc03-create-menu.test.ts
├── tc04-voucher.test.ts
└── tc05-confirm-qris-payment.test.ts

src/test/integration/
├── pembayaran.test.ts
├── tc01-create-user.test.ts
├── tc02-create-meja.test.ts
├── tc03-create-menu.test.ts
├── tc04-voucher.test.ts
└── tc05-confirm-qris-payment.test.ts
```

## Level Menengah — Kenapa?

Setiap TC menyentuh minimal 2 dari 3 hal berikut:

1. **Aturan bisnis** — validasi kapasitas, harga, password, status voucher.
2. **Transformasi data** — hash password, normalisasi kode, konversi Decimal,
   generate nomor meja & token.
3. **Relasi / efek samping** — relasi menu→kategori, pesanan→shift→kasir,
   penulisan log audit, dan `revalidatePath`.

## Prasyarat Integration Test

Integration test **hanya** berjalan bila `TEST_DATABASE_URL` tersedia dan
mengarah ke database test terpisah — sama seperti `pembayaran.test.ts`.
Database test disediakan lewat **Docker Compose** (PostgreSQL 16, port `5433`,
data ephemeral). Detail tech stack, alur, dan troubleshooting ada di
[TEST_DATABASE_DOCKER.md](TEST_DATABASE_DOCKER.md).

> **PENTING:** jangan pernah memakai `DATABASE_URL` development/production.
> Script `test-db.mjs` menolak berjalan bila `TEST_DATABASE_URL` sama dengan
> `DATABASE_URL`. Setiap test membuat dan menghapus datanya sendiri (tanpa
> TRUNCATE), sehingga aman berjalan bersama test integration lain.

Setup sekali — tambahkan ke `.env` (sudah ada di `.env.example`):

```dotenv
TEST_DATABASE_URL="postgresql://pringmoni:pringmoni@localhost:5433/pringmoni_test"
```

Quick start:

```powershell
npm run test:db:up        # nyalakan PostgreSQL test + tunggu healthcheck
npm run test:integration  # push schema + jalankan semua integration test
npm run test:db:down      # hentikan container & buang data test
```

Jika `TEST_DATABASE_URL` kosong, seluruh integration test otomatis
`describe.skip` (ditampilkan sebagai *skipped*, bukan gagal).

Alternatif tanpa npm script (mis. env sudah diekspor di shell):

```powershell
# PowerShell
$env:TEST_DATABASE_URL="postgresql://pringmoni:pringmoni@localhost:5433/pringmoni_test"
npx vitest run src/test/integration
```

```bash
# Git Bash
export TEST_DATABASE_URL="postgresql://pringmoni:pringmoni@localhost:5433/pringmoni_test"
npx vitest run src/test/integration
```

## Cara Menjalankan

```powershell
# Semua unit test demo (21 test, tanpa database)
npx vitest run src/test/unit/app/actions/tc01-create-user.test.ts src/test/unit/app/actions/tc02-create-meja.test.ts src/test/unit/app/actions/tc03-create-menu.test.ts src/test/unit/app/actions/tc04-voucher.test.ts src/test/unit/app/actions/tc05-confirm-qris-payment.test.ts

# Semua integration test demo (butuh database test Docker)
npm run test:db:up
npm run test:integration

# Satu test case saja
npx vitest run src/test/unit/app/actions/tc01-create-user.test.ts
npm run test:integration -- src/test/integration/tc01-create-user.test.ts
```

`npm run test:integration` otomatis menjalankan `prisma db push
--skip-generate` ke database test sebelum Vitest, jadi schema selalu sinkron.
Perintah lain: `test:db:push`, `test:db:reset`, `test:db:logs` (lihat
[TEST_DATABASE_DOCKER.md](TEST_DATABASE_DOCKER.md)).

## Pembagian Demo per Individu

| Anggota | TC | Fokus presentasi |
|---------|----|------------------|
| 1 | TC-01 | Hash password + validasi role |
| 2 | TC-02 | Generate nomor meja & token unik |
| 3 | TC-03 | Relasi menu–kategori + aturan stok |
| 4 | TC-04 | Normalisasi kode + perhitungan diskon |
| 5 | TC-05 | Transaksi pembayaran + audit log + shift |

## Prinsip Unit vs Integration

| Aspek | Unit Test | Integration Test |
|-------|-----------|------------------|
| Database | Di-mock (`prismaMock`) | PostgreSQL nyata (`TEST_DATABASE_URL`) |
| Kecepatan | Milidetik | Detik |
| Tujuan | Logika & aturan bisnis | Bukti data benar-benar tersimpan/berubah |
| Boundary | Semua dependency di-mock | Hanya `auth`, `next/cache`, `next/headers`, `pusher` |

## Catatan

- Unit test memakai helper yang sudah ada: `src/test/helpers/prisma-mock.ts`,
  `auth-mock.ts`, `fixtures.ts`.
- Integration test mengikuti pola `src/test/integration/pembayaran.test.ts`:
  `TEST_DATABASE_URL` → `DATABASE_URL`, `describe.skip` bila tidak valid,
  dynamic import action + Prisma setelah env diset.
- Setiap integration test membuat data dengan nama unik dan menghapusnya di
  blok `finally`, sehingga tidak mengganggu `pembayaran.test.ts` yang berjalan
  paralel.
- `graphify` tidak perlu dijalankan untuk membaca dokumen ini.
