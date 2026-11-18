-- AlterTable
ALTER TABLE "reservasi" ADD COLUMN     "voucher_id" INTEGER,
ADD COLUMN     "diskon_voucher" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "reservasi_voucher_id_idx" ON "reservasi"("voucher_id");

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
