# BLACKBOX TEST - Rencana, Aturan & Implementasi Bertahap

Dokumen ini adalah **sumber tunggal** untuk pengujian blackbox (Playwright) per modul.
Setiap modul dikerjakan bertahap: rencana -> spec -> jalankan -> cleanup -> update status di sini.

## 1. Tujuan

- Membuktikan perilaku fitur dari sisi pengguna (UI + alur), bukan hanya unit test.
- Menjaga data asli tetap aman: **hanya memakai data sementara** yang dibuat test.
- Memberi jejak yang jelas: PBI mana yang sudah diuji, file spec, dan statusnya.

## 2. Strategi Isolasi Database (KEPUTUSAN)

**Keputusan saat ini: data sementara di database yang sama (bukan data asli).**

Alasan:
- Project Supabase yang sama tidak bisa menyediakan database kedua.
- Docker/PostgreSQL lokal belum tersedia di mesin pengembangan saat ini.
- Opsi project Supabase terpisah tetap didokumentasikan sebagai upgrade.

Aturan wajib:
1. **Jangan memakai akun/data asli** (mis. `pohan`) untuk test.
2. Akun test: `e2e_owner` (dibuat via `npm run test:e2e:seed`, password dari env).
3. Semua data buatan test memakai prefix **`E2E_`**.
4. Cleanup **per-ID/per-nama unik** lewat fixture `cleanup` (Prisma). **Dilarang**
   `deleteMany` tanpa filter yang sempit, dan dilarang mengosongkan tabel.
5. Test tidak boleh mengubah/menghapus record yang tidak dibuat oleh test itu.
6. Jika test gagal di tengah jalan, fixture tetap menjalankan cleanup.
7. Sisa data yang tidak sengaja tertinggal harus terlihat dari prefix `E2E_` dan
   bisa dibersihkan manual tanpa menyentuh data asli.

Risiko yang diterima:
- Data test bisa sempat terlihat di dashboard/laporan/log selama test berjalan.
- Log login test (`keterangan` memuat username E2E) dibersihkan oleh fixture user.
- Belum ada isolasi total; upgrade ke database test terpisah tetap disarankan.

Upgrade path (belum dikerjakan):
- Buat project Supabase khusus E2E -> set `TEST_DATABASE_URL` + `DIRECT_URL` test.
- Atau PostgreSQL lokal (Docker) dengan schema `prisma db push` + seed minimal.

## 3. Aturan Penulisan Test

- Framework: Playwright (`@playwright/test`), spec di `tests/e2e/modulN/`.
- Import `test`/`expect` dari `tests/e2e/fixtures.ts` (bukan langsung dari Playwright)
  agar cleanup otomatis tersedia.
- Kredensial hanya dari env: `E2E_OWNER_USERNAME`, `E2E_OWNER_PASSWORD`.
  Jangan hardcode password asli.
- Selector stabil: role + name, label, placeholder, atau id field form.
- Hindari `waitForTimeout`; gunakan `expect(...).toBeVisible({ timeout })` /
  `waitForURL`.
- **SLOWMO default 500 ms** (bisa dioverride `SLOWMO=0`).
- Modul yang berbagi state (stok, pesanan, shift, meja) memakai
  `test.describe.configure({ mode: 'serial' })`.
- Test takeover memakai akun sementara sendiri (bukan `e2e_owner`) agar tidak
  membatalkan `storageState` project utama.
- Screenshot hanya saat gagal (kecuali spec lama yang intentionally menyimpan
  screenshot hasil).

## 4. Perintah

```powershell
# 1) Siapkan akun test (sekali / saat password berubah)
$env:E2E_OWNER_USERNAME='e2e_owner'
$env:E2E_OWNER_PASSWORD='<password-kuat>'
npm run test:e2e:seed

# 2) Jalankan test (dev server harus hidup; Playwright reuseExistingServer)
$env:E2E_OWNER_USERNAME='e2e_owner'
$env:E2E_OWNER_PASSWORD='<password-kuat>'
npm run test:e2e

# Modul tertentu
npx playwright test tests/e2e/modul1
```

Catatan: `npm run dev` dijalankan oleh user, bukan agent. Jika dev server mati,
Playwright akan mencoba menyalakannya lewat `webServer`.

## 5. Peta Modul & Status

Legenda status spec: `Done` = spec ada & pernah lulus; `Draft` = spec ditulis,
belum diverifikasi; `Todo` = belum ada spec; `N/A` = fitur belum ada (Todo di PRD).

