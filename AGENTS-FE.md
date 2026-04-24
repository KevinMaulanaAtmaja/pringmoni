# AGENTS-FE.md - Panduan Frontend Developer

> **Referensi Utama:** `AGENTS.md` - Semua aturan, struktur, dan konvensi ada di sana.

---

## Role & Akses Folder

### FE-1: Dashboard & Kasir
**Akses folder:**
- `src/app/dashboard/` - Halaman dashboard
- `src/app/dashboard/pesanan/` - Kelola pesanan
- `src/app/dashboard/kasir/` - Halaman kasir
- `src/components/dashboard/` - Komponen dashboard
- `src/components/kasir/` - Komponen kasir

**Tugas:** UI halaman admin, statistik, kelola pesanan, kasir

### FE-2: Customer & Admin
**Akses folder:**
- `src/app/(customer)/` - Halaman customer
- `src/app/dashboard/menu/` - Kelola menu
- `src/app/dashboard/meja/` - Kelola meja
- `src/components/customer/` - Komponen customer

**Tugas:** UI customer kiosk, CRUD menu, CRUD meja

---

## PBI yang Bisa Dikerjakan

### Modul 2: Pesanan (FE-1)
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (QR scan / input manual) - UI | 🔲 |
| PBI-2.2 | Kelola Item Pesanan (tambah/edit/hapus item) - UI | 🔲 |
| PBI-2.3 | Status & Pembatalan (tampil status, batal) - UI | 🔲 |

### Modul 3: Pembayaran (FE-1)
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-3.1 | Hitung Total (subtotal, pajak, kembalian) - UI | 🔲 |
| PBI-3.2 | Pembayaran (tunai/non-tunai) - UI | 🔲 |
| PBI-3.3 | Struk (tampil/cetak) - UI | 🔲 |

### Modul 1: CRUD (FE-2)
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.3 | CRUD Meja - UI | 🔲 |
| PBI-1.4 | CRUD Menu - UI | 🔲 |

### Fitur Tambahan (FE-2)
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Customer Kiosk | Menu digital via scan QR | 🔲 |
| QR Generation | Generate QR code meja | 🔲 |

---

## Fitur yang TIDAK Bisa Dikerjakan (Harus BE)

- Logika database (Prisma schema)
- Server Actions (CRUD di `src/app/actions/`)
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
- **Selalu tanya/opencode dengan merujuk file ini:**
  > "FE-1 mau kerja PBI-2.1, cek AGENTS-FE.md dulu ya"
- **Komponen UI:** Pakai shadcn/ui (`src/components/ui/`)
- **Style:** Tailwind CSS v4

---

## Checklist sebelum generate

- [ ] Sudah dapat persetujuan dari lead?
- [ ] Cek versi library di `AGENTS.md`
- [ ] Survei API jika perlu
- [ ] UI sesuai shadcn/ui convention?