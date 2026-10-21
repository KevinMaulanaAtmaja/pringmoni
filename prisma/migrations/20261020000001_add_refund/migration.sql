-- Fitur Refund (PBI-7.5):
--   1) Status pembayaran & status pesanan baru: "refund".
--   2) Kolom catatan & jejak refund di pesanan.
--   3) Tabel bukti foto refund (UploadThing).

-- 1) Tambah value enum.
ALTER TYPE "StatusBayar" ADD VALUE IF NOT EXISTS 'refund';
ALTER TYPE "StatusPesanan" ADD VALUE IF NOT EXISTS 'refund';

-- 2) Kolom refund di pesanan.
ALTER TABLE "pesanan" ADD COLUMN "refund_catatan" TEXT;
ALTER TABLE "pesanan" ADD COLUMN "refunded_at" TIMESTAMP(3);
ALTER TABLE "pesanan" ADD COLUMN "refunded_by_id" INTEGER;

-- 3) Tabel bukti refund.
CREATE TABLE "refund_bukti" (
  "id" SERIAL NOT NULL,
  "pesanan_id" INTEGER NOT NULL,
  "foto_url" TEXT NOT NULL,
  "file_key" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "refund_bukti_pkey" PRIMARY KEY ("id")
);

-- Index + foreign key.
CREATE INDEX "refund_bukti_pesanan_id_idx" ON "refund_bukti"("pesanan_id");

ALTER TABLE "refund_bukti"
  ADD CONSTRAINT "refund_bukti_pesanan_id_fkey"
  FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pesanan"
  ADD CONSTRAINT "pesanan_refunded_by_id_fkey"
  FOREIGN KEY ("refunded_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
