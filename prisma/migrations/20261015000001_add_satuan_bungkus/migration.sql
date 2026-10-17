-- Tambah satuan "bungkus" ke enum SatuanStok.
-- Dipisah dari migrasi reseed karena PostgreSQL (pre-v12 maupun >=12) melarang
-- memakai nilai enum yang baru ditambahkan di dalam transaksi yang sama.

-- AlterEnum
ALTER TYPE "SatuanStok" ADD VALUE IF NOT EXISTS 'bungkus';
