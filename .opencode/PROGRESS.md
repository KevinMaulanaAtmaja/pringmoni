# PROGRESS - Sesi 2026-11-05 (Blackbox Modul 2 Pesanan)

## ✅ SELESAI

- **Fixture Modul 2** (`tests/e2e/fixtures.ts`): tambah `createTestUser(db, username, password, role)`, `createTestMeja`, `createTestKategori`, `createTestMenu`, `createTestPesanan`; `createTestOwner` mendelegasikan ke `createTestUser`.
- **Spec Modul 2** (`tests/e2e/modul2/pesanan.spec.ts`): 7 test serial mencakup QR order + stok/meja, checkout kosong, order manual kasir + `kasirId`, waiter tandai semua item, guard item belum lengkap, pembatalan + `deletedAt`, owner read-only, serta status/filter/pencarian/detail.
- **Verifikasi**: `npm run lint -- --quiet` dan `npx tsc --noEmit` lolos; `npx playwright test tests/e2e/modul2` **9 passed** (7 test + setup).
- **Cleanup**: verifikasi DB setelah run → 0 sisa user/kategori/menu/meja/pesanan berprefix `E2E_` (di luar `e2e_owner`).
- Status di `.opencode/BLACKBOX_TEST.md` diperbarui: PBI 2.1, 2.2, 2.3 -> Done.

## ⏳ BELUM / CATATAN

- Modul 3 dst. belum dikerjakan.
- Akun `e2e_owner` di-seed ulang dengan password sementara (tidak dicatat di repo).
- `npm run graph:update` berhasil dijalankan (2751 nodes, 5121 edges, 123 communities).

---

# PROGRESS - Sesi 2026-11-05 (Verifikasi Blackbox Modul 1.4 & 1.5)

## ✅ SELESAI

- **Modul 1.4 Menu** (`tests/e2e/modul1/menu.spec.ts`): 3/3 test lulus (headed Playwright).
- **Modul 1.5 Takeover** (`tests/e2e/modul1/takeover.spec.ts`): 3/3 test lulus (headed Playwright).
- **Seluruh Modul 1**: 15/15 test lulus (`npx playwright test tests/e2e/modul1 --headed`).
- Status di `.opencode/BLACKBOX_TEST.md` diperbarui: PBI 1.4 & 1.5 dari Draft -> Done.
- **Fix data legacy**: `meja` K003 (id 5) dan K001 (id 1) punya `status_meja = 'dipesan'`, nilai enum yang hanya ada di PostgreSQL dan tidak ada di `prisma/schema.prisma`. Ini membuat `pesanan.findMany()` gagal (`Value 'dipesan' not found in enum 'StatusMeja'`) dan halaman `/dashboard/pesanan` error. Semua baris invalid dinormalisasi menjadi `kosong` (verifikasi ulang: 0 baris invalid).
- **Fix race cache sesi**: `ambilVersiSesi()` di `src/lib/sesi.ts` kini mendukung opsi `{ fresh: true }` untuk melewati cache. `src/lib/auth.ts` membaca ulang versi dari DB saat versi token berbeda, sehingga sesi yang baru login tidak salah dianggap sudah diambil alih ketika cache per-proses masih basi.
- Akun test `e2e_owner` di-seed ulang untuk sesi verifikasi ini (password tidak dicatat di repo).

## ⏳ BELUM / CATATAN

- Modul 3 dst. belum dikerjakan.
- Belum ada migrasi SQL untuk menormalkan sisa nilai enum legacy `dipesan` di environment lain (data di DB saat ini sudah bersih).

---

# PROGRESS - Sesi 2026-11-04 (Blackbox E2E)

> Fondasi blackbox test + dokumen tracking. Belum commit.

## ✅ SELESAI

- Dokumen tracking baru: `.opencode/BLACKBOX_TEST.md` (strategi DB data sementara, aturan, peta modul/PBI, rencana bertahap, cleanup).
- `tests/e2e/fixtures.ts`: prefix `E2E_`, kredensial env, login helper + handle dialog takeover, `CleanupRegistry` per-ID/nama.
- `tests/e2e/seed-e2e-owner.ts` + script `npm run test:e2e:seed` (upsert `e2e_owner`, password dari env).
- `tests/e2e/auth.setup.ts`: login akun test (bukan akun asli) + handle dialog takeover.
- `playwright.config.ts`: SLOWMO default 200, timeout, action/navigation timeout, dotenv.
- Spec baru: `modul1/menu.spec.ts` (PBI-1.4) dan `modul1/takeover.spec.ts` (PBI-1.5).
- Spec lama (`login`, `users`, `meja`) memakai fixtures + cleanup; username test diberi prefix `E2E_`.
- `tests/e2e/README.md` diperbarui (setup akun test, env, aturan cleanup).
- Lint bersih (`npm run lint -- --quiet`).
- `npx playwright test --list` menemukan 15 test di 6 file.

## ⏳ BELUM / CATATAN

- Spec Modul 1.4/1.5 masih **Draft**: belum dijalankan karena dev server merespons 500.
- `npx tsc --noEmit` masih gagal karena Prisma client basi + `.next` basi (pre-existing); perlu `npx prisma generate` saat dev server mati.
- `npm run test:unit` gagal pre-existing: `next-auth` mengimpor `next/server` yang tidak resolve di Vitest.
- `npm run graph:update` gagal: `graphify.exe` diblokir Application Control policy. `graphify-out/` belum diperbarui.
- `package-lock.json` masih dirty (1 deletion) + `graphify-out/` dirty; commit menunggu keputusan.
- `stash@{0}` (graphify lama) belum di-drop; `stash@{1}` berisi perubahan kode lama (blokir order/token meja).
- Modul berikutnya (2 dst.) belum dikerjakan; menunggu instruksi user.

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
