-- Tambah nilai enum PINDAH_MEJA untuk log aksi pindah meja
ALTER TYPE "JenisAksiLog" ADD VALUE IF NOT EXISTS 'PINDAH_MEJA';
