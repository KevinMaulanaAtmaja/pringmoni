# PROGRESS - Sesi 2026-11-16 (Skeleton page reusable + fix enum usang)

> Skeleton loading seragam untuk halaman OWNER, judul tetap teks asli, dan perbaikan data enum lama.

## Selesai
- Komponen baru `src/components/ui/page-skeleton.tsx`: `PageTitle`, `PageSkeletonHeader`, `ToolbarSkeleton`, `FilterBarSkeleton`, `StatCardsSkeleton`, `ChartCardsSkeleton`, `ChartBlockSkeleton`, `MiniCardsSkeleton`, `TableSkeleton`, `TableBodySkeleton`, `CardGridSkeleton`, `ListSkeleton`.
- Ukuran skeleton disesuaikan dengan kotak asli: Card `rounded-2xl px-6 py-6`, chart `h-48`, Table header `h-9` / baris `h-12`, kartu pesanan aktif `h-60`, detail `h-96`.
- Semua `loading.tsx` halaman OWNER memakai komponen reusable; judul statis dirender sebagai teks asli (tidak skeleton bar). Layout bersama (auth/customer/root) memakai teks brand `Pringmoni`.
- Teks "Memuat..." di halaman & komponen OWNER diganti skeleton (logging, users, meja, shift, stok-bahan, pesanan, voucher, ShiftKasirPanel, notifikasi).
- `page-loader.tsx` dihapus, diganti `skeleton.tsx` + `page-skeleton.tsx`.
- Fix error Prisma: `getLogs()` hanya query enum `JenisAksiLog` yang valid; `getPesananForDashboard()` memfilter relasi meja ke enum `StatusMeja` yang valid.
- Data DB usang dibersihkan: meja K003 `dipesan` → `kosong` (tidak ada pesanan aktif). Sisa log reservasi lama masih disembunyikan filter.
- `.opencode/SKELETON_PLAN.md`: rencana, aturan judul, klasifikasi route, dan status implementasi.
- `.gitignore`: abaikan `playwright/.auth/` dan `playwright-report/` (mengandung session/auth state).

## Hasil verifikasi
- `npx tsc --noEmit` bersih.
- `npm run lint -- --quiet` bersih.
- Query `getPesananForDashboard` diuji langsung: 5 baris pesanan kembali tanpa error.

## Catatan
- `npm run graph:update` gagal: executable `graphify` tidak tersedia di PATH/node_modules environment ini.
- Belum dijalankan: build (dev server user aktif).

## Berikutnya
- Bersihkan 22 baris log reservasi usang bila disetujui user.
- Pertimbangkan judul sticky di header dashboard agar tetap terlihat saat scroll.

---

# PROGRESS - Sesi 2026-11-10 (Latihan uji operasi DB di file terpisah)

> Menyimpan 5 test case operasi database ke file terpisah + menjelaskan konsep dasar testing.

## Selesai
- File baru latihan: `src/test/unit/app/actions/meja-operasi.test.ts` (102 baris) — 5 test case operasi DB (getMeja x2, createMeja x2 + it.each, kosongkanMeja x1).
- Konsep dijelaskan: `describe`, `it`, `expect`, `.mockResolvedValue/Once`, `beforeEach/afterEach`, `vi.mock/hoisted`.

## Hasil verifikasi
- `npx vitest run src/test/unit/app/actions/meja-operasi.test.ts` -> 7/7 passed.
- `npx vitest run` (full) -> 36 file passed / 1 skipped, 667 passed / 1 skipped.
- `npx eslint` pada file baru -> bersih (0 error).

## Berikutnya
- Lanjut rencana whitebox testing / implementasi test berikutnya.

---

# PROGRESS - Sesi 2026-11-08 (Rencana integration testing)

> Menyusun rencana integration testing semua alur (belum implementasi) dan merapikan branch testing.

