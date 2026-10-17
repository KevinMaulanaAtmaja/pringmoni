-- =============================================================================
-- Shift Kasir: pencatatan uang awal (modal kas) + pemisahan kas per shift
-- =============================================================================

-- CreateEnum: StatusShift
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'StatusShift'
  ) THEN
    CREATE TYPE "StatusShift" AS ENUM ('ACTIVE', 'CLOSED');
  END IF;
END $$;

-- AlterEnum: tambah aksi shift + perbaikan aksi EMPTY_TABLE yang belum pernah
-- ada di enum DB (dipakai src/app/actions/meja.ts:kosongkanMeja sehingga lognya
-- selalu gagal diam-diam). Semua dalam blok idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'JenisAksiLog' AND e.enumlabel = 'EMPTY_TABLE'
  ) THEN
    ALTER TYPE "JenisAksiLog" ADD VALUE 'EMPTY_TABLE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'JenisAksiLog' AND e.enumlabel = 'OPEN_SHIFT'
  ) THEN
    ALTER TYPE "JenisAksiLog" ADD VALUE 'OPEN_SHIFT';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'JenisAksiLog' AND e.enumlabel = 'CLOSE_SHIFT'
  ) THEN
    ALTER TYPE "JenisAksiLog" ADD VALUE 'CLOSE_SHIFT';
  END IF;
END $$;

-- CreateTable: shift_kasir
CREATE TABLE IF NOT EXISTS "shift_kasir" (
    "id" SERIAL NOT NULL,
    "kasir_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "waktu_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktu_keluar" TIMESTAMP(3),
    "uang_awal" DECIMAL(15,2) NOT NULL,
    "uang_akhir" DECIMAL(15,2),
    "status_shift" "StatusShift" NOT NULL DEFAULT 'ACTIVE',
    -- Jaminan DB untuk "satu kasir hanya boleh satu shift ACTIVE":
    -- saat ACTIVE -> diisi kasir_id (unik), saat CLOSED -> NULL (banyak diizinkan).
    "aktif_key" INTEGER,
    "total_transaksi" INTEGER NOT NULL DEFAULT 0,
    "total_pendapatan" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_tunai" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_non_tunai" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "selisih_kas" DECIMAL(15,2),
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "shift_kasir_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "shift_kasir" ADD COLUMN IF NOT EXISTS "sumber_shift_id" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "shift_kasir_aktif_key_key" ON "shift_kasir"("aktif_key");
CREATE INDEX IF NOT EXISTS "shift_kasir_kasir_id_tanggal_idx" ON "shift_kasir"("kasir_id", "tanggal");
CREATE INDEX IF NOT EXISTS "shift_kasir_status_shift_idx" ON "shift_kasir"("status_shift");
CREATE INDEX IF NOT EXISTS "shift_kasir_sumber_shift_id_idx" ON "shift_kasir"("sumber_shift_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shift_kasir_kasir_id_fkey'
  ) THEN
    ALTER TABLE "shift_kasir"
      ADD CONSTRAINT "shift_kasir_kasir_id_fkey"
      FOREIGN KEY ("kasir_id") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Aturan 7: shift ini memakai uang kas yang ditutup shift lain.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shift_kasir_sumber_shift_id_fkey'
  ) THEN
    ALTER TABLE "shift_kasir"
      ADD CONSTRAINT "shift_kasir_sumber_shift_id_fkey"
      FOREIGN KEY ("sumber_shift_id") REFERENCES "shift_kasir"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable: setiap transaksi kasir terikat ke shift saat transaksi dicatat
ALTER TABLE "pesanan" ADD COLUMN IF NOT EXISTS "shift_id" INTEGER;

CREATE INDEX IF NOT EXISTS "pesanan_shift_id_idx" ON "pesanan"("shift_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pesanan_shift_id_fkey'
  ) THEN
    ALTER TABLE "pesanan"
      ADD CONSTRAINT "pesanan_shift_id_fkey"
      FOREIGN KEY ("shift_id") REFERENCES "shift_kasir"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;