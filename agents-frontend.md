# Pringmoni Frontend Rules

## Reference
- **Folder Structure**: Lihat `AGENTS.md` untuk struktur lengkap project
- **Tech Stack**: Next.js 16 (App Router), Tailwind CSS + shadcn/ui, NextAuth v5

## Task Focus
- Fokus pada UI saja (LOGIC dihandle oleh backend/Server Actions)
- Login page ✅
- Reset password page ✅
- Dashboard per role (owner, cashier, waiter) ✅

## Component Rules
- **Prioritas**: Gunakan komponen shadcn/ui yang sudah tersedia
- **Fallback**: Jika tidak ada komponen shadcn yang cocok, gunakan Tailwind langsung
- **Komponen shadcn tersedia**: Button, Input, Label, Card, Dialog, Sheet, Table, Select, Dropdown, Badge, Avatar, Tabs

## UI/UX Rules
- **Responsive**: Must work on laptop, tablet, and phone
  - Mobile: < 640px (1 kolom)
  - Tablet: 640px - 1024px (2 kolom)
  - Desktop: > 1024px (3-4 kolom)
- **Sidebar**: `#15803d` (green-700), text white
- **Primary Color**: Green apple (preset shadcn `b3ubQPikny`)
- **Font**: Default shadcn (sans)

## Architecture
- **Server Actions** (`app/actions/`): Logic bisnis (LOGIC ONLY, janganhandle UI)
- **Page Components** (`app/(auth)/` dan `app/(dashboard)/`): Handle UI dan form submission saja
- **API Routes**: JANGAN tambah route baru di `app/api/`, biarkan hanya `[...nextauth]`

## Dashboard per Role

### Owner
- Full menu: Dashboard, Pesanan, Menu, Meja, Kasir
- Stats: pesanan hari ini, pendapatan hari ini, meja kosong, pesanan menunggu

### Cashier
- Menu: Dashboard, Pesanan, Kasir
- Stats: pesanan hari ini, pesanan menunggu (tidak lihat pendapatan/meja)

### Waiter
- Menu: Dashboard, Pesanan
- Stats: pesanan hari ini, pesanan menunggu, pesanan diproses

## Progress
- [x] Login page (UI & logic dipisah)
- [x] Reset password page (UI & logic dipisah)
- [x] Dashboard per role dengan stats berbeda
- [x] Sidebar per role (nav items berbeda)
- [ ] Header with user info
- [ ] CRUD: Meja, Menu, Pesanan, Kasir (BELUM - skip dulu)

## Notes
- Role: 'owner' | 'cashier' | 'waiter'
- Tidak perlu buat API route baru
- Globals.css sudah diupdate dengan preset green apple

---
**Jika ada yang kurang jelas tentang rules frontend, tanyakan dulu sebelum lanjut!**