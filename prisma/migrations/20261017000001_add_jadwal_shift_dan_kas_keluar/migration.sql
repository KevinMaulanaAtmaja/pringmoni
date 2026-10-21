-- Fase shift v2: jadwal slot shift oleh owner, auto-close tengah malam, kas keluar.
-- Idempotent supaya aman dijalankan ulang pada database yang sudah sebagian termigrasi.

-- 1) Nilai enum log baru (OPEN_SHIFT/CLOSE_SHIFT sudah ada dari migrasi sebelumnya).
ALTER TYPE "JenisAksiLog" ADD VALUE IF NOT EXISTS 'AUTO_CLOSE_SHIFT';
ALTER TYPE "JenisAksiLog" ADD VALUE IF NOT EXISTS 'KAS_KELUAR';

-- 2) Kolom baru pada shift_kasir.
--    - jadwal_shift_id : slot jadwal yang dijalani shift ini.
--    - slot_aktif_key  : "slot:<id>" saat ACTIVE (unik) -> cegah 2 shift aktif pada slot sama.
--    - auto_closed     : ditutup otomatis oleh sistem, bukan kasir.
ALTER TABLE "shift_kasir" ADD COLUMN IF NOT EXISTS "jadwal_shift_id" INTEGER;
ALTER TABLE "shift_kasir" ADD COLUMN IF NOT EXISTS "slot_aktif_key" TEXT;
ALTER TABLE "shift_kasir" ADD COLUMN IF NOT EXISTS "auto_closed" BOOLEAN NOT NULL DEFAULT false;

-- 3) Tabel jadwal_shift (template slot harian). Jam = menit dari tengah malam.
CREATE TABLE IF NOT EXISTS "jadwal_shift" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jam_mulai" INTEGER NOT NULL,
    "jam_selesai" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "jadwal_shift_pkey" PRIMARY KEY ("id")
);

-- 4) Tabel kas_keluar (pengeluaran tunai selama shift).
CREATE TABLE IF NOT EXISTS "kas_keluar" (
    "id" SERIAL NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "nominal" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kas_keluar_pkey" PRIMARY KEY ("id")
);

-- 5) Index.
CREATE INDEX IF NOT EXISTS "jadwal_shift_urutan_idx" ON "jadwal_shift"("urutan");
CREATE INDEX IF NOT EXISTS "kas_keluar_shift_id_idx" ON "kas_keluar"("shift_id");
CREATE INDEX IF NOT EXISTS "shift_kasir_jadwal_shift_id_idx" ON "shift_kasir"("jadwal_shift_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shift_kasir_slot_aktif_key_key" ON "shift_kasir"("slot_aktif_key");

-- 6) Foreign key (dibungkus guard agar tidak error bila sudah ada).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shift_kasir_jadwal_shift_id_fkey') THEN
        ALTER TABLE "shift_kasir"
            ADD CONSTRAINT "shift_kasir_jadwal_shift_id_fkey"
            FOREIGN KEY ("jadwal_shift_id") REFERENCES "jadwal_shift"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kas_keluar_shift_id_fkey') THEN
        ALTER TABLE "kas_keluar"
            ADD CONSTRAINT "kas_keluar_shift_id_fkey"
            FOREIGN KEY ("shift_id") REFERENCES "shift_kasir"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kas_keluar_user_id_fkey') THEN
        ALTER TABLE "kas_keluar"
            ADD CONSTRAINT "kas_keluar_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 7) Seed slot default: Pagi 08:00-16:00 dan Sore 16:00-24:00.
--    Hanya diisi bila tabel masih kosong, agar tidak menimpa pengaturan owner.
INSERT INTO "jadwal_shift" ("nama", "jam_mulai", "jam_selesai", "urutan", "aktif")
SELECT v.nama, v.jam_mulai, v.jam_selesai, v.urutan, true
FROM (
    VALUES
        ('Pagi', 480, 960, 1),
        ('Sore', 960, 1440, 2)
) AS v(nama, jam_mulai, jam_selesai, urutan)
WHERE NOT EXISTS (SELECT 1 FROM "jadwal_shift");
