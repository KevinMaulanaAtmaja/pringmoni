import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomTime(day: number, month: number, year: number): Date {
  const h = randomInt(8, 21)
  const m = randomInt(0, 59)
  return new Date(year, month - 1, day, h, m, 0, 0)
}

async function main() {
  console.log("🌱 Seeding 2025 historical data (1-2 orders/month, add-only)...")
  console.log("⚠️  Existing data will NOT be modified\n")

  const menus = await prisma.menu.findMany({ where: { statusMenu: "tersedia" } })
  const mejas = await prisma.meja.findMany({ select: { id: true } })
  const cashiers = await prisma.users.findMany({ where: { role: "cashier" } })

  if (menus.length === 0 || cashiers.length === 0) {
    console.log("❌ No menus or cashiers found. Seed main data first.")
    return
  }

  console.log(`Found ${menus.length} menus, ${mejas.length} tables, ${cashiers.length} cashiers`)

  const metodePembayaran = ["tunai", "qris", "transfer"] as const
  const statusPesananList = ["selesai", "selesai", "selesai", "dibatalkan"] as const

  let totalOrders = 0

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(2025, month, 0).getDate()
    const orderCount = randomInt(1, 2)

    for (let o = 0; o < orderCount; o++) {
      const day = randomInt(1, daysInMonth)
      const createdAt = randomTime(day, month, 2025)
      const meja = randomItem(mejas)
      const cashier = randomItem(cashiers)
      const metode = randomItem(metodePembayaran)
      const statusPesanan = randomItem(statusPesananList)
      const isBerhasil = statusPesanan !== "dibatalkan"

      const itemCount = randomInt(1, 3)
      const selectedMenus: { menuId: number; harga: number; qty: number }[] = []
      const usedIds = new Set<number>()

      for (let i = 0; i < itemCount; i++) {
        let menu: typeof menus[0]
        let attempts = 0
        do {
          menu = randomItem(menus)
          attempts++
        } while (usedIds.has(menu.id) && attempts < 20)
        usedIds.add(menu.id)
        selectedMenus.push({
          menuId: menu.id,
          harga: Number(menu.harga),
          qty: randomInt(1, 2),
        })
      }

      const totalHarga = selectedMenus.reduce((sum, m) => sum + m.harga * m.qty, 0)

      await prisma.pesanan.create({
        data: {
          mejaId: meja.id,
          kasirId: cashier.id,
          statusPesanan,
          namaPelanggan: isBerhasil ? `Pelanggan ${month}-${o}` : null,
          totalHarga,
          metodePembayaran: isBerhasil ? metode : null,
          statusPembayaran: isBerhasil ? "berhasil" : "dibatalkan",
          createdAt,
          detailPesanan: {
            create: selectedMenus.map((m) => ({
              menuId: m.menuId,
              jumlah: m.qty,
              hargaSaatPesan: m.harga,
            })),
          },
        },
      })

      totalOrders++
    }
  }

  console.log(`✅ Done! ${totalOrders} orders added for 2025.`)

  const count = await prisma.pesanan.count()
  const detailCount = await prisma.detailPesanan.count()
  console.log(`📊 Database now has: ${count} orders, ${detailCount} detail items`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
