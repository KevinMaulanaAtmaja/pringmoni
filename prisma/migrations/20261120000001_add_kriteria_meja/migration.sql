-- AlterEnum
ALTER TYPE "JenisAksiLog" ADD VALUE 'MANAGE_KRITERIA_MEJA';

-- CreateTable
CREATE TABLE "kriteria_meja" (
    "id" SERIAL NOT NULL,
    "nama_kriteria" TEXT NOT NULL,
    "token_kriteria" TEXT NOT NULL,
    "khusus_satu_customer" BOOLEAN NOT NULL DEFAULT false,
    "mode_bebas" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "kriteria_meja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kriteria_meja_nama_kriteria_key" ON "kriteria_meja"("nama_kriteria");
CREATE UNIQUE INDEX "kriteria_meja_token_kriteria_key" ON "kriteria_meja"("token_kriteria");

-- AlterTable
ALTER TABLE "meja" ADD COLUMN "kriteria_meja_id" INTEGER;

-- CreateIndex
CREATE INDEX "meja_kriteria_meja_id_idx" ON "meja"("kriteria_meja_id");

-- AddForeignKey
ALTER TABLE "meja" ADD CONSTRAINT "meja_kriteria_meja_id_fkey" FOREIGN KEY ("kriteria_meja_id") REFERENCES "kriteria_meja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed kriteria bawaan
INSERT INTO "kriteria_meja" ("nama_kriteria", "token_kriteria", "khusus_satu_customer", "mode_bebas")
VALUES ('Meja Bebas', 'BEBAS', false, true)
ON CONFLICT ("nama_kriteria") DO NOTHING;

INSERT INTO "kriteria_meja" ("nama_kriteria", "token_kriteria", "khusus_satu_customer", "mode_bebas")
VALUES ('Meja Khusus 1 Customer', 'KHUSUS1', true, false)
ON CONFLICT ("nama_kriteria") DO NOTHING;
