-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('owner', 'cashier', 'waiter');

-- CreateEnum
CREATE TYPE "StatusMeja" AS ENUM ('kosong', 'terpakai');

-- CreateEnum
CREATE TYPE "StatusMenu" AS ENUM ('tersedia', 'habis', 'nonaktif');

-- CreateEnum
CREATE TYPE "StatusPesanan" AS ENUM ('menunggu', 'diproses', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('qris', 'tunai');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('menunggu', 'berhasil', 'dibatalkan');

-- CreateEnum
CREATE TYPE "JenisAksiLog" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_MENU', 'UPDATE_MENU', 'DELETE_MENU', 'CREATE_MEJA', 'UPDATE_MEJA', 'DELETE_MEJA', 'CREATE_ORDER', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER', 'PROCESS_PAYMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meja" (
    "id" SERIAL NOT NULL,
    "nomor_meja" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "token_meja" TEXT,
    "status_meja" "StatusMeja" NOT NULL DEFAULT 'kosong',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "meja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_menu" (
    "id" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "kategori_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "nama_menu" TEXT NOT NULL,
    "deskripsi" TEXT,
    "harga" DECIMAL(10,2) NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "status_menu" "StatusMenu" NOT NULL DEFAULT 'tersedia',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_foto" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "foto_url" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "menu_foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesanan" (
    "id" SERIAL NOT NULL,
    "meja_id" INTEGER NOT NULL,
    "waiter_id" INTEGER,
    "kasir_id" INTEGER,
    "status_pesanan" "StatusPesanan" NOT NULL DEFAULT 'menunggu',
    "catatan" TEXT,
    "total_harga" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metode_pembayaran" "MetodePembayaran",
    "jumlah_bayar" DECIMAL(10,2),
    "kembalian" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status_pembayaran" "StatusBayar" NOT NULL DEFAULT 'menunggu',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_pesanan" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "pesanan_id" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_saat_pesan" DECIMAL(10,2) NOT NULL,
    "catatan_item" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "aksi" "JenisAksiLog" NOT NULL,
    "keterangan" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "meja_nomor_meja_key" ON "meja"("nomor_meja");

-- CreateIndex
CREATE UNIQUE INDEX "meja_token_meja_key" ON "meja"("token_meja");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_menu_nama_kategori_key" ON "kategori_menu"("nama_kategori");

-- CreateIndex
CREATE UNIQUE INDEX "menu_nama_menu_key" ON "menu"("nama_menu");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori_menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_foto" ADD CONSTRAINT "menu_foto_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_kasir_id_fkey" FOREIGN KEY ("kasir_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_waiter_id_fkey" FOREIGN KEY ("waiter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_meja_id_fkey" FOREIGN KEY ("meja_id") REFERENCES "meja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
