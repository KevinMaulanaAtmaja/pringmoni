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
 */

type DerivedResep = {
  namaBahanUtama: string;
  namaBumbu: string;
  jumlahUtama: number;
  jumlahBumbu: number;
};

/**
 * Ambil bahan utama dari nama menu dengan mengambil kata/penanda utama.
 * "Ayam Kesrut" -> "Ayam", "Nasi Goreng Jawa" -> "Nasi Goreng",
 * "Jus Jambu" -> "Jambu", "kopi susu ice/hot" -> "Kopi Susu".
 */
function deriveBahanUtama(namaMenu: string): string {
  // Buang keterangan jumlah: "Dimsum Kukus (isi 5)" -> "Dimsum Kukus"
  let nama = namaMenu.replace(/\([^)]*\)/g, " ").trim();

  // Buang penanda saji: "capucino ice/hot" -> "capucino"
  nama = nama.replace(/\s*[\/(]?\s*(ice|hot)\s*(\/\s*(ice|hot))?\s*\)?/gi, " ");
  nama = nama.replace(/\s{2,}/g, " ").trim();
  if (nama.length === 0) nama = namaMenu.trim();

  const kata = nama.split(" ").filter(Boolean);
  if (kata.length === 0) return toTitle(namaMenu.trim());

  // Kata pertama yang cuma menjelaskan jenis hidangan, bukan bahannya:
  // "Jus Jambu" -> Jambu, "Cah Kangkung" -> Kangkung, "Soto Ayam" -> Ayam
  const modifierJenis = new Set([
    "jus",
    "juice",
    "sm",
    "cah",
    "soto",
    "sop",
    "tumis",
    "lodeh",
    "pecel",
    "gulai",
    "martabak",
  ]);
  if (kata.length >= 2 && modifierJenis.has(kata[0].toLowerCase())) {
    return toTitle(kata[1]);
  }

  // "es tape ketan" -> Es Tape (kata pertamageneric, tapi modifier Minuman)
  if (
    kata.length >= 3 &&
    ["es", "kopi", "teh", "milk", "lemon"].includes(kata[0].toLowerCase())
  ) {
    return toTitle(kata.slice(0, 2).join(" "));
  }

  // Default: ambil kata pertama sebagai bahan utama.
  // "Ayam Kesrut" -> Ayam, "Udang Bakar" -> Udang, "Tahu Petis" -> Tahu.
  return toTitle(kata[0]);
}

