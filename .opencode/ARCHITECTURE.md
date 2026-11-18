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
│    NextAuth v5    │    Pusher (Realtime)    │ QRIS       │
│    (Auth)         │    (Notifications)      │ (statis)   │
└─────────────────────────────────────────────────────────┘
```

## 2. Database Schema

### Models (16)
| Model | Deskripsi | Relasi |
|-------|-----------|--------|
| Users | Akun (owner, cashier, waiter, kitchen) | - |
| JadwalShift | Slot jadwal shift yang diatur owner | -> Users |
| ShiftKasir | Sesi buka/tutup shift kasir + kas awal/akhir | -> Users, JadwalShift |
| KasKeluar | Pengeluaran kas selama shift | -> ShiftKasir, Users |
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
│   ├── checkout/page.tsx             # Konfirmasi pesanan
│   ├── pembayaran/...                # Pembayaran QRIS/tunai
│   └── pesanan/page.tsx              # Lihat pesanan
├── reservasi/[kodeAkses]/page.tsx    # Form reservasi publik (link umum, pilih meja)
├── reservasi/[kodeAkses]/cek/page.tsx # Detail reservasi berhasil + popup cek (kode + no HP)
├── reservasi/status/page.tsx         # Legacy: redirect ke /reservasi/<kodeAkses>/cek
├── dashboard/                        # Admin dashboard
│   ├── page.tsx                      # Statistik
│   ├── pesanan/page.tsx              # Kelola pesanan
│   ├── kasir/page.tsx                # Kasir
│   ├── menu/page.tsx                 # Kelola menu + stok harian
│   ├── stok-bahan/page.tsx           # Stok bahan internal (gudang/dapur)
│   ├── meja/page.tsx                 # Kelola meja
│   ├── users/page.tsx                # Kelola user
│   ├── shift/page.tsx                # Shift (tab jadwal [owner] + riwayat shift)
│   ├── logging/page.tsx              # Log aktivitas
│   └── laporan/page.tsx              # Laporan
├── api/auth/[...nextauth]/route.ts   # Auth API
└── api/uploadthing/                  # Upload gambar
```

> Reservasi customer memakai **link umum** `/reservasi/<kodeAkses>` (kode publik di `src/lib/reservasi-akses.ts`, bukan token meja). Halaman memuat menu + daftar meja kosong; server (`reservasi-customer.ts`) memvalidasi kode akses dan mengunci meja secara transaksional (`FOR UPDATE` + cek reservasi/pesanan aktif). Meja tanpa QR tetap muncul di daftar selama statusnya `kosong`.
>
> Setelah sukses, form mengarahkan ke `/reservasi/<kodeAkses>/cek` (halaman terpisah dari form). Halaman ini membaca hasil dari `sessionStorage` (`src/lib/reservasi-hasil.ts`) dan menyediakan popup cek status (kode + no HP) melalui `cekStatusReservasi`. Tombol kembali memakai dialog konfirmasi lalu `router.push` ke form. Proxy membuka ketiga pola reservasi tanpa login.

## 4. Server Actions

| File | Fungsi |
|------|--------|
| `reservasi.ts` | CRUD reservasi offline, konfirmasi kedatangan, batal, expire, verifikasi DP |
| `reservasi-customer.ts` | Link reservasi publik: daftar meja kosong, buat reservasi online + DP |
| `meja.ts` | getMejas (dengan `reservasiAktif` terbaru per meja), createMeja, updateMeja, getMejaByToken, kosongkanMeja |
| `menu.ts` | getMenus, createMenu, updateMenu, deleteMenu, aturStokHarian (+ per kategori) |
| `menu-foto.ts` | kelola foto menu (tambah/hapus/urutan) |
| `stok-bahan.ts` | getStokBahanList, getBahanDapurList, CRUD bahan, restockBahan, transferStokBahan, getRiwayatStok |
| `pesanan.ts` | getPesanan, createPesanan, updateStatusPesanan, prosesPembayaran, pindahMeja |
| `kasir.ts` | pesanan belum bayar, konfirmasi pembayaran QRIS/tunai |
| `shift.ts` | getJadwalShift/simpan/update/hapus (owner), bukaShift/tutupShift/tambahKasKeluar (kasir), getRiwayatShift (owner semua / kasir miliknya), getShiftAktif (termasuk saran uang awal dari shift kasir lain) |
| `voucher.ts` | CRUD voucher + validasi diskon/minimal belanja |
| `refund.ts` | refund pesanan + bukti foto, batas 3 hari sejak `createdAt` (`src/lib/refund.ts`) |
| `notifikasi.ts` | getNotifikasiTerlambat (pesanan >30 menit belum ditangani + sweep tengah malam) |
| `dashboard.ts` | statistik dashboard |
| `laporan.ts` | laporan harian/bulanan + analitik menu terlaris |
| `logs.ts` | getLogs, clearLogs |
| `login.ts` / `logout.ts` | loginAction (validasi kredensial + deteksi sesi perangkat lain), logout |
| `forgot-password.ts` / `reset-password*.ts` | alur reset password |
| `upload.ts` | helper UploadThing |

