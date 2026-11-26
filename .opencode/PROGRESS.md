# PROGRESS - Sesi 2026-11-17 (Skeleton dashboard per role)

> Menyamakan ketentuan skeleton dashboard untuk role selain OWNER (CASHIER / WAITER / KITCHEN).

## Selesai
- `src/app/dashboard/loading.tsx`: `await auth()` + preset per role — judul teks asli (`Dashboard Owner` / `Dashboard Kasir` / `Dashboard Waiter` / `Dashboard Kitchen`), stat card 4/3/3/3, chart card 4/2/2/0 sesuai konten asli tiap role. Fallback `owner` bila sesi gagal dibaca.
- Skeleton waiter disesuaikan dengan kartu asli: 3 kartu stat berjudul teks asli + placeholder ikon, chart `Pesanan Per Jam` `h-48`, chart `Status Antar Item` pie `h-24 w-24` + legenda.
- Loading internal kasir tidak lagi menghilangkan judul: `Kelola Kasir`, `Buat Pesanan Baru`, `Pembayaran` dirender teks asli lewat `PageTitle` (`kasir/page.tsx`, `kasir/pesanan-baru/page.tsx`, `kasir/pesanan-baru/[id]/page.tsx`).
- `src/app/dashboard/page.tsx`: perbaikan judul role `kitchen` (sebelumnya tampil "Dashboard Waiter").
- `.opencode/SKELETON_PLAN.md`: aturan judul diperbarui + tambah matriks preset per role (5.1).

## Berikutnya
- Verifikasi visual skeleton di tiap role saat dev server aktif.

---

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
# PROGRESS - Sesi 2026-11-17 (Status awal reservasi customer)

## SELESAI

- `/reservasi/[kodeAkses]/cek`: badge tidak lagi langsung "Terkonfirmasi" setelah reservasi dibuat. Status awal kini **Menunggu DP** (amber) dengan keterangan verifikasi DP; "Terkonfirmasi" hanya muncul bila `dpStatus === "berhasil"`.
- `createReservasiCustomer` mengembalikan `statusReservasi` (`menunggu_kedatangan`) dan `dpStatus` (`menunggu`); keduanya disimpan ke `sessionStorage` lewat `HasilReservasi` dan dipetakan ke halaman cek, sehingga data lokal konsisten dengan data dari `cekStatusReservasi`.

## VERIFIKASI

- `npx tsc --noEmit` -> 0 error.
- `npx eslint` pada 4 file yang diubah -> 0 error.
- `npm run graph:update` -> selesai.

---

# PROGRESS - Sesi 2026-11-17 (Badge status meja)

## SELESAI

- `/dashboard/meja`: badge status di kolom QR (yang menampilkan kode reservasi + nama pelanggan) **dihapus** karena sudah ada kolom Status tersendiri; fungsi `getMejaMarker()` juga dihapus. Kolom status tetap menampilkan `Kosong` / `Dipesan` / `Terpakai`.

## VERIFIKASI

- `npx tsc --noEmit` -> 0 error.
- `npx eslint "src/app/dashboard/meja/page.tsx" --quiet` -> 0 error.
- `npm run graph:update` -> selesai.

---

# PROGRESS - Sesi 2026-11-17 (Akses kasir /dashboard/reservasi)

## SELESAI

- **Role cashier lebih tahan banting**: `src/app/dashboard/reservasi/page.tsx` kini memakai fallback `useUserRole()` (role dari session server di layout) bila `useSession()` belum memuat role, dengan normalisasi huruf kecil + alias `kasir` -> `cashier`, mengikuti pola halaman `kasir`/`pesanan`.
- `src/proxy.ts`: `normalizeRoleValue()` menormalkan role sebelum pengecekan akses route, sehingga role legacy `kasir`/huruf besar tidak membuat cashier dilempar ke `/login`.
- `src/app/actions/reservasi.ts`: `requireReservasiRole()` menormalkan role; pengecekan ganda `role !== "cashier"` di `verifikasiDpCustomer` dihapus (sudah dijamin oleh guard).
- `Sidebar.tsx` & `DashboardClient.tsx`:(menu desktop/mobile + `ShiftSidebarStatus`) juga memakai role ternormalisasi.

## VERIFIKASI

- `npx tsc --noEmit` -> 0 error.
- `npx eslint` pada 5 file yang diubah -> 0 error.
- `npm run graph:update` -> selesai.

## BELUM

- Uji manual login sebagai user cashier lalu buka `/dashboard/reservasi`.

---

# PROGRESS - Sesi 2026-11-17 (Feedback halaman Reservasi Berhasil)

