# AGENTS-FE.md - Panduan Frontend Developer

> **Referensi Utama:** `AGENTS.md` - Semua aturan, struktur, dan konvensi ada di sana.

---

## Role & Akses Folder

### FE-1: Customer, Waiter & Cashier
**Akses folder:**
- `src/app/(customer)/` - Halaman customer kiosk
- `src/app/(auth)/login/` - Halaman login
- `src/app/dashboard/pesanan/` - Kelola pesanan (waiter)
- `src/app/dashboard/kasir/` - Halaman kasir (cashier)
- `src/components/customer/` - Komponen customer
- `src/components/pesanan/` - Komponen pesanan
- `src/components/kasir/` - Komponen kasir

**Tugas:** UI customer kiosk, login, kelola pesanan (waiter), kasir (cashier)

### FE-2: Owner / Admin
**Akses folder:**
- `src/app/dashboard/page.tsx` - Halaman utama dashboard (statistik)
- `src/app/dashboard/user/` - Kelola user
- `src/app/dashboard/menu/` - Kelola menu
- `src/app/dashboard/meja/` - Kelola meja
- `src/app/dashboard/laporan/` - Laporan & analitik
- `src/components/dashboard/` - Komponen dashboard/admin

**Tugas:** UI dashboard owner, statistik, CRUD user/menu/meja, laporan, analitik

---

## PBI yang Bisa Dikerjakan

### FE-1 (Customer, Waiter, Cashier)

#### Modul 1: Auth
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.1 | Login & Logout - UI | 🔲 |

#### Modul 2: Pesanan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (customer kiosk / waiter input manual) - UI | 🔲 |
| PBI-2.2 | Kelola Item Pesanan (tambah/edit/hapus item) - UI | 🔲 |
| PBI-2.3 | Status & Pembatalan (tampil status, batal) - UI | 🔲 |

#### Modul 3: Pembayaran
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-3.1 | Hitung Total (subtotal, pajak, kembalian) - UI | 🔲 |
| PBI-3.2 | Pembayaran (tunai/non-tunai) - UI | 🔲 |
| PBI-3.3 | Struk (tampil/cetak) - UI | 🔲 |

#### Fitur Tambahan
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Customer Kiosk | Menu digital via scan QR | 🔲 |
| QR Generation | Generate QR code meja | 🔲 |

---

### FE-2 (Owner / Admin)

#### Modul 1: Manajemen
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.2 | CRUD User - UI (tambah/edit/hapus user) | 🔲 |
| PBI-1.3 | CRUD Meja - UI (tambah/edit/hapus meja) | 🔲 |
| PBI-1.4 | CRUD Menu - UI (tambah/edit/hapus menu) | 🔲 |

#### Modul 4: Sistem
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-4.1 | Logging - UI (tampil log aktivitas) | 🔲 |

#### Modul 5: Laporan & Analitik
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-5.1 | Laporan - UI (pendapatan harian/bulanan) | 🔲 |
| PBI-5.2 | Analitik - UI (menu terlaris, jumlah terjual) | 🔲 |

#### Dashboard
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Dashboard Utama | Statistik ringkasan (total pesanan, pendapatan) | 🔲 |
| Real-time Update | Status pesanan real-time di dashboard | 🔲 |

---

## Fitur yang TIDAK Bisa Dikerjakan (Harus BE)

- Logika database (Prisma schema)
- Server Actions (CRUD di `src/app/actions/`) — meja.ts, menu.ts, pesanan.ts, user.ts, log.ts, laporan.ts, struk.ts
- Auth logic (login, session)
- API routes

---

## Alur Kerja

```
1. Pilih PBI dari daftar di atas
2. Tanya FE lead/manager: "Boleh kerja PBI-2.1?"
3. Kalau dapat persetujuan → baru generate code
4. Setelah selesai → submit PR untuk review
5. Review oleh lead/manager → merge
```

---

## Catatan Penting

- **Jangan ubah folder `src/app/actions/`, `prisma/`, `src/lib/`**
- **FE-1 → jangan ubah folder FE-2, FE-2 → jangan ubah folder FE-1**
- **Selalu tanya/opencode dengan merujuk file ini:**
  > "FE-1 mau kerja PBI-2.1, cek AGENTS-FE.md dulu ya"
- **Komponen UI:** Pakai shadcn/ui (`src/components/ui/`)
- **Style:** Tailwind CSS v4
- **Halaman baru:** Buat folder route baru di `src/app/` sesuai kebutuhan (contoh: `dashboard/laporan/`)

---

## Checklist sebelum generate

- [ ] Sudah dapat persetujuan dari lead?
- [ ] Cek versi library di `AGENTS.md`
- [ ] Survei API jika perlu
- [ ] UI sesuai shadcn/ui convention?