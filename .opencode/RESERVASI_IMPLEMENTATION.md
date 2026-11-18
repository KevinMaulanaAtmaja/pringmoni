# Implementasi Reservasi (PBI-7.1)

> Referensi teknis untuk fitur reservasi offline. Rencana & fase ada di `RESERVASI_PLAN.md`.

## 1. Ringkasan

Reservasi offline dikelola staf dari `/dashboard/reservasi`. Reservasi membuat meja berstatus `dipesan` tanpa memotong stok. Konfirmasi kedatangan membuat `Pesanan` dan memotong `Menu.stokManual` dalam satu transaksi.

## 2. Perubahan Database

File: `prisma/schema.prisma`

### Enum

```prisma
enum StatusMeja {
  kosong
  terpakai
  dipesan
}

enum StatusReservasi {
  menunggu_kedatangan
  dikonfirmasi
  batal
  expired
}
```

`JenisAksiLog` ditambah: `CREATE_RESERVASI`, `CONFIRM_RESERVASI`, `CANCEL_RESERVASI`, `EXPIRE_RESERVASI`.

### Model

- `Reservasi`
  - `id`, `mejaId`, `namaPelanggan`, `noHp`, `jumlahOrang`
  - `waktuKedatangan`, `batasKonfirmasi`, `catatan`
  - `statusReservasi`, `createdById`, `pesananId`, `confirmedById`, `confirmedAt`, `cancelledAt`
  - Relasi: `meja`, `createdBy`, `confirmedBy`, `pesanan`, `detailReservasi`
  - Index: `mejaId`, `statusReservasi`, `createdById`
- `DetailReservasi`
  - `id`, `reservasiId`, `menuId`, `jumlah`, `hargaSaatPesan`, `catatanItem`
  - Relasi: `reservasi` (cascade), `menu`

Relasi lawan ditambahkan di `Users` (`reservasiDibuat`, `reservasiDikonfirmasi`), `Meja` (`reservasi`), `Menu` (`detailReservasi`), `Pesanan` (`reservasi`).

### Migrasi

```powershell
npx prisma validate
npx prisma generate
npx prisma db push
```

Catatan: `prisma generate` harus dijalankan saat dev server mati (Windows mengunci DLL query engine). `db push` akan menambah nilai enum dan membuat tabel baru tanpa menghapus data lama.

## 3. Server Actions

File: `src/app/actions/reservasi.ts`

Role yang diizinkan: `owner`, `cashier`, `waiter`.

| Action | Perilaku |
|--------|----------|
| `createReservasi(data)` | Validasi input, meja, reservasi aktif, pesanan aktif, dan stok `stokManual`. Membuat reservasi + detail, set meja `dipesan`, tulis log. |
| `getReservasi({ status })` | `all` mengembalikan semua status. Include meja, user, pesanan, detail menu. Maksimal 300 baris. |
| `confirmKedatanganReservasi(id)` | Validasi ulang stok, buat `Pesanan` + `DetailPesanan`, potong `stokManual`, set meja `terpakai`, update reservasi `dikonfirmasi`, log, trigger Pusher. |
| `cancelReservasi(id, alasan)` | Menolak jika sudah menjadi pesanan. Set `batal`, lepas meja `dipesan` → `kosong`, log. |
| `expireReservasi()` | Cari reservasi `menunggu_kedatangan` yang melewati `batasKonfirmasi`, set `expired`, lepas meja, log ringkasan. |
| `getMejaUntukReservasi()` | Daftar meja + reservasi aktif per meja untuk form. |

Aturan penting:

- Stok **tidak** dipotong saat create; hanya divalidasi.
- Pemotongan memakai pola yang sama dengan `createPesanan` di `src/app/actions/pesanan.ts`.
- `src/lib/stok.ts` (`potongStokDapur`) tidak dipanggil karena masih berbasis resep legacy.
- Konfirmasi memakai `crypto.randomUUID()` untuk `midtransOrderId` (field lama tetap diisi).

## 4. UI

File: `src/app/dashboard/reservasi/page.tsx`

- Client component (`"use client"`) dengan `useSession`.
- Daftar kartu reservasi, filter status, pencarian nama/meja/no HP.
- Dialog buat reservasi: meja kosong, nama, no HP, jumlah orang, waktu kedatangan, catatan, pre-order menu.
- Pre-order hanya menampilkan menu `tersedia` dengan `porsiTersedia > 0`.
- Tombol konfirmasi/batal untuk status `menunggu_kedatangan`; link ke kasir untuk reservasi terkonfirmasi.
- Saat data dimuat, `expireReservasi()` dipanggil lebih dulu.

## 5. Integrasi

| File | Perubahan |
|------|-----------|
| `src/components/layout/Sidebar.tsx` | Menu "Reservasi" untuk owner, cashier, waiter. |
| `src/proxy.ts` | `/dashboard/reservasi`: `["owner","cashier","waiter"]`. |
| `src/lib/log.ts` | Union `JenisAksiLog` + 4 aksi reservasi. |
| `src/types/index.ts` | `StatusMeja` + `'dipesan'`. |
| `src/app/dashboard/meja/page.tsx` | Label/warna/filter `dipesan`; tombol kosongkan meja untuk `terpakai` dan `dipesan`. |
| `src/app/actions/meja.ts` | `deleteMeja` menolak `dipesan`; `kosongkanMeja` membatalkan reservasi aktif. |

## 6. Verifikasi

