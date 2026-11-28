# PRD - Pringmoni Resto POS & Monitoring

## 1. Product Overview

**Pringmoni** adalah sistem **Resto POS & Monitoring** untuk **Restoran Pringsewu**. Dibangun sebagai proyek **Project Based Learning (PBL)**.

### Tech Stack
| Kategori | Library | Versi |
|----------|---------|-------|
| Framework | Next.js | 16.2.1 |
| UI Library | React | 19.2.4 |
| Database ORM | Prisma | 5.22.0 |
| Auth | NextAuth | 5.0.0-beta.30 |
| CSS | Tailwind CSS | v4 |
| UI Components | shadcn/ui | v4.1.1 |
| PDF | jsPDF | v4.2.1 |
| Realtime | Pusher | v5.3.3 |
| Upload | UploadThing | v7.7.4 |
| Payment | QRIS statis + tunai (verifikasi manual) | - |

## 2. Core Features

### Customer Self-Order
- Customer scan QR code di meja (token unik per meja)
- Akses halaman menu tanpa login
- Pilih menu, tambah ke keranjang, kirim pesanan
- Lihat status pesanan real-time

### Dashboard Admin
- Statistik overview (pendapatan, pesanan, grafik)
- Manajemen pesanan (lihat, proses, selesai, batalkan)
- Manajemen menu (tambah, edit, hapus, kategori, foto)
- Manajemen meja (tambah, edit, status, token QR)
- Manajemen user (tambah, edit, hapus, role)
- Laporan (filter tanggal, export PDF/Excel)
- Logging aktivitas

### Kasir System
- Pesanan baru (input manual)
- Proses pembayaran (tunai, QRIS statis) + verifikasi manual kasir
- Hitung kembalian otomatis
- Cetak struk PDF
- Riwayat transaksi

### Manajemen Stok
- **Stok harian per menu** diatur dari **Menu Management** (`menu.stokManual`) dan menjadi sumber ketersediaan di customer
- Master bahan dengan dua lokasi: **Gudang** & **Dapur** (monitoring internal)
- Restock, koreksi/limbah, dan **transfer Gudang -> Dapur**
- Riwayat pergerakan stok per bahan
- Stok bahan **tidak** menentukan tampilan customer — hanya untuk pemantauan aliran bahan internal
- Pemotongan stok dapur otomatis saat pesanan selesai berjalan bila data resep tersedia (tanpa UI rakit resep)

## 3. Product Backlog (PBI)

### Modul 1: User Management
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.1 | Login & Logout (role-based) | Done |
| PBI-1.2 | CRUD User | Done |
| PBI-1.3 | CRUD Meja (token unik) | Done |
| PBI-1.4 | CRUD Menu (kategori, foto) | Done |
| PBI-1.5 | Ambil alih sesi login antar perangkat (satu konfirmasi saat login) | Done |

> Catatan PBI-1.4: Ketersediaan menu diatur lewat **stok harian** (`menu.stokManual`) di Menu Management (lihat Modul 6).
>
> Catatan PBI-1.5: Saat menekan Masuk, bila sesi akun masih aktif di perangkat
> lain (`users.last_seen_at` < 15 menit & `cookie pm_device` berbeda), tampil
> **satu dialog konfirmasi** "Ambil alih sesi?". Setelah dikonfirmasi, login
> membuat sesi baru dan menaikkan `users.session_version`; JWT lama otomatis
> ditandai `takenOver`, cookie sesinya dihapus **proxy**, dan perangkat lama
> diarahkan ke `/login?takenOver=1` yang menampilkan **dialog sekali** "Sesi
> diambil alih" (URL lalu dibersihkan agar tidak berulang saat refresh).
> Menekan **Batal** pada dialog tidak dihitung sebagai percobaan gagal — rate
> limit login hanya mencatat username/password yang salah. Sumber:
> `src/lib/sesi.ts`, `src/lib/auth.ts`, `src/app/actions/login.ts`, `src/lib/rate-limiter.ts`,
> `src/proxy.ts`.

### Modul 2: Pesanan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (QR scan / manual) | Done |
| PBI-2.2 | Kelola Item Pesanan | Done |
| PBI-2.3 | Status & Pembatalan | Done |

