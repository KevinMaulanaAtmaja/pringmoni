-- CreateEnum
CREATE TYPE "SumberReservasi" AS ENUM ('offline', 'online');

-- AlterEnum
ALTER TYPE "JenisAksiLog" ADD VALUE 'CREATE_RESERVASI_CUSTOMER';
ALTER TYPE "JenisAksiLog" ADD VALUE 'VERIFIKASI_DP_CUSTOMER';

-- DropForeignKey
ALTER TABLE "reservasi" DROP CONSTRAINT "reservasi_created_by_id_fkey";

-- AlterTable
ALTER TABLE "reservasi" ADD COLUMN     "alasan_batal" TEXT,
ADD COLUMN     "kode_reservasi" TEXT,
ADD COLUMN     "sumber" "SumberReservasi" NOT NULL DEFAULT 'offline',
ALTER COLUMN "created_by_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reservasi_kode_reservasi_key" ON "reservasi"("kode_reservasi");

-- Backfill kode reservasi untuk baris lama (offline, tanpa kode)
UPDATE "reservasi" SET "kode_reservasi" = 'RSV-' || lpad("id"::text, 5, '0') WHERE "kode_reservasi" IS NULL;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;