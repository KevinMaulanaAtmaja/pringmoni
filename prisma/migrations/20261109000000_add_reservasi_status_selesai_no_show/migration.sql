-- AlterEnum
ALTER TYPE "StatusReservasi" ADD VALUE 'selesai';
ALTER TYPE "StatusReservasi" ADD VALUE 'no_show';

-- AlterTable
ALTER TABLE "reservasi" ADD COLUMN     "no_show_at" TIMESTAMP(3),
ADD COLUMN     "selesai_at" TIMESTAMP(3);
