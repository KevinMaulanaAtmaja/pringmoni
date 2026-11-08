# Whitebox Testing Plan - Pringmoni

> **Status:** Unit S0-S6 SELESAI (2026-11-06; unit suite hijau: 35 file test / 660 test). Integration test (8.4) BELUM — butuh test database PostgreSQL terisolasi + persetujuan user.
> **Versi:** 1.0
> **Tanggal:** 5 November 2026
> **Project:** Pringmoni Resto POS & Monitoring
> **Referensi:** `.opencode/PRD.md`, `.opencode/ARCHITECTURE.md`, `.opencode/CONVENTIONS.md`, `.opencode/SECURITY.md`, Dokumen TEST CASE 4

---

## 1. Tujuan & Ruang Lingkup

### Tujuan
1. Menguji **logika internal** Server Actions dan library dengan pendekatan **whitebox** (statement, branch, path).
2. Menutup technical debt di `.opencode/PRD.md` bagian 5: *"Unit test (vitest) untuk server actions"*.
3. Menjaga perilaku kritis tetap benar saat refactor: auth, pesanan, pembayaran, shift, voucher, notifikasi.
4. Menyediakan gate kualitas yang bisa dijalankan lokal sebelum commit.

### In Scope
- `src/app/actions/**/*.ts` (logika bisnis utama)
- `src/lib/**/*.ts` (fee, jadwal, stok, voucher, export, print, rate limiter, sesi)
- `src/proxy.ts` (route protection)

### Out of Scope (untuk iterasi ini)
- E2E browser (Playwright) dan visual regression.
- Component test React: `@testing-library/*` sudah ada, tetapi **`jsdom`/`happy-dom` belum terpasang**. Component test baru dimasukkan bila environment DOM ditambahkan.
- Load/performance test (PBI-9.3).
- Kode Midtrans di branch arsip `feature/be-midtrans-qris-dinamis`.
- Database asli: **semua test wajib memakai mock**, tidak boleh menyentuh DB/network.

---

## 2. Baseline Library & Kondisi Saat Ini

### 2.1 Library tersedia
| Library | Versi | Peran |
|---------|-------|-------|
| `vitest` | ^4.1.1 | Test runner utama |
| `@testing-library/react` | ^16.3.2 | Cadangan component test (belum dipakai) |
| `@testing-library/jest-dom` | ^6.9.1 | Matcher DOM (belum dipakai) |
| `@testing-library/user-event` | ^14.6.1 | Interaksi user (belum dipakai) |

### 2.2 Test yang sudah berjalan (27 file, 526 test)
| Folder | File | Cakupan |
|--------|------|---------|
| `src/test/unit/app/actions/` | `dashboard`, `kasir`, `laporan`, `login`, `logout`, `logs`, `meja`, `menu`, `menu-foto`, `notifikasi`, `pesanan`, `refund`, `reset-password`, `shift`, `stok-bahan`, `users`, `voucher` | Server Actions (auth, pesanan, pembayaran, shift, refund, laporan, stok, CRUD) |
| `src/test/unit/lib/` | `export-laporan`, `fee`, `jadwal`, `log`, `print-struk`, `rate-limiter`, `sesi`, `shift`, `stok` | Library murni + integrasi tipis (PDF/Excel, struk, rate limit, sesi, stok) |
| `src/test/unit/` | `proxy.test.ts` | Route protection, role matrix, nested route, `takenOver` |
| `src/test/integration/` | _(kosong)_ | Disiapkan untuk integration test (lihat 8.4) |

### 2.3 Gap yang harus ditutup di Fase 0
| Gap | Dampak | Aksi |
|-----|--------|------|
| `vitest.config.ts` belum punya blok `coverage` | Tidak ada laporan coverage | Tambah konfigurasi V8 + threshold |
| `@vitest/coverage-v8` belum ada di `node_modules` | `vitest --coverage` bisa gagal | **Selesai:** terpasang `@vitest/coverage-v8@4.1.1` (devDependency) |
| Belum ada helper mock Prisma/auth | Setiap test menulis mock berulang | **Selesai:** `src/test/helpers/{prisma-mock,auth-mock,fixtures}.ts` |
| Belum ada script `test:coverage` | Perintah tidak seragam | **Selesai:** script `test:coverage` ditambahkan |
| `environment: 'node'` | Tidak bisa render komponen | Tetap `node`; component test ditunda |

---

## 3. Strategi Whitebox

### 3.1 Teknik per level kritikalitas
| Level | Teknik wajib | Fokus |
|-------|--------------|-------|
| **Critical** | Path + Branch + Statement | Semua cabang validasi, rollback, otorisasi, happy path |
| **High** | Branch + Statement | Cabang utama + error handling penting |
| **Medium** | Statement | Happy path + satu cabang error utama |