> Catatan PBI-2.1: Pemesanan tunduk pada validasi stok harian — menu harus `tersedia` dan `stokManual` mencukupi; jika tidak, ditolak server (lihat Modul 6). Angka sisa stok tidak ditampilkan di kartu/detail customer; menu dengan stok 0 tetap muncul dengan label **Habis** agar jelas, bukan menghilang dari daftar. Tampilan **Habis** memakai state netral (bukan error merah) dengan badge berikon, keterangan "Stok habis", dan tombol detail **Lihat menu lain** agar customer bisa langsung memilih menu lain.
>
> Catatan UX menu dine-in: filter (cari + mikrofon + tab Resto/Cafe + kategori) kini berupa kartu sticky di bawah header yang **selalu tampil**, dengan versi ringkas (search `h-9` di HP; tab Resto/Cafe dan kategori satu baris scroll di semua breakpoint, grup Resto/Cafe punya wadah berborder + pemisah vertikal yang jelas di HP dengan jarak internal tetap sama seperti kategori biasa) agar tidak banyak memakan ruang. Nomor meja ada di header; jumlah item, voucher, dan total hanya tampil di panel keranjang `xl` / sheet keranjang mobile — bukan di bar search. Mobile/tablet memakai bar keranjang ringkas di bawah berisi foto menu bulat (maks 3 + `+N`), ringkasan item/total, dan ikon keranjang yang membuka keranjang samping. Header responsif (brand, badge meja, ikon keranjang); kartu voucher di halaman menu dihapus — voucher dipilih/dilepas dari panel/sheet keranjang; peringatan "Meja Sedang Digunakan" hanya muncul saat meja benar-benar punya pesanan aktif. Tombol mic bersifat opsional dan kini tampil sebagai ikon ber-ring primary yang jelas (tanpa label teks), dengan penjelasan kuota AI terbatas di sheet; hasil hanya bisa diulang lewat **Cari lagi**.
 Rencana & detail: `.opencode/DINE_IN_UX_PLAN.md`.
>
> Catatan varian suhu: pilihan **Panas / Dingin** hanya muncul untuk kategori yang mengaktifkan `pilihanSuhu`. Varian ikut tersimpan di `DetailPesanan.catatanItem` sebagai tag `[Varian: ...]`, ditampilkan sebagai badge di keranjang, checkout, detail pesanan customer/dashboard, kasir, dan struk (copy pelanggan + kitchen) tanpa menampilkan tag mentah.

### Modul 3: Pembayaran
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-3.1 | Hitung Total (subtotal, pajak) | Done |
| PBI-3.2 | Pembayaran (tunai/QRIS/transfer) | Done |
| PBI-3.3 | Struk & Riwayat | Done |

### Modul 4: Sistem
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-4.1 | Logging Activity | Done |

### Modul 5: Laporan & Analitik
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-5.1 | Laporan (harian/bulanan) | Done |
| PBI-5.2 | Analitik (menu terlaris) | Done |

### Modul 6: Stok Bahan & Stok Harian
*Gabungan eks Modul 6–8. Detail user story & spesifikasi teknis menyusul.*

| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-6.1 | CRUD Bahan + klasifikasi lokasi (Gudang/Dapur) | Done |
| PBI-6.2 | Restock, koreksi/limbah, transfer Gudang → Dapur | Done |
| PBI-6.3 | Riwayat pergerakan stok per bahan | Done |
| PBI-6.4 | ~~Rakit resep menu (BOM)~~ — dihapus dari UI; data resep lama tetap dipakai untuk pemotongan stok internal bila ada | Dihapus |
| PBI-6.5 | Stok harian per menu diatur dari Menu Management | Done |
| PBI-6.6 | Gate pemesanan berdasarkan stok harian + pemotongan stok harian otomatis | Done |
| PBI-6.7 | Tampilkan status "Stok Habis" di menu customer (angka sisa tidak ditampilkan) | Done |

> Catatan Modul 6: ketersediaan menu untuk customer sepenuhnya mengacu pada **stok harian (`menu.stokManual`)** di Menu Management. Stok bahan (Gudang/Dapur) adalah monitoring internal dan tidak memengaruhi tampilan customer. UI "Rakit Resep" dihapus bersama route `/dashboard/resep`.

### Modul 7: Reservasi & Operasional Meja
*Fitur prioritas. Detail user story & spesifikasi menyusul.*

| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-7.1 | Reservasi pesanan (offline) | Done |
| PBI-7.2 | Ganti meja (pindah pesanan antar meja) | Todo |
| PBI-7.3 | Pergantian shift kasir | Done |
| PBI-7.4 | Auto-kosongkan meja + pesanan (pesanan selesai / pesanan lama dibayar) | Done |
| PBI-7.5 | Refund + bukti foto | Done |

> Catatan PBI-7.1: Reservasi offline dikelola dari `/dashboard/reservasi` **hanya oleh CASHIER** (owner/waiter tidak punya akses). Meja di-hold dengan status `dipesan` tanpa memotong stok. Konfirmasi kedatangan membuat pesanan dan memotong `menu.stokManual` dalam satu transaksi. Reservasi yang melewati `batasKonfirmasi` otomatis menjadi `expired` dan meja dikembalikan ke `kosong`. Detail teknis: `.opencode/RESERVASI_PLAN.md` dan `.opencode/RESERVASI_IMPLEMENTATION.md`.
>
> Catatan penandaan meja: `/dashboard/meja` menampilkan tanda/status pada meja ber-token QR — badge mark di kolom QR (`Dipesan`/`Terpakai`) saat status bukan `kosong`, serta dialog QR menampilkan badge status dan frame berwarna (hijau `kosong` → merah `terpakai` / amber `dipesan`). Server action `getMeja` kini mengembalikan `reservasiAktif` terbaru per meja.
>
> Jadwal reservasi saat ini **tetap** (belum dapat diatur owner): jam buka 13:00, kedatangan terakhir 20:30, jam tutup 21:00, slot tiap 30 menit, maksimal 7 hari ke depan. `batasKonfirmasi` DP dihitung dari waktu kedatangan + expiry (default 3 jam) tetapi **di-cap pada jam tutup 21:00** hari yang sama. Rencana pengaturan jam oleh owner ada di `.opencode/RESERVASI_PLAN.md` §8 (status: rencana, belum diimplementasi).
>
> Reservasi customer memakai **link umum** `/reservasi/PRINGSEWU26` (kode akses publik di `src/lib/reservasi-akses.ts`, bukan token meja). Customer memilih sendiri meja yang masih kosong — termasuk meja yang belum punya QR — lalu server memvalidasi ulang status meja secara transaksional. Rentang tanggal = hari ini s/d H+7 (**8 tanggal**, dihitung ulang saat melewati tengah malam). Pemilih bulan/tahun manual dihapus; cukup chip tanggal. Link lama per meja (`/reservasi/<tokenMeja>`) tidak dipakai lagi.
>
> Tampilan **Reservasi Berhasil** dipisah dari form ke halaman `/reservasi/<kodeAkses>/cek`. Setelah reservasi dibuat, customer diarahkan ke halaman ini dan detailnya diambil dari `sessionStorage` (`src/lib/reservasi-hasil.ts`). Untuk melihat reservasi lagi (mis. di perangkat lain), halaman ini memakai **popup** "Cek Reservasi" — input kode reservasi + nomor HP via `cekStatusReservasi` — bukan halaman cek status tersendiri. Tombol kembali memunculkan dialog peringatan ("kode tidak akan tampil lagi") lalu mengarahkan ke form reservasi. Route lama `/reservasi/status` kini hanya **redirect** ke halaman cek.
>
> Halaman reservasi customer juga menyediakan: tombol **Unduh QRIS** pada langkah bayar DP (menyimpan gambar QRIS statis ke perangkat), opsi **Meja Bebas** yang bisa dipilih (sistem otomatis memilih meja kosong paling pas, termasuk meja Tanpa QR; grup yang lebih besar dari kapasitas satu meja tetap bisa — resto menggabungkan meja, dan server melewati cek kapasitas untuk mode ini), serta pratinjau keranjang pre-order berupa **panel melayang di kanan** pada desktop (maks 5 item + tombol lihat menu lain, tiap item bisa ditambah/dikurangi langsung) dan sheet bawah pada mobile (maks 5 item + tombol lihat menu lain).
>
> Catatan PBI-7.5: Refund hanya untuk CASHIER, wajib minimal 1 bukti foto, dan dibatasi maksimal **3 hari sejak pesanan dibuat** (`createdAt`). Tombol refund tersedia di halaman Pesanan (Pesanan Aktif & Riwayat); untuk pesanan yang lewat 3 hari tombol tetap tampil tetapi disabled. Di halaman Kasir, refund hanya dapat diakses dari detail pesanan aktif, bukan dari tabel Riwayat. Tab Pesanan Aktif hanya menampilkan pesanan 24 jam terakhir.
>
> Catatan PBI-7.4: Meja otomatis dikosongkan saat pesanan selesai, dibatalkan, atau pesanan kedaluwarsa (tidak dibayar 60 menit). Selain itu tersedia tombol "Kosongkan Meja" manual untuk OWNER, CASHIER, dan WAITER (pesanan yang belum dibayar ikut dibatalkan). Ditambah lagi, saat lewat tengah malam (00:00) sisa pesanan aktif yang belum dibayar ikut dibatalkan otomatis oleh `getNotifikasiTerlambat()` — lihat PBI-8.4.
>
> Catatan PBI-7.3 (pembagian hak akses shift):
> - **CASHIER** — hanya boleh **buka/tutup shift sendiri** dan **melihat riwayat shift sendiri** (read-only). Tidak bisa mengatur jadwal shift maupun melihat/mengubah shift kasir lain.
> - **OWNER** — configuring jadwal shift (tambah/edit/hapus slot) + monitoring seluruh riwayat shift (read-only, termasuk filter per kasir). Tidak membuka/menutup shift kasir.
> - **WAITER** — **tidak punya akses shift sama sekali** (menu disembunyikan, route `/dashboard/shift` diblokir proxy, aksi shift menolak role ini). Alasan: shift melacak uang awal/akhir kas (drawer) yang dipegang kasir.
> - Jadwal shift & riwayat shift berada di satu halaman `/dashboard/shift` (tab terpisah). Menu sidebar owner: "Shift" (mobile & desktop) — sebelumnya ada link `/dashboard/jadwal-shift` yang **404**.

### Modul 8: Notifikasi, QR & Backup
*Fitur prioritas. Detail user story & spesifikasi menyusul.*

| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-8.1 | Download QR meja | Todo |
| PBI-8.2 | Notifikasi perubahan status pesanan ke customer | Todo |
| PBI-8.3 | Backup data | Todo |
| PBI-8.4 | Notifikasi pesanan terlambat di dashboard (lonceng + badge) | Done |

> Catatan PBI-8.4: Lonceng notifikasi **selalu tampil** di header dashboard untuk
> **OWNER, CASHIER, dan WAITER** (semua halaman dashboard). Badge menampilkan jumlah
> pesanan yang **sudah >30 menit belum ditangani** — status `menunggu` (belum di-acknowledge)
> maupun `diproses` (sudah bayar, belum diantar). Klik lonceng untuk melihat daftar
> pesanan terlambat + tautan ke detail pesanan; bunyi/voice alert baru saat ada pesanan
> terlambat **baru** terdeteksi. **Reset tiap tengah malam (00:00):** notifikasi hanya
> berlaku untuk pesanan yang dibuat **hari ini**, dan sisa pesanan yang **belum dibayar**
> otomatis dibatalkan + mejanya dikosongkan (`CANCEL_ORDER_EXPIRED`), sehingga tidak
> menggantung selamanya seperti sebelumnya. Pesanan yang **sudah dibayar** tidak
> dibatalkan otomatis (perlu refund manual) — hanya dikeluarkan dari daftar notifikasi.
> Sumber data tunggal: `src/app/actions/notifikasi.ts` → `getNotifikasiDashboard()`,
> ditampilkan lewat lonceng header (`StaleNotificationBell`). Banner terpisah di
> `/dashboard` sudah dihapus agar tidak duplikat.

### Modul 9: Non-Fungsional & Pengujian
*Fitur prioritas. Detail user story & spesifikasi menyusul.*

| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-9.1 | Caching | Todo |
| PBI-9.2 | Realtime | Todo |
| PBI-9.3 | Pengujian Ramadhan (50 orang) | Todo |
| PBI-9.4 | Data uji menu (contoh: Abi Coffee) | Todo |

### Modul 10: Voucher & Diskon
*Fitur prioritas. Detail user story & spesifikasi menyusul.*

| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-10.1 | Voucher: buat, edit, non-aktifkan (oleh OWNER) | Done |
| PBI-10.2 | Voucher diskon % per total pembelian | Done |
| PBI-10.3 | Voucher dengan minimal pembelian tertentu | Done |
| PBI-10.4 | Pilih voucher di panel/sheet keranjang customer | Done |

> Catatan PBI-10.x: Management voucher berada sebagai tab **Voucher** di halaman Menu (`/dashboard/menu`) — tidak menambah menu sidebar. Customer memilih voucher lewat pemilih kartu di panel keranjang `xl` / sheet keranjang mobile (nama, kode, diskon, minimal belanja, status "Belum cukup"/"Dipakai", input kode opsional); kartu voucher di halaman menu sudah dihapus agar tidak memakan ruang. Diskon hanya untuk voucher berstatus aktif, minimal belanja & kode voucher divalidasi ulang di server saat pesanan dibuat (client tidak dipercaya). Nilai diskon disimpan di `pesanan.diskon_voucher` dan `pesanan.voucher_id`.

## 4. Definition of Done

- [ ] Semua PBI Modul 1-10 selesai
- [x] Database schema dengan 16 model + relasi
- [x] Auth system dengan NextAuth v5
- [x] Server Actions untuk semua operasi CRUD
- [x] Customer self-order flow end-to-end
- [x] Export PDF (jsPDF) dan Excel
- [ ] Real-time update dengan Pusher
- [x] Image upload dengan UploadThing
- [x] Pembayaran QRIS statis + verifikasi manual kasir
- [x] Logging untuk semua aksi penting

## 5. Future Plans

### Technical Debt
- [x] Unit test (vitest) untuk server actions
- [ ] Integration test untuk flow pesanan + pembayaran
- [ ] CI/CD (GitHub Actions) untuk auto lint + test
- [ ] Deploy ke Vercel + database production

### Fitur Baru
- [ ] QR Generator untuk cetak QR meja
- [ ] Multi-outlet support
- [ ] Dark mode untuk dashboard
- [ ] Mobile responsive lebih baik
