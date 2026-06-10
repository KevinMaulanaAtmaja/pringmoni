# Pringmoni - Project Plan

## 1. Tujuan Proyek

Membangun sistem **Resto POS & Monitoring** untuk **Restoran Pringsewu** yang modern, efisien, dan mudah digunakan. Sistem mencakup:

- **Customer Self-Order** — pelanggan scan QR meja, pesan langsung dari HP tanpa login
- **Dashboard Admin** — owner/staff kelola pesanan, menu, meja, laporan, dan statistik
- **Kasir System** — proses pembayaran tunai/non-tunai dengan struk otomatis

## 2. MVP (Minimum Viable Product)

Fitur inti yang sudah berfungsi:

### Modul 1 — User Management ✅
| Fitur | Status |
|-------|--------|
| Login & Logout (role-based: owner, cashier, waiter) | ✅ |
| CRUD User (tambah/edit/hapus) | ✅ |
| CRUD Meja (dengan token unik per meja) | ✅ |
| CRUD Menu (dengan kategori, foto, status) | ✅ |
| Reset Password (via email) | ✅ |

### Modul 2 — Pesanan ✅
| Fitur | Status |
|-------|--------|
| Buat Pesanan (via QR scan / input manual) | ✅ |
| Kelola Item Pesanan (tambah/edit/hapus item) | ✅ |
| Status & Pembatalan (menunggu → diproses → selesai/dibatalkan) | ✅ |
| Customer Self-Order (scan QR, pilih menu, kirim pesanan) | ✅ |

### Modul 3 — Pembayaran ✅
| Fitur | Status |
|-------|--------|
| Hitung Total (subtotal, pajak, kembalian) | ✅ |
| Pembayaran (tunai, QRIS, transfer) | ✅ |
| Struk & Riwayat (PDF struk, riwayat transaksi) | ✅ |
| Midtrans Integration (payment gateway) | ✅ |

### Modul 4 — Sistem ✅
| Fitur | Status |
|-------|--------|
| Logging Activity (login, logout, CRUD, payment) | ✅ |

### Modul 5 — Laporan ✅
| Fitur | Status |
|-------|--------|
| Laporan Harian/Mingguan/Bulanan/Tahunan | ✅ |
| Export PDF & Excel | ✅ |
| Ranking Menu Terlaris | ✅ |
| Statistik Kasir | ✅ |

## 3. Fitur Lengkap

### Customer-Facing
- Menu digital per meja (via token QR)
- Keranjang belanja
- Checkout & kirim pesanan
- Lihat status pesanan real-time
- Pembayaran via Midtrans (QRIS, transfer, virtual account)

### Admin Dashboard
- Statistik overview (pendapatan, pesanan, grafik)
- Manajemen pesanan (lihat, proses, selesai, batalkan)
- Manajemen menu (tambah, edit, hapus, kategori, foto)
- Manajemen meja (tambah, edit, status, token QR)
- Manajemen user (tambah, edit, hapus, role)
- Laporan (filter tanggal, export PDF/Excel)
- Logging aktivitas

### Kasir System
- Pesanan baru (input manual)
- Proses pembayaran (tunai, QRIS, transfer)
- Hitung kembalian otomatis
- Cetak struk PDF
- Riwayat transaksi

## 4. DOD (Definition of Done) & Kendala

### Sudah Tercapai
- Semua PBI Modul 1-5 selesai
- Database schema dengan 8 model + relasi lengkap
- Auth system dengan NextAuth v5
- Server Actions untuk semua operasi CRUD
- Customer self-order flow end-to-end
- Export PDF (jsPDF) dan Excel (exceljs)
- Real-time update dengan Pusher
- Image upload dengan UploadThing
- Payment gateway Midtrans
- Logging untuk semua aksi penting

### Kendala / Catatan
| No | Kendala | Dampak | Status |
|----|---------|--------|--------|
| 1 | NextAuth v5 masih beta (5.0.0-beta.31) | Mungkin ada API changes saat stable | Monitor |
| 2 | UploadThing + effect vulnerability (HIGH) | Risiko rendah untuk use case kami | Di-skip |
| 3 | postcss vulnerability via Next.js | Akan ter-resolve otomatis saat Next.js update | Auto-fix |
| 4 | uuid vulnerability via exceljs | Transitive dep, risiko rendah | Di-skip |
| 5 | npm peer dep warning (nodemailer v8 vs next-auth) | Tidak masalah saat runtime | Di-skip |
| 6 | Belum ada test otomatis (unit test / integration) | Risiko regresi | Perlu |
| 7 | Belum ada deployment ke production | Hanya jalan di local | Perlu |

## 5. Plan Next Semester

### Technical Debt
- [ ] Tambah **unit test** (vitest) untuk server actions
- [ ] Tambah **integration test** untuk flow pesanan + pembayaran
- [ ] Setup **CI/CD** (GitHub Actions) untuk auto lint + test
- [ ] **Deploy ke Vercel** + database production (Neon/ Supabase)

### Fitur Baru (Potential)
- [ ] **Notifikasi real-time** di dashboard (Pusher sudah terintegrasi)
- [ ] **QR Generator** untuk cetak QR meja langsung dari web
- [ ] **Multi-outlet** support (untuk cabang)
- [ ] **Dark mode** untuk dashboard
- [ ] **Mobile responsive** lebih baik untuk customer order
- [ ] **Menu gambar** dengan crop/optimasi upload

### Security Hardening
- [ ] Upgrade NextAuth ke stable release jika sudah rilis
- [ ] Pantau update UploadThing untuk fix effect vulnerability
- [ ] Tambah rate limiting di API routes
- [ ] Audit keamanan berkala

### Dokumentasi
- [ ] Buku Panduan Pengguna (untuk staff restoran)
- [ ] Dokumentasi API / Server Actions
- [ ] Panduan deployment
- [ ] Panduan troubleshooting

---

*Dokumen ini dibuat: Juni 2026*