function toTitle(value: string): string {
  return value
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function deriveResep(namaMenu: string): DerivedResep {
  return {
    namaBahanUtama: deriveBahanUtama(namaMenu),
    namaBumbu: `Bumbu ${toTitle(namaMenu.trim())}`,
    jumlahUtama: 0.2,
    jumlahBumbu: 0.05,
  };
}

const STOK_AWAL_UTAMA = 20;
const STOK_AWAL_BUMBU = 5;
const HARGA_UTAMA = 38000;
const HARGA_BUMBU = 5000;

async function upsertBahan(
  namaBahan: string,
  kategori: KategoriBahan,
  stokAwal: number,
  harga: number
) {
  return await prisma.stokBahan.upsert({
    where: { namaBahan_tipe: { namaBahan, tipe: LokasiStok.dapur } },
    update: {
      kategori,
      stokMinimum: kategori === KategoriBahan.bumbu ? 1 : 5,
      hargaPerSatuan: harga,
    },
    create: {
      namaBahan,
      tipe: LokasiStok.dapur,
      kategori,
      stokQty: stokAwal,
      satuan: SatuanStok.kg,
      stokMinimum: kategori === KategoriBahan.bumbu ? 1 : 5,
      hargaPerSatuan: harga,
      keterangan: "Data fake seed resep",
    },
  });
}

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    select: { id: true, namaMenu: true },
    orderBy: { namaMenu: "asc" },
  });

  if (DRY_RUN) {
    console.log("=== DRY RUN (tidak ada perubahan ke database) ===\n");
    for (const menu of menus) {
      const r = deriveResep(menu.namaMenu);
      console.log(
        `  ${menu.namaMenu} -> utama "${r.namaBahanUtama}" (${r.jumlahUtama} kg) + bumbu "${r.namaBumbu}" (${r.jumlahBumbu} kg)`
      );
    }
    return;
  }

  console.log(`Menu aktif ditemukan: ${menus.length}`);

  // Resep lama dibersihkan supaya tidak ada bahan yang salah nyambung
  // (mis. Ayam Kesrut -> Daging Sapi). Izin user: "seed ulang resep".
  // Hanya tabel child resep_menu, master bahan & menu tidak disentuh.
  const hapus = await prisma.resepMenu.deleteMany({});
  console.log(`Resep lama dibersihkan: ${hapus.count} baris`);

  const totalPakai = new Map<string, number>();
  for (const menu of menus) {
    const r = deriveResep(menu.namaMenu);
    totalPakai.set(
      r.namaBahanUtama,
      (totalPakai.get(r.namaBahanUtama) ?? 0) + 1
    );
  }

  let dibuat = 0;
  let gagal = 0;
  const ringkasan: string[] = [];

  for (const menu of menus) {
    const resep = deriveResep(menu.namaMenu);

    try {
      const utama = await upsertBahan(
        resep.namaBahanUtama,
        KategoriBahan.bahan_utama,
        STOK_AWAL_UTAMA,
        HARGA_UTAMA
      );
      const bumbu = await upsertBahan(
        resep.namaBumbu,
        KategoriBahan.bumbu,
        STOK_AWAL_BUMBU,
        HARGA_BUMBU
      );

      await prisma.resepMenu.create({
        data: {
          menuId: menu.id,
          stokBahanId: utama.id,
          jumlah: resep.jumlahUtama,
        },
      });
      await prisma.resepMenu.create({
        data: {
          menuId: menu.id,
          stokBahanId: bumbu.id,
          jumlah: resep.jumlahBumbu,
        },
      });

      dibuat += 1;
      const dipakai = totalPakai.get(utama.namaBahan) ?? 1;
      const porsiUtama = Math.floor(
        (STOK_AWAL_UTAMA * dipakai) / resep.jumlahUtama
      );
      ringkasan.push(
        `  ${menu.namaMenu} -> ${utama.namaBahan} (${resep.jumlahUtama} kg) + ${bumbu.namaBahan} (${resep.jumlahBumbu} kg)`
      );
      ringkasan.push(
        `     sisa porsi: ${Math.min(porsiUtama, Math.floor(STOK_AWAL_BUMBU / resep.jumlahBumbu))} (${dipakai} menu pakai ${utama.namaBahan})`
      );
    } catch (e) {
      gagal += 1;
      console.error(`  GAGAL ${menu.namaMenu}:`, e instanceof Error ? e.message : e);
    }
  }

  // Distribusikan stok bahan utama sesuai berapa menu yang memakainya,
  // supaya 1 bahan tidak jadi pembatas semua menu.
  for (const [namaBahan, dipakai] of totalPakai) {
    await prisma.stokBahan.updateMany({
      where: { namaBahan, tipe: LokasiStok.dapur },
      data: { stokQty: STOK_AWAL_UTAMA * dipakai },
    });
  }

  console.log(
    `\nSelesai. Berhasil: ${dibuat}, gagal: ${gagal}`
  );
  console.log("\nRincian:");
  for (const r of ringkasan) console.log(r);

  // Laporan ketersediaan
  console.log("\nKetersediaan:");
  const semua = await prisma.menu.findMany({
    where: { deletedAt: null },
    select: {
      namaMenu: true,
      resep: {
        select: {
          jumlah: true,
          stokBahan: {
            select: { namaBahan: true, stokQty: true, kategori: true },
          },
        },
      },
    },
    orderBy: { namaMenu: "asc" },
  });

  for (const m of semua) {
    const utama = m.resep.filter(
      (r) => r.stokBahan.kategori === "bahan_utama"
    ).length;
    const bumbu = m.resep.filter(
      (r) => r.stokBahan.kategori === "bumbu"
    ).length;
    const porsi = m.resep
      .filter((r) => Number(r.jumlah) > 0)
      .map((r) =>
        Math.floor(Number(r.stokBahan.stokQty) / Number(r.jumlah))
      );
    const min = porsi.length > 0 ? Math.min(...porsi) : 0;
    const status =
      utama === 0 || bumbu === 0
        ? "RESEP TIDAK LENGKAP"
        : min <= 0
          ? "STOK HABIS"
          : `${min} porsi`;
    console.log(`  ${m.namaMenu}: ${status}`);
  }
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