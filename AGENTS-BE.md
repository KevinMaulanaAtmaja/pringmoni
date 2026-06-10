# AGENTS-BE.md - Panduan Backend Developer

> **Referensi Utama:** `AGENTS.md` - Semua aturan, struktur, dan konvensi ada di sana.

---

## Role & Akses Folder

**Akses folder:**
- `prisma/` - Schema database & migration
- `src/app/actions/` - Server Actions (CRUD)
- `src/lib/` - Konfigurasi (prisma, auth, utils)
- `src/proxy.ts` - Route protection

**Tugas:** Database schema, logika server actions, auth, API

---

## PBI yang Bisa Dikerjakan

### Modul 1: User Management (CRUD + Auth)
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-1.1 | Login & Logout (auth logic) | 🔲 |
| PBI-1.2 | CRUD User (database + actions) | 🔲 |
| PBI-1.3 | CRUD Meja (database + actions) | 🔲 |
| PBI-1.4 | CRUD Menu (database + actions) | 🔲 |

### Modul 2: Pesanan
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-2.1 | Buat Pesanan (createPesanan action) | 🔲 |
| PBI-2.2 | Kelola Item Pesanan (update detail) | 🔲 |
| PBI-2.3 | Status & Pembatalan (updateStatus action) | 🔲 |

### Modul 3: Pembayaran
| PBI | Deskripsi | Status |
|-----|------------|--------|
| PBI-3.1 | Hitung Total (subtotal, pajak) | 🔲 |
| PBI-3.2 | Pembayaran (simpan status) | 🔲 |
| PBI-3.3 | Struk & Riwayat (generasi struk, query riwayat) | 🔲 |

### Modul 4: Sistem
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-4.1 | Logging (create log action) | 🔲 |

### Modul 5: Laporan & Analitik
| PBI | Deskripsi | Status |
|-----|----------|--------|
| PBI-5.1 | Laporan (query pendapatan harian/bulanan) | 🔲 |
| PBI-5.2 | Analitik (query menu terlaris, jumlah terjual) | 🔲 |

---

## File yang Harus Dikerjakan

| File | Fungsi | Status |
|------|--------|--------|
| `prisma/schema.prisma` | Database schema | 🔲 |
| `src/lib/prisma.ts` | Prisma client | 🔲 |
| `src/lib/auth.ts` | NextAuth config | 🔲 |
| `src/app/actions/meja.ts` | CRUD meja | 🔲 |
| `src/app/actions/menu.ts` | CRUD menu | 🔲 |
| `src/app/actions/pesanan.ts` | CRUD pesanan | 🔲 |
| `src/app/actions/user.ts` | CRUD user | 🔲 |
| `src/app/actions/log.ts` | Logging activity | 🔲 |
| `src/app/actions/laporan.ts` | Laporan & analitik queries | 🔲 |
| `src/app/actions/struk.ts` | Generate struk PDF | 🔲 |

---

## Fitur yang TIDAK Bisa Dikerjakan (Harus FE)

- Halaman UI (`src/app/page.tsx`, dll)
- Komponen UI (`src/components/`)
- Styling CSS/Tailwind
- Interaksi browser/React hooks

---

## Alur Kerja

```
1. Pilih PBI dari daftar di atas
2. Tanya lead/manager: "Boleh kerja PBI-1.2?"
3. Kalau dapat persetujuan → buat schema dulu, lalu actions
4. Test pakai `npx prisma db push` / `npm run build`
5. Setelah selesai → submit PR untuk review
6. Review → merge kalau OK
```

---

## Catatan Penting

- **Jangan ubah folder `src/app/` (halaman), `src/components/`**
- **Selalu tanya/opencode dengan merujuk file ini:**
  > "BE mau kerja PBI-1.2, cek AGENTS-BE.md dulu ya"
- **Server Actions:** Pakai `use server` directive
- **Auth:** NextAuth v5 beta - cek `AGENTS.md` untuk breaking changes

---

## Checklist sebelum generate

- [ ] Sudah dapat persetujuan dari lead?
- [ ] Cek versi Prisma, NextAuth di `AGENTS.md`
- [ ] Schema sudah di-update dulu sebelum actions?
- [ ] Test `npx prisma validate` sebelum commit?

---

## Urutan Kerja (PBI Baru)

```
1. Update schema.prisma (kalau perlu)
2. Jalankan: npx prisma db push
3. Generate type: npx prisma generate
4. Buat/update Server Actions
5. Test dengan npm run build
```