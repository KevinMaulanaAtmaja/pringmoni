# Rencana Integration Testing - Pringmoni

> Status: **RENCANA** (belum dieksekusi). Semua test di folder `src/test/integration/`
> memakai Prisma nyata dan otomatis **skip** bila `TEST_DATABASE_URL` tidak valid.
> Terakhir diperbarui: 2026-11-08.

Referensi: `.opencode/WHITEBOX_TESTING_PLAN.md` §8.3-8.4, `.opencode/SECURITY.md`.

---

## 1. Prinsip

| Aspek | Aturan |
|-------|--------|
| Database | PostgreSQL khusus **test** (`pringmoni_test`, project Supabase terpisah). Tidak pernah DB dev/produksi. |
| Mock | Hanya boundary eksternal: `@/lib/auth`, `@/lib/pusher`, `next/cache`, `next/headers`. **Prisma tidak di-mock.** |
| Gate | `describe.skip` bila `TEST_DATABASE_URL` tidak valid / belum diisi. |
| Isolasi | `TRUNCATE ... RESTART IDENTITY CASCADE` pada tabel terkait di `beforeEach` (bukan transaksi + rollback, karena server action memakai `$transaction` internal). |
| Determinisme | `vi.setSystemTime` untuk logika tanggal (shift/auto-close), suffix unik untuk constraint unik. |
| Cleanup | Truncate di `beforeEach`; `prisma.$disconnect()` di `afterAll`. |

## 2. Status Saat Ini

**Sudah ada**
- `src/test/integration/pembayaran.test.ts` - 1 skenario: kasir `confirmQrisPayment` ->
  `statusPembayaran=berhasil`, `statusPesanan=diproses`, `jumlahBayar` terisi, `shiftId` terhubung.
- Gate `TEST_DATABASE_URL` + `.env.test` (placeholder) + `.gitignore`.
- Masih **skipped** karena belum ada kredensial DB test.

**Belum**
- Helper isolasi bersama (`resetDb`, `setAuth`).
- Alur: pesanan customer + tunai, stok dapur, shift/rekap, refund, voucher.
- Eksekusi nyata: `prisma migrate deploy` + run integration.
- CI/CD.

## 3. Prasyarat Eksekusi (nanti)

1. Buat project Supabase `pringmoni_test` (terpisah dari dev).
2. Isi `.env.test` (tidak boleh di-commit):
   - `DATABASE_URL` / `TEST_DATABASE_URL` -> pooler `:6543/pringmoni_test?pgbouncer=true`
   - `DIRECT_URL` -> direct `:5432/pringmoni_test`
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`
3. Migrasi schema: `npx prisma migrate deploy` (memakai `DIRECT_URL`).
4. Jalankan (PowerShell, perintah terpisah):
   - Semua integrasi: `npx vitest run src/test/integration`
   - Satu file: `npx vitest run src/test/integration/shift.test.ts`
   - Satu test: `npx vitest run -t "nama test"`
5. DB test wajib kosong/terisolasi sebelum run (helper truncate menangani).

## 4. Helper & Isolasi

```
src/test/integration/
├── helpers/
│   ├── db.ts        # resetDb(), disconnect, seed builder
│   └── auth.ts      # setAuth({ id, role, username })
├── pembayaran.test.ts        # (ada) QRIS
├── pesanan-pembayaran.test.ts
├── stok-dapur.test.ts
├── shift.test.ts
├── refund.test.ts
└── voucher.test.ts
```

`resetDb()` (nama tabel aktual dari `@@map` di schema):

```sql
TRUNCATE TABLE
  logs, riwayat_stok, refund_bukti, detail_pesanan, pesanan,
  kas_keluar, shift_kasir, jadwal_shift, voucher,
  menu_foto, resep_menu, menu, kategori_menu,
  stok_bahan, meja, users
