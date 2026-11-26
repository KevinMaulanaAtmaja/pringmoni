import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { hitungMatriksSimilarity, simpanMatriksSimilarity } from "../src/lib/spk/build-similarity"

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const matriks = await hitungMatriksSimilarity(prisma, 90)
  await simpanMatriksSimilarity(matriks)

  console.log(
    `CF selesai: ${matriks.menuCount} menu, ${matriks.pairs.length} pasangan similarity.`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
