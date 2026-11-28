# Rencana Perbaikan UX Pemesanan Dine-in (QR Scan)

Branch: `feature/fe-dine-in-ux` (dibuat dari `develop`).
Status: **implementasi selesai** (revisi: filter selalu tampil & ringkas di HP, grup Resto/Cafe dibedakan jelas dari pill kategori dengan jarak internal tetap sama, info keranjang tidak di search, indikator bawah hanya membuka keranjang, voucher hanya di panel/sheet keranjang, varian suhu tampil di struk, error `RoleUser.gudang` dibersihkan, stok harian tidak ditampilkan angkanya, menu habis tetap tampil dengan label `Habis`, dan tampilan habis dibuat netral + ada aksi "Lihat menu lain").

## 1. Latar Belakang

Halaman pemesanan dine-in (`src/app/(customer)/[tokenMeja]/page.tsx`) sudah memakai header sticky, tetapi **pencarian, kategori, dan voucher ikut tergeser saat scroll**. Keranjang hanya berupa drawer kanan yang dipicu ikon header; pada mobile, bottom bar memakai trik `document.querySelector("[data-cart-button]")?.click()` dan tidak punya `safe-area-inset`.

Sementara itu halaman reservasi customer (`src/app/reservasi/[kodeAkses]/page.tsx`) sudah punya pola UI yang lebih matang. Rencana ini mengadaptasi pola tersebut ke dine-in **tanpa mengubah logika bisnis, server action, Prisma schema, atau alur pembayaran**.

## 2. Analisis Perbedaan UI Reservasi vs Dine-in

| Pola UI | Reservasi | Dine-in saat ini | Keputusan |
|---------|-----------|------------------|-----------|
| Header sticky | `page.tsx:735` (`top-0 z-20`, judul dinamis) | `page.tsx:402` (`top-0 z-50`, brand + meja + cart) | Dipertahankan; ditambah CTA "Pesanan" |
| Filter sticky | `page.tsx:1168-1195` (`top-[6.75rem]`, kartu `bg-card/95 shadow-md backdrop-blur`) | `page.tsx:626-711` search + voucher + kategori biasa | **Diadaptasi** sebagai kartu sticky yang **selalu tampil** (tanpa auto-hide) |
| Ringkasan penting (jumlah, total, voucher) | `page.tsx:885`, `1390`, `1466` | Hanya badge cart `page.tsx:444` | **Tidak ditaruh di search**; tetap di panel/sheet keranjang |
| Panel keranjang desktop fixed | `page.tsx:1383-1484` (list scroll mandiri + ringkasan) | Tidak ada | **Diadaptasi** sebagai kolom sticky |
| Sheet keranjang mobile | `page.tsx:1807-1943` (`side="bottom"`, avatar stack) | Drawer kanan `cart-sheet.tsx:126` | **Diadaptasi** |
| Action bar fixed + safe-area + `pointer-events-none` | `page.tsx:1793-1798` | `page.tsx:776-795` (tanpa safe-area, z rendah) | **Diadaptasi** |
| Empty state berlapis | `page.tsx:890`, `1105`, `1259`, `1395` | `page.tsx:746` (satu variant) | **Diadaptasi** |
| Kartu voucher dengan state | `page.tsx:1198-1258` | Pill voucher `page.tsx:658-684` | Disederhanakan: pill + info min. belanja + chip aktif di bar |
| Dialog konfirmasi | `cek/page.tsx:453-469` | Tidak ada | **Diadaptasi** untuk navigasi dengan keranjang |
| Stepper 4 langkah, chip tanggal, slot jam, DP/QRIS | `page.tsx:767-789`, `998-1110`, `1656-1767` | Tidak relevan | **Tidak diadaptasi** (spesifik reservasi) |

## 3. Scope Implementasi

### 3.1 Filter bar sticky selalu tampil
- `search` + tombol mikrofon + tab **Resto/Cafe** + pill kategori berada dalam satu kartu sticky di bawah header (`top-16`, `z-40`) dan **tampil apa adanya sejak awal** (tanpa perlu scroll).
- Layout rapi: mic disatuakan di dalam kolom search; Resto/Cafe tetap memakai `role="tablist"` dan berada dalam wadah pill `border border-border/60 bg-muted/60 p-0.5 sm:p-1` supaya **terlihat jelas terpisah** dari kategori biasa di HP. Jarak internal antar Resto/Cafe tetap disamakan dengan kategori (`gap-1.5 sm:gap-2`), dan pemisah vertikal `w-px h-5 sm:h-6` ditambahkan setelah wadah grup. Kategori pills horizontal dengan scrollbar disembunyikan. Search diperkecil di HP (`h-9`, teks `xs`, ikon lebih kecil), dan tab Resto/Cafe + kategori berada dalam **satu baris scroll** di semua breakpoint.
- Mic tidak lagi berupa ghost icon yang samar: tetap **ikon saja** (tanpa tulisan), tapi dibungkus chip sekunder `border-primary/25 bg-primary/10 text-primary shadow-sm` berukuran `size-8 sm:size-9` + tooltip. Fitur tetap opsional: sheet menyebut kuota AI terbatas dan, setelah rekomendasi muncul, tombol mic/manual dinonaktifkan sampai user menekan **Cari lagi** agar satu permintaan tidak mengirim beberapa call Gemini.
- Nomor meja tetap di header; jumlah item, voucher, dan total **hanya** tampil di panel/sheet keranjang (kecuali ringkasan ringkas di bar bawah).
- Teks "N menu tersedia" dihapus. State `searchQuery`, `activeKategori`, `voucher`, `itemsToShow` tidak berubah.