| Modul | PBI | Fitur | Spec | Status |
|-------|-----|-------|------|--------|
| 1 | 1.1 | Login & Logout | `modul1/login.spec.ts` | Done |
| 1 | 1.2 | CRUD User | `modul1/users.spec.ts` | Done |
| 1 | 1.3 | CRUD Meja | `modul1/meja.spec.ts` | Done |
| 1 | 1.4 | CRUD Menu (kategori, foto, stok harian) | `modul1/menu.spec.ts` | Done |
| 1 | 1.5 | Ambil alih sesi (takeover) | `modul1/takeover.spec.ts` | Done |
| 2 | 2.1 | Buat pesanan (QR/manual) | `modul2/pesanan.spec.ts` | Done |
| 2 | 2.2 | Kelola item pesanan | `modul2/pesanan.spec.ts` | Done |
| 2 | 2.3 | Status & pembatalan | `modul2/pesanan.spec.ts` | Done |
| 3 | 3.1 | Hitung total (subtotal, pajak) | `modul3/pembayaran.spec.ts` | Todo |
| 3 | 3.2 | Pembayaran tunai/QRIS | `modul3/pembayaran.spec.ts` | Todo |
| 3 | 3.3 | Struk & riwayat | `modul3/pembayaran.spec.ts` | Todo |
| 4 | 4.1 | Logging aktivitas | `modul4/logging.spec.ts` | Todo |
| 5 | 5.1 | Laporan harian/bulanan | `modul5/laporan.spec.ts` | Todo |
| 5 | 5.2 | Analitik menu terlaris | `modul5/laporan.spec.ts` | Todo |
| 6 | 6.1 | CRUD bahan + lokasi | `modul6/stok-bahan.spec.ts` | Todo |
| 6 | 6.2 | Restock, koreksi, transfer | `modul6/stok-bahan.spec.ts` | Todo |
| 6 | 6.3 | Riwayat stok | `modul6/stok-bahan.spec.ts` | Todo |
| 6 | 6.5 | Stok harian dari Menu Management | `modul6/stok-harian.spec.ts` | Todo |
| 6 | 6.6 | Gate pemesanan + potong stok | `modul6/stok-harian.spec.ts` | Todo |
| 6 | 6.7 | Tampilan stok habis di customer | `modul6/stok-harian.spec.ts` | Todo |
| 7 | 7.1 | Reservasi pesanan (offline) | - | N/A (Todo PRD) |
| 7 | 7.2 | Ganti meja | - | N/A (Todo PRD) |
| 7 | 7.3 | Pergantian shift kasir | `modul7/shift.spec.ts` | Todo |
| 7 | 7.4 | Auto-kosongkan meja + pesanan | `modul7/meja-otomatis.spec.ts` | Todo |
| 7 | 7.5 | Refund + bukti foto | `modul7/refund.spec.ts` | Todo |
| 8 | 8.1 | Download QR meja | - | N/A (Todo PRD) |
| 8 | 8.2 | Notifikasi status ke customer | - | N/A (Todo PRD) |
| 8 | 8.3 | Backup data | - | N/A (Todo PRD) |
| 8 | 8.4 | Notifikasi pesanan terlambat | `modul8/notifikasi.spec.ts` | Todo |
| 10 | 10.1 | CRUD voucher | `modul10/voucher.spec.ts` | Todo |
| 10 | 10.2 | Diskon % | `modul10/voucher.spec.ts` | Todo |
| 10 | 10.3 | Minimal pembelian | `modul10/voucher.spec.ts` | Todo |
| 10 | 10.4 | Voucher di menu customer | `modul10/voucher.spec.ts` | Todo |

## 6. Rencana Bertahap (Staged Implementation)

Setiap tahap: tulis spec -> jalankan -> perbaiki -> cleanup -> update status tabel.

1. **Fondasi** (selesai/dikerjakan sekarang)
   - `fixtures.ts`: prefix `E2E_`, kredensial env, cleanup per-ID, login helper.
   - `seed-e2e-owner.ts`: upsert `e2e_owner`.
   - `playwright.config.ts`: SLOWMO 500, timeout, serial per spec yang perlu.
   - `auth.setup.ts`: login akun test + handle dialog takeover.
2. **Modul 1.4 Menu** (Done)
   - Tampilan halaman + tab Menu/Voucher.
   - Buat kategori E2E -> buat menu E2E (harga, kategori, status, stok harian).
   - Cari menu, edit stok inline, edit nama, hapus menu + kategori.
   - Cleanup: `trackKategori`, `trackMenu` (urutan terbalik).
3. **Modul 1.5 Takeover** (Done)
   - Dua context browser dengan akun owner sementara.
   - Konfirmasi "Ambil alih sesi?" -> context lama diarahkan ke
     `/login?takenOver=1` + dialog "Sesi diambil alih".
   - Skenario Batal: sesi lama tetap hidup.
   - Cleanup: hapus user sementara + log terkait.