### 3.2 Prinsip test
1. **AAA** — Arrange, Act, Assert, satu perilaku per `it`.
2. **Isolasi** — `vi.resetAllMocks()` + fixture baru di `beforeEach`; tidak ada state antar-test.
3. **Tanpa I/O nyata** — Prisma, Pusher, UploadThing, email, `next/cache`, `next/headers` selalu di-mock.
4. **Deterministik** — waktu di-freeze dengan `vi.useFakeTimers()` untuk shift/notifikasi/expiry.
5. **Nama test** — `describe` bahasa Inggris (mengikuti test existing), `it` bahasa Indonesia yang menjelaskan perilaku.
6. **Terpusat & terstruktur** — semua test di `src/test/`, dibagi per folder mengikuti source (`src/test/app/actions/pesanan.test.ts`, `src/test/lib/sesi.test.ts`); helper di `src/test/helpers/`. Import source memakai alias `@/...`.

### 3.3 Kontrak: Test = Spek (WAJIB)

> **Test adalah representasi spek fitur.** Kalau implementasi tidak sesuai spek, biarkan test gagal dan tampilkan error — jangan melonggarkan assertion, men-skip test, atau mengubah expected value.

Aturan operasional:
1. **Test gagal = temuan.** Laporkan assertion/error-nya sebagai bug atau ketidaksesuaian implementasi, bukan sebagai masalah test.
2. **DILARANG** mengubah expected value, melonggarkan `expect`, memakai `it.skip`/`describe.skip`, atau menghapus test agar hijau.
3. Kode test hanya boleh diubah untuk memperbaiki **setup/mock/fixture yang terbukti salah** — bukan untuk mengubah ekspektasi perilaku.
4. Perbaikan dilakukan di **kode sumber** (implementation), lalu test dijalankan ulang.
5. Jika spek fitur **ambigu atau tidak lengkap**: berhenti, **tanya user dulu** sebelum mengubah test.
6. Setiap waiver (bila benar-benar disetujui user) harus dicatat di laporan dengan alasan dan TC ID.

### 3.4 Target coverage
| Area | Statement | Branch | Catatan |
|------|-----------|--------|---------|
| Critical (auth, pesanan, kasir, shift, voucher, notifikasi) | >= 90% | >= 85% | Gate wajib |
| High (refund, stok, laporan, dashboard, proxy, sesi) | >= 85% | >= 75% | Gate wajib |
| Medium (CRUD, struk, log, export) | >= 70% | - | Best effort |
| **Global** | **>= 70%** | **>= 60%** | Threshold `vitest` |

> File yang dikecualikan dari coverage: `**/*.test.ts`, `src/components/**`, `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/lib/prisma.ts`, `src/lib/uploadthing*.ts`.

---

## 4. Inventaris Test Case (42 TC)

Distribusi: **Critical 11 + High 14 + Medium 17 = 42**.

### 4.1 Critical (11 TC) — Path + Branch + Statement

| ID | Skenario utama | Target | Sesi |
|----|----------------|--------|------|
| TC-AUTH-001 | Login valid: kredensial benar -> `signIn` dipanggil, rate limit di-reset, log `LOGIN`, `success: true` | `actions/login.ts`, `lib/auth.ts` | S1 |
| TC-AUTH-002 | Kredensial salah / user nonaktif / kosong -> error generik + `recordFailedAttempt`; percobaan ke-5 memblokir dengan pesan menit | `actions/login.ts`, `lib/rate-limiter.ts` | S1 |
| TC-AUTH-003 | Logout: `signOut` dipanggil + redirect login; token `takenOver` -> cookie sesi dihapus & redirect `/login?takenOver=1` | `actions/logout.ts`, `lib/auth.ts`, `proxy.ts` | S1 |
| TC-ORD-001 | Buat pesanan QR bahagia: stok cukup -> pesanan + detail dibuat, stok harian berkurang, status jadi `habis` saat 0, meja `terpakai`, Pusher + log | `actions/pesanan.ts` | S2 |
| TC-ORD-002 | Buat pesanan kasir: `kasirId` dari session terisi; tanpa session tetap boleh (customer) | `actions/pesanan.ts`, `actions/kasir.ts` | S2 |
| TC-ORD-005 | Pembatalan tanpa refund: status pesanan/pembayaran menjadi batal, meja dikosongkan, stok harian dikembalikan (sesuai implementasi) | `actions/pesanan.ts` | S2 |
| TC-PAY-002 | Pembayaran tunai: uang >= total -> `kembalian` benar, status `berhasil`/`diproses`, `shiftId` terisi; uang kurang -> error | `actions/kasir.ts` | S3 |
| TC-PAY-003 | Pembayaran QRIS: status `berhasil`, admin fee 0, kembalian 0; pesanan sudah dibayar -> error; non-cashier -> Unauthorized | `actions/kasir.ts` | S3 |
| TC-SHFT-001 | Shift: buka/tutup milik kasir, hitung `uangHarapAkhir`, `selisihKas`, auto-close shift basi, nominal tidak valid ditolak, waiter ditolak | `actions/shift.ts`, `lib/shift.ts`, `lib/jadwal.ts` | S3 |
| TC-VCH-002 | Validasi voucher saat pesanan: kode kosong/tidak ada/nonaktif/minimal belanja kurang ditolak; valid -> `diskonVoucher` + `voucherId` disimpan; client value diabaikan | `actions/voucher.ts`, `actions/pesanan.ts` | S2 |
| TC-NTF-001 | Notifikasi terlambat: hanya pesanan hari ini `menunggu`/`diproses` > 30 menit; reset tengah malam membatalkan pesanan belum bayar + kosongkan meja; pesanan sudah bayar tidak dibatalkan | `actions/notifikasi.ts`, `actions/dashboard.ts` | S4 |