### 3.2 Keranjang desktop + mobile
- Kolom kanan `xl` berisi panel keranjang sticky (maks 3 item + "lihat semua", stepper qty, voucher, total, Checkout) — memakai state yang sama dengan drawer.
- Trigger mobile membuka `SheetContent side="bottom"`; hapus trik `querySelector`.
- `CartSheet` menerima prop `side` (`right` default, `bottom` untuk mobile).

### 3.3 Bar keranjang bawah & toast
- Mobile/tablet memakai bar ringkas di bawah: `inset-x-0`, `bottom-[calc(3.75rem+env(safe-area-inset-bottom))]`, `z-40`, `xl:hidden`, lebar `max-w-sm sm:max-w-md` (tidak penuh di tablet).
- Isi bar: **foto menu berbentuk lingkaran** (maks 3, fallback huruf awal jika tanpa foto) + badge `+N` bila ada menu lain; **tanpa nama menu**.
- Tengah bar tidak kosong: ringkasan `{totalItem} item · Rp {totalHarga}` + petunjuk "Ketuk untuk lihat keranjang" (atau "Belum ada menu dipilih" saat kosong).
- Ikon kanan diganti **ikon keranjang** (`ShoppingCart`) dalam lingkaran primary agar jelas bisa diklik; menekan bar membuka **keranjang samping** (`CartSheet side="right"`).
- `xl` memakai `FloatingCartPanel` yang sudah tampil; bar disembunyikan.
- `main` diberi `pb-32`; toast di `7.25rem + safe-area` agar tidak menimpa bar.

### 3.4 Detail UI tambahan
- Header responsif: mark "P", brand + badge meja bertumpuk di HP dan sejajar di tablet/laptop; aksi "Pesanan"/"Pindah" ikon-only di HP, lengkap di `sm+`; cart badge lebih ringkas; tinggi `h-14 sm:h-16`, filter sticky `top-14 sm:top-16`.
- Voucher: kartu voucher di halaman menu **dihapus**. Pemilih voucher (diexpor dari `cart-sheet.tsx`) dipakai bersama `CartSheet` dan `FloatingCartPanel`: daftar kartu berisi nama/kode/diskon/minimal belanja, status "Pakai"/"Dipakai"/"Belum cukup", toggle lepas, serta input kode opsional yang tersembunyi sampai dibuka. Validasi tetap lewat `validateVoucher` di server.
- Peringatan "Meja Sedang Digunakan" hanya muncul jika `statusMeja === "terpakai"` **dan** `adaPesananAktif`; meja kosong tidak memunculkannya.
- CTA "Pesanan" di header saat `adaPesananAktif` (melengkapi tombol "Pindah").
- Empty state menu: pesan berbeda saat ada query/category filter + tombol "Hapus filter".
- Dialog konfirmasi saat pindah meja / scan meja lain sementara keranjang tidak kosong.

### 3.5 Kartu menu & detail: stok harian
- Angka **Sisa N porsi / Sisa 10 porsi** sengaja **tidak ditampilkan** di kartu maupun dialog detail menu: angka cepat basi dan membuat kartu ramai. Keputusan: cukup status **Habis** saat memang tidak bisa dipesan.
- `getMenusForCustomer()` mengembalikan menu `tersedia` **dan** `habis`; menu dengan `stokManual = 0` tetap tampil di daftar dengan badge/detail teks **Habis**, bukan hilang.
- Kartu habis memakai state netral (bukan merah `destructive`): border `border-border/70`, latar `bg-muted/20`, foto diredupkan ringan `opacity-60 grayscale-[35%]`, badge netral berikon `Ban`, dan keterangan kecil **Stok habis** di bawah harga. Nama & harga tetap terbaca.
- Dialog detail habis memakai kartu netral: ikon `Ban`, judul situasional ("Stok menu ini habis" / "Menu belum siap dipesan" / "Menu tidak tersedia"), pesan yang bisa ditindaklanjuti, serta tombol **Lihat menu lain** (`DialogClose`) agar customer tidak menemui jalan buntu.
- Stok harian tetap membatasi `handleTambah`, stepper keranjang, dan validasi checkout; control jumlah dinonaktifkan saat batas tercapai tanpa menampilkan angkanya.