4. **Modul 2 Pesanan** (Done, serial)
   - Spec: `tests/e2e/modul2/pesanan.spec.ts`, `test.describe.configure({ mode: 'serial' })`.
   - Fixture tambahan: `createTestUser(role)` (waiter/cashier), `createTestMeja`,
     `createTestKategori`, `createTestMenu`; semua memakai `E2E_` + cleanup per-ID.
   - Context customer tanpa `storageState`; context staff login per role agar
     `kasirId`/`waiterId` tidak tercampur.
   - **2.1 Buat pesanan**
     - QR: buka `/<token>` sebagai guest, tambah menu E2E, checkout, isi nama,
       pilih Tunai, konfirmasi -> redirect pembayaran; assert pesanan `menunggu`,
       stok harian berkurang, meja `terpakai`, kartu muncul di dashboard.
     - Manual: login staff, `/dashboard/kasir/pesanan-baru`, pilih meja E2E,
       tambah menu, isi nama + metode, submit -> redirect detail pesanan.
     - Guard: checkout tanpa nama/metode -> tombol konfirmasi disabled/validasi;
       checkout keranjang kosong -> state "Keranjang Kosong".
   - **2.2 Kelola item**
     - Precondition: set `statusPembayaran='berhasil'` lewat DB fixture.
     - Login waiter -> kartu "Meja ..." -> "Tandai Item" -> centang semua item
       -> "Selesai (n/n)"; assert status `selesai`, `waiterId` terisi, meja
       `kosong`, semua `statusAntar='diantar'`.
     - Guard: centang sebagian -> alert "Tandai semua item sudah diterima
       terlebih dahulu!", status pesanan tidak berubah.
   - **2.3 Status & pembatalan**
     - Login staff non-owner -> `/dashboard/pesanan/<id>` -> "Batalkan" ->
       konfirmasi; assert `dibatalkan`, `statusPembayaran='dibatalkan'`,
       `deletedAt` terisi, meja `kosong`.
     - Login owner -> halaman detail pesanan yang sama; assert tombol
       "Selesai"/"Batalkan" tidak tampil (owner read-only).
     - Tampilan/filter: set status `diproses` lewat DB, assert kartu + filter
       "Diproses", pencarian `#id`/meja, dan dialog detail menampilkan item/total.
   - Cleanup urutan: user -> kategori -> menu -> meja -> pesanan didaftarkan
     sedemikian rupa sehingga saat dibalik pesanan terhapus lebih dulu.
5. **Modul 3 Pembayaran** (serial)
   - Tunai/QRIS, kembalian, struk, riwayat.
6. **Modul 4 Logging**, **Modul 5 Laporan** (read-only, hati-hati data test).
7. **Modul 6 Stok** (serial): stok harian gate, pemotongan, transfer.
8. **Modul 7**: shift, auto-kosongkan, refund (7.1/7.2 menunggu fitur).
9. **Modul 8**: notifikasi terlambat (8.1-8.3 menunggu fitur).
10. **Modul 10 Voucher** (dapat digabung dengan Modul 2/3 karena diskon masuk pesanan).

## 7. Data Test & Cleanup

| Entitas | Penanda | Cleanup |
|---------|---------|---------|
| User | `E2E_<label>_<stamp>` | hapus log berisi username, lalu user by username |
| Kategori | `E2E_<label>_<stamp>` | hapus kategori hanya jika tidak punya menu |
| Menu | `E2E_<label>_<stamp>` | hapus MenuFoto/ResepMenu/DetailPesanan lalu menu by nama |
| Meja | `E2E_K_<stamp>` / `E2E_L_<stamp>` (token `E2E` + hex) | hapus detail+pesanan lalu meja by nomor |
| Voucher | `E2E<STAMP>` | hapus voucher by kode (setelah pesanan terkait) |
| Pesanan | nama pelanggan `E2E_...` | hapus detail, bukti refund, pesanan |

Cleanup dijalankan fixture setelah test (termasuk saat gagal), urutan task
dibalik dari urutan pendaftaran. Daftarkan dari induk -> anak (kategori dulu,
lalu menu) agar penghapusan terbalik aman.

## 8. Catatan Operasional

- `graphify-out/` sudah dapat diperbarui di mesin ini: `npm run graph:update`
  berhasil (2751 nodes, 5121 edges, 123 communities per sesi Modul 2). Tetap
  jalankan setelah perubahan kode dan jangan commit artefak graph yang basi.
- Dev server yang merespons 500 harus diperbaiki user (kemungkinan `.next` basi).
  Agent tidak menjalankan/mematikan `npm run dev`.
- Stash `stash@{0}` berisi graphify lama (bukan kode fitur). Belum di-drop;
  tunggu keputusan user.
