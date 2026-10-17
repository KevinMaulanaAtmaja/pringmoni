-- Stok Bahan v2: lokasi stok (gudang/dapur), resep menu, dan pemotongan stok otomatis.
--
-- Catatan: tabel stok_bahan & riwayat_stok sudah ada di database (dibuat lewat prisma db push,
-- belum punya migration). Migration ini hanya mengubahnya, tidak membuat ulang.

-- CreateEnum
CREATE TYPE "LokasiStok" AS ENUM ('gudang', 'dapur');

-- AlterEnum
ALTER TYPE "JenisPerubahanStok" ADD VALUE 'otomatis';

-- AlterTable: tambah kolom tipe secara nullable dulu supaya aman kalau sudah ada data
ALTER TABLE "stok_bahan" ADD COLUMN "tipe" "LokasiStok";

-- Backfill: bahan yang sudah ada sebelumnya dianggap berada di gudang
UPDATE "stok_bahan" SET "tipe" = 'gudang' WHERE "tipe" IS NULL;

ALTER TABLE "stok_bahan" ALTER COLUMN "tipe" SET NOT NULL;

-- Ganti unique constraint lama (nama_bahan) menjadi gabungan (nama_bahan, tipe),
-- karena satu nama bahan bisa ada di gudang sekaligus dapur.
DROP INDEX "stok_bahan_nama_bahan_key";

CREATE UNIQUE INDEX "stok_bahan_nama_bahan_tipe_key" ON "stok_bahan"("nama_bahan", "tipe");

-- CreateTable
CREATE TABLE "resep_menu" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "stok_bahan_id" INTEGER NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resep_menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resep_menu_menu_id_stok_bahan_id_key" ON "resep_menu"("menu_id", "stok_bahan_id");

-- AddForeignKey
ALTER TABLE "resep_menu" ADD CONSTRAINT "resep_menu_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_menu" ADD CONSTRAINT "resep_menu_stok_bahan_id_fkey" FOREIGN KEY ("stok_bahan_id") REFERENCES "stok_bahan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: penanda idempotensi pemotongan stok per pesanan
ALTER TABLE "pesanan" ADD COLUMN "stok_deducted" BOOLEAN NOT NULL DEFAULT false;