## SELESAI

- **Halaman sukses dipisah dari form**: sukses reservasi kini di halaman `/reservasi/[kodeAkses]/cek` (`src/app/reservasi/[kodeAkses]/cek/page.tsx`). Form (`[kodeAkses]/page.tsx`) menyimpan hasil ke `sessionStorage` via `src/lib/reservasi-hasil.ts` lalu `router.push` ke halaman cek; blok `if (hasil)` di form dihapus.
- **Cek reservasi jadi popup**: halaman cek memakai `Dialog` input kode reservasi + nomor HP (`cekStatusReservasi`), bukan halaman tersendiri. `/reservasi/status` kini hanya redirect ke halaman cek.
- **Tombol kembali ada peringatan**: dialog konfirmasi ("kode tidak akan tampil lagi") lalu mengarahkan ke form reservasi (bukan beranda). Form juga punya entry point "Cek Reservasi" di header.
- **Proxy**: `RESERVASI_PUBLIC_PATTERN` diperluas untuk `/reservasi/[kodeAkses]/cek` (tetap tanpa login).
- **Visibilitas entry point**: header form memakai tombol outline emerald "Cek Reservasi" (teks selalu tampil) + banner "Sudah punya reservasi?" dengan tombol Cek di atas langkah 1.
- **Dokumen**: PRD (PBI-7.1) + ARCHITECTURE (route) diperbarui; `npm run graph:update` dijalankan.

## VERIFIKASI

- `npx tsc --noEmit` -> 0 error.
- `npx eslint` pada file yang diubah -> 0 error. `npm run lint -- --quiet` penuh timeout (>180s).
- `npm run build` belum dijalankan (dev server user mungkin aktif).

## BELUM

- Uji manual E2E alur form -> halaman cek -> popup cek -> dialog kembali.

---

# PROGRESS - Sesi 2026-11-17 (Penandaan Status Meja + QR Reservasi)

## SELESAI

- **Penandaan meja ber-token QR**: `src/app/dashboard/meja/page.tsx` kini menampilkan mark di kolom QR (badge `Dipesan`/`Terpakai` saat `statusMeja` bukan `kosong`) dan dialog QR menampilkan badge status + frame berwarna (hijau `kosong` → merah `terpakai` / amber `dipesan`) serta info reservasi aktif (`kodeReservasi`, nama pelanggan, jumlah orang, kedatangan).
- **Server**: `getMeja` di `src/app/actions/meja.ts` mengembalikan `reservasiAktif` terbaru per meja (dari reservasi `menunggu_kedatangan` / `dikonfirmasi`).
- **Header reservasi** kini tampil di tengah: `/dashboard/reservasi` (judul + tombol), `/reservasi/[kodeAkses]` ("Reservasi Meja", tombol kembali tetap kiri), dan `/reservasi/status` ("Cek Status Reservasi", tombol kembali tetap kiri).

## VERIFIKASI

- `npx tsc --noEmit` -> 0 error.
- `npm run lint -- --quiet` -> 0 error (44 warning pre-existing, tidak dari file yang diubah).

## BELUM

- `npm run build` (menunggu dev server user dimatikan).
- `npm run graph:update` setelah perubahan ini.
- Uji manual E2E meja/reservasi.

---

# PROGRESS - Sesi 2026-11-15 (Link Reservasi Umum + Window 7 Hari)

> Branch `feat/reservasi-customer-qr`; commit dibuat di akhir sesi, tanpa PR.

## SELESAI

- **Link reservasi umum**: `src/lib/reservasi-akses.ts` (kode publik `PRINGSEWU26` + `LINK_RESERVASI_PUBLIK`). Route di-rename `src/app/reservasi/[tokenMeja]` -> `src/app/reservasi/[kodeAkses]`; customer memilih meja kosong dari daftar (termasuk meja tanpa QR). Server `createReservasiCustomer` menerima `kodeAkses` + `mejaId` dan memvalidasi meja kosong secara transaksional.
- **Window 7 hari konsisten**: `batasAkhirReservasi()` = akhir hari H+7 (8 tanggal), chip memakai `i <= MAKS_HARI_KE_DEPAN`, daftar tanggal dihitung ulang tiap menit dan tanggal terpilih di-reset saat melewati tengah malam.
- **UI tanggal**: select Bulan/Tahun + helper `aturTanggal`/`bulanDalamRentang`/`hariDalamRentang`/`opsiTahun` dihapus; chip tanggal diperbesar (grid), teks info diringkas.
- **Agentation**: toolbar hanya dirender saat `NODE_ENV === "development"`.
- **Link menu customer**: tombol Reservasi memakai `LINK_RESERVASI_PUBLIK`.
- **Verifikasi**: `npm run lint -- --quiet` -> 0 error; `npm test` -> 34 test lulus; `npx tsc` via config sementara (tanpa `.next`) -> 0 error.
- **Dokumen**: PRD (catatan PBI-7.1), ARCHITECTURE (route + server action), PROGRESS.

