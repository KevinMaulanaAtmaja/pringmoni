-- Perbaikan: tabel voucher memakai soft delete (deleted_at) tetapi migrasi
-- 20261021000001_add_voucher tidak menambahkan kolom tersebut.

ALTER TABLE "voucher" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "voucher_deleted_at_idx" ON "voucher"("deleted_at");
