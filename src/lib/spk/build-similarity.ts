import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { PrismaClient } from "@prisma/client"
import type { MatriksSimilarity, PasanganSimilarity } from "./cf"

export async function hitungMatriksSimilarity(
  prisma: PrismaClient,
  hari = 90
): Promise<MatriksSimilarity> {
  const batas = new Date(Date.now() - hari * 24 * 60 * 60 * 1000)
  const pesananList = await prisma.pesanan.findMany({
    where: {
      createdAt: { gte: batas },
      statusPembayaran: "berhasil",
      deletedAt: null,
    },
    select: {
      detailPesanan: {
        where: { menu: { deletedAt: null } },
        select: { menuId: true },
      },
    },
  })

  const freq = new Map<number, number>()
  const co = new Map<string, number>()

  for (const pesanan of pesananList) {
    const menuIds = [...new Set(pesanan.detailPesanan.map((item) => item.menuId))].sort((a, b) => a - b)

    for (const menuId of menuIds) {
      freq.set(menuId, (freq.get(menuId) ?? 0) + 1)
    }

    for (let i = 0; i < menuIds.length; i++) {
      for (let j = i + 1; j < menuIds.length; j++) {
        const kunci = `${menuIds[i]}:${menuIds[j]}`
        co.set(kunci, (co.get(kunci) ?? 0) + 1)
      }
    }
  }

  const pairs: PasanganSimilarity[] = []
  for (const [kunci, jumlah] of co) {
    const [a, b] = kunci.split(":").map(Number)
    const denominator = Math.sqrt((freq.get(a) ?? 0) * (freq.get(b) ?? 0))
    if (denominator === 0) continue

    const sim = jumlah / denominator
    if (!Number.isFinite(sim) || sim <= 0) continue
    pairs.push({ a, b, sim: Number(sim.toFixed(6)) })
  }
  pairs.sort((x, y) => x.a - y.a || x.b - y.b)

  return {
    generatedAt: new Date().toISOString(),
    menuCount: freq.size,
    pairs,
  }
}

export async function simpanMatriksSimilarity(matriks: MatriksSimilarity): Promise<string> {
  const tujuan = path.join(process.cwd(), "src", "data", "menu-similarity.json")
  await mkdir(path.dirname(tujuan), { recursive: true })
  await writeFile(tujuan, `${JSON.stringify(matriks, null, 2)}\n`, "utf8")
  return tujuan
}
