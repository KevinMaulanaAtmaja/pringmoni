# Playwright Blackbox Testing - Pringmoni

Rencana, aturan, dan status per modul ada di `.opencode/BLACKBOX_TEST.md`.

## Strategi Data

Test **tidak memakai data asli**. Semua data test memakai prefix `E2E_` dan
dibersihkan otomatis oleh fixture `cleanup` (per-ID/per-nama unik).

Akun test: `e2e_owner` (role owner). Akun ini hanya untuk test, bukan akun
produksi.

## Setup

1. Install dependencies: `npm install`
2. Install browser: `npx playwright install chromium`
3. Siapkan akun test (sekali saja / saat password berubah):

```powershell
# PowerShell
$env:E2E_OWNER_USERNAME='e2e_owner'
$env:E2E_OWNER_PASSWORD='<password-kuat>'
npm run test:e2e:seed
```

```bash
# Git Bash
export E2E_OWNER_USERNAME=e2e_owner
export E2E_OWNER_PASSWORD='<password-kuat>'
npm run test:e2e:seed
```

4. Jalankan test (dev server harus hidup; Playwright akan reuse):

```powershell
$env:E2E_OWNER_USERNAME='e2e_owner'
$env:E2E_OWNER_PASSWORD='<password-kuat>'
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

- `fixtures.ts` - prefix `E2E_`, kredensial env, login helper, cleanup registry.
- `seed-e2e-owner.ts` - upsert akun `e2e_owner`.
- `auth.setup.ts` - login akun test + simpan `storageState`.
- `modul1/login.spec.ts` - PBI-1.1
- `modul1/users.spec.ts` - PBI-1.2
- `modul1/meja.spec.ts` - PBI-1.3
- `modul1/menu.spec.ts` - PBI-1.4
- `modul1/takeover.spec.ts` - PBI-1.5

Modul berikutnya mengikuti peta di `.opencode/BLACKBOX_TEST.md`.

## Aturan Penting

- Jangan menulis password asli di file test.
- Jangan memakai `deleteMany` tanpa filter sempit; gunakan `cleanup` fixture.
- Modul yang berbagi state (stok, pesanan, shift) memakai mode `serial`.
- Test takeover memakai akun sementara sendiri agar tidak membatalkan sesi
  `e2e_owner`.
- Screenshot hanya saat gagal; trace/video disimpan saat gagal.

## Capture

- Screenshot: `only-on-failure`
- Video: `retain-on-failure`
- Trace: `on-first-retry`

Output ada di `test-results/` dan `playwright-report/` (keduanya di-gitignore).
