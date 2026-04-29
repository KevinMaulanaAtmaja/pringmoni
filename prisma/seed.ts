import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seed meja...");

  // Data meja yang mau ditambahkan
  const mejaData = [
    { nomorMeja: "1", kapasitas: 4, statusMeja: "kosong" as const },
    { nomorMeja: "2", kapasitas: 4, statusMeja: "kosong" as const },
    { nomorMeja: "3", kapasitas: 2, statusMeja: "kosong" as const },
    { nomorMeja: "4", kapasitas: 6, statusMeja: "kosong" as const },
    { nomorMeja: "5", kapasitas: 4, statusMeja: "kosong" as const },
  ];

  // Cek meja yang sudah ada (biar nggak dobel)
  const existingMeja = await prisma.meja.findMany({
    select: { nomorMeja: true }
  });
  const existingNomor = new Set(existingMeja.map(m => m.nomorMeja));

  // Filter meja yang belum ada di DB
  const mejaBaru = mejaData.filter(m => !existingNomor.has(m.nomorMeja));

  if (mejaBaru.length === 0) {
    console.log("Semua meja sudah ada di database, nggak ada yang ditambahkan.");
    return;
  }

  // Insert meja baru
  for (const meja of mejaBaru) {
    await prisma.meja.create({
      data: meja,
    });
    console.log(`Meja ${meja.nomorMeja} berhasil ditambahkan`);
  }

  console.log(`${mejaBaru.length} meja baru berhasil di-seed.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