### 4.2 High (14 TC) — Branch + Statement

| ID | Skenario utama | Target | Sesi |
|----|----------------|--------|------|
| TC-ORD-003 | Tambah/ubah item: gabung jumlah per menu, catatan berbeda tetap dihitung benar | `actions/pesanan.ts` | S2 |
| TC-ORD-006 | Update status alur dapur: transisi valid, status tidak dikenal ditolak, role tidak berhak ditolak | `actions/pesanan.ts` | S2 |
| TC-REF-001 | Refund: wajib kasir, catatan >= 3 karakter, minimal 1 bukti foto, hanya pesanan `berhasil`, sekali per pesanan | `actions/refund.ts` | S4 |
| TC-REF-002 | Simpan bukti refund + update status `refund`, log + Pusher; hapus bukti | `actions/refund.ts` | S4 |
| TC-PAY-001 | Perhitungan total: `hitungAdminFee` transfer 4000, QRIS 0, `hitungExpiryMenit` 60 menit | `lib/fee.ts` | S3 |
| TC-PAY-005 | Riwayat transaksi kasir: filter today/week/month/all memakai rentang tanggal benar | `actions/kasir.ts` | S3 |
| TC-REP-001 | Laporan: filter tanggal, agregasi pendapatan, menu terlaris, kategori, banding periode | `actions/laporan.ts` | S4 |
| TC-TBL-005 | Pindah meja: token kosong/sama/tidak valid/tujuan terpakai/tidak ada pesanan aktif ditolak; sukses memindah pesanan + status kedua meja | `actions/pesanan.ts` | S2 |
| TC-STK-001 | CRUD stok bahan: validasi owner, data wajib, soft delete, status stok otomatis (`tersedia`/`menipis`/`habis`) | `actions/stok-bahan.ts` | S4 |
| TC-STK-002 | Restock & transfer: jumlah <= 0 ditolak, transfer hanya gudang->dapur, melebihi stok ditolak, riwayat tercatat 2 arah | `actions/stok-bahan.ts`, `lib/stok.ts` | S4 |
| TC-STK-003 | Gate stok harian: `statusMenu != tersedia` ditolak, `stokManual < jumlah` ditolak dengan sisa, gabungan item dihitung total | `actions/pesanan.ts`, `actions/menu.ts` | S2 |
| TC-DSH-001 | Statistik dashboard: pendapatan/pesanan hari ini, grafik, stale order, auto-cancel | `actions/dashboard.ts` | S4 |
| TC-PROXY-001 | Proteksi route: public, wajib login, matrix OWNER/CASHIER/WAITER/KITCHEN, longest match, user login di `/login` diarahkan, role tak dikenal tidak loop | `src/proxy.ts` | S5 |
| TC-SESI-001 | Ambil alih sesi: sesi lain aktif & device beda -> `perluKonfirmasi`; `takeover=1` -> lanjut; device sama/tidak diketahui; label waktu | `actions/login.ts`, `lib/sesi.ts`, `lib/auth.ts` | S1 |

### 4.3 Medium (17 TC) — Statement

