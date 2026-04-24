<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pringmoni - Resto POS & Monitoring

## Konteks Project

Project ini adalah **Project Based Learning (PBL)** untuk mitra kami: **Restoran Pringsewu**. Tujuan utama adalah membuat sistem manajemen pesanan dan kasir yang modern dan efisien.

### Fitur Utama:
1. **Customer Self-Order**: Customer scan QR code di masing-masing meja (dengan token meja berbeda) lalu akses halaman menu dan pesan langsung tanpa perlu login
2. **Dashboard Admin**: Untuk owner/staff melihat pesanan, menu, meja, dan statistik
3. **Kasir System**: Untuk proses pembayaran

### Catatan Penting:
- Project ini adalah project PBL belajar, sehingga perlu mempertimbangkan:
  - Gunakan library/dependency yang **free** dan **sesuai untuk pembelajaran**
  - Hindari dependency yang memerlukan biaya langganan mahal
  - Dokumentasi yang lengkap dan komunitas yang aktif

### Pembatasan Kerja

| Aktivitas | Diizinkan |
|-----------|-----------|
| `npm run dev` | ❌ Tidak - dijalankan oleh user |
| `npm run build` | ✅ Diizinkan |
| `npm run lint` | ✅ Diizinkan |
| Install dependencies baru | ⚠️ Hanya BE yang boleh |

### Pembagian Role

Project ini dipisahkan peran untuk pembelajaran:

| Role | File Panduan | Akses Folder | Tugas |
|------|-------------|--------------|-------|
| **Frontend (FE)** | `AGENTS-FE.md` | `src/app/`, `src/components/`, `src/types/` | UI, halaman, interaksi user |
| **Backend (BE)** | `AGENTS-BE.md` | `prisma/`, `src/app/actions/`, `src/lib/` | Database, API, logika backend |
| **Tester** | `AGENTS-TESTER.md` | Semua folder (test only) | Test fitur, verifikasi |

**Catatan Security & Performance:**
- **Security Engineer**: Invoke dengan `@secu-engi` (read-only, kasih saran)
- **Performance Engineer**: Invoke dengan `@perf-engi` (bisa bash, kasih saran)

Contoh:
```
@secu-engi cek security di halaman login
@perf-engi analisis performa dashboard
```

**CATATAN:**
- **Sebelum generate code, SELALU tanya/interaktif:**
  > "FE mau kerja PBI-2.1, cek AGENTS-FE.md dulu ya"
- **Jangan langsung generate** - harus dapat persetujuan lead/manager
- **Referensi utama:** `AGENTS.md` - semua aturan dan konvensi ada di sini

### Versi yang Sedang Digunakan

Selalu cek dan sesuaikan dengan versi di `package.json`:

| Library | Versi Terinstall |
|---------|------------------|
| Next.js | 16.2.1 |
| React | 19.2.4 |
| NextAuth | 5.0.0-beta.30 |
| Prisma | 5.22.0 |
| Tailwind CSS | 4 |
| shadcn/ui | 4.1.1 |

**Sebelum menulis code, WAJIB:**
1. Cek dokumentasi resmi Next.js (`node_modules/next/dist/docs/`)
2. Survey/search perubahan API karena versi Next.js 16 dan React 19 punya breaking changes
3. Sesuaikan pattern code dengan versi yang terinstall

---

## Tech Stack (Free & Beginner-Friendly)

| Kategori | Library/Dependency | Catatan |
|----------|---------------------|---------|
| Database | **Prisma + PostgreSQL** | v5.22.0 |
| Auth | **NextAuth v5** | v5.0.0-beta.30, free, open source |
| UI | **Tailwind CSS + shadcn/ui** | v4 + v4.1.1 |
| Hosting | **Vercel (free tier)** | Free untuk hobby |
| Route Protection | **Next.js Proxy** | Route protection (Next.js 16) |
| PDF Generation | **jsPDF** | v4.2.1, free |
| Real-time | **Pusher** | v5.3.3 |
| Image Upload | **UploadThing** | v7.7.4, free tier |

**Proxy (`proxy.ts`)**: Melindungi route dashboard, redirect ke login kalau belum login.