## BELUM

- Uji manual E2E (dilewati atas permintaan user).
- `npm run build` belum dijalankan (menunggu dev server user dimatikan).

---

# PROGRESS - Sesi 2026-11-14 (Jadwal Reservasi Tetap + Rencana Owner Settings)

> Branch aktif; perubahan belum di-commit (menunggu instruksi user).

## SELESAI

- **Jadwal reservasi tetap**: `src/lib/reservasi-jadwal.ts` berisi konstanta 13:00–21:00, kedatangan terakhir 20:30, slot 30 menit, maksimal 7 hari, serta helper `validasiWaktuKedatangan`, `hitungBatasKonfirmasi`, `periodeJam`, `formatMenit`, `SLOT_RESERVASI`.
- **Cap konfirmasi DP**: `batasKonfirmasi = min(kedatangan + expiry, jam tutup 21:00)` diterapkan di reservasi customer dan offline.
- **Reservasi customer**: `src/app/actions/reservasi-customer.ts` memakai helper jadwal; `src/app/reservasi/[tokenMeja]/page.tsx` memakai slot 30 menit, tab sesi Siang/Sore/Malam, validasi terpusat, dan teks kebijakan cap 21:00.
- **Mobile footer**: action bar customer dinaikkan (`bottom-14 sm:bottom-9`) agar tombol Lanjut tidak menutupi footer yang bisa wrap 2 baris di HP.
- **Reservasi offline**: `src/app/actions/reservasi.ts` memvalidasi jam operasional dan memakai cap yang sama.
- **Test**: `src/lib/reservasi-jadwal.test.ts` — 10 test lulus (slot, periode, validasi, cap).
- **Verifikasi**: `npx eslint` file terkait → 0 error (2 warning pre-existing di halaman customer); `npx tsc --noEmit` → hanya error stale `.next/types/validator.ts` untuk halaman `testing` yang sudah dihapus.
- **Dokumen rencana owner**: `.opencode/RESERVASI_PLAN.md` §8 ditambahkan (status RENCANA, belum diimplementasi). Implementasi owner settings yang sempat dibuat sudah dikembalikan seluruhnya.
- **PRD**: catatan PBI-7.1 diperbarui dengan jadwal tetap + cap DP.

## BELUM

- Implementasi pengaturan jam oleh owner (menunggu persetujuan rencana §8).
- Update `graph:update` setelah perubahan sesi ini.
- Uji manual E2E: slot customer 13:00–20:30, tolak slot di luar jam, cap DP 21:00, reservasi offline di luar jam ditolak.
- Commit/PR (belum diminta user).

# PROGRESS - Sesi 2026-11-15 (Refund & Polish Reservasi)

> Branch `feature/refund-reservasi-polish`, di atas `feat/reservasi-customer-qr` (`0aa78f9`).

## SELESAI

- Refund: batas 3 hari (`src/lib/refund.ts`), validasi server di `ajukanRefund`, tombol refund tetap tampil di Riwayat Pesanan (disabled jika lewat 3 hari), dihapus dari tabel Riwayat Kasir, refund kasir hanya dari detail pesanan aktif.
- Pesanan Aktif hanya menampilkan pesanan 24 jam terakhir; riwayat kasir mengambil 300 baris agar bukti refund lama tetap terjangkau.
- Reservasi: form staf 3 langkah (detail -> menu -> DP), chip acara + catatan terstruktur (`src/lib/reservasi-catatan.ts`), penekanan sisa pelunasan; halaman customer menyesuaikan alur dan catatan.
- Auth/proxy: bypass server action `/dashboard/reservasi` + guard `takenOver` agar tidak memicu E394.
- Hidrasi: sanitizer atribut `bis_skin_checked` via `next/script` `beforeInteractive` di root layout.

## VERIFIKASI

- `npm run lint` 0 error (warning pre-existing).
- `npx tsc --noEmit` 0 error.
- `npm test` 24/24 passed.
- `npm run graph:update` dijalankan.

## BELUM

- Uji manual end-to-end refund & reservasi.

---

# PROGRESS - Sesi 2026-11-04 (Reservasi PBI-7.1)

> Branch `feat/reservasi`, di atas `origin/develop` `08fb1be`. Commit belum dibuat (menunggu instruksi user).

## ✅ SELESAI

- Fast-forward merge `origin/develop` (`2e0226f..08fb1be`); WIP reservasi lama di stash/backup diterapkan ulang.
- Schema: `StatusReservasi`, model `Reservasi` + `DetailReservasi`, `StatusMeja.dipesan`, 4 aksi log reservasi, relasi lawan di `Users`/`Meja`/`Menu`/`Pesanan`.
- Migrasi: `npx prisma validate` valid, `npx prisma generate` sukses, `npx prisma db push` sinkron.
- `src/app/actions/reservasi.ts`: create/get/confirm/cancel/expire/getMeja, type-safe, validasi `stokManual`, transaksi, log, Pusher.
- `src/app/dashboard/reservasi/page.tsx`: daftar/filter/cari, form reservasi + pre-order, konfirmasi/batal, auto-expire saat load.
- Integrasi: sidebar (owner/cashier/waiter), proxy guard, tipe `StatusMeja`, log, halaman meja (label/filter/aksi), `deleteMeja` + `kosongkanMeja`.
- Fix bug pre-existing `src/components/ui/switch.tsx`: `cn` import `"cn"` → `"@/lib/utils"`.
- Verifikasi: `npx tsc --noEmit` 0 error; `npm run lint -- --quiet` 0 error; `npm run build` sukses (route `/dashboard/reservasi` terbentuk).
- Dokumentasi: `.opencode/RESERVASI_PLAN.md`, `.opencode/RESERVASI_IMPLEMENTATION.md`; PRD PBI-7.1 → Done.
- Fix error `npm run graph:update`: install CLI `graphifyy` 0.9.102 via pip (+ `graphifyy[sql]`), lalu update graph berhasil — **2712 nodes, 4326 edges, 189 communities**. Graphify juga me-refresh `.opencode/plugins/graphify.js` + `.opencode/opencode.json` untuk kompatibilitas OpenCode 2.
- `.next` dibersihkan setelah build; dev server dihentikan sementara dan perlu dijalankan ulang user.

## ⏳ BELUM

- Uji manual end-to-end (lihat checklist di `RESERVASI_IMPLEMENTATION.md`).
- Commit/PR (belum diminta user).
- Opsional: partial unique index 1 reservasi aktif per meja; edit/reschedule; reservasi online; DP.

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

## Sesi feedback /reservasi/PRINGSEWU26

### Selesai
- Unduh QRIS statis di langkah bayar DP (fetch blob -> anchor download, fallback buka tab baru).
- Preferensi Area (chip multi-pilih) menggantikan tombol "Minta bantuan kasir"; digabung ke `catatan` reservasi dan tampil di ringkasan step 3.
- Jam terpilih kini tampil pada chip tanggal aktif dan baris ringkasan (`tanggal . pukul jam`).
- Keranjang pre-order jadi panel melayang kanan-tengah (sticky sidebar `lg+`); sheet bawah tetap untuk mobile.
- Bottom action bar diubah jadi tombol mengambang (rounded-full + shadow, tanpa bar background penuh).

### Verifikasi
- `npm run lint -- --quiet`: 0 error (warning lama tetap).
- `npx tsc --noEmit`: hanya error lama `.next/types/validator.ts` (route `dashboard/testing` basi).
- `npm run graph:update`: selesai.

### File diubah
- `src/app/reservasi/[kodeAkses]/page.tsx`
- `.opencode/PRD.md`
- `.opencode/PROGRESS.md`

## Sesi feedback #2 /reservasi/PRINGSEWU26

### Selesai
- Sticky filter menu (search + kategori) jadi kartu melayang rounded dengan jarak dari header, tidak lagi menempel di atas.
- Kotak "Preferensi Area" dihapus, diganti kotak penjelasan **Meja Bebas** (bebas pilih meja kosong, termasuk Tanpa QR).
- Chip "Butuh kursi bayi" diganti "Butuh meja panjang"; placeholder catatan tidak lagi menyebut kursi bayi.
- Panel keranjang desktop: tiap item kini bisa ditambah/dikurangi (ikon hapus saat qty 1), tanpa batas 4 item.
- Paragraf "Preview singkat. Rincian lengkap..." dihapus.
- Halaman scroll ke atas setiap ganti langkah & saat pertama dibuka.
- `public/qris-statis.jpeg` dipulihkan dari commit `f1837eb` (aset sudah ada di `main`/`develop`, belum ikut branch ini) sehingga QRIS env tampil.
- Callout "Resto akan menyiapkan pesanan..." di langkah bayar dibuat lebih kontras (emerald card + ikon).