| ID | Skenario utama | Target | Sesi |
|----|----------------|--------|------|
| TC-AUTH-004 | Lupa/reset password: email terdaftar membuat token + kirim email; email tidak ada tetap respons netral; token salah/kedaluwarsa ditolak; password baru ter-hash | `actions/forgot-password.ts`, `actions/reset-password*.ts`, `lib/email.ts` | S1 |
| TC-USER-001 | Tambah user: owner only, username unik, role valid, password di-hash | `actions/users.ts` | S5 |
| TC-USER-002 | Ubah data/role: owner only, user tidak ditemukan, role valid | `actions/users.ts` | S5 |
| TC-USER-003 | Hapus/nonaktifkan user: owner only, status berubah, user tidak ditemukan | `actions/users.ts` | S5 |
| TC-MENU-001 | Tambah menu + kategori + foto: validasi input, simpan foto | `actions/menu.ts`, `actions/menu-foto.ts` | S5 |
| TC-MENU-002 | Ubah menu & stok harian: `updateStokMenuHarian` 0 -> `habis`, > 0 -> `tersedia`, set semua/per kategori | `actions/menu.ts` | S5 |
| TC-MENU-003 | Hapus menu: soft delete (`deletedAt`), menu hilang dari list | `actions/menu.ts` | S5 |
| TC-MENU-004 | Tampilkan menu per kategori: filter kategori, urutan, menu terhapus tidak muncul | `actions/menu.ts` | S5 |
| TC-TBL-001 | Tambah meja: owner only, kapasitas 1-20, tipe valid, nomor unik, token unik, status awal `kosong` | `actions/meja.ts` | S5 |
| TC-TBL-002 | Ubah meja: kapasitas divalidasi, nomor/status berubah | `actions/meja.ts` | S5 |
| TC-TBL-003 | Hapus meja: meja `terpakai` ditolak; selain itu soft delete | `actions/meja.ts` | S5 |
| TC-TBL-004 | QR meja: token dipakai untuk URL customer; token tidak valid -> error | `actions/meja.ts`, `actions/pesanan.ts` | S5 |
| TC-PAY-004 | Cetak struk PDF: data struk lengkap, format rupiah, tidak error saat item kosong | `lib/print-struk.ts` | S3 |
| TC-LOG-001 | Log aktivitas: `createLog` menyimpan user/aksi/deskripsi; filter & clear logs | `actions/logs.ts`, `lib/log.ts` | S5 |
| TC-VCH-001 | CRUD voucher: owner only, kode unik, diskon 1-100, minimal belanja >= 0, nonaktifkan, soft delete | `actions/voucher.ts` | S5 |
| TC-ORD-004 | Hapus item pesanan: item dihapus, total dihitung ulang, item bukan milik pesanan ditolak | `actions/pesanan.ts` | S2 |
| TC-EXP-001 | Export laporan PDF/Excel: filter diteruskan, file/blob terbentuk, tidak error saat data kosong | `lib/export-laporan.ts` | S4 |

---

## 5. Rencana File Test

```
src/
└── test/
    ├── helpers/
    │   ├── prisma-mock.ts        # factory mock Prisma + $transaction + raw SQL
    │   ├── auth-mock.ts          # session per role (owner/cashier/waiter/kitchen/null)
    │   └── fixtures.ts           # user, menu, meja, pesanan, voucher, shift
    ├── proxy.test.ts             # PROXY-001 (route protection)
    ├── app/
    │   └── actions/
    │       ├── login.test.ts             # AUTH-001/002, SESI-001
    │       ├── logout.test.ts            # AUTH-003
    │       ├── reset-password.test.ts    # AUTH-004
    │       ├── users.test.ts             # USER-001..003
    │       ├── menu.test.ts              # MENU-001..004, STK-003 (stok harian)
    │       ├── meja.test.ts              # TBL-001..003
    │       ├── pesanan.test.ts           # ORD-001..006, TBL-004/005, STK-003, VCH-002
    │       ├── kasir.test.ts             # PAY-001/002/003/005
    │       ├── shift.test.ts             # SHFT-001
    │       ├── voucher.test.ts           # VCH-001/002
    │       ├── refund.test.ts            # REF-001/002
    │       ├── stok-bahan.test.ts        # STK-001/002
    │       ├── notifikasi.test.ts        # NTF-001
    │       ├── dashboard.test.ts         # DSH-001
    │       ├── laporan.test.ts           # REP-001
    │       └── logs.test.ts              # LOG-001
    └── lib/
        ├── fee.test.ts               # PAY-001
        ├── shift.test.ts             # SHFT-001 (pure functions)
        ├── jadwal.test.ts            # SHFT-001 (slot/jam)
        ├── stok.test.ts              # STK-002
        ├── export-laporan.test.ts    # EXP-001
        ├── print-struk.test.ts       # PAY-004
        ├── rate-limiter.test.ts      # enhance existing
        └── sesi.test.ts              # enhance existing
```

**Konvensi:** satu file test per source utama, path di `src/test/` mencerminkan lokasi source (`src/app/actions` -> `src/test/app/actions`, `src/lib` -> `src/test/lib`). Test murni (fee/jadwal/stok) dipisah dari test action agar mock Prisma tidak mencemari logika murni. `vitest.config.ts` hanya memindai `src/test/**`.

---

## 6. Strategi Mock & Fixture

### 6.1 Mock Prisma (wajib)
```ts
import { vi, beforeEach } from 'vitest'

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    users: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    menu: { findFirst: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    pesanan: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    voucher: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    meja: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    shiftKasir: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
  authMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ default: prismaMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn(() => ({ get: vi.fn() })) }))
vi.mock('@/lib/log', () => ({ createLog: vi.fn(), createLogNoSession: vi.fn() }))
vi.mock('@/lib/pusher', () => ({
  ORDERS_CHANNEL: 'orders',
  PESANAN_EVENTS: { newOrder: 'new-order', orderPaid: 'order-paid', orderUpdated: 'order-updated' },
  triggerPusher: vi.fn(),
}))
```

### 6.2 Transaksi
```ts
prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
  if (typeof arg === 'function') return (arg as (tx: unknown) => unknown)(prismaMock)
  return Promise.all(arg as Promise<unknown>[])
})
```

