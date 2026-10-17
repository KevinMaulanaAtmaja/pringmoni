-- Rapikan data resep & bahan hasil seed:
--   1) Hapus tulisan contoh seed pada kolom keterangan bahan.
--   2) Bumbu hanya diperlukan untuk kategori "Makanan". Menu "Minuman" & "Camilan"
--      cukup punya bahan utama, jadi bumbu otomatisnya dihapus (beserta resep &
--      riwayat stok terkait).
--
-- ATURAN: perubahan ini menghapus baris bumbu (resep_menu + stok_bahan) untuk
-- Minuman & Camilan atas perintah eksplisit user.

-- 1) Bersihkan keterangan contoh seed.
UPDATE "stok_bahan"
SET "keterangan" = NULL
WHERE "keterangan" LIKE 'Seed contoh%'
   OR "keterangan" LIKE 'Data fake seed%';

-- 2) Hapus riwayat stok bumbu Minuman/Camilan dulu (FK RESTRICT ke stok_bahan).
DELETE FROM "riwayat_stok"
WHERE "stok_bahan_id" IN (
  SELECT sb."id"
  FROM "stok_bahan" sb
  JOIN "menu" m ON sb."nama_bahan" = 'Bumbu ' || m."nama_menu"
  JOIN "kategori_menu" k ON k."id" = m."kategori_id"
  WHERE sb."kategori" = 'bumbu'
    AND k."nama_kategori" IN ('Minuman', 'Camilan')
);

-- 3) Hapus baris resep yang menunjuk bumbu Minuman/Camilan (FK RESTRICT ke stok_bahan).
DELETE FROM "resep_menu"
WHERE "stok_bahan_id" IN (
  SELECT sb."id"
  FROM "stok_bahan" sb
  JOIN "menu" m ON sb."nama_bahan" = 'Bumbu ' || m."nama_menu"
  JOIN "kategori_menu" k ON k."id" = m."kategori_id"
  WHERE sb."kategori" = 'bumbu'
    AND k."nama_kategori" IN ('Minuman', 'Camilan')
);

-- 4) Hapus bahan bumbunya.
DELETE FROM "stok_bahan"
WHERE "id" IN (
  SELECT sb."id"
  FROM "stok_bahan" sb
  JOIN "menu" m ON sb."nama_bahan" = 'Bumbu ' || m."nama_menu"
  JOIN "kategori_menu" k ON k."id" = m."kategori_id"
  WHERE sb."kategori" = 'bumbu'
    AND k."nama_kategori" IN ('Minuman', 'Camilan')
);