## Selesai
- Branch: `test/whitebox` jadi branch utama whitebox; `test/blackbox` gabungan e2e modul 1-2; `test/whitebox-unit-restructure` dihapus (sudah ter-merge); `develop` berisi merge `test/whitebox`.
- `.opencode/INTEGRATION_TESTING_PLAN.md`: rencana 5 alur (pesanan+pembayaran, stok dapur, shift, refund, voucher), helper truncate, prasyarat `.env.test`/`prisma migrate deploy`, DoD.

## Hasil verifikasi
- `npx vitest run` (test/whitebox & develop): 35 file passed / 1 skipped, 660 passed / 1 skipped.

## Catatan
- Model `Voucher` tidak punya kolom kuota; skenario voucher disesuaikan (validasi diskon + relasi pemakaian).
- Integration test belum dieksekusi (butuh kredensial Supabase `pringmoni_test`).

## Berikutnya
- Isi `.env.test`, `prisma migrate deploy`, implement helper + 5 file integration.

---

# PROGRESS - Sesi 2026-11-07 (Whitebox: rencana ke depan + commit unit test S0-S6)

> Menyimpan item-item testing yang masih pending sebagai rencana di WHITEBOX_TESTING_PLAN (§8.5), lalu commit unit testing whitebox yang sudah selesai ke branch baru.

## Selesai
- §8.5 WHITEBOX_TESTING_PLAN: item component test React (jsdom belum terpasang), E2E Playwright (out of scope), load/performance (PBI-9.3), integration test DB nyata (butuh Supabase test + `.env.test`), CI/CD (Todo) disimpan sebagai rencana penting ke depan.

## Hasil verifikasi
- `npx vitest run`: 35 file passed / 1 skipped, 660 passed / 1 skipped (661).

## Catatan
- Unit testing S0-S6 sudah selesai; item §8.5 ditunda ke depan.

## Berikutnya
- (Opsional) Supabase project baru + `.env.test` -> jalankan integration test.
- (Opsional) Pasang jsdom untuk component test.

---

# PROGRESS - Sesi 2026-11-06 (Whitebox Testing S1-S3 lanjutan)

> Melanjutkan backlog coverage S1-S3 dari `.opencode/WHITEBOX_TESTING_PLAN.md`. Commit belum dibuat.

## Selesai
- S1: file baru `src/test/unit/lib/auth.test.ts` (18 test) — `authorize` (kredensial kosong, user tidak ada/nonaktif, password salah, sukses + deviceId, P1001/DatabaseNotReachable -> `DATABASE_ERROR`, error lain diteruskan), `jwt` (simpan user, `takenOver` saat versi beda, catat aktivitas, id non-angka, versi non-angka), `session` (mapping + default + token null).
- S2: `pesanan.test.ts` +13 fungsi (menu customer, dashboard, pembayaran, checkout, status customer, konfirmasi, cancel expired, pindah meja, update nama, dll).
- S3: `shift.test.ts` + `getShiftAktif`, `getRiwayatShift`, `getSisaPesanan`, `getDaftarKasir` sukses, `getDaftarKasirLengkap`.
- UI report `src/app/dashboard/testing/report.ts`: status S1-S3 -> `selesai` dengan angka coverage aktual.
- Dokumen: status implementasi + DoD + changelog `WHITEBOX_TESTING_PLAN.md` disinkronkan.

## Hasil verifikasi
- `npx vitest run` (suite penuh via `npm run test:report`): hijau; 71 test di `shift.test.ts`, 87 di `pesanan.test.ts`, 18 di `auth.test.ts`.
- `npx tsc --noEmit`: bersih (0 error).
- `npm run lint -- --quiet`: **0 error, 40 warning** (pre-existing).
- `npm run test:report`: coverage global **94,69% stmt / 88,92% branch / 96,35% func / 95,42% line**.
- Per file: `lib/auth.ts` 100/97,22/100/100; `pesanan.ts` 99/90,55/97,29/98,94; `shift.ts` 94,75/85,27/100/97,61.