### 6.3 Auth per role
```ts
export const sessionUntuk = (role: 'owner' | 'cashier' | 'waiter' | 'kitchen' | null) =>
  role ? { user: { id: '1', role, username: role } } : null
```
- Selalu set `authMock.mockResolvedValue(sessionUntuk(...))` di `beforeEach` atau per test.
- Test otorisasi: panggil action dengan role salah dan pastikan `{ error: 'Unauthorized' }` serta **tidak ada** `prisma.*.update/create` yang terpanggil (`expect(...).not.toHaveBeenCalled()`).

### 6.4 Waktu & ID
- `vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-05T10:00:00+07:00'))` untuk notifikasi, shift, expiry; `vi.useRealTimers()` di `afterEach`.
- ID acak: gunakan `crypto.randomUUID()` atau counter deterministik di fixture.
- `bcryptjs`: gunakan hash sekali di fixture statis atau mock `compare`/`hash` agar test cepat.
- Rate limiter & cache sesi bersifat module-level: pakai identifier unik per test atau `vi.resetModules()`.

### 6.5 Yang tidak boleh dilakukan
- Jangan memakai database PostgreSQL asli.
- Jangan memanggil `fetch`, Pusher, atau UploadThing asli.
- Jangan `sleep` nyata; gunakan fake timer.
- Jangan menghapus data apa pun (sesuai `.opencode/SECURITY.md`).

---

## 7. Fase Implementasi Dipercepat (7 Sesi Kerja)

Target dipercepat dari 8 minggu menjadi **7 sesi kerja (~6-7 hari kerja)** karena eksekusi dilakukan agent. Sesi 4 dan 5 dapat diparalelkan.

| Sesi | Fase | Estimasi | Cakupan TC | Deliverable | Exit Criteria |
|------|------|----------|------------|-------------|---------------|
| **S0** | Foundation | 0,5 hari | Enhancement 3 test existing | Coverage config, helper mock, script, fixture | `npm test` hijau; laporan coverage terbentuk |
| **S1** | Critical: Auth & Sesi | 1 hari | AUTH-001..004, SESI-001 | 3 file test baru + 2 enhance | Semua cabang `loginAction` & takeover teruji |
| **S2** | Critical: Pesanan & Stok Gate | 1 hari | ORD-001..006, STK-003, VCH-002, TBL-004/005 | `pesanan.test.ts`, `menu.test.ts` | Semua jalur validasi `createPesanan` + rollback stok |
| **S3** | Critical: Pembayaran, Kasir, Shift | 1,5 hari | PAY-001..005, SHFT-001 | `kasir.test.ts`, `shift.test.ts`, `fee/jadwal/print` | Pembayaran + perhitungan kas + auto-close teruji |
| **S4** | High: Refund, Notifikasi, Laporan, Stok, Dashboard, Export | 1,5 hari | REF-001/002, NTF-001, REP-001, STK-001/002, DSH-001, EXP-001 | 6 file test | Semua cabang error utama teruji |
| **S5** | Medium: CRUD, Log, Proxy | 1 hari | USER-001..003, MENU-001..004, TBL-001..003, VCH-001, LOG-001, PROXY-001 | 5 file test + enhance proxy | CRUD bahagia + otorisasi owner teruji |
| **S6** | Finalisasi | 0,5 hari | Semua | Coverage report, audit flaky, update dokumen | Semua gate coverage + lint terpenuhi |

> **Status implementasi:** S0-S6 selesai (S1-S3 dituntaskan 2026-11-06). Seluruh test adalah **unit test** (mock Prisma/auth/Pusher/revalidatePath, tanpa DB/network). Coverage global 94,69% stmt / 88,92% branch / 96,35% func / 95,42% line; `lib/auth.ts` 100%, `pesanan.ts` 99%, `shift.ts` 94,75% statement. Folder `src/test/integration/` masih kosong karena 8.4 butuh test database terisolasi dan di luar Definition of Done iterasi ini.

### 7.1 Detail per sesi

**S0 — Foundation**
- Verifikasi `npx vitest run --coverage`; bila gagal karena provider, ajukan `@vitest/coverage-v8` (devDependency, hanya dengan persetujuan user).
- Tambah blok `coverage` di `vitest.config.ts` dan script `"test:coverage": "vitest run --coverage"`.
- Buat `src/test/helpers/{prisma-mock,auth-mock,fixtures}.ts`.
- Enhance `proxy.test.ts` (tambah role `kitchen`, route shift, `takenOver`), `rate-limiter.test.ts` (boundary waktu blokir), `sesi.test.ts` (cache versi).
- Jalankan `npm test` + `npm run lint -- --quiet`.

