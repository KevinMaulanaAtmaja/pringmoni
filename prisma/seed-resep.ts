import "dotenv/config";
import {
  PrismaClient,
  KategoriBahan,
  LokasiStok,
  SatuanStok,
} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ⚠️ ATURAN SEED (ikuti prisma/seed.ts):
 * - Master table (menu, users, meja, kategori_menu) TIDAK boleh dihapus
 * - Gunakan UPSERT untuk menghindari duplikasi
 * - deleteMany hanya pada tabel child (resep_menu) dan hanya untuk data resep
 *   yang sudah/setup ulang atas izin user
 *
 * Pola sederhana:
 *   1 menu = 1 bahan utama (nama menu).
 *   Khusus kategori "Makanan" ditambah 1 bumbu ("Bumbu <nama menu>").
 *   Minuman & Camilan cukup bahan utama (bumbu opsional / tidak dibuat).
 *   Satuan "bungkus", 1 porsi = 1 bungkus bahan utama (+ 1 bungkus bumbu bila ada).
 *   Tidak ada bahan tambahan detail (bawang, garam, dll).
 */

const STOK_AWAL = 100;
const STOK_MINIMUM = 10;
const HARGA_UTAMA = 5000;
const HARGA_BUMBU = 1500;

// Aturan sama dengan src/lib/resep.ts butuhBumbu(): hanya "Makanan" wajib bumbu.
function butuhBumbu(kategori: string | null | undefined): boolean {
  return (kategori ?? "").trim().toLowerCase() === "makanan";
}

async function upsertBahan(
  namaBahan: string,
  kategori: KategoriBahan,
  harga: number
) {
  return await prisma.stokBahan.upsert({
    where: { namaBahan_tipe: { namaBahan, tipe: LokasiStok.dapur } },
    update: {
      kategori,
      satuan: SatuanStok.bungkus,
      stokMinimum: STOK_MINIMUM,
      hargaPerSatuan: harga,
      keterangan: null,
    },
    create: {
      namaBahan,
      tipe: LokasiStok.dapur,
      kategori,
      stokQty: STOK_AWAL,
      satuan: SatuanStok.bungkus,
      stokMinimum: STOK_MINIMUM,
      hargaPerSatuan: harga,
      keterangan: null,
    },
  });
}

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      namaMenu: true,
      kategori: { select: { namaKategori: true } },
    },
    orderBy: { namaMenu: "asc" },
  });

  if (DRY_RUN) {
    console.log("=== DRY RUN (tidak ada perubahan ke database) ===\n");
    for (const menu of menus) {
      const bahanBumbu = butuhBumbu(menu.kategori?.namaKategori)
        ? ` + bumbu "Bumbu ${menu.namaMenu}" (1 bungkus)`
        : "";
      console.log(
        `  ${menu.namaMenu} -> utama "${menu.namaMenu}" (1 bungkus)${bahanBumbu}`
      );
    }
    return;
  }

  console.log(`Menu aktif ditemukan: ${menus.length}`);

  // Resep lama dibersihkan supaya tidak ada bahan yang salah nyambung.
  // Hanya tabel child resep_menu, master bahan & menu tidak disentuh.
  const hapus = await prisma.resepMenu.deleteMany({});
  console.log(`Resep lama dibersihkan: ${hapus.count} baris`);

  let dibuat = 0;
  let gagal = 0;

  for (const menu of menus) {
    try {
      const utama = await upsertBahan(
        menu.namaMenu,
        KategoriBahan.bahan_utama,
        HARGA_UTAMA
      );

      const dataResep = [
        { menuId: menu.id, stokBahanId: utama.id, jumlah: 1 },
      ];

      // Bumbu hanya untuk kategori Makanan.
      if (butuhBumbu(menu.kategori?.namaKategori)) {
        const bumbu = await upsertBahan(
          `Bumbu ${menu.namaMenu}`,
          KategoriBahan.bumbu,
          HARGA_BUMBU
        );
        dataResep.push({ menuId: menu.id, stokBahanId: bumbu.id, jumlah: 1 });
      }

      await prisma.resepMenu.createMany({
        data: dataResep,
        skipDuplicates: true,
      });

      dibuat += 1;
    } catch (e) {
      gagal += 1;
      console.error(`  GAGAL ${menu.namaMenu}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`\nSelesai. Berhasil: ${dibuat}, gagal: ${gagal}`);
  console.log(
    `Semua bahan memakai satuan "${SatuanStok.bungkus}" (bumbu hanya dibuat untuk kategori Makanan).`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