## Catatan
- Seluruh test tetap **unit test**: Prisma/auth/Pusher/`revalidatePath`/`next/headers` di-mock; **tidak ada akses DB/network nyata**.
- 8.4 Integration Test tetap **belum**: butuh test database PostgreSQL terisolasi + persetujuan user; di luar DoD iterasi ini.
- `src/lib/upload.ts` dan `lib/logout-storage.ts` masih 0% (boundary eksternal/DOM), bukan target S1-S3.

## Berikutnya
- (Opsional, butuh persetujuan) Implementasi 8.4 dengan test DB terisolasi.
- `npm run graph:update` lalu commit bila diminta user.

---

# PROGRESS - Sesi 2026-11-05 (Whitebox Testing S3-S6)

> Eksekusi S3 (Pembayaran/Kasir/Shift), S4 (High Support), S5 (Medium CRUD), dan S6 (Finalisasi) dari `.opencode/WHITEBOX_TESTING_PLAN.md`. Commit belum dibuat.

## Selesai
- Restrukturisasi test ke `src/test/unit/{app/actions,lib}` + `src/test/unit/proxy.test.ts`; folder `src/test/integration/` disiapkan (masih kosong).
- S3: `kasir.test.ts`, `shift.test.ts`, `lib/{shift,jadwal,fee,print-struk}.test.ts` (total 236 test saat itu).
- S4: `refund.test.ts`, `notifikasi.test.ts`, `dashboard.test.ts`, `laporan.test.ts`, `stok-bahan.test.ts`, `lib/export-laporan.test.ts`.
- S5: `users.test.ts`, `meja.test.ts`, `voucher.test.ts`, `logs.test.ts`, perluasan `menu.test.ts` (CRUD menu & kategori), plus `lib/log.test.ts`, `menu-foto.test.ts`.
- Tambahan S6: `lib/stok.test.ts` (7 test) — agregasi resep, clamp stok 0, status `tersedia/menipis/habis`, filter `tipe: dapur` + `deletedAt: null`, idempotensi `stokDeducted`.
- Helper `fixtures.ts`: `kategoriMenuFixture` + `deletedAt` (untuk uji restore soft-delete).
- Perbaikan type: `lokasi: 'dapur'` -> `'cafe'` di `menu.test.ts`; `waiterUsername` ditambahkan pada fixture `ItemLaporanPesanan` di `export-laporan.test.ts`.

## Hasil verifikasi
- `npx vitest run`: **27 file, 526 test passed**; stabil pada 3x run berturut-turut (termasuk run coverage).
- `npx tsc --noEmit`: bersih (0 error).
- `npm run lint -- --quiet`: **0 error, 40 warning** (semua pre-existing di kode aplikasi/plugin, bukan file test).
- `npm run test:coverage`: lolos gate global — statement **76,01%**, branch **63,89%**, function **79,55%**, line **77,38%** (threshold 70/60/70/70).
- Coverage per area: `src/lib/stok.ts` 96,29% stmt / 94,44% branch; `export-laporan.ts` 100% stmt/line; `menu.ts` 99,09%, `users.ts` 92,85%, `laporan.ts` 86,03%.
- Waiver coverage (belum jadi target iterasi): `kasir.ts` 31,73%, `pesanan.ts` 54,48%, `shift.ts` 68,18%; lib dengan 0% karena butuh boundary eksternal/DOM: `auth.ts`, `pusher.ts`, `email.ts`, `catatan-item.ts`, `kategori-icon.ts`.

## Catatan
- Seluruh test tetap **unit test**: Prisma/auth/Pusher/`revalidatePath`/`next/headers` di-mock; **tidak ada akses DB/network nyata**.
- Integration test (Prisma nyata + rollback) hanya **direncanakan** di `WHITEBOX_TESTING_PLAN.md` §8.4; belum diimplementasikan.
- Perubahan WIP lain di working tree tidak disentuh.