```powershell
npx tsc --noEmit
npm run lint -- --quiet
npm run build
```

Status terakhir:

- `npx prisma validate` → valid.
- `npx prisma generate` → sukses.
- `npx prisma db push` → database sinkron.
- `npx tsc --noEmit` → 0 error.
- `npm run lint -- --quiet` → 0 error.

## 7. Checklist Uji Manual

1. Buat reservasi untuk meja kosong → meja berubah `dipesan`.
2. Coba reservasi meja yang sama → ditolak.
3. Buat reservasi dengan pre-order melebihi stok → ditolak.
4. Konfirmasi kedatangan → pesanan muncul di kasir, `stokManual` berkurang, meja `terpakai`.
5. Batal reservasi → meja kembali `kosong`.
6. Tunggu/ubah `batasKonfirmasi` ke masa lalu → muat ulang halaman → status `expired`, meja `kosong`.
7. Kosongkan meja `dipesan` dari halaman meja → reservasi menjadi `batal`, meja `kosong`.
8. Coba hapus meja `dipesan` → ditolak.
9. Login sebagai kitchen → menu/route reservasi tidak dapat diakses.
10. Cek log aktivitas memuat aksi reservasi.

## 8. Batasan yang Diketahui

- Belum ada partial unique index untuk mencegah double booking di level database.
- Belum ada edit/reschedule reservasi.
- Belum ada reservasi online dari customer.
- Belum ada DP/pembayaran di muka.
- Kitchen belum punya tampilan pre-order reservasi.

## 9. Reservasi Customer via QR (P3) — Rencana Eksekusi

Keputusan user (2026-11-13):

1. **Entry point**: tombol "Reservasi Meja Ini" di header halaman customer `/[tokenMeja]` menuju route baru `/reservasi/[tokenMeja]`. QR tercetak tidak diubah.
2. **Pre-order wajib min. 1 menu** (sama seperti alur staf) → DP 20% dibulatkan ke atas ke Rp 1.000 (`src/lib/dp.ts`).
3. **DP dibayar online**: QRIS statis + upload bukti → `dpStatus: menunggu` → diverifikasi kasir (owner/cashier) dari dashboard.
4. **Expiry**: `batasKonfirmasi = waktuKedatangan + EXPIRY_JAM_DEFAULT` dengan `EXPIRY_JAM_DEFAULT = 3` (konstanta di `src/lib/reservasi.ts`). Berlaku untuk reservasi staf maupun customer.
5. **DP hangus** jika expired/no-show; refund hanya manual oleh owner.
6. **Jam kedatangan ditampilkan jelas** ke customer sebagai patokan persiapan resto — di langkah ringkasan, layar sukses (kode reservasi), dan halaman cek status ("Resto menyiapkan pesanan Anda sebelum jam kedatangan").

### Perubahan schema (migrasi)

| Field | Perubahan |
|-------|-----------|
| `Reservasi.kodeReservasi` | `String? @unique` — kode pendek 6 char, backfill row lama |
| `Reservasi.sumber` | `enum SumberReservasi { offline online } @default(offline)` |
| `Reservasi.createdById` | `Int` → `Int?` (reservasi online tanpa user) |
| `Reservasi.alasanBatal` | `String?` |
| `JenisAksiLog` | tambah `CREATE_RESERVASI_CUSTOMER`, `VERIFIKASI_DP_CUSTOMER` |

### Action baru (`src/app/actions/reservasi-customer.ts`)

| Action | Perilaku |
|--------|----------|
| `createReservasiCustomer(data)` | Publik, `sumber: "online"`, `createdById: null`. Rate limit per IP/no HP + honeypot. Validasi token meja, meja tidak `dipesan`/pesanan aktif, kapasitas, waktu kedatangan (tidak masa lalu, maks H+7), pre-order min. 1 + stok. DP → `menunggu`. Pusher event ke dashboard. |
| `getReservasiCustomerByToken(token)` | Data meja + menu untuk form. |
| `cekStatusReservasi(kode, noHp)` | Status untuk halaman customer. |
| `uploadBuktiDp(reservasiId, file)` | Upload bukti DP (reuse UploadThing). |

### Action tambahan (`src/app/actions/reservasi.ts`)

| Action | Perilaku |
|--------|----------|
| `verifikasiDpCustomer(reservasiId)` | Owner/cashier: `dpStatus: berhasil` + `dpPaidAt`, log audit. |

### Halaman baru

| Route | Isi |
|-------|-----|
| `/reservasi/[tokenMeja]` | Stepper: Data & Waktu (nama, no HP, jumlah orang, `datetime-local`) → Pre-order → Ringkasan + DP (rincian, kebijakan) → Bayar DP (QRIS + upload bukti) → Sukses (kode reservasi + jam kedatangan). |
| `/reservasi/status` | Input kode + no HP → status + jam kedatangan. |

### Dashboard

- Kartu reservasi: badge "DP menunggu verifikasi" + tombol **Verifikasi DP**.
- Filter status tambah turunan `dpStatus = menunggu`.

### Verifikasi

`prisma migrate dev` (dev server mati) → `npx tsc --noEmit` → `npm run lint -- --quiet` → `npm run graph:update`. E2E: reservasi online → meja `dipesan` + badge staf → upload bukti → verifikasi → konfirmasi kedatangan → order selesai; uji expiry (ubah `batasKonfirmasi` ke masa lalu) & rate limit.
