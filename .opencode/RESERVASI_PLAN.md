# Rencana Reservasi Meja (PBI-7.1 + Reservasi Customer)

> Status: MVP offline selesai di branch `feat/reservasi`. Rencana v2 di bawah ini
> mencakup stabilisasi P0-P3, reservasi customer via QR, kategori meja, dan DP.
> Keputusan user: 2026-11-06.

## 1. Keputusan yang sudah disepakati

1. **Reservasi = hold meja saat ini juga.** Begitu reservasi dibuat, meja langsung
   berstatus `dipesan` (baik dibuat staf maupun customer).
2. **QR meja yang sudah direservasi** menampilkan pesan
   "Sudah direservasi oleh customer lain" dan tidak boleh dipakai untuk order.
3. **Kategori meja** dibuat fleksibel: kursi, lesehan, reservasi, dan kategori
   lain di masa depan. Sebagian kategori/meja boleh **umum** (QR dipakai banyak
   customer), sebagian **khusus** (satu QR hanya untuk satu customer/reservasi
   pada satu waktu).
4. **Gunakan file migration resmi** (bukan `db push`) untuk seluruh perubahan
   schema reservasi.
5. **Pre-order menu di-hold saat reservasi dibuat** (hard hold):
   - `menu.stokManual` dikurangi di dalam transaksi create.
   - Stok dikembalikan saat reservasi `batal`, `expired`, atau `no_show`.
   - Saat konfirmasi kedatangan, stok **tidak** dipotong lagi karena sudah
     di-hold; order dibuat dengan `stokDeducted = true`.
   - Alasan: mencegah overselling pre-order. Risiko no-show yang menahan stok
     dibatasi oleh `batasKonfirmasi` (default 180 menit).
6. **DP dicatat manual di bagian reservasi kasir** (tanpa payment gateway):
   nominal DP, metode, status, waktu, dan siapa yang mencatat. Sisa bayar
   ditampilkan saat konfirmasi dan diteruskan sebagai informasi ke pesanan.

## 2. Ruang Lingkup

| Fitur | Status |
|-------|--------|
| Reservasi offline oleh staf | Sudah ada (MVP) |
| Lifecycle status sampai `selesai`/`no_show` | P0 |
| Expiry server-side + cron | P0 |
| Anti double-booking di level DB | P0 |
| Blokir order pada meja `dipesan` | P0 |
| Migration resmi + audit pembatalan | P1 |
| Validasi kapasitas/waktu/no HP | P1 |
| Edit/reschedule reservasi | P1 |
| Hold stok pre-order | P1 |
| DP manual di reservasi kasir | P2 |
| Pagination/filter/calendar/realtime | P2 |
| Test reservasi | P2 |
| Kategori meja (kursi/lesehan/reservasi/dst) | P3 |
| QR umum vs QR khusus per meja | P3 |
| Reservasi customer via QR | P3 |
| UI customer + cek status reservasi | P3 |
| Reminder WA/SMS, payment gateway DP | Belum (di luar scope) |

## 3. Desain Data v2

### Status reservasi
```
menunggu_kedatangan -> dikonfirmasi -> selesai
        |                   |
      batal              batal
        |
     expired / no_show
```

### Perubahan schema

`Reservasi`:
- `kodeReservasi String @unique` (kode pendek untuk customer, mis. `RSV-7K2P`)
- `sumber SumberReservasi @default(offline)` (`offline` / `online`)
- `createdById Int?` (nullable untuk reservasi online)
- `alasanBatal String?`
- `cancelledById Int?`
- `selesaiAt DateTime?`
- `noShowAt DateTime?`
- `dpAmount Decimal? @db.Decimal(10,2)`
- `dpMetode String?`
- `dpStatus DpStatus @default(tanpa_dp)` (`tanpa_dp` / `sebagian` / `lunas`)
- `dpDibayarAt DateTime?`
- `dpDicatatById Int?`

`StatusReservasi`: tambah `selesai`, `no_show`.

`KategoriMeja`:
```prisma
model KategoriMeja {
  id            Int       @id @default(autoincrement())
  nama          String    @unique
  deskripsi     String?
  bisaReservasi Boolean   @default(true) @map("bisa_reservasi")
  qrMode        QrMode    @default(umum) @map("qr_mode")
  urutan        Int       @default(0)
  createdAt     DateTime  @default(now()) @map("created_at")
  deletedAt     DateTime? @map("deleted_at")
  meja          Meja[]
  @@map("kategori_meja")
}
```

`Meja`:
- `kategoriMejaId Int?`
- `qrMode QrMode?` (override kategori; null = ikut kategori)
- relasi `kategoriMeja`

`QrMode`: `umum` | `khusus`.
- `umum`: QR boleh dipakai banyak customer (mis. meja food court / area umum).
- `khusus`: QR hanya untuk satu customer/reservasi aktif pada satu waktu.

Backfill kategori awal:
- `Lesehan` (prefix `L`, `qrMode = khusus`, `bisaReservasi = true`)
- `Kursi` (prefix `K`, `qrMode = khusus`, `bisaReservasi = true`)
- `Reservasi` (kategori opsional untuk meja yang memang dikhususkan reservasi)

## 4. Fase Pengerjaan

### P0 - Stabilisasi kritis