## Berikutnya
- (Opsional) Implementasi integration test sesuai §8.4 setelah test DB terisolasi tersedia.
- Commit bila diminta user (usulan: `test(whitebox): selesaikan unit test S3-S6 + coverage gate`).

---

# PROGRESS - Sesi 2026-11-05 (Whitebox Testing S2)

> Eksekusi S2 (Pesanan & Stok Gate) dari `.opencode/WHITEBOX_TESTING_PLAN.md`. Commit belum dibuat.

## Selesai
- Test baru: `src/app/actions/pesanan.test.ts` (44 test), `menu.test.ts` (16 test).
- Cakupan pesanan: token meja invalid, menunggu pembayaran, item kosong, menu tidak ada/nonaktif, stok kurang, agregasi item, voucher tidak ada/nonaktif/minimal/valid, sukses + potong stok + status habis, rollback `newStok < 0`, menu hilang di transaksi, customer tanpa session, update status, cancel, mark selesai + potong stok dapur, toggle item diantar, daftar meja pindah, semua cabang `pindahMeja`.
- Cakupan menu: stok harian negatif/non-integer/0/positif, menu tidak ada/nonaktif, set semua menu, set per kategori, kategori tidak ada.
- `npm test` -> **8 file, 123 test passed**.
- `npx tsc --noEmit` bersih; eslint terarah pada 2 file test bersih.
- Coverage terarah `pesanan.ts` + `menu.ts`: statement 50,12%, branch 42,37%, function 33,33%, line 50,38% (fungsi lain di kedua file belum menjadi target S2; threshold global tetap sengaja merah).

## Catatan
- File yang ditambah: `src/app/actions/{pesanan,menu}.test.ts`.
- Perubahan WIP lain di working tree **tidak disentuh**.

## Berikutnya
- S3: Pembayaran, Kasir, Shift (`kasir.test.ts`, `shift.test.ts`, `lib/{shift,jadwal,fee,print-struk}.test.ts`).

---

# PROGRESS - Sesi 2026-11-05 (Whitebox Testing S1)

> Eksekusi S1 (Auth & Sesi) dari `.opencode/WHITEBOX_TESTING_PLAN.md`. Commit belum dibuat.

## Selesai
- Test baru: `src/app/actions/login.test.ts` (16 test), `logout.test.ts` (3), `reset-password.test.ts` (12).
- Cakupan: rate limit dulu, kredensial kosong, user tidak ada/nonaktif, bcrypt gagal, DB `P1001`/error umum, sukses + log + reset limit, sesi lain aktif -> `perluKonfirmasi`, `takeover=1`, device sama, URL error `signIn`, `DATABASE_ERROR` (message & cause), logout, forgot/reset password, token invalid/kedaluwarsa, hash password.
- `npm test` -> **6 file, 63 test passed**.
- Coverage terarah: `login.ts` statement/line/function **100%**, branch **92,15%** (target >=85%); `logout.ts`, `forgot-password.ts`, `reset-password.ts`, `reset-password-confirm.ts` **100%** semua metrik.
- `npx tsc --noEmit` bersih; eslint terarah pada 3 file test bersih.

## Catatan
- File yang ditambah: `src/app/actions/{login,logout,reset-password}.test.ts`.
- Perubahan WIP lain di working tree **tidak disentuh**.
- Threshold coverage global masih sengaja merah sampai S2-S5 menambah test.

## Berikutnya
- S2: Pesanan & Stok Gate (`pesanan.test.ts`, `menu.test.ts`).

---

# PROGRESS - Sesi 2026-11-05 (Whitebox Testing S0)

> Eksekusi S0 dari `.opencode/WHITEBOX_TESTING_PLAN.md`. Commit belum dibuat.

