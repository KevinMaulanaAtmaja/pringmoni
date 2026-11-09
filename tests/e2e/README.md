# Playwright Blackbox Testing - Pringmoni

Rencana, aturan, status, dan ringkasan per modul ada di
`.opencode/BLACKBOX_TEST.md`.

## Akun Test (dibuat sekali, dipakai ulang)

Semua test login memakai akun tetap di bawah ini. **Jangan membuat akun login
baru di dalam test.** Akun dibuat/di-update oleh `npm run test:e2e:seed`.

| Role | Username | Password | Dipakai untuk |
|------|----------|----------|---------------|
| Owner | `e2e_owner` | `Owner123!` | `auth.setup.ts`, Modul 1, Modul 2 read-only |
| Kasir | `e2e_kasir` | `Kasir123!` | Modul 2 manual, Modul 3 pembayaran |
| Pelayan | `e2e_waiter` | `Waiter123!` | Modul 2 kelola item & status |
| Dapur | `e2e_kitchen` | `Kitchen123!` | Modul yang butuh role kitchen |
| Takeover | `e2e_takeover` | `Takeover123!` | Modul 1.5 ambil alih sesi |

- Password di atas **hanya untuk akun test**, bukan akun produksi.
- `e2e_kasir` otomatis mendapat shift `ACTIVE` saat seed.
- `e2e_takeover` sengaja terpisah dari `e2e_owner` agar skenario takeover tidak
  mengeluarkan sesi `storageState` owner yang dipakai project chromium.
- Override bila perlu: `E2E_<KEY>_USERNAME` / `E2E_<KEY>_PASSWORD`
  (contoh `E2E_KASIR_PASSWORD`). Default tetap seperti tabel.
- Pengecualian: test CRUD User (Modul 1.2) membuat user sementara karena user
  itu adalah **data yang sedang diuji**, bukan akun login test.

## Strategi Data

Test **tidak memakai data asli**. Semua data test memakai prefix `E2E_` dan
dibersihkan otomatis oleh fixture `cleanup` (per-ID/per-nama unik).

## Setup

1. Install dependencies: `npm install`
2. Install browser: `npx playwright install chromium`
3. Siapkan semua akun test + shift kasir (sekali / saat password berubah):

```bash
npm run test:e2e:seed
```

4. Jalankan test (dev server harus hidup; Playwright akan reuse):

```bash
npm run test:e2e
```

Perintah lain:

```bash
npm run test:e2e:ui       # UI mode
npm run test:e2e:headed   # lihat browser
npm run test:e2e:report   # buka report
npx playwright test tests/e2e/modul1
```

`SLOWMO` default 500 ms. Set `SLOWMO=0` bila ingin cepat.

## Struktur

- `accounts.ts` - daftar akun test tetap (semua role) + override env.
- `fixtures.ts` - prefix `E2E_`, `testAccount`, `getTestUser`, login helper,
  `ensureTestShift`, dan cleanup registry.
- `seed-e2e-accounts.ts` - upsert semua akun test + shift ACTIVE kasir.
- `auth.setup.ts` - login `e2e_owner` + simpan `storageState`.
- `modul1/login.spec.ts` - PBI-1.1
- `modul1/users.spec.ts` - PBI-1.2
- `modul1/meja.spec.ts` - PBI-1.3
- `modul1/menu.spec.ts` - PBI-1.4
- `modul1/takeover.spec.ts` - PBI-1.5
- `modul2/pesanan.spec.ts` - PBI-2.1, 2.2, 2.3
- `modul3/pembayaran.spec.ts` - PBI-3.1, 3.2, 3.3

Modul berikutnya mengikuti peta di `.opencode/BLACKBOX_TEST.md`.

## Ringkasan Modul yang Sudah Dikerjakan

| Modul | Ringkasan |
|-------|-----------|
| 1 | Login/logout, CRUD user, meja (token unik), menu (kategori/foto/stok harian), dan ambil alih sesi antar perangkat. |
| 2 | Pesanan QR customer + manual kasir, potong stok & kunci meja, kelola item pelayan (termasuk guard item belum lengkap), pembatalan, owner read-only, filter/pencarian status. |
| 3 | Hitung grand total (subtotal + biaya admin + PPN), tunai + kembalian + struk, guard nominal kurang, QRIS, riwayat + cetak struk. |

## Aturan Penting

- Jangan membuat akun login baru per test; pakai akun tetap hasil seed.
- Jangan menulis password asli/produksi di file test.
- Jangan memakai `deleteMany` tanpa filter sempit; gunakan `cleanup` fixture.
- Modul yang berbagi state (stok, pesanan, shift) memakai mode `serial`.
- Screenshot hanya saat gagal; trace/video disimpan saat gagal.

## Capture

- Screenshot: `only-on-failure`
- Video: `retain-on-failure`
- Trace: `on-first-retry`

Output ada di `test-results/` dan `playwright-report/` (keduanya di-gitignore).
