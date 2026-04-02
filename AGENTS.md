<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pringmoni - Resto POS & Monitoring

## Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── pesanan/page.tsx
│   │   ├── kasir/page.tsx
│   │   ├── menu/page.tsx
│   │   └── meja/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── pesanan/route.ts
│       ├── kasir/route.ts
│       ├── menu/route.ts
│       └── meja/route.ts
├── components/
│   ├── ui/              # shadcn components
│   ├── pesanan/
│   ├── kasir/
│   └── layout/
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── auth.ts
└── types/
    └── index.ts
```

## Types
```typescript
// User & Auth
export type RoleUser = 'owner' | 'cashier' | 'waiter'
export interface User { id: number; username: string; email?: string; role: RoleUser; status: boolean }

// Meja
export type StatusMeja = 'kosong' | 'terpakai'
export interface Meja { id: number; nomorMeja: string; kapasitas: number; tokenMeja?: string; statusMeja: StatusMeja }

// Menu
export type StatusMenu = 'tersedia' | 'habis' | 'nonaktif'
export interface KategoriMenu { id: number; namaKategori: string }
export interface Menu { id: number; namaMenu: string; deskripsi?: string; harga: number; kategoriId: number; kategori?: KategoriMenu; statusMenu: StatusMenu; fotoUrl?: string }

// Pesanan
export type StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'
export type StatusBayar = 'menunggu' | 'berhasil' | 'dibatalkan'
export type MetodePembayaran = 'qris' | 'tunai'
export interface DetailPesananItem { id: number; menuId: number; menuName: string; jumlah: number; hargaSaatPesan: number; catatanItem?: string }
export interface Pesanan { id: number; mejaId: number; meja?: Meja; waiterId?: number; kasirId?: number; statusPesanan: StatusPesanan; catatan?: string; totalHarga: number; metodePembayaran?: MetodePembayaran; jumlahBayar?: number; kembalian: number; statusPembayaran: StatusBayar; createdAt: string; detailPesanan: DetailPesananItem[] }

// Dashboard
export interface DashboardStats { totalPesananHariIni: number; totalPendapatanHariIni: number; mejaTerpakai: number; mejaKosong: number; pesananMenunggu: number }
```

## Tech Stack
- Next.js 16 (App Router)
- Prisma + PostgreSQL
- Supabase Realtime, Supbase Storage
- NextAuth v5 (beta)
- Tailwind CSS + shadcn/ui
- UploadThing (image upload)