## Selesai
- Coverage V8 aktif: pasang `@vitest/coverage-v8@4.1.1` (devDependency) + blok `coverage` dan threshold di `vitest.config.ts`.
- Script baru `npm run test:coverage`.
- Helper test: `src/test/helpers/prisma-mock.ts`, `auth-mock.ts`, `fixtures.ts`.
- Enhance test existing:
  - `src/proxy.test.ts`: role `kitchen`, route `/dashboard/shift`, sesi `takenOver` (hapus cookie + redirect), 12 test.
  - `src/lib/rate-limiter.test.ts`: boundary blokir 5 menit, reset jendela 15 menit, record saat diblokir.
  - `src/lib/sesi.test.ts`: cache versi sesi (TTL 3 detik), throttle aktivitas 2 menit, fail-open saat DB error.
- `npm test` -> **3 file, 32 test passed**.
- `npm run test:coverage` -> laporan terbentuk; baseline statement **5,05%**, branch **5,10%**, function **3,64%**, line **4,89%**. Threshold 70/60 sengaja belum terpenuhi sampai S1-S5.
- `npx eslint` pada file yang diubah -> bersih (0 error).

## Catatan
- `npm run lint` penuh melewati timeout 5 menit di environment ini; verifikasi dilakukan dengan eslint terarah pada file yang berubah.
- File yang diubah/ditambah: `vitest.config.ts`, `package.json`, `package-lock.json`, `src/proxy.test.ts`, `src/lib/rate-limiter.test.ts`, `src/lib/sesi.test.ts`, `src/test/helpers/*`.
- Perubahan WIP lain di working tree (shift, dashboard, dll.) **tidak disentuh**.

## Berikutnya
- S1: Auth & Sesi (`login.test.ts`, `logout.test.ts`, `reset-password.test.ts`).

---

# PROGRESS - Sesi 2026-11-04

> Lanjutan penyelesaian checklist sesi sebelumnya. Commit belum dibuat (menunggu instruksi user).

## ✅ SELESAI (verifikasi & pembersihan)

- `npx vitest run src/proxy.test.ts` → 8/8 passed.
- `npx tsc --noEmit` → bersih (0 error).
- `npm run lint` → 0 error, 40 warning; semua warning pre-existing (bukan dari perubahan sesi ini).
- Warning `stok-bahan.ts` `'tipe' is defined but never used` **pre-existing** (commit `ec915acd`, 2026-10-28). Diperbaiki: parameter `tipe` dihapus dari `resetAllStokBahan()` (dialog memang "Hapus Semua") + caller `page.tsx`.
- File demo `src/components/layout/notifikasi-contoh.ts` **dihapus** dan wiring `CONTOH_NOTIFIKASI` dilepas dari `StaleNotificationBell.tsx` (sesuai CONVENTIONS §5: dilarang file `*-contoh.ts` di `src/`).
- `LogoutButton.tsx` dipertahankan (komponen nyata: dialog konfirmasi logout).
- BOM + missing newline pada `src/app/actions/notifikasi.ts` diperbaiki.
- `npm run graph:update` dijalankan (tanpa snapshot harian). Statistik terakhir: **2644 nodes, 4032 edges, 164 communities**.

## 🧹 Rampingkan graphify (2026-11-04)

- Hapus **20 folder snapshot harian** `graphify-out/20YYYY-MM-DD/` (~32,1 MB) — informasi tetap ada di `graphify-out/` umum + riwayat git.
- Tambah `graphify-out/20*/` ke `.gitignore` agar snapshot harian tidak ikut ter-commit lagi.
- Tambah script `npm run graph:update` di `package.json` yang menjalankan `graphify update .` dengan `GRAPHIFY_NO_BACKUP=1` (cross-shell PowerShell/Git Bash) sehingga tidak membuat folder tanggal baru.
- `AGENTS.md` diperbarui: gunakan `npm run graph:update`, bukan `graphify update .` polos.
- `AGENTS.md` SESSION STARTUP ditambah langkah **6**: jalankan `npm run graph:update` lalu cari kode lewat `graphify query/path/explain` (bukan `rg`/`grep` untuk eksplorasi umum).
- Tambah bagian **"Aturan Hemat Token (WAJIB)"** di `AGENTS.md`: larangan baca `graph.json`/`graph.html`/`manifest.json`, `git diff --stat` dulu, query `--budget 400` + `context_filter=['call']`, `rg -n ... -m 5` lalu baca ±15 baris, `read` pakai `offset`/`limit`, `npm run lint -- --quiet`, dokumen startup dibaca sekali per sesi.
- Hasil update terakhir: 2644 nodes, 4032 edges, 164 communities; hanya `graphify-out/` umum yang berubah.

