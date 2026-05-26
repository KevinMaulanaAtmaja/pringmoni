-- CreateEnum: StatusAntar
CREATE TYPE "StatusAntar" AS ENUM ('belum', 'diantar');

-- AlterTable: add status_antar to detail_pesanan
ALTER TABLE "detail_pesanan" ADD COLUMN "status_antar" "StatusAntar" NOT NULL DEFAULT 'belum';