**S1 — Auth & Sesi**
- `login.test.ts`: rate limit dulu, kredensial kosong, user nonaktif, bcrypt gagal, sesi lain aktif -> `perluKonfirmasi`, `takeover=1`, `signIn` mengembalikan URL error, error DB `P1001`, sukses + log + reset limit.
- `logout.test.ts`: `signOut` dipanggil.
- `reset-password.test.ts`: token valid/kedaluwarsa, email tidak terdaftar (respons netral), hash password baru.
- Enhance `sesi.test.ts`: `ambilVersiSesi` cache 3 detik, `catatAktivitasSesi` throttle 2 menit.
- Exit: seluruh cabang `loginAction` minimal 85% branch.

**S2 — Pesanan & Stok Gate**
- `pesanan.test.ts`: token meja invalid, masih menunggu bayar, item kosong, menu tidak ada, menu nonaktif/tidak tersedia, stok kurang, gabungan item, voucher (tidak ada/nonaktif/minimal), sukses + decrement stok + status `habis`, transaksi gagal (`newStok < 0`) -> error, `createPesanan` tanpa session (customer), pindah meja (semua cabang), update status, cancel, hapus item.
- `menu.test.ts`: `updateStokMenuHarian` 0/nol/negatif, set semua, per kategori.
- Exit: semua early-return `createPesanan` punya test; stok tidak pernah negatif.

**S3 — Pembayaran, Kasir, Shift**
- `kasir.test.ts`: auth cashier, `requireShiftAktif` error, pesanan tidak ada, sudah dibayar, tunai kurang, tunai pas/lebih (kembalian), QRIS, filter riwayat.
- `shift.test.ts` (action): buka/tutup hanya cashier, nominal invalid, hitung `uangHarapAkhir`, `selisihKas`, `autoCloseShifts`, kas keluar, jadwal owner-only, waiter ditolak.
- `lib/shift.test.ts`: `validasiNominal`, `uangHarapAkhir`, `tanggalShiftSekarang`, `MAKS_NOMINAL`.
- `lib/jadwal.test.ts`: `formatJam`, `jamDariTeks`, `cariSlot`, `slotSaatIni`, `rentangBentrok`.
- `lib/fee.test.ts`: transfer 4000, QRIS 0, expiry.
- `lib/print-struk.test.ts`: data lengkap, item kosong.
- Exit: perhitungan uang & gate shift 100% branch pada fungsi murni.

**S4 — High Support**
- `refund.test.ts`: non-kasir, catatan < 3, tanpa bukti, pesanan tidak ada, sudah refund, belum bayar, batal, sukses (2 bukti, log, status), hapus bukti.
- `notifikasi.test.ts`: batas 30 menit, status `menunggu` vs `diproses`, hanya hari ini, sweep tengah malam (batalkan yang belum bayar, jangan yang sudah bayar), pesanan `deletedAt` diabaikan.
- `laporan.test.ts`: filter periode, agregasi, menu terlaris, kategori, banding.
- `stok-bahan.test.ts`: create/update/delete, status otomatis, restock, transfer (gudang->dapur, stok kurang, buat baris dapur baru, riwayat 2 arah), riwayat per bahan.
- `dashboard.test.ts`: statistik hari ini, grafik, stale order, auto-cancel.
- `export-laporan.test.ts`: PDF & Excel, data kosong, filter.
- Exit: setiap action mengembalikan objek error yang diharapkan, bukan melempar exception.

**S5 — Medium CRUD, Log, Proxy**
- `users.test.ts`, `menu.test.ts`, `meja.test.ts`, `voucher.test.ts`, `logs.test.ts`.
- Enhance `proxy.test.ts`: KITCHEN hanya pesanan/menu, WAITER tanpa shift, CASHIER tanpa stok-bahan/laporan, nested route, `takenOver`.
- `meja.test.ts`: mock `$queryRaw`/`$executeRaw` untuk nomor & token; meja `terpakai` tidak bisa dihapus.
- Exit: semua aksi owner-only menolak role lain tanpa menyentuh Prisma.

**S6 — Finalisasi**
- Jalankan `npm test` 3x untuk mendeteksi flaky.
- `npm run lint -- --quiet`.
- Cek threshold coverage; dokumentasikan waiver bila ada.
- Update `.opencode/PROGRESS.md` (hasil, file, coverage) dan centang technical debt di `.opencode/PRD.md` bila sudah memadai.
- Jangan menjalankan `next build` saat dev server aktif (lihat `AGENTS.md`).

### 7.2 Jalur paralel (opsional, target ~4 hari)
Setelah S0-S3 selesai:
- **Agent A**: S4 (refund, notifikasi, laporan, export).
- **Agent B**: S4 (stok-bahan, dashboard) + S5 (CRUD).
- Gabungkan, lalu S6.

---

## 8. Konfigurasi Coverage & Perintah