## ⏳ BELUM / MENUNGGU KEPUTUSAN

- **WIP fitur notifikasi dashboard** — `src/app/actions/notifikasi.ts`, `src/components/layout/StaleNotificationBell.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/LogoutButton.tsx` masih uncommitted; perlu keputusan user apakah masuk commit atau ditunda.
- **Perubahan siap commit (ramping graphify + cleanup)** — `.gitignore`, `package.json`, `AGENTS.md`, `graphify-out/` umum, `PROGRESS.md`, hapus 20 folder snapshot + `src/lib/resep.ts`, `src/proxy.ts`/`src/proxy.test.ts`, `src/app/actions/stok-bahan.ts`, `src/app/dashboard/stok-bahan/page.tsx`.
- **Commit belum dibuat** (menunggu instruksi eksplisit user). Usulan pesan: `chore(graphify): rampingkan snapshot harian + aturan hemat token`.

---

# PROGRESS - Sesi 2026-09-02

> Catatan progres pekerjaan. Lanjutkan dari bagian "BELUM SELESAI" di bawah.

## ✅ SELESAI

### 1. Teks "Coret item" → "Tandai item"
- Sudah terverifikasi: kode sudah memakai **"Tandai Item"** di `src/app/dashboard/pesanan/page.tsx` (baris ~547 & ~899). Tidak perlu diubah.

### 2. Fix bug checkbox waiter
- `src/app/dashboard/pesanan/page.tsx`:
  - `toggleItemCheck` diperbaiki: state diambil dari `checkedMap` saat ini (bukan toggle buta) → tidak ada race condition saat klik cepat.
  - Ganti `<input type="checkbox">` native (yang `pointer-events-none`) dengan **shadcn/ui `<Checkbox>`** yang proper & bisa diklik, warna `chart-5` saat tercentang.

### 3. Delay navigasi halaman (loading.tsx)
- Ditambahkan `loading.tsx` di semua sub-route dashboard yang belum punya:
  - `pesanan`, `kasir`, `menu`, `meja`, `users`, `laporan`, `logging`
- Semua memakai `PageLoader` (spinner emerald + overlay gelap `bg-black/40 backdrop-blur`).

### 4. Voice notifikasi pesanan masuk & dibayar
- Sudah ada di `src/hooks/use-notification.ts` (file untracked, sudah ada sebelum sesi ini):
  - `notifyNewOrder`: beep ganda + voice "Pesanan baru dari meja X..."
  - `notifyOrderPaid`: beep triple + voice "Pesanan dari meja X telah dibayar..."
- Sudah ter-wire di `pesanan/page.tsx` & `kasir/page.tsx`. **Tidak diubah.**

### 5. Animasi loading + overlay gelap
- Sudah ada di `src/components/ui/page-loader.tsx` (spinner + overlay). Dipakai semua `loading.tsx`. **Tidak diubah.**

### 6. Responsive HP & tablet
- Customer menu grid: `grid-cols-3` → `grid-cols-2 sm:grid-cols-3`
- Login card: `max-w-md sm:max-w-2xl`
- Pesanan page: tabel riwayat `overflow-x-auto` + kolom disembunyikan di mobile (Pelanggan/Items/Waktu), stat cards responsive, modal `max-w-[95vw] sm:max-w-2xl`
- **CATATAN**: Header (judul + tab buttons) di pesanan & kasir page **DIKEMBALIKAN ke ukuran semula** (`text-2xl`, `size="lg" text-base px-6`) atas permintaan user.

