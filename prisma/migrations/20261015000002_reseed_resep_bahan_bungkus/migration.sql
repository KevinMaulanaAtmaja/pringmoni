-- Reset penuh data resep & bahan, lalu isi ulang dengan pola sederhana:
--   1 menu = 1 bahan utama (nama menu) + 1 bumbu ("Bumbu <nama menu>")
-- Semua bahan disimpan di Dapur dengan satuan "bungkus"
-- (bahan sudah otomatis digabung & diracik menjadi 1 bungkus, bukan kiloan).
-- Tidak ada bahan tambahan detail (bawang, garam, dll).
--
-- ATURAN: migrasi ini menghapus seluruh isi resep_menu, riwayat_stok, dan stok_bahan
-- atas perintah eksplisit user ("buang semua resep dan bahannya").

-- 1) Bersihkan semua resep, riwayat stok, dan bahan.
DELETE FROM "resep_menu";
DELETE FROM "riwayat_stok";
DELETE FROM "stok_bahan";

-- 2) Bahan utama: satu per menu aktif, nama = nama menu. Stok dalam bungkus.
INSERT INTO "stok_bahan"
  ("nama_bahan", "tipe", "kategori", "stok_qty", "satuan", "stok_minimum", "harga_per_satuan", "status_stok", "keterangan")
SELECT
  m."nama_menu", 'dapur', 'bahan_utama', 100, 'bungkus', 10, 5000, 'tersedia', 'Seed contoh resep (bungkus)'
FROM "menu" m
WHERE m."deleted_at" IS NULL;

-- 3) Bumbu: satu per menu aktif, nama = "Bumbu <nama menu>". Stok dalam bungkus.
INSERT INTO "stok_bahan"
  ("nama_bahan", "tipe", "kategori", "stok_qty", "satuan", "stok_minimum", "harga_per_satuan", "status_stok", "keterangan")
SELECT
  'Bumbu ' || m."nama_menu", 'dapur', 'bumbu', 100, 'bungkus', 10, 1500, 'tersedia', 'Seed contoh resep (bungkus)'
FROM "menu" m
WHERE m."deleted_at" IS NULL;

-- 4) Rakit resep: 1 porsi = 1 bungkus bahan utama + 1 bungkus bumbu.
INSERT INTO "resep_menu" ("menu_id", "stok_bahan_id", "jumlah")
SELECT m."id", sb."id", 1
FROM "menu" m
JOIN "stok_bahan" sb
  ON sb."nama_bahan" = m."nama_menu"
 AND sb."tipe" = 'dapur'
WHERE m."deleted_at" IS NULL;

INSERT INTO "resep_menu" ("menu_id", "stok_bahan_id", "jumlah")
SELECT m."id", sb."id", 1
FROM "menu" m
JOIN "stok_bahan" sb
  ON sb."nama_bahan" = 'Bumbu ' || m."nama_menu"
 AND sb."tipe" = 'dapur'
WHERE m."deleted_at" IS NULL;