### Verifikasi
- `npx eslint "src/app/reservasi/[kodeAkses]/page.tsx"`: 0 error (2 warning lama).
- `npx tsc --noEmit`: hanya error lama `.next/types/validator.ts` (route `dashboard/testing` basi).

### File diubah
- `src/app/reservasi/[kodeAkses]/page.tsx`
- `public/qris-statis.jpeg` (dipulihkan)
- `.opencode/PRD.md`
- `.opencode/PROGRESS.md`


### Follow-up: Meja Bebas selectable
- Opsi **Meja Bebas** kini bisa dipilih (tombol ria-pressed); sistem otomatis memilih meja kosong dengan kapasitas paling pas (termasuk Tanpa QR), lalu server memvalidasi ulang saat submit.
- Memilih meja spesifik otomatis mematikan mode bebas; kapasitas input jumlah orang mengikuti meja terbesar saat mode bebas.
- Header menampilkan `Meja bebas � otomatis Meja X` dan validasi memberi pesan jelas bila tak ada meja yang cukup.
- Verifikasi: eslint 0 error (2 warning lama).
- Panel keranjang desktop digeser lebih turun (`top-[9rem]`) dan hanya menampilkan maksimal 5 item; tombol `Lihat N menu lain` / `Sembunyikan menu lain` untuk membuka sisanya.
- Panel keranjang desktop digeser lebih turun lagi (`top-[11rem]`, list `max-h-[calc(100vh-20rem)]`); batas 5 item + tombol lihat menu lain juga diterapkan di sheet mobile.
- Meja Bebas tidak lagi dibatasi kapasitas satu meja: input jumlah orang bebas, sistem memilih meja terbesar yang kosong, dan server melewati cek kapasitas saat `mejaBebas` true (catatan reservasi otomatis ditandai `Meja bebas (resto pilihkan)`).

## 🎙️ Voice Order + SPK (F1-F5)
- F1-F3 selesai: tokenizer/CBF, item-CF + `npm run seed:similarity`, endpoint `POST /api/rekomendasi` dengan Gemini NLU, fallback leksikon, rate limit `voice`, dan scoring hybrid 60/30/10.
- F4 selesai: `src/hooks/use-voice-input.ts`, `src/components/customer/voice-order-sheet.tsx`, tombol mic di kiosk customer, tambah rekomendasi ke keranjang.
- F5 selesai:
  - Voice-search dashboard di `src/components/dashboard/voice-search-button.tsx`, dipasang di filter `src/app/dashboard/pesanan/page.tsx` (tanpa biaya API).
  - Cadangan iOS: `src/hooks/use-audio-transcribe.ts` + `POST /api/transcribe` memakai Groq `whisper-large-v3-turbo`, rate limit namespace `transcribe` (5/10 menit), batas 25 MB.
  - `.env.example` ditambah `GROQ_API_KEY` (opsional; tanpa key user diarahkan ketik manual).
- Auto refresh CF:
  - `src/lib/spk/build-similarity.ts`: perhitungan matriks dipakai bersama oleh script dan runtime.
  - `src/lib/spk/refresh-similarity.ts`: refresh sekalian update memori `cf.ts`, ada lock + cooldown.
  - `src/lib/spk/cf.ts`: `setMatriksSimilarity()` agar perubahan JSON/matriks langsung dipakai tanpa restart di proses yang sama.
  - `src/app/actions/pesanan.ts`: `after()` memicu refresh otomatis setelah order berhasil (cooldown 60 detik).
  - `src/app/api/cron/similarity/route.ts` + `vercel.json`: schedule tiap 15 menit, dilindungi `CRON_SECRET`.
  - `.env.example`: `CRON_SECRET` ditambahkan.
- Verifikasi: `npm test` 75 passed, `npx tsc --noEmit` bersih, `npm run lint -- --quiet` bersih.
- `npm run build` sukses saat dev server mati; route `/api/cron/similarity` terbentuk; `.next` dibersihkan setelahnya agar dev server membangun ulang artefaknya.
- `npm run graph:update` sudah dijalankan setelah perubahan cron.
- Uji live saat dev server aktif: `GET /api/cron/similarity` → 200 (28 menu, 52 pasangan, tersimpan); `POST /api/rekomendasi` → 200 (mood `panas`, 4 rekomendasi).
- Belum: uji manual precision@4 dengan data pesanan nyata.
