-- Fitur Voucher & Diskon (PBI-10.1 s.d. 10.4):
--   1) Tabel voucher (kode unik, diskon persen, minimal belanja, status aktif/nonaktif).
--   2) Relasi pesanan ke voucher + nilai diskon yang terpakai.
--   3) Value enum log aktivitas voucher.

-- 1) Tambah value enum.
ALTER TYPE "JenisAksiLog" ADD VALUE IF NOT EXISTS 'MANAGE_VOUCHER';

CREATE TYPE "StatusVoucher" AS ENUM ('aktif', 'nonaktif');

-- 2) Tabel voucher.
CREATE TABLE "voucher" (
  "id" SERIAL NOT NULL,
  "kode" TEXT NOT NULL,
  "nama_voucher" TEXT NOT NULL,
  "deskripsi" TEXT,
  "diskon_persen" INTEGER NOT NULL,
  "minimal_belanja" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "status_voucher" "StatusVoucher" NOT NULL DEFAULT 'aktif',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3),

  CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "voucher_kode_key" ON "voucher"("kode");

-- 3) Relasi pesanan -> voucher.
ALTER TABLE "pesanan" ADD COLUMN "voucher_id" INTEGER;
ALTER TABLE "pesanan" ADD COLUMN "diskon_voucher" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "pesanan"
  ADD CONSTRAINT "pesanan_voucher_id_fkey"
  FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
