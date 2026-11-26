-- Hapus tipe bawaan "Meja Khusus 1 Customer" (seed dari migration 20261120000001, tidak dipakai)
DELETE FROM "tipe_meja"
WHERE "nama_tipe" = 'Meja Khusus 1 Customer'
   OR "token_tipe" = 'KHUSUS1';