### 7. Icon logout nempel ke kanan
- `src/components/layout/Header.tsx`: `grid grid-cols-3` → `flex items-center justify-between w-full`
- `src/components/layout/DashboardClient.tsx`: padding header `px-4 md:px-6` (dikembalikan, ada margin kanan-kiri)
- Tombol logout diberi `mr-1` agar tidak terlalu nempel.

### 8. Optimasi delay >5 detik
- `src/app/actions/dashboard.ts` `getDashboardStats`:
  - `findMany` → `count` + `aggregate` (query di DB, jauh lebih cepat)
- `src/app/actions/kasir.ts` `getPesananBelumBayar`:
  - Ditambahkan `take: 50` limit (dipanggil polling tiap 5 detik)

### 9. Animasi loading di loading state lokal
- Diganti text polos "Memuat..." → spinner emerald berputar di:
  - `pesanan/page.tsx` (loading utama + 2 modal detail)
  - `pesanan/[id]/page.tsx`
  - `menu/page.tsx`, `meja/page.tsx`, `users/page.tsx`, `logging/page.tsx` (spinner kecil di tabel)
  - `kasir/pesanan-baru/page.tsx`
  - `(customer)/[tokenMeja]/page.tsx` (loading menu)
- Kasir page & customer pesanan/checkout sudah pakai `Loader2` (tidak diubah).

## ⏳ BELUM SELESAI

### A. Optimasi laporan (belum dikerjakan)
- `src/app/actions/laporan.ts` `getLaporanAll` / `getLaporanBanding`:
  - Menjalankan 7 query laporan sekaligus (`Promise.all`) — bisa lambat jika data banyak.
  - Perlu dicek apakah ada `findMany` tanpa limit yang bisa dioptimalkan.

### B. Verifikasi (belum dijalankan)
- `npm run lint` dan `npm run build` belum dijalankan setelah semua perubahan.
- Catatan: error `no-explicit-any` di `kasir/page.tsx` (baris 205, 304, 946) & warning di `pesanan/page.tsx` (Link, jumlahLunas, handleUpdateStatus) **sudah ada sebelum sesi ini** — bukan dari perubahan kita.

## 📁 File yang Diubah (sesi ini)
- `src/app/dashboard/pesanan/page.tsx` (checkbox, responsive, loading)
- `src/app/dashboard/kasir/page.tsx` (responsive, take:50 di action)
- `src/app/actions/dashboard.ts` (optimasi stats)
- `src/app/actions/kasir.ts` (take:50)
- `src/components/layout/Header.tsx` (logout nempel kanan)
- `src/components/layout/DashboardClient.tsx` (padding header)
- `src/app/dashboard/pesanan/[id]/page.tsx` (loading)
- `src/app/dashboard/menu/page.tsx`, `meja/page.tsx`, `users/page.tsx`, `logging/page.tsx` (loading)
- `src/app/dashboard/kasir/pesanan-baru/page.tsx` (loading)
- `src/app/(customer)/[tokenMeja]/page.tsx` (responsive grid + loading)
- `src/app/(auth)/login/page.tsx` (responsive card)
- `src/app/dashboard/laporan/page.tsx` (heading)
- `src/app/dashboard/page.tsx` (heading)
- `src/app/dashboard/{pesanan,kasir,menu,meja,users,laporan,logging}/loading.tsx` (baru)

## 🔜 Langkah Besok
1. Optimalkan `getLaporanAll` / `getLaporanBanding` di `laporan.ts` jika ada query berat.
2. Jalankan `npm run lint` & `npm run build`.
3. Perbaiki error/warning yang muncul (kalau ada yang baru).
