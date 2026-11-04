import "dotenv/config"
import { PrismaClient, Prisma, LokasiMenu } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed data menu + kategori Resto/Cafe.
 *
 * ⚠️ ATURAN (lihat AGENTS.md & SECURITY.md):
 * - TIDAK ada DELETE / deleteMany / truncate. Hanya UPSERT.
 * - Kategori & menu yang sudah ada di database TIDAK dihapus, hanya
 *   dilengkapi (icon, lokasi, harga) bila datanya memang belum sesuai.
 * - Menu dengan nama yang sudah dipakai kategori lokasi lain TIDAK dipindah
 *   (dilewati + dilaporkan) supaya tidak diam-diam mengubah tampilan kiosk.
 *
 * Jalankan: npm run seed-menu
 */

type KategoriSeed = {
  namaKategori: string
  lokasi: LokasiMenu
  icon: string
}

type MenuSeed = {
  namaMenu: string
  harga: number
  deskripsi: string
  kategori: string
}

const KATEGORI_SEED: KategoriSeed[] = [
  { namaKategori: "Makanan", lokasi: "resto", icon: "Utensils" },
  { namaKategori: "Minuman", lokasi: "resto", icon: "GlassWater" },
  { namaKategori: "Camilan", lokasi: "resto", icon: "Cookie" },
  { namaKategori: "Cafe", lokasi: "cafe", icon: "Coffee" },
  { namaKategori: "Paket Ramadhan", lokasi: "cafe", icon: "Package" },
]

const MENU_CAFE_SEED: MenuSeed[] = [
  {
    namaMenu: "Espresso",
    harga: 12000,
    deskripsi: "Single shot espresso house blend",
    kategori: "Cafe",
  },
  {
    namaMenu: "Americano",
    harga: 14000,
    deskripsi: "Espresso dengan air panas",
    kategori: "Cafe",
  },
  {
    namaMenu: "Cappuccino",
    harga: 18000,
    deskripsi: "Espresso, susu steamed, dan foam",
    kategori: "Cafe",
  },
  {
    namaMenu: "Cafe Susu Gula Aren",
    harga: 17000,
    deskripsi: "Espresso dengan susu gula aren",
    kategori: "Cafe",
  },
  {
    namaMenu: "Latte",
    harga: 18000,
    deskripsi: "Espresso dengan susu steamed",
    kategori: "Cafe",
  },
  {
    namaMenu: "Mocha",
    harga: 19000,
    deskripsi: "Espresso, cokelat, dan susu steamed",
    kategori: "Cafe",
  },
  {
    namaMenu: "Matcha Latte",
    harga: 20000,
    deskripsi: "Matcha premium dengan susu steamed",
    kategori: "Cafe",
  },
  {
    namaMenu: "Iced Coffee",
    harga: 16000,
    deskripsi: "Espresso dituang es",
    kategori: "Cafe",
  },
  {
    namaMenu: "Iced Matcha",
    harga: 19000,
    deskripsi: "Matcha premium dengan susu dan es",
    kategori: "Cafe",
  },
  {
    namaMenu: "Es Teh Manis",
    harga: 8000,
    deskripsi: "Teh dingin-manis",
    kategori: "Cafe",
  },
  {
    namaMenu: "Taro Milk Tea",
    harga: 16000,
    deskripsi: "Milk tea taro dengan susu fresh",
    kategori: "Cafe",
  },
  {
    namaMenu: "Affogato",
    harga: 22000,
    deskripsi: "Es krim vanila dengan hot espresso",
    kategori: "Cafe",
  },
  {
    namaMenu: "Croissant",
    harga: 15000,
    deskripsi: "Croissant Mentega oven fresh",
    kategori: "Cafe",
  },
  {
    namaMenu: "Bolu Kukus",
    harga: 12000,
    deskripsi: "Bolu kukus khas Pringsewu",
    kategori: "Cafe",
  },
  {
    namaMenu: "Donut Gula",
    harga: 14000,
    deskripsi: "Donut goreng dengan gula months",
    kategori: "Cafe",
  },
  {
    namaMenu: "Sandwich Ayam",
    harga: 22000,
    deskripsi: "Sandwich roti gambang dengan isi ayam",
    kategori: "Cafe",
  },
]

const MENU_PAKET_SEED: MenuSeed[] = [
  {
    namaMenu: "Paket Puasa Lengkap",
    harga: 25000,
    deskripsi: "Nasi, sup ayam, sayur lodeh, dan es teh",
    kategori: "Paket Ramadhan",
  },
  {
    namaMenu: "Paket Puasa Ringan",
    harga: 18000,
    deskripsi: "Nasi, telur balado, sayur asinan, dan es teh",
    kategori: "Paket Ramadhan",
  },
  {
    namaMenu: "Paket Sahur Komplit",
    harga: 22000,
    deskripsi: "Nasi goreng, telur mata sapi, sop, dan kopi",
    kategori: "Paket Ramadhan",
  },
  {
    namaMenu: "Paket Ramadan Kare",
    harga: 28000,
    deskripsi: "Nasi, kare ayam, sup, dan es campur",
    kategori: "Paket Ramadhan",
  },
]

