-- Konsolidasi kategori Cafe menjadi SATU kategori "Cafe" agar daftar kategori
-- di dashboard owner lebih ringkas (sebelumnya ada Kopi, Matcha, Latte, Teh,
-- Signatures yang terpisah).
--
-- Kategori cafe lama dinonaktifkan (soft delete, TIDAK menghapus data), dan
-- menu apa pun yang masih memakainya dipindah ke kategori "Cafe".

-- Pastikan kategori "Cafe" ada.
INSERT INTO "kategori_menu" ("nama_kategori", "lokasi")
VALUES ('Cafe', 'cafe')
ON CONFLICT ("nama_kategori") DO UPDATE
  SET "lokasi" = 'cafe', "deleted_at" = NULL;

-- Pindahkan menu dari kategori cafe lama ke "Cafe" (jika ada).
UPDATE "menu"
SET "kategori_id" = (
  SELECT "id" FROM "kategori_menu" WHERE "nama_kategori" = 'Cafe'
)
WHERE "kategori_id" IN (
  SELECT "id" FROM "kategori_menu"
  WHERE "nama_kategori" IN ('Kopi', 'Matcha', 'Latte', 'Teh', 'Signatures')
);

-- Nonaktifkan kategori cafe lama (soft delete, data tetap aman).
UPDATE "kategori_menu"
SET "deleted_at" = now()
WHERE "nama_kategori" IN ('Kopi', 'Matcha', 'Latte', 'Teh', 'Signatures')
  AND "deleted_at" IS NULL;
