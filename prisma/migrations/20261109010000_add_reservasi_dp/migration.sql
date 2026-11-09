-- AlterTable
ALTER TABLE "reservasi" ADD COLUMN     "dp_persen" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "dp_nominal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "dp_metode" "MetodePembayaran",
ADD COLUMN     "dp_status" "StatusBayar" NOT NULL DEFAULT 'menunggu',
ADD COLUMN     "dp_paid_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pesanan" ADD COLUMN     "dp_nominal" DECIMAL(10,2) NOT NULL DEFAULT 0;
