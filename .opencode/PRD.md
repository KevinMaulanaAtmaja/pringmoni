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

## 3. Product Backlog (PBI)

### Modul 1: User Management
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.1 | Login & Logout (role-based) | Done |
| PBI-1.2 | CRUD User | Done |
| PBI-1.3 | CRUD Meja (token unik) | Done |
| PBI-1.4 | CRUD Menu (kategori, foto) | Done |

### Modul 2: Pesanan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (QR scan / manual) | Done |
| PBI-2.2 | Kelola Item Pesanan | Done |
| PBI-2.3 | Status & Pembatalan | Done |

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

## 4. Definition of Done

- [ ] Semua PBI Modul 1-5 selesai
- [ ] Database schema dengan 8 model + relasi
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
