import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ⚠️ ATURAN SEED:
 * - JANGAN menghapus/reset data tanpa perintah eksplisit dari user
 * - JANGAN jalankan DELETE atau deleteMany() pada table master
 * - Gunakan UPSERT, bukan CREATE, untuk menghindari duplikasi
 * - Baca AGENTS.md sebelum mengubah file ini
 */

async function main() {
  console.log("Seed file ready - no data to seed yet");
  console.log("⚠️ To clear data, user must explicitly request: 'kosongkan DB' or 'seed ulang'");
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