## 4. Acceptance Criteria

1. Search, mikrofon, tab Resto/Cafe, dan kategori langsung tampil sticky di bawah header tanpa perlu scroll; query/kategori tidak reset. Filter dibuat ringkas (satu baris tab + kategori) sehingga tidak mendesak grid menu; jarak internal antar pill Resto/Cafe tidak berbeda dari kategori biasa, tetapi grup Resto/Cafe terlihat jelas terpisah lewat wadah berborder + pemisah vertikal di HP.
2. Bar search **tidak** menampilkan nomor meja, jumlah item, total harga, voucher, maupun teks "N menu tersedia". Nomor meja ada di header; detail keranjang hanya di panel/sheet keranjang.
3. Pada `xl`, panel keranjang tetap terlihat saat scroll dan tidak menutup grid menu; list item memiliki scroll mandiri.
4. Pada mobile/tablet, bar bawah ringkas (`max-w-sm sm:max-w-md`) hanya menampilkan foto menu bulat + `+N`, ikon keranjang di kanan, dan membuka keranjang samping (`side="right"`); checkout tetap memakai `handleCheckout` di dalam keranjang; tidak ada lagi `data-cart-button`/`querySelector`.
5. Bar tidak tertutup footer, tidak menimpa toast, dan mendukung safe-area.
6. Peringatan meja hanya tampil saat ada pesanan aktif; voucher bisa dipilih/dilepas dari panel/sheet keranjang dengan status jelas; header tetap lega di HP/tablet/laptop.
7. Varian Panas/Dingin tampil sebagai badge di keranjang, checkout, detail pesanan, dan struk (copy pelanggan + kitchen); tag mentah `[Varian: ...]` tidak pernah tampil ke customer.
8. `npm run lint -- --quiet` dan `npx tsc --noEmit` lolos dengan 0 error (entri `RoleUser.gudang` usang sudah dibersihkan).
9. Kartu/detail menu tidak menampilkan angka sisa stok; menu `habis` tetap terlihat dengan label **Habis** yang netral (bukan error merah), detailnya punya pesan + tombol **Lihat menu lain**, dan stok harian tetap menolak/menjepit jumlah di keranjang serta checkout.
10. Mic mudah ditemukan sebagai ikon ber-ring primary (tanpa label teks), tetapi tidak mendominasi; kuota AI dijelaskan di sheet dan pemakaian ulang perlu **Cari lagi**, sehingga free API key Gemini tidak terpakai untuk klik ganda.

## 5. File yang Disentuh

- `src/app/(customer)/[tokenMeja]/page.tsx`
- `src/components/customer/menu-card.tsx` (kartu & detail menu, label `Habis`)
- `src/components/customer/cart-sheet.tsx`
- `src/components/customer/floating-cart-panel.tsx` (baru)
- `src/lib/print-struk.ts`, `src/test/unit/lib/print-struk.test.ts` (varian suhu di struk)
- `src/app/actions/pesanan.ts`, `src/test/unit/app/actions/pesanan.test.ts` (menu habis tetap dikirim ke customer)
- `src/app/actions/notifikasi.ts`, `src/app/dashboard/users/page.tsx` (hapus entri role `gudang` yang tidak ada di enum Prisma)
- `.opencode/PRD.md`, `.opencode/PROGRESS.md` (sinkron dokumen)
- `.opencode/DINE_IN_UX_PLAN.md` (dokumen ini)

Tidak ada perubahan schema atau route baru. Server action yang disentuh: `notifikasi.ts` (hapus role usang) dan `pesanan.ts` (filter menu customer), bukan API baru.

## 6. Verifikasi

- `npm run lint -- --quiet`: 0 error (43 warning pre-existing).
- `npx tsc --noEmit --incremental false`: 0 error.
- `npx vitest run src/test/unit/app/actions/notifikasi.test.ts src/test/unit/lib/print-struk.test.ts src/test/unit/lib/catatan-item.test.ts`: 29 passed / 1 failed pre-existing (mock `prisma.reservasi` belum ada di `reservasi.ts:91`).
- `npx vitest run src/test/unit/app/actions/pesanan.test.ts -t getMenusForCustomer`: 1 passed / 86 skipped.
- Cek visual manual oleh user lewat dev server yang dijalankan user.
- `npm run graph:update` setelah kode stabil (2732 nodes, 5122 edges, 241 communities).
- `npm test` suite penuh pernah dijalankan: 647 passed / 31 failed / 1 skipped (semua failure pre-existing di luar scope); hindari mengulang tanpa permintaan eksplisit. Tidak menjalankan `next build` saat dev server aktif.