RESTART IDENTITY CASCADE;
```

`setAuth()` mengisi mock `@/lib/auth` dengan `{ user: { id, role, username, ... } }`
(role string: `owner` | `cashier` | `waiter` | `kitchen`).

## 5. Rencana per Alur

### 5.1 Pesanan + Pembayaran (customer -> kasir)

- **File:** `pesanan-pembayaran.test.ts`
- **Fixture:** user `cashier` + `waiter`, `meja` (tokenMeja), `kategori_menu`, 2 `menu`
  (`harga` 25.000 / 30.000, `stokManual` 10), `shift_kasir` ACTIVE.
- **Langkah & assertion:**
  1. `createPesanan({ tokenMeja, items: [{ menuId, jumlah: 2 }], metodePembayaran: 'tunai' })`
     -> `statusPesanan=menunggu`, `statusPembayaran=menunggu`, `totalHarga=50.000`,
     `detailPesanan.hargaSaatPesan=25.000`, `midtransOrderId` (uuid) terisi.
  2. `createPesanan` kedua saat masih menunggu bayar -> error "menunggu pembayaran".
  3. `prosesPembayaranTunai(id, 100.000)` -> `berhasil`, `jumlahBayar=100.000`,
     `kembalian=50.000`, `shiftId` terisi (jika shift aktif).
  4. `konfirmasiPembayaranCustomer(publicId, tokenMeja, 'qris')` -> status berubah sesuai alur customer.
- **Negatif:** token meja invalid; menu `tidak tersedia`; `stokManual < jumlah`.
- **Matriks:** `createPesanan`, `prosesPembayaranTunai`, `konfirmasiPembayaranCustomer`.

### 5.2 Stok Dapur (pesanan selesai -> potong stok)

- **File:** `stok-dapur.test.ts`
- **Fixture:** `stok_bahan` (`tipe=dapur`, `stokQty=10`, `stokMinimum=2`), `resep_menu`
  (`jumlah=2` per porsi), `menu`, `meja`, `pesanan` + `detail_pesanan` (`jumlah=3`), user `waiter`.
- **Langkah & assertion:**
  1. `markPesananSelesai(pesananId)` (waiter) -> `statusPesanan=selesai`,
     `stokDeducted=true`, `meja.statusMeja=kosong`.
  2. `stok_bahan.stokQty = 10 - (2 x 3) = 4`, `statusStok=tersedia`.
  3. `riwayat_stok`: 1 baris (`stokSebelum=10`, `stokSesudah=4`, `jumlahPerubahan=6`, `jenisPerubahan=otomatis`).
  4. Idempotensi: panggil `potongStokDapur` lagi -> `{ deducted: false }`, riwayat tidak bertambah.
- **Batas:** bahan `tipe=gudang` tidak dipotong; stok tidak minus (`Math.max(0, ...)`).
- **Matriks:** `markPesananSelesai`, `potongStokDapur`.

### 5.3 Shift (buka -> transaksi -> kas keluar -> tutup -> rekap)

- **File:** `shift.test.ts`
- **Fixture:** user `cashier`, `meja`, `menu`, pesanan tunai 50.000, `kas_keluar` 20.000.
- **Langkah & assertion:**
  1. `bukaShift(100.000)` -> ACTIVE, `uangAwal=100.000`, `aktifKey=kasirId`.
  2. `tambahKasKeluar(20.000, 'beli gas')` -> 1 baris `kas_keluar`.
  3. Pembayaran tunai 50.000 -> `totalTransaksi=1`, `totalTunai=50.000`.
  4. `tutupShift(130.000)` (uang harap = 100.000 + 50.000 - 20.000) ->
     CLOSED, `uangAkhir=130.000`, `selisihKas=0`, `aktifKey=null`, totals tersimpan.
  5. **Selisih:** `tutupShift` nominal beda tanpa keterangan -> error "Selisih kas ... wajib keterangan";
     dengan keterangan -> sukses dan `selisihKas` tercatat.
  6. **Sisa pesanan:** ada pesanan menunggu -> `{ warning, sisaPesanan }`;
     dengan `konfirmasiSisaPesanan=true` -> sukses.
  7. `autoCloseShifts()` untuk shift ACTIVE bertanggal lampau -> `autoClosed=true`.
- **Catatan:** `vi.setSystemTime` untuk konsistensi `tanggal`/`waktuMasuk`.
- **Matriks:** `bukaShift`, `tambahKasKeluar`, `tutupShift`, `autoCloseShifts`.

### 5.4 Refund (bayar -> ajukan refund + bukti)

- **File:** `refund.test.ts`
- **Fixture:** pesanan `statusPembayaran=berhasil` (via tunai), user `cashier`.
- **Langkah & assertion:**
  1. `ajukanRefund(id, 'Salah pesan', [{ url, fileKey }])` ->
     `refund_bukti` 1 baris; `statusPembayaran=refund`, `statusPesanan=refund`,
     `refundCatatan`, `refundedAt`, `refundedById` terisi; log `REFUND_ORDER` dibuat.
  2. `getRefundInfo(id)` mengembalikan info refund + bukti.
  3. `deleteRefundBukti(buktiId)` menghapus baris bukti.
- **Negatif:** tanpa bukti foto; catatan < 3 karakter; pesanan belum lunas; refund dua kali.
- **Catatan:** implementasi saat ini **tidak** mengembalikan stok saat refund -
  test memastikan stok tidak berubah (sesuaikan bila fitur berubah).
- **Matriks:** `ajukanRefund`, `getRefundInfo`, `deleteRefundBukti`.

### 5.5 Voucher (validasi -> dipakai di pesanan)

- **File:** `voucher.test.ts`
- **Fixture:** user `owner`, `voucher` (`kode=HEMAT10`, `diskonPersen=10`,
  `minimalBelanja=20.000`, `statusVoucher=aktif`), `menu` 25.000, `meja`.
- **Langkah & assertion:**
  1. `validateVoucher('hemat10', 25.000)` -> valid; diskon 2.500; total 22.500.
  2. `createPesanan({ ..., kodeVoucher: 'hemat10' })` -> `voucherId` terisi,
     `diskonVoucher=2.500`, `totalHarga=22.500`.
  3. Relasi `voucher.pesanan` mencatat pemakaian.
- **Negatif:** subtotal < minimal belanja; voucher nonaktif; kode tidak ada.
- **Catatan schema:** model `Voucher` **tidak punya kolom kuota/pemakaian**,
  jadi skenario "kuota berkurang" diganti dengan "voucher terhubung + diskon benar".
  Jika kuota ingin diuji, perlu migrasi schema baru (di luar scope).
- **Matriks:** `validateVoucher`, `createPesanan`.

## 6. Matriks Cakupan

| File | Alur | Action/lib |
|------|------|------------|
| `pembayaran.test.ts` (ada) | QRIS | `confirmQrisPayment` |
| `pesanan-pembayaran.test.ts` | customer order, tunai, QRIS | `createPesanan`, `prosesPembayaranTunai`, `konfirmasiPembayaranCustomer` |
| `stok-dapur.test.ts` | selesai -> potong stok | `markPesananSelesai`, `potongStokDapur` |
| `shift.test.ts` | buka, kas keluar, tutup, rekap | `bukaShift`, `tambahKasKeluar`, `tutupShift`, `autoCloseShifts` |
| `refund.test.ts` | refund + bukti | `ajukanRefund`, `getRefundInfo`, `deleteRefundBukti` |
| `voucher.test.ts` | validasi & pakai voucher | `validateVoucher`, `createPesanan` |

## 7. Definition of Done

- Semua file integrasi **hijau** saat `TEST_DATABASE_URL` valid, dan **skip** tanpa env.
- Deterministik (minimal 3x run berturut-turut).
- Tidak ada data tersisa setelah run; tidak menyentuh DB dev/produksi.
- Unit test tetap hijau (660 passed / 1 skipped).
- Docs (`PROGRESS.md`, `WHITEBOX_TESTING_PLAN.md` §8.4) diperbarui.

## 8. Risiko & Catatan

- Server action memakai `$transaction` internal -> **jangan** bungkus transaksi + rollback.
- `auth()` mock harus memakai id numerik (string) dan role huruf kecil
  (`'cashier'`, `'waiter'`, `'owner'`) sesuai pengecekan action.
- Constraint unik (`users.username`, `menu.namaMenu`, `meja.nomorMeja`, `voucher.kode`)
  -> truncate + suffix `Date.now()`.
- `Decimal` -> bandingkan dengan `Number(...)`.
- `createLog` menulis ke tabel `logs` -> ikut di-truncate; `headers()` di-mock.
- Tanggal bergantung waktu (`tanggal` shift, `autoCloseShifts`, expiry pesanan)
  -> `vi.setSystemTime`.

## 9. Langkah Eksekusi Berikutnya

1. Isi kredensial `pringmoni_test` di `.env.test`.
2. `npx prisma migrate deploy`.
3. Implement `helpers/db.ts` + `helpers/auth.ts`.
4. Implement 5 file test sesuai §5.
5. Jalankan & stabilkan, lalu perbarui DoD/docs.