1. **Siklus status**
   - Helper `finalizeReservasiUntukMeja(tx, mejaId, outcome)` di
     `src/lib/reservasi.ts`.
   - Panggil saat meja dikosongkan / order selesai / order batal di:
     `kasir.ts`, `pesanan.ts`, `dashboard.ts`, `notifikasi.ts`, `meja.ts`.
   - `dikonfirmasi` + order selesai => `selesai`; order batal => `batal`.
2. **Expiry**
   - `confirmKedatanganReservasi` menolak jika `now > batasKonfirmasi`.
   - Route cron `src/app/api/cron/reservasi/route.ts` dengan `CRON_SECRET`.
   - Fallback expiry saat halaman reservasi / data customer dimuat.
3. **Anti double-booking**
   - Partial unique index:
     ```sql
     CREATE UNIQUE INDEX reservasi_meja_aktif_unique
     ON reservasi(meja_id)
     WHERE status_reservasi IN ('menunggu_kedatangan', 'dikonfirmasi');
     ```
   - `SELECT ... FOR UPDATE` pada baris meja di dalam transaksi.
   - Tangkap `P2002` => pesan "Meja sudah memiliki reservasi aktif".
4. **Scan QR meja `dipesan`**
   - Halaman customer menampilkan layar terkunci:
     "Sudah direservasi oleh customer lain".
   - Tidak menampilkan nama/no HP pemesan.
   - Tombol: hubungi staff / cek status reservasi / scan QR lain.

### P1 - Hardening

1. File migration resmi untuk seluruh schema reservasi + perubahan P0/P1.
2. Validasi kapasitas (`jumlahOrang <= meja.kapasitas`), waktu tidak masa lalu,
   format no HP, batas maksimal orang.
3. Audit pembatalan: `alasanBatal`, `cancelledById`.
4. Edit/reschedule reservasi (ubah waktu, jumlah orang, meja, pre-order).
5. Hard hold stok pre-order:
   - create: kurangi `stokManual` dengan guard `stokManual >= qty`.
   - cancel/expire/no_show: kembalikan stok.
   - confirm: buat order dengan `stokDeducted = true`, tanpa potong ulang.
6. Kode reservasi unik + halaman cek status dasar.

### P2 - Operasional & UX kasir

1. DP manual di reservasi kasir:
   - input nominal DP, metode, status, catatan.
   - tampil di kartu reservasi dan dialog konfirmasi.
   - saat konfirmasi, tampilkan total pre-order, DP, dan sisa bayar.
2. Pagination + filter tanggal/status di `getReservasi`.
3. Tampilan kalender/hari.
4. Realtime Pusher untuk create/update/cancel/expire.
5. Kitchen bisa melihat pre-order sebelum konfirmasi.
6. Test: double booking, expiry, hold/restore stok, finalisasi status.

### P3 - Reservasi customer & kategori meja

1. CRUD `KategoriMeja` di dashboard (owner), assign ke meja.
2. QR mode `umum` vs `khusus`:
   - `khusus`: QR reservasi hanya bisa dipakai satu customer aktif.
   - `umum`: QR bisa dipakai banyak customer; reservasi tetap per meja.
3. Rute publik `/reservasi` (layout customer, mobile-first).
   - QR berisi `/reservasi?meja=<token>` atau `/r/<token>`.
   - Form: kategori -> meja -> jumlah orang/waktu -> data diri -> pre-order
     opsional -> ringkasan -> sukses + kode reservasi.
4. Server action publik `createReservasiCustomer`:
   - tanpa login, `sumber = online`, `createdById = null`.
   - validasi token meja, kategori `bisaReservasi`, QR mode, ketersediaan.
   - rate limit + honeypot.
5. Halaman `/reservasi/status` (kode + no HP).
6. Layar sukses customer: kode reservasi, instruksi datang, kebijakan
   `batasKonfirmasi`, tombol cek status.

## 5. Alur Meja

```
create reservasi -> dipesan
confirm          -> terpakai (stok sudah di-hold)
order selesai    -> kosong + reservasi selesai
cancel/expire    -> kosong + stok dikembalikan
scan QR dipesan  -> layar "Sudah direservasi oleh customer lain"
```

## 6. Verifikasi

- Schema berubah: dev server mati -> `npx prisma generate` -> migration.
- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run lint -- --quiet`
- `npm run build` hanya saat dev server mati.
- `npm run graph:update` sebelum commit.
- E2E manual:
  1. Buat reservasi + pre-order -> stok berkurang, meja `dipesan`.
  2. Scan QR meja -> terkunci "Sudah direservasi oleh customer lain".
  3. Konfirmasi -> order dibuat, stok tidak potong dua kali.
  4. Selesaikan order -> meja `kosong`, reservasi `selesai`.
  5. Reservasi baru di meja yang sama berhasil.
  6. Dua create bersamaan -> satu gagal (unique index).
  7. Expire -> stok kembali, meja kosong.
  8. Customer reservasi via QR umum/khusus -> kode reservasi muncul.

## 7. Urutan Eksekusi & Commit

1. Simpan rencana ini.
2. `npm run graph:update`.
3. Branch baru dari `feat/reservasi` (mis. `feat/reservasi-customer-qr`).
4. Commit + push WIP MVP.
5. Eksekusi P0 -> P1 -> P2 -> P3, verifikasi tiap fase, commit terpisah.