### Breaking Changes & Catatan Penting:
- **Next.js 16**: Middleware di-rename jadi `proxy.ts` dengan function `proxy()`
- **React 19**: Ada breaking changes dengan Server Components
- **NextAuth v5 beta**: API berbeda dengan v4, menggunakan `auth()` function
- **Tailwind CSS v4**: Konfigurasi berbeda (gunakan CSS-based config)
- **shadcn/ui v4**: Menggunakan Tailwind CSS v4

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Landing page (home restoran)
│   ├── (auth)/                     # Halaman Auth
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (customer)/                # Halaman Public untuk Customer
│   │   ├── [tokenMeja]/            # Dynamic route: /{tokenMeja}
│   │   │   ├── page.tsx            # Menu & pesan (tanpa login)
│   │   │   └── pesanan/page.tsx   # Lihat pesanan sendiri
│   │   └── layout.tsx
│   ├── dashboard/                  # Dashboard Admin (memerlukan login)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Statistik
│   │   ├── pesanan/page.tsx       # Kelola pesanan
│   │   ├── kasir/page.tsx         # Pembayaran
│   │   ├── menu/page.tsx          # Kelola menu
│   │   └── meja/page.tsx           # Kelola meja
│   └── api/
│       └── auth/[...nextauth]/route.ts
│       
├── components/
│   ├── ui/                        # shadcn components
│   ├── customer/
│   ├── pesanan/
│   ├── kasir/
│   └── layout/
│
├── types/
│   └── index.ts
├── lib/
│   ├── prisma.ts                  # Database client
│   ├── utils.ts                  # Utility functions
│   └── auth.ts                   # NextAuth configuration
└── proxy.ts                       # Route protection (Next.js 16)
```

---

## Struktur Database (Prisma Schema)

Lihat `prisma/schema.prisma` untuk detail schema lengkap.

### Model Utama:

- **Users**: Akun owner, cashier, waiter
- **Meja**: Meja restoran (ada token unik per meja)
- **Menu**: Menu makanan/minuman
- **KategoriMenu**: Kategori menu
- **Pesanan**: Pesanan customer
- **DetailPesanan**: Item-item dalam pesanan
- **Logs**: Log aktivitas (untuk audit)

---

## API & Server Actions

Backend logic menggunakan **Server Actions** (Next.js App Router):

Server Actions diletakkan di `src/app/actions/` dengan penamaan langsung:

| File | Fungsi |
|------|--------|
| `src/app/actions/meja.ts` | getMejas, createMeja, updateMeja, getMejaByToken |
| `src/app/actions/menu.ts` | getMenus, createMenu, updateMenu, deleteMenu |
| `src/app/actions/pesanan.ts` | getPesanan, createPesanan, updateStatusPesanan, prosesPembayaran |

Auth sudah ada di `src/lib/auth.ts` (NextAuth configuration).

---

## Types

Lihat `src/types/index.ts` untuk semua type definitions.

---

## Cara Kerja Customer Self-Order

1. **Setup Meja**: Admin membuat meja dengan nomor dan token unik
2. **QR Code**: Generated QR code berisi URL: `{domain}/{tokenMeja}`
3. **Customer Scan**: Customer scan QR → redirect ke halaman menu
4. **Pilih Menu**: Customer pilih menu, masukkan jumlah, tambah ke keranjang
5. **Kirim Pesanan**: Customer kirim pesanan (tanpa login)
6. **Notifikasi**: Staff dapat melihat pesanan masuk via dashboard
7. **Pembayaran**: Customer ke kasir untuk pembayaran

---

## Folder & Naming Conventions

- **Page components**: `page.tsx` di folder route (Next.js App Router)
- **UI components**: `{nama}.tsx` (shadcn style)
- **Server actions**: langsung nama file (misal `meja.ts`, `menu.ts`) di folder `app/actions/`
- **Types**: `types/index.ts`
- **Utils**: `lib/utils.ts`

---

## Product Backlog (PBI)

### Modul 1: User Management

| PBI | Deskripsi |
|-----|----------|
| PBI-1.1 | Login & Logout (username/password, role-based, validasi) |
| PBI-1.2 | CRUD User (tambah/edit/hapus user, atur role) |
| PBI-1.3 | CRUD Meja (tambah/edit/hapus meja, status) |
| PBI-1.4 | CRUD Menu (tambah/edit/hapus menu, kategori, status) |

### Modul 2: Pesanan

| PBI | Deskripsi |
|-----|----------|
| PBI-2.1 | Buat Pesanan (QR scan / input manual) |
| PBI-2.2 | Kelola Item Pesanan (tambah/edit/hapus item) |
| PBI-2.3 | Status & Pembatalan (tampil status, batal sebelum bayar) |

### Modul 3: Pembayaran

| PBI | Deskripsi |
|-----|----------|
| PBI-3.1 | Hitung Total (subtotal, pajak, hitung kembalian) |
| PBI-3.2 | Pembayaran (tunai/non-tunai, simpan status) |
| PBI-3.3 | Struk & Riwayat (cetak/tampil struk, simpan riwayat) |

### Modul 4: Sistem

| PBI | Deskripsi |
|-----|----------|
| PBI-4.1 | Logging (log user activity, log system event) |

### Modul 5: Laporan & Analitik

| PBI | Deskripsi |
|-----|----------|
| PBI-5.1 | Laporan (harian/bulanan, total pendapatan) |
| PBI-5.2 | Analitik (ranking menu terlaris, jumlah terjual) |

---

## Fitur Tambahan (Beyond PBI)

Fitur ekstra untuk customer experience:

| Fitur | Deskripsi |
|-------|-----------|
| Customer Kiosk | Menu digital tanpa login via scan QR |
| QR Generation | Generate QR code meja dengan token unik |
| Real-time Update | Status pesanan real-time di dashboard |