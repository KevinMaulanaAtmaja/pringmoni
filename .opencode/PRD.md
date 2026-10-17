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
| Payment | Midtrans | - |

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
- Proses pembayaran (tunai, QRIS, transfer via Midtrans)
- Hitung kembalian otomatis
- Cetak struk PDF
- Riwayat transaksi

### Manajemen Stok & Resep
- Master bahan dengan dua lokasi: **Gudang** & **Dapur**
- Restock, koreksi/limbah, dan **transfer Gudang -> Dapur**
- Riwayat pergerakan stok per bahan
- **Resep menu** (komposisi bahan dapur + jumlah per porsi)
- Ketersediaan menu **otomatis dari stok dapur** (porsi tersedia)
- Pengurangan stok dapur otomatis saat pesanan dibuat
- Menu tanpa resep lengkap / porsi habis otomatis tidak dapat dipesan

## 3. Product Backlog (PBI)

### Modul 1: User Management
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.1 | Login & Logout (role-based) | Done |
| PBI-1.2 | CRUD User | Done |
| PBI-1.3 | CRUD Meja (token unik) | Done |
| PBI-1.4 | CRUD Menu (kategori, foto) | Done |

> Catatan PBI-1.4: Menu tidak lagi punya "mode manual" — ketersediaan mengacu pada resep (lihat Modul 7 & 8).

### Modul 2: Pesanan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (QR scan / manual) | Done |
| PBI-2.2 | Kelola Item Pesanan | Done |
| PBI-2.3 | Status & Pembatalan | Done |

> Catatan PBI-2.1: Pemesanan kini tunduk pada validasi resep & stok dapur — menu wajib punya resep lengkap dan porsi tersedia, jika tidak maka ditolak server (lihat Modul 7 & 8).

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

### Modul 6: Manajemen Stok Bahan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-6.1 | CRUD Bahan (nama, satuan, kategori, harga/satuan, stok minimum, status stok) | Done |
| PBI-6.2 | Klasifikasi lokasi stok: Gudang & Dapur | Done |
| PBI-6.3 | Restock bahan & koreksi/limbah | Done |
| PBI-6.4 | Transfer bahan Gudang -> Dapur | Done |
| PBI-6.5 | Riwayat/log pergerakan stok per bahan | Done |

### Modul 7: Resep Menu (BOM)
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-7.1 | Rakit resep menu (bahan dapur + jumlah per porsi) | Done |
| PBI-7.2 | Validasi kelengkapan resep (min. 1 bahan utama + 1 bumbu) | Done |

### Modul 8: Ketersediaan Otomatis
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-8.1 | Hitung porsi tersedia dari stok dapur | Done |
| PBI-8.2 | Pengurangan stok dapur otomatis saat pesanan dibuat | Done |
| PBI-8.3 | Gate pemesanan: resep tak lengkap / porsi habis ditolak | Done |
| PBI-8.4 | Tampilkan sisa porsi / "Stok Habis" di menu customer | Done |

## 4. Definition of Done

- [ ] Semua PBI Modul 1-8 selesai
- [ ] Database schema dengan 11 model + relasi
- [ ] Auth system dengan NextAuth v5
- [ ] Server Actions untuk semua operasi CRUD
- [ ] Customer self-order flow end-to-end
- [ ] Export PDF (jsPDF) dan Excel
- [ ] Real-time update dengan Pusher
- [ ] Image upload dengan UploadThing
- [ ] Payment gateway Midtrans
- [ ] Logging untuk semua aksi penting

## 5. Future Plans

### Technical Debt
- [ ] Unit test (vitest) untuk server actions
- [ ] Integration test untuk flow pesanan + pembayaran
- [ ] CI/CD (GitHub Actions) untuk auto lint + test
- [ ] Deploy ke Vercel + database production

### Fitur Baru
- [ ] QR Generator untuk cetak QR meja
- [ ] Multi-outlet support
- [ ] Dark mode untuk dashboard
- [ ] Mobile responsive lebih baik
