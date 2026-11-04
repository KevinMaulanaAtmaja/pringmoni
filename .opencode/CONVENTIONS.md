# Code Conventions - Pringmoni

## File Naming

| Tipe | Convention | Contoh |
|------|-----------|--------|
| Page components | `page.tsx` | `src/app/dashboard/page.tsx` |
| UI components | `{nama}.tsx` | `Button.tsx`, `Modal.tsx` |
| Server actions | `{nama}.ts` | `meja.ts`, `menu.ts` |
| Types | `index.ts` | `src/types/index.ts` |
| Utils | `{nama}.ts` | `src/lib/utils.ts` |

## Folder Structure

```
src/
├── app/              # Routes & pages (Next.js App Router)
│   ├── actions/      # Server Actions (BE only)
│   ├── (auth)/       # Auth pages
│   ├── (customer)/   # Public customer pages
│   └── dashboard/    # Admin dashboard
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── customer/     # Customer-specific components
│   ├── pesanan/      # Order components
│   ├── kasir/        # Cashier components
│   └── layout/       # Layout components
├── types/            # TypeScript type definitions
├── lib/              # Utilities & config
│   ├── prisma.ts     # Prisma client
│   ├── auth.ts       # NextAuth config
│   └── utils.ts      # Utility functions
└── proxy.ts          # Route protection (Next.js 16)
```

## Code Style

### TypeScript
- Use TypeScript for all files
- Prefer interfaces over types for object shapes
- Use `readonly` for immutable data

### React
- Use functional components with hooks
- Prefer Server Components by default
- Use `'use client'` only when needed (interactivity)

### Server Actions
- Always use `'use server'` directive
- Return plain objects (no class instances)
- Handle errors with try/catch

### Tailwind CSS
- Use utility classes, avoid custom CSS
- Follow shadcn/ui conventions
- Mobile-first responsive design

### Prisma
- Always validate before commit: `npx prisma validate`
- Generate client after schema changes: `npx prisma generate`
- Use relations, avoid raw SQL when possible

## Alur Kerja Wajib (Anti-Churn)

### 1. Cek Sebelum Mengubah
- Sebelum menyentuh fitur, cek status PBI di `.opencode/PRD.md` dan jejak implementasinya (`graphify query` atau `rg`).
- Jika PBI sudah `Done`, **konfirmasi ke user dulu** sebelum mengubah perilakunya.
- Jangan mengulang pekerjaan yang sudah ada — baca dulu, baru ubah.

### 2. Spec Sebelum Kode
- Untuk fitur baru/rework, tulis 3-5 acceptance criteria + matriks role (OWNER/CASHIER/WAITER/KITCHEN) sebelum coding.
- Keputusan eksternal (payment gateway, dsb) harus dikunci sebelum implementasi.

### 3. Verifikasi Sebelum Commit
- Wajib: `npm run lint` dan `npm test` (jika menyentuh proxy/action).
- Jangan merge branch yang meninggalkan error lint.
- Setelah ubah `prisma/schema.prisma`: `npx prisma validate` + `npx prisma generate` (saat dev server mati).

### 4. Sinkron Dokumen
- Perubahan schema, role, route, payment, atau perilaku fitur **wajib** memperbarui `.opencode/PRD.md` + `.opencode/ARCHITECTURE.md` di commit yang sama.
- Jangan biarkan dokumen menyebut fitur/library yang sudah tidak aktif (mis. Midtrans).

### 5. Larangan File Sementara
- Jangan menyimpan file demo/temp (`*-contoh.ts`, mock) di `src/`.
- Jika perlu verifikasi visual, hapus sebelum commit dan jangan wire ke komponen produksi.

### 6. Handoff Sesi
- Update `.opencode/PROGRESS.md` di akhir sesi: apa yang selesai, apa yang belum, file yang diubah.

## Commit Convention

Format: `type(scope): description`

| Type | Kapan |
|------|-------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Ubah struktur tanpa ubah fungsi |
| `test` | Tambah test |
| `docs` | Ubah dokumentasi |
| `chore` | Maintenance |

Branch convention:
- `feature/fe-{nama}` - Frontend
- `feature/be-{nama}` - Backend
- `test/{type}-{nama}` - Testing

Branch terlindungi (JANGAN dihapus tanpa perintah eksplisit user):
- `main` - Produksi
- `develop` - Integrasi/staging
- `feature/be-midtrans-qris-dinamis` - Arsip kode Midtrans/QRIS dinamis (commit `df12fb2`), bukan fitur aktif
