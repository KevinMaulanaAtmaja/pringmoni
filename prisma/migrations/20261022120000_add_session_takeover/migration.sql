-- Support fitur "ambil alih" sesi: versi sesi per akun + penanda perangkat & waktu login terakhir
ALTER TABLE "users"
ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_login_at" TIMESTAMP(3),
ADD COLUMN "last_login_device" TEXT;
