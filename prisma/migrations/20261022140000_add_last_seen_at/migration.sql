-- Deteksi sesi lain yang masih benar-benar aktif (bukan hanya baru login)
ALTER TABLE "users"
ADD COLUMN "last_seen_at" TIMESTAMP(3);
