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
