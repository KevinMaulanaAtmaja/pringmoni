# Playwright Blackbox Testing untuk Modul 1

## Setup
1. Install dependencies: `npm install`
2. Install browser: `npx playwright install chromium`

## Running Tests

Set kredensial owner lewat environment variable (jangan ditulis di file test):

```bash
# PowerShell
$env:E2E_OWNER_USERNAME='pohan'
$env:E2E_OWNER_PASSWORD='<password-owner>'

# Git Bash
export E2E_OWNER_USERNAME=pohan
export E2E_OWNER_PASSWORD='<password-owner>'
```

```bash
# Jalankan semua e2e tests (sama dengan npm test)
npm run test:e2e

# Jalankan dengan UI mode (bisa liat browser)
npm run test:e2e:ui

# Jalankan dengan headed mode (lihat browser langsung)
npm run test:e2e:headed

# Lihat report
npm run test:e2e:report
```

## Struktur Testing

- `tests/e2e/auth.setup.ts` - Setup autentikasi untuk role owner
- `tests/e2e/modul1/login.spec.ts` - Blackbox test untuk login (PBI-1.1)
- `tests/e2e/modul1/users.spec.ts` - Blackbox test untuk CRUD User (PBI-1.2)
- `tests/e2e/modul1/meja.spec.ts` - Blackbox test untuk CRUD Meja (PBI-1.3)

## Capture
Playwright akan otomatis capture:
- **Screenshot**: hanya saat test gagal
- **Video**: disimpan saat test gagal  
- **Trace**: untuk debugging saat test gagal pertama kali

Screenshot manual juga disimpan di `test-results/screenshots/`

## Notes
- Pastikan server dev berjalan atau biarkan Playwright yang handle via `webServer` config
- Username owner default: `pohan` (bisa dioverride via `E2E_OWNER_USERNAME`)
- Password wajib diisi via `E2E_OWNER_PASSWORD`
- Tests menggunakan `storageState` untuk menghindari login berulang
- Data user/meja yang dibuat test akan dihapus kembali di akhir test
