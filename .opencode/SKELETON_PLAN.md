# Rencana Skeleton Page - Pringmoni

> Analisis dan keputusan penerapan `loading.tsx` / skeleton page, fokus pada area dashboard OWNER.
> Dibuat: 2026-11-16.

## 1. Prinsip

- `loading.tsx` adalah Suspense boundary Next.js. File ini tampil **hanya saat server component async masih `await`**.
- Halaman `"use client"` mengambil data di `useEffect` dan sudah punya skeleton/spinner internal. `loading.tsx`-nya hanya muncul sepersekian detik saat chunk JS dimuat → nilainya sebagai "anti-blank" saat transisi.
- Ukuran skeleton wajib mengikuti kotak asli: Card `rounded-2xl px-6 py-6`, chart `h-48`, Table header `h-9` / baris `h-12`, dll.

## 2. Klasifikasi route

### Paling perlu
- `/dashboard` — async server, 4 `await`: `auth()`, `getDashboardStats()`, `getDashboardCharts()`, `getStaleOrders()`.

### Cukup perlu (anti-blank saat transisi)
- Pesanan, Menu, Stok Bahan, Meja, Akun, Logging, Laporan, Shift — sering dibuka, mencegah layar kosong saat chunk JS dimuat.

### Tidak perlu / opsional dihapus
- `/login`, `/reset-password`, `/reset-password/[token]` — form statis, tanpa fetch saat mount.
- `/` (landing) — hanya `auth()` + redirect, sangat cepat.
- `/dashboard/testing` — halaman dev, hanya `auth()`.
- Sub-route customer (`checkout`, `pembayaran`, `pesanan`) — sudah punya `Loader2` internal; cukup satu `(customer)/[tokenMeja]/loading.tsx`.
- `pesanan/[id]`, `kasir/pesanan-baru/[id]` — sudah punya skeleton internal sendiri.

## 3. Aturan judul

| Jenis judul | Perlakuan | Contoh |
|---|---|---|
| **Statis** | Teks asli lewat `titleText` / `PageTitle` | Kelola Pesanan, Kelola Kasir, Buat Pesanan Baru, Logging, Shift, Kelola Menu, dll. |
| **Dinamis** | Teks asli versi pendek (bagian yang tidak berubah) | `Detail Pesanan #{id}` → `Detail Pesanan`; `Menunggu Pembayaran`/`Pembayaran QRIS` → `Pembayaran` |
| **Layout bersama** | Teks brand `Pringmoni` | `(auth)/loading.tsx`, `(customer)/[tokenMeja]/loading.tsx`, root `loading.tsx` |

**Rule utama (berlaku untuk semua `loading.tsx`)**: judul **tidak boleh berubah menjadi skeleton bar** — teks harus tetap tampil saat skeleton page. Alasan: langsung memberi konteks dan menghindari "fake bar" yang berkedip. `PageSkeletonHeader` kini hanya dipakai jika judul benar-benar tidak diketahui.

Catatan: `loading.tsx` tidak bisa membaca session/`params` tanpa `await`, jadi teks `Dashboard Owner` tampil untuk semua role selama skeleton, lalu diganti judul sesuai role saat halaman aktif render. Untuk layout bersama dengan banyak judul (`(auth)`: Welcome Back / Lupa Password / Reset Password; customer: Checkout / Status Pesanan / Pembayaran), dipakai teks brand `Pringmoni` agar selalu benar.

## 4. Komponen reusable

`src/components/ui/page-skeleton.tsx`:

- `PageTitle` — `h1`, ukuran default `text-2xl`, bisa diubah lewat `titleClassName`
- `PageSkeletonHeader` — skeleton bar `h-8 w-56` untuk judul dinamis
- `PageSkeleton` — header + `StatCardsSkeleton` + `ChartCardsSkeleton`
- `StatCardsSkeleton` — variant `card` / `compact`
- `ChartCardsSkeleton`, `ChartBlockSkeleton`, `MiniCardsSkeleton`
- `ToolbarSkeleton`, `FilterBarSkeleton` (baris tab + filter)
- `TableSkeleton` — `columns`, `rows`, `headerHeight`, `rowHeight`, `titleText`
- `CardGridSkeleton` — `cards`, `gridClassName`, `cardHeight`, `cardClassName`, `titleText`
- `ListSkeleton`

## 5. Status implementasi

| Route | Preset | Judul |
|---|---|---|
| `/dashboard` | `PageSkeleton` 4 stat + 4 chart | `Dashboard Owner` (teks asli) |
| `/dashboard/laporan` | Toolbar + 4 compact + chart `h-48` + 6 mini | `Laporan & Analitik` |
| `/dashboard/pesanan` | FilterBar + CardGrid 6 kartu `h-60` (tab Aktif) | `Kelola Pesanan` |
| `/dashboard/menu` | Table 8 kolom | `Kelola Menu` |
| `/dashboard/stok-bahan` | Table 8 kolom | `Stok Bahan` |
| `/dashboard/meja` | Table 7 kolom | `Kelola Meja` |
| `/dashboard/users` | Table 6 kolom | `Kelola Akun` |
| `/dashboard/logging` | Table 6 kolom | `Logging` |
| `/dashboard/shift` | CardGrid 2, `h-40`, `rounded-lg` | `Shift` |
| `/dashboard/testing` | CardGrid 5 + 4 | `Whitebox Testing` |

### Route lain (rule yang sama)

| Route | Judul skeleton |
|---|---|
| `/` (root) | `Pringmoni` |
| `(auth)/*` | `Pringmoni` (bersama: Welcome Back / Lupa Password / Reset Password) |
| `(customer)/[tokenMeja]/*` | `Pringmoni` (bersama: menu / Checkout / Status Pesanan / Pembayaran) |
| `/dashboard/kasir` | `Kelola Kasir` |
| `/dashboard/kasir/pesanan-baru` | `Buat Pesanan Baru` |
| `/dashboard/kasir/pesanan-baru/[id]` | `Pembayaran` |
| `/dashboard/pesanan/[id]` | 2 kartu `h-96` + Table 6 kolom | `Detail Pesanan` |

## 6. Verifikasi

- `npm run lint -- --quiet` → bersih
- `npx tsc --noEmit` → bersih

## 7. Catatan

- Perubahan belum di-commit.
- `npm run graph:update` gagal di environment ini: executable `graphify` tidak ditemukan di PATH.
