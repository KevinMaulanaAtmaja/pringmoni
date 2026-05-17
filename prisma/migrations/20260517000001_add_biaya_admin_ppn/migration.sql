-- AlterTable: add biaya_admin and ppn columns to pesanan
ALTER TABLE "pesanan" ADD COLUMN "biaya_admin" DECIMAL(10,2);
ALTER TABLE "pesanan" ADD COLUMN "ppn" DECIMAL(10,2);