### 8.1 `vitest.config.ts` (target Fase 0)
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/app/actions/**/*.ts', 'src/lib/**/*.ts', 'src/proxy.ts'],
      exclude: [
        '**/*.test.ts',
        'src/lib/prisma.ts',
        'src/lib/uploadthing*.ts',
        'src/components/**',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### 8.2 Perintah
| Tujuan | Perintah |
|--------|----------|
| Semua test | `npm test` |
| Satu file | `npx vitest run src/test/unit/app/actions/pesanan.test.ts` |
| Satu test | `npx vitest run -t "nama test"` |
| Coverage | `npm run test:coverage` (setelah script ditambahkan) |
| Watch lokal | `npx vitest` |
| Lint ringkas | `npm run lint -- --quiet` |

> Shell: jalankan perintah satu per satu (PowerShell 5.1 tidak mendukung `&&`).

### 8.3 Struktur folder test (unit vs integration)

```
src/test/
├── helpers/                # prisma-mock, auth-mock, fixtures
├── unit/
│   ├── app/actions/*.test.ts
│   ├── lib/*.test.ts
│   └── proxy.test.ts
└── integration/            # (kosong) integration test, lihat 8.4
```

- **Unit test** (sudah ada): memanggil satu action/fungsi dengan Prisma, auth, Pusher, `revalidatePath`, dan `next/headers` di-mock. Cepat, deterministik, tanpa DB/network.
- **Integration test** (rencana): menguji alur lintas-action dengan Prisma nyata (test database terisolasi) dan mock hanya pada boundary eksternal (Pusher, UploadThing, email). Belum diimplementasikan pada iterasi ini.

### 8.4 Rencana integration testing (iterasi berikutnya)

| Aspek | Rencana |
|-------|---------|
| Database | PostgreSQL khusus test (schema terpisah / container), migrasi via `prisma migrate deploy`, reset dengan truncate per test |
| Isolasi | Satu transaksi per test + rollback, atau `beforeEach` truncate tabel terkait |
| Auth | Sesi nyata (NextAuth) atau `auth()` di-mock di level boundary; jangan mock Prisma |
| Boundary eksternal | Mock `@/lib/pusher`, UploadThing, email; tidak ada network keluar |
| Alur kandidat | (1) customer buat pesanan -> status berubah -> kasir bayar tunai/QRIS -> struk; (2) pesanan selesai -> `potongStokDapur` kurangi stok + riwayat; (3) shift buka -> transaksi -> tutup -> rekap kas; (4) refund dengan bukti -> stok/status kembali; (5) voucher dipakai -> kuota berkurang |
| Gate | Tetap tanpa DB produksi; integration test dipisah (`src/test/integration/`) dan dijalankan hanya bila env test DB tersedia |
| CI/shell | Power Shell/Git Bash kompatibel, perintah terpisah (tanpa `&&`), DB dinyalakan/dimatikan oleh user |

### 8.5 Rencana Penting Lain (Menunggu / TODO)

Berikut item yang sengaja ditunda dan menjadi **rencana penting** ke depan:

| ID | Item | Status Saat Ini | Catatan / Langkah |
|----|------|-----------------|-------------------|
| 8.5.1 | Component test React | Tertunda — `@testing-library/*` sudah ada di `package.json`, tapi `jsdom`/`happy-dom` belum terpasang dan `vitest.config.ts` (`environment: 'node'`) masih non-DOM | Siapkan `jsdom` + `@testing-library/jest-dom` + `@testing-library/user-event` (sudah ada versi npm-nya), lalu set `environment: 'jsdom'` untuk file komponen test. |
| 8.5.2 | E2E browser (Playwright) | Tertunda — masih di Out of Scope rencana (§1). | Masuk evaluasi setelah unit/integration stabil. |
| 8.5.3 | Load / performance test | Todo (PBI-9.3, PRD Modul 9). | Di luar scope unit/integration saat ini. |
| 8.5.4 | Integration test dengan DB nyata | Belum — butuh Supabase project baru + file `.env.test` (env testing terpisah) + `prisma migrate deploy` ke test DB. | Rencana detail: §8.4. |
| 8.5.5 | CI/CD (GitHub Actions) | Todo (PRD §5, technical debt). | Auto lint + test setelah unit/integration stabil. |

---

## 9. Definition of Done

- [ ] 42 TC terimplementasi atau memiliki waiver tertulis yang disetujui user.
  - Sebagian besar TC terimplementasi; waiver coverage untuk area di luar target iterasi dicatat di `.opencode/PROGRESS.md` (kasir, pesanan, shift, auth/pusher/email).
- [x] `npm test` hijau, stabil 3x berturut-turut.
- [ ] Threshold coverage global terpenuhi; Critical >= 90% statement / >= 85% branch.
  - Gate global **lolos** (94,69/88,92/96,35/95,42); target *Critical* per-file tercapai (`kasir.ts` 100%, `pesanan.ts` 99%, `shift.ts` 94,75%, `auth.ts` 100%).
- [x] Tidak ada akses DB/network nyata di test.
- [x] `npm run lint -- --quiet` tanpa error.
- [x] Test mengikuti konvensi nama & lokasi file.
- [x] **Tidak ada test yang dilonggarkan, di-skip, dihapus, atau diubah expected value-nya** demi menutupi implementasi yang tidak sesuai spek.
- [x] Kegagalan karena implementasi tidak sesuai spek dilaporkan sebagai error/bug, bukan "diperbaiki" dengan mengubah test.
- [ ] `.opencode/PROGRESS.md` diperbarui; technical debt unit test di PRD ditandai.
  - `PROGRESS.md` sudah diperbarui; pencentangan technical debt di `PRD.md` belum dilakukan.
- [x] Tidak ada secret/credential di test atau fixture.

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| `@vitest/coverage-v8` belum terpasang | `--coverage` gagal | Verifikasi di S0; ajukan instalasi devDependency dengan persetujuan user |
| Prisma raw SQL (`$queryRaw`/`$executeRaw`) di meja/stok | Sulit di-mock | Mock per query; assert nilai parameter bila perlu |
| `next/headers` dipanggil di luar request | Error saat import/run | Selalu mock `next/headers` |
| Module-level cache (rate limiter, sesi) bocor antar-test | Flaky | Identifier unik + `vi.resetModules()` bila perlu |
| Waktu nyata pada shift/notifikasi | Hasil tidak deterministik | `vi.useFakeTimers()` + `setSystemTime` |
| File action besar (pesanan/shift) | Coverage lambat tercapai | Prioritaskan cabang early-return & error; tambah bertahap per sesi |
| `next build` saat dev server aktif | Route 404 / Prisma stale | Jangan build saat dev aktif; ikuti aturan `AGENTS.md` |
| Komponen React butuh DOM | Component test gagal | Tetap di scope server/unit; tambah `jsdom` hanya bila diminta |

---

## 11. Progress Tracker

| Sesi | Status | Catatan |
|------|--------|---------|
| S0 Foundation | Selesai (2026-11-05) | Coverage V8 aktif; 32 test hijau; baseline statement 5,05% (gate 70% sengaja merah sampai S1-S5 menambah test) |
| S1 Auth & Sesi | Selesai (2026-11-05) | 3 file test baru; `npm test` 63 test hijau; branch `login.ts` 92,15% (target >=85%); logout/forgot/reset 100% |
| S2 Pesanan & Stok Gate | Selesai (2026-11-05) | `pesanan.test.ts` 44 test + `menu.test.ts` 16 test; `npm test` 123 test hijau; semua early-return `createPesanan` dan cabang `pindahMeja` teruji |
| S3 Pembayaran, Kasir, Shift | Selesai (2026-11-05) | `kasir.test.ts` 21 test + `shift.test.ts` 53 test + 4 file lib; `npm test` 236 test hijau; `lib/shift` & `lib/jadwal` 100% branch |
| S4 High Support | Selesai (2026-11-05) | `refund`/`notifikasi`/`laporan`/`stok-bahan`/`dashboard` + `export-laporan`; `npm test` stabil |
| S5 Medium CRUD & Proxy | Selesai (2026-11-05) | `users`/`meja`/`voucher`/`logs` + perluasan `menu` + `menu-foto`; proxy sudah diperluas |
| S6 Finalisasi | Selesai (2026-11-05) | 27 file / 526 test hijau; stabil 3x; `tsc` bersih; lint 0 error; coverage global 76,01% stmt / 63,89% branch / 79,55% func / 77,38% line (gate 70/60/70/70) |

---

## 12. Riwayat Perubahan

| Tanggal | Versi | Perubahan |
|---------|-------|-----------|
| 5 Nov 2026 | 1.0 | Dokumen awal: 42 TC, 7 sesi dipercepat, strategi mock, coverage gate |
| 5 Nov 2026 | 1.1 | S0-S1 selesai: coverage V8, helper mock, 63 test hijau, branch auth teruji |
| 5 Nov 2026 | 1.2 | S2 selesai: 123 test hijau; gate pesanan/stok/voucher/meja teruji |
| 5 Nov 2026 | 1.3 | S3 selesai: 236 test hijau; pembayaran, kas, shift, jadwal, fee, struk teruji |
| 5 Nov 2026 | 1.4 | Restrukturisasi test ke `src/test/` (dibagi `app/actions` & `lib`); import memakai alias `@/`; `vitest.config.ts` hanya memindai `src/test/**` |
| 6 Nov 2026 | 2.0 | S1-S3 tuntas: `lib/auth.test.ts` (18 test), `pesanan.test.ts` +13 fungsi, `shift.test.ts` +getShiftAktif/getRiwayatShift/getSisaPesanan/getDaftarKasirLengkap; coverage 94,69/88,92/96,35/95,42; `tsc` bersih; lint 0 error; 8.4 tetap menunggu test DB + persetujuan user |
| 5 Nov 2026 | 1.5 | S4-S6 selesai: 27 file / 526 test hijau, stabil 3x; `tsc` bersih; lint 0 error; coverage global 76,01/63,89/79,55/77,38 lolos gate; ditambah `lib/stok.test.ts`; struktur unit vs integration + rencana integration (8.3-8.4) |