### 4.1 Shift Kasir & Serah Terima Kas

- Satu slot jadwal hanya boleh diisi **satu kasir**; kasir hanya membuka/menutup shift miliknya (owner hanya mengatur jadwal + monitoring).
- `getShiftAktif` menawarkan `saranUangAwal` = uang akhir shift `CLOSED` terakhir **milik kasir lain**, sebagai dasar serah terima kas antar shift.
- Saat `bukaShift` memakai saran itu, `sumberShiftId` disimpan sehingga riwayat menampilkan "Modal dari {kasir}".
- `uangHarapAkhir = uangAwal + totalTunai - totalKasKeluar`; `selisihKas = uangAkhir(fisik) - uangHarapAkhir`.

## 5. Auth Flow

```
Customer (Public) -> QR Scan -> Token Meja -> Menu (No Login)
Staff -> Login (NextAuth v5) -> Role-based redirect -> Dashboard
```

Roles:
- `OWNER` - Full access (kecuali mengubah status pesanan)
- `CASHIER` - Kasir + Pesanan + shift miliknya
- `WAITER` - Pesanan + Meja
- `KITCHEN` - Pesanan + Menu (stok harian)

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

Catatan: POST server action ke `/dashboard/reservasi` dikecualikan dari redirect
proxy (`SERVER_ACTION_BYPASS`). Action `requireReservasiRole` menolak sesi
`takenOver`, sehingga error auth dikembalikan sebagai error action (bukan
redirect HTML yang memicu E394).

## 6. Real-time Flow

```
Customer Order -> Server Action -> Pusher Event -> Dashboard Update
```

## 7. Payment Flow

```
Checkout -> QRIS statis / tunai -> Verifikasi manual kasir -> Update Status -> Struk PDF
```

- QRIS **statis** (satu gambar QR milik resto); customer klaim "Saya Sudah Bayar", kasir verifikasi manual.
- Tunai diverifikasi kasir saat pembayaran. Tidak ada callback payment gateway.
- Midtrans dinonaktifkan; kode lama diarsipkan di branch `feature/be-midtrans-qris-dinamis`.

## 8. Stock & Availability Flow

```
Menu Management --stok harian (stokManual)--> ketersediaan customer --pesanan--> stok harian berkurang
Gudang --transfer--> Dapur --pemakaian--> RiwayatStok (monitoring internal)
```

- **Ketersediaan menu untuk customer** mengacu pada `menu.stokManual` (stok harian) yang diatur dari **Menu Management**, bukan resep.
- Gate di `createPesanan`: menu harus `statusMenu = tersedia` dan `stokManual >= jumlah`; stok harian otomatis berkurang saat pesanan dibuat.
- **Stok bahan** (`StokBahan` + `RiwayatStok`) adalah monitoring internal aliran gudang -> dapur (restock, koreksi/limbah, transfer, pemakaian). Tidak menentukan tampilan customer.
- `ResepMenu` masih ada di schema dan dipakai `potongStokDapur` (pemotongan stok dapur internal saat pesanan selesai) **bila data resep tersedia**; tidak ada lagi UI rakit resep.