async function upsertKategori(seed: KategoriSeed) {
  // Cari kategori AKTIF dengan nama case-insensitive, supaya kategori yang
  // tersimpan dengan huruf kecil (mis. "paket ramadhan") tidak jadi duplikat
  // dan kategori soft-deleted tidak ikut ter-update.
  const existing = await prisma.kategoriMenu.findFirst({
    where: {
      deletedAt: null,
      namaKategori: { equals: seed.namaKategori, mode: "insensitive" },
    },
  })

  const kategori = existing
    ? await prisma.kategoriMenu.update({
        where: { id: existing.id },
        data: {
          namaKategori: seed.namaKategori,
          lokasi: seed.lokasi,
          icon: seed.icon,
          deletedAt: null,
        },
      })
    : await prisma.kategoriMenu.create({
        data: {
          namaKategori: seed.namaKategori,
          lokasi: seed.lokasi,
          icon: seed.icon,
        },
      })

  const aksi = !existing
    ? "dibuat"
    : existing.namaKategori !== seed.namaKategori ||
      existing.lokasi !== seed.lokasi ||
      existing.icon !== seed.icon ||
      existing.deletedAt
      ? "diperbarui"
      : "sama"

  return { kategori, aksi }
}

async function upsertMenu(seed: MenuSeed, kategoriId: number, lokasiKategori: LokasiMenu) {
  const existing = await prisma.menu.findUnique({
    where: { namaMenu: seed.namaMenu },
    include: { kategori: true },
  })

  // Nama menu sudah dipakai kategori dengan lokasi lain -> jangan dipindah diam-diam.
  if (existing && existing.kategori.lokasi !== lokasiKategori) {
    return { aksi: "dilewati" as const, namaMenu: seed.namaMenu }
  }

  await prisma.menu.upsert({
    where: { namaMenu: seed.namaMenu },
    update: {
      harga: new Prisma.Decimal(seed.harga),
      deskripsi: seed.deskripsi,
      kategoriId,
      statusMenu: "tersedia",
      deletedAt: null,
    },
    create: {
      namaMenu: seed.namaMenu,
      harga: new Prisma.Decimal(seed.harga),
      deskripsi: seed.deskripsi,
      kategoriId,
      statusMenu: "tersedia",
    },
  })

  return {
    aksi: (existing ? "diperbarui" : "dibuat") as "diperbarui" | "dibuat",
    namaMenu: seed.namaMenu,
  }
}

async function main() {
  console.log("=== Seed kategori menu (resto & cafe) ===")

  const kategoriMap = new Map<string, number>()
  const lokasiMap = new Map<string, LokasiMenu>()

  for (const seed of KATEGORI_SEED) {
    const { kategori, aksi } = await upsertKategori(seed)
    kategoriMap.set(seed.namaKategori, kategori.id)
    lokasiMap.set(seed.namaKategori, seed.lokasi)
    console.log(`  ${aksi.padEnd(11)} ${seed.namaKategori} (${seed.lokasi}) icon=${seed.icon}`)
  }

  console.log("\n=== Seed menu ===")
  for (const daftarSeed of [MENU_CAFE_SEED, MENU_PAKET_SEED]) {
    for (const seed of daftarSeed) {
      const kategoriId = kategoriMap.get(seed.kategori)
      if (!kategoriId) continue
      const lokasiKategori = lokasiMap.get(seed.kategori)!
      const { aksi, namaMenu } = await upsertMenu(seed, kategoriId, lokasiKategori)
      console.log(
        `  ${aksi.padEnd(11)} ${namaMenu.padEnd(22)} Rp${seed.harga.toLocaleString("id-ID")}`
      )
    }
  }

  console.log("\n=== Ringkasan ===")
  const kategori = await prisma.kategoriMenu.findMany({
    where: { deletedAt: null },
    orderBy: [{ lokasi: "asc" }, { namaKategori: "asc" }],
    select: {
      id: true,
      namaKategori: true,
      lokasi: true,
      icon: true,
      _count: { select: { menus: { where: { deletedAt: null } } } },
    },
  })
  for (const k of kategori) {
    console.log(
      `  ${k.lokasi.padEnd(6)} ${k.namaKategori.padEnd(18)} icon=${String(k.icon).padEnd(11)} menu=${k._count.menus}`
    )
  }

  const totalMenu = await prisma.menu.count({ where: { deletedAt: null } })
  console.log(`\nTotal menu aktif: ${totalMenu}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("ERROR:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
