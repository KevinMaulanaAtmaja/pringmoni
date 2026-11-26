-- Ganti nama "kriteria" menjadi "tipe" (enum log, tabel, kolom, index, FK)
ALTER TYPE "JenisAksiLog" RENAME VALUE 'MANAGE_KRITERIA_MEJA' TO 'MANAGE_TIPE_MEJA';

ALTER TABLE "kriteria_meja" RENAME TO "tipe_meja";

ALTER TABLE "tipe_meja" RENAME COLUMN "nama_kriteria" TO "nama_tipe";
ALTER TABLE "tipe_meja" RENAME COLUMN "token_kriteria" TO "token_tipe";
ALTER TABLE "meja" RENAME COLUMN "kriteria_meja_id" TO "tipe_meja_id";

ALTER INDEX "kriteria_meja_nama_kriteria_key" RENAME TO "tipe_meja_nama_tipe_key";
ALTER INDEX "kriteria_meja_token_kriteria_key" RENAME TO "tipe_meja_token_tipe_key";
ALTER INDEX "kriteria_meja_prefix_kode_key" RENAME TO "tipe_meja_prefix_kode_key";
ALTER INDEX "meja_kriteria_meja_id_idx" RENAME TO "meja_tipe_meja_id_idx";

ALTER TABLE "tipe_meja" RENAME CONSTRAINT "kriteria_meja_pkey" TO "tipe_meja_pkey";
ALTER TABLE "meja" RENAME CONSTRAINT "meja_kriteria_meja_id_fkey" TO "meja_tipe_meja_id_fkey";

-- Seed tipe meja bawaan (lewati bila sudah ada)
INSERT INTO "tipe_meja" ("nama_tipe", "token_tipe", "prefix_kode", "khusus_satu_customer", "mode_bebas")
VALUES
  ('Kursi', 'KURSI', 'K', true, false),
  ('Lesehan', 'LESEHAN', 'L', true, false),
  ('Camping', 'CAMPING', 'C', true, false)
ON CONFLICT DO NOTHING;
