-- Pringmoni mencakup 2 tempat: Resto dan Cafe.
-- Kategori menu diberi penanda lokasi supaya Resto (makanan, minuman, camilan)
-- dan Cafe (kopi, matcha, latte, dst.) bisa dibedakan di kiosk customer.
-- Migrasi ini aditif: kategori lama otomatis menjadi 'resto' (default).

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "LokasiMenu" AS ENUM ('resto', 'cafe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "kategori_menu"
  ADD COLUMN IF NOT EXISTS "lokasi" "LokasiMenu" NOT NULL DEFAULT 'resto';

-- Seed kategori Cafe. Idempotent: tidak menghapus kategori lama, hanya
-- memastikan kategori cafe dasar ada dan berlabel 'cafe'.
INSERT INTO "kategori_menu" ("nama_kategori", "lokasi")
VALUES
  ('Kopi', 'cafe'),
  ('Matcha', 'cafe'),
  ('Latte', 'cafe'),
  ('Teh', 'cafe'),
  ('Signatures', 'cafe')
ON CONFLICT ("nama_kategori") DO UPDATE
  SET "lokasi" = 'cafe', "deleted_at" = NULL;
