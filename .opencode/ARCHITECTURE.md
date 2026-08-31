# ARCHITECTURE - Pringmoni

Dokumen ini menjelaskan **arsitektur teknis** dari **Pringmoni Resto POS & Monitoring**.

## 1. Architecture Overview

### Tech Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
├──────────────────┬──────────────────┬───────────────────┤
│   Customer UI    │   Dashboard UI   │   Kasir UI        │
│   (Public)       │   (Auth)         │   (Auth)          │
├──────────────────┴──────────────────┴───────────────────┤
│              Server Actions (src/app/actions/)           │
├─────────────────────────────────────────────────────────┤
│              Prisma ORM + PostgreSQL                     │
├─────────────────────────────────────────────────────────┤
│    NextAuth v5    │    Pusher (Realtime)    │ Midtrans   │
│    (Auth)         │    (Notifications)      │ (Payment)  │
└─────────────────────────────────────────────────────────┘
```

## 2. Database Schema

### Models
| Model | Deskripsi | Relasi |
|-------|-----------|--------|
| Users | Akun (owner, cashier, waiter) | - |
| Meja | Meja restoran + token QR | - |
| Menu | Menu makanan/minuman | -> KategoriMenu |
| KategoriMenu | Kategori menu | - |
| Pesanan | Pesanan customer | -> Users, Meja, DetailPesanan |
| DetailPesanan | Item dalam pesanan | -> Pesanan, Menu |
| Logs | Log aktivitas | - |

## 3. Route Structure

```
src/app/
├── page.tsx                          # Landing page
├── (auth)/login/page.tsx             # Login
├── (customer)/[tokenMeja]/           # Customer kiosk
│   ├── page.tsx                      # Menu & order
│   └── pesanan/page.tsx             # Lihat pesanan
├── dashboard/                        # Admin dashboard
│   ├── page.tsx                      # Statistik
│   ├── pesanan/page.tsx             # Kelola pesanan
│   ├── kasir/page.tsx               # Kasir
│   ├── menu/page.tsx                # Kelola menu
│   ├── meja/page.tsx                # Kelola meja
│   ├── user/page.tsx                # Kelola user
│   └── laporan/page.tsx             # Laporan
└── api/auth/[...nextauth]/route.ts   # Auth API
```

## 4. Server Actions

| File | Fungsi |
|------|--------|
| `src/app/actions/meja.ts` | getMejas, createMeja, updateMeja, getMejaByToken |
| `src/app/actions/menu.ts` | getMenus, createMenu, updateMenu, deleteMenu |
| `src/app/actions/pesanan.ts` | getPesanan, createPesanan, updateStatusPesanan, prosesPembayaran |

## 5. Auth Flow

```
Customer (Public) -> QR Scan -> Token Meja -> Menu (No Login)
Staff -> Login (NextAuth v5) -> Role-based redirect -> Dashboard
```

Roles:
- `OWNER` - Full access
- `CASHIER` - Kasir + Pesanan
- `WAITER` - Pesanan only

## 6. Real-time Flow

```
Customer Order -> Server Action -> Pusher Event -> Dashboard Update
```

## 7. Payment Flow

```
Checkout -> Midtrans (QRIS/Transfer/VA) -> Callback -> Update Status -> Struk PDF
```
