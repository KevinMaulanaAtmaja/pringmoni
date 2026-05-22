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
  const h = randomInt(7, 22)
  const m = randomInt(0, 59)
  return new Date(year, month - 1, day, h, m, 0, 0)
}

async function main() {
  console.log("🌱 Seeding historical data for March & April 2026...")
  console.log("⚠️  Existing data will NOT be modified\n")

  const menus = await prisma.menu.findMany({ where: { statusMenu: "tersedia" } })
  const mejas = await prisma.meja.findMany({ select: { id: true } })
  const cashiers = await prisma.users.findMany({ where: { role: "cashier" } })
  const waiters = await prisma.users.findMany({ where: { role: "waiter" } })

  if (menus.length === 0) {
    console.log("❌ No menu items found. Seed main data first.")
    return
  }

  console.log(`Found ${menus.length} menus, ${mejas.length} tables, ${cashiers.length} cashiers, ${waiters.length} waiters`)

  const metodePembayaran = ["tunai", "qris", "transfer"]
  const statusPesananList = ["selesai", "selesai", "selesai", "selesai", "dibatalkan"] // ~20% cancel

  let totalOrders = 0
  let totalItems = 0

  for (const { month, label, targetOrders } of [
    { month: 3, label: "Maret 2026", targetOrders: 35 },
    { month: 4, label: "April 2026", targetOrders: 45 },
  ]) {
    console.log(`\n--- ${label} ---`)

    const daysInMonth = new Date(2026, month, 0).getDate()
    const dayWeights: number[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(2026, month - 1, d).getDay()
      // Weekend (0=Sun, 6=Sat) gets more weight
      dayWeights.push(dow === 0 || dow === 6 ? 3 : 1)
    }
    const totalWeight = dayWeights.reduce((a, b) => a + b, 0)

    const ordersPerDay: number[] = []
    let remaining = targetOrders
    for (let d = 0; d < daysInMonth; d++) {
      if (d === daysInMonth - 1) {
        ordersPerDay.push(remaining)
      } else {
        const weight = dayWeights[d] / totalWeight
        const count = Math.round(targetOrders * weight)
        const capped = Math.min(count, Math.max(0, remaining - (daysInMonth - d - 1)))
        ordersPerDay.push(capped)
        remaining -= capped
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const orderCount = ordersPerDay[day - 1]
      if (orderCount <= 0) continue

      for (let o = 0; o < orderCount; o++) {
        const createdAt = randomTime(day, month, 2026)
        const meja = randomItem(mejas)
        const cashier = randomItem(cashiers)
        const waiter = waiters.length > 0 ? randomItem(waiters) : undefined
        const metode = randomItem(metodePembayaran) as "tunai" | "qris" | "transfer"
        const statusPesanan = randomItem(statusPesananList) as "selesai" | "dibatalkan"
        const isBerhasil = statusPesanan !== "dibatalkan"

        const itemCount = randomInt(1, 5)
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
            qty: randomInt(1, 3),
          })
        }

        const totalHarga = selectedMenus.reduce((sum, m) => sum + m.harga * m.qty, 0)

        const pesanan = await prisma.pesanan.create({
          data: {
            mejaId: meja.id,
            kasirId: cashier.id,
            waiterId: waiter?.id ?? null,
            statusPesanan,
            namaPelanggan: statusPesanan !== "dibatalkan" ? `Pelanggan ${day}-${o}` : null,
            totalHarga,
            metodePembayaran: isBerhasil ? metode : null,
            statusPembayaran: isBerhasil ? "berhasil" : statusPesanan === "dibatalkan" ? "dibatalkan" : "menunggu",
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
        totalItems += itemCount

        if (totalOrders % 20 === 0) {
          console.log(`  Progress: ${totalOrders} orders created...`)
        }
      }
    }
    console.log(`  ✅ ${label}: ${ordersPerDay.reduce((a, b) => a + b, 0)} orders created`)
  }

  console.log(`\n✅ Done! Total: ${totalOrders} orders, ${totalItems} detail items added.`)

  // Verify
  const count = await prisma.pesanan.count()
  const detailCount = await prisma.detailPesanan.count()
  console.log(`📊 Database now has: ${count} orders, ${detailCount} detail items`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
