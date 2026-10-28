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
| MenuFoto | Foto menu (multi-gambar) | -> Menu |
| KategoriMenu | Kategori menu | - |
| Pesanan | Pesanan customer | -> Users, Meja, DetailPesanan, Voucher |
| DetailPesanan | Item dalam pesanan | -> Pesanan, Menu |
| RefundBukti | Foto bukti refund pesanan | -> Pesanan |
| Voucher | Kode voucher + diskon % + minimal belanja (soft delete) | -> Pesanan |
| StokBahan | Master bahan: lokasi (gudang/dapur), kategori, satuan, stok, minimum, harga, status | -> RiwayatStok, ResepMenu |
| RiwayatStok | Log pergerakan stok (sebelum/sesudah, jenis, keterangan, user) | -> StokBahan, Users |
| ResepMenu | Komposisi menu (bahan dapur + jumlah per porsi) | -> Menu, StokBahan |
| Logs | Log aktivitas | - |

### Enums (stok & resep)
| Enum | Nilai |
|------|-------|
| LokasiStok | gudang, dapur |
| KategoriBahan | bahan_utama, bumbu |
| SatuanStok | kg, pcs, pack, bungkus |
| StatusStok | tersedia, menipis, habis |
| JenisPerubahanStok | restock, penggunaan, koreksi, limbah, otomatis, transfer |

### Enums (voucher)
| Enum | Nilai |
|------|-------|
| StatusVoucher | aktif, nonaktif |

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
│   ├── resep/page.tsx               # Resep menu (BOM)
│   ├── stok-bahan/page.tsx          # Kelola stok bahan (gudang/dapur)
│   ├── meja/page.tsx                # Kelola meja
│   ├── user/page.tsx                # Kelola user
│   ├── shift/page.tsx               # Shift (tab jadwal [owner] + riwayat shift)
│   └── laporan/page.tsx             # Laporan
└── api/auth/[...nextauth]/route.ts   # Auth API
```

## 4. Server Actions

| File | Fungsi |
|------|--------|
| `src/app/actions/meja.ts` | getMejas, createMeja, updateMeja, getMejaByToken, kosongkanMeja |
| `src/app/actions/menu.ts` | getMenus, createMenu, updateMenu, deleteMenu |
| `src/app/actions/stok-bahan.ts` | getStokBahanList, createStokBahan, updateStokBahan, deleteStokBahan, restockBahan, transferStokBahan, getRiwayatStok, getDaftarMenuResep, getResepMenu, saveResepMenu |
| `src/app/actions/pesanan.ts` | getPesanan, createPesanan, updateStatusPesanan, prosesPembayaran |
| `src/app/actions/notifikasi.ts` | getNotifikasiTerlambat (daftar pesanan >30 menit belum ditangani + sweep tengah malam) |
| `src/app/actions/shift.ts` | getJadwalShift/simpan/update/hapus (owner), bukaShift/tutupShift/tambahKasKeluar (kasir), getRiwayatShift (owner semua / kasir miliknya), getShiftAktif (termasuk saran uang awal dari shift kasir lain) |

### 4.1 Shift Kasir & Serah Terima Kas

- Satu slot jadwal hanya boleh diisi **satu kasir**; kasir hanya membuka/menutup shift miliknya (owner hanya mengatur jadwal + monitoring).
- `getShiftAktif` menawarkan `saranUangAwal` = uang akhir shift `CLOSED` terakhir **milik kasir lain**, sebagai dasar serah terima kas antar shift.
- Saat `bukaShift` memakai saran itu, `sumberShiftId` disimpan sehingga riwayat menampilkan "Modal dari {kasir}".
- `uangHarapAkhir = uangAwal + totalTunai - totalKasKeluar`; `selisihKas = uangAkhir(fisik) - uangHarapAkhir`.
| `src/app/actions/login.ts` | loginAction (validasi kredensial + deteksi sesi di perangkat lain sebelum membuat sesi) |

## 5. Auth Flow

```
Customer (Public) -> QR Scan -> Token Meja -> Menu (No Login)
Staff -> Login (NextAuth v5) -> Role-based redirect -> Dashboard
```

Roles:
- `OWNER` - Full access
- `CASHIER` - Kasir + Pesanan
- `WAITER` - Pesanan only

### 5.1 Ambil alih sesi (takeover antar perangkat)

```
Login -> validasi kredensial (bcrypt) -> sesi lain masih aktif (last_seen_at
         < 15 menit & perangkat berbeda)?
      -> ya: tampilkan SATU dialog "Ambil alih sesi?" (tanpa memanggil signIn)
      -> tidak / dikonfirmasi: buat sesi (session_version naik)
Buat sesi -> users.session_version naik -> JWT membawa versi itu
Request berikutnya -> jwt callback bandingkan versi token vs DB
      -> sama: users.last_seen_at diperbarui (throttle 2 menit) -> sesi masih hidup
      -> beda: token.takenOver = true -> proxy hapus cookie sesi +
               redirect /login?takenOver=1 (dialog sekali)
```

| Elemen | Fungsi |
|--------|--------|
| `users.session_version` | Penanda versi sesi per akun (naik tiap login) |
| `users.last_login_at` / `users.last_login_device` | Audit login terakhir (dipakai di log takeover) |
| `users.last_seen_at` | Aktivitas terakhir sesi yang sah (diperbarui `jwt` callback, throttle 2 menit) |
| cookie `pm_device` | ID perangkat (httpOnly, dibuat proxy) |
| `src/lib/sesi.ts` | Cache versi sesi (3 detik), catat aktivitas, format waktu |
| `src/lib/auth.ts` | `authorize` naikkan versi; `jwt` cek versi + catat aktivitas; `session` expose `takenOver` |
| `src/proxy.ts` | Enforcement: `takenOver` -> `/login?takenOver=1`; set cookie `pm_device` |

Catatan: konfirmasi hanya **satu kali** saat menekan tombol Masuk (dialog
"Ambil alih sesi?"). Setelah dikonfirmasi, sesi lama langsung tidak berlaku
pada request berikutnya; perangkat lama kehilangan cookie sesi dan diarahkan
ke `/login?takenOver=1`, yang menampilkan **dialog sekali** "Sesi diambil alih"
(parameter URL langsung dibersihkan sehingga tidak muncul lagi saat refresh).

Catatan: enforcement dilakukan di **proxy** sehingga request lama (termasuk POST
server action) dialihkan ke login **sebelum** aksi dieksekusi. Role yang sudah
login tapi tidak punya akses route diarahkan ke `/dashboard` (bukan `/login`).

## 6. Real-time Flow

```
Customer Order -> Server Action -> Pusher Event -> Dashboard Update
```

## 7. Payment Flow

```
Checkout -> Midtrans (QRIS/Transfer/VA) -> Callback -> Update Status -> Struk PDF
```

## 8. Stock & Availability Flow

```
Gudang --transfer--> Dapur --resep--> porsiTersedia --pesanan--> potong stok dapur (RiwayatStok)
```

- Ketersediaan menu mengacu pada **resep** (bahan dapur), bukan `statusMenu` manual.
- `porsiTersedia = floor(min(stok dapur / jumlah per porsi))`; menu wajib punya **bahan utama + bumbu** (resep lengkap).
- Resep tak lengkap / `porsiTersedia <= 0` -> menu tampil di kiosk customer tetapi **tidak bisa dipesan** (gate di `createPesanan`).
