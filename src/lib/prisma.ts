import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // Jangan biarkan import modul gagal hanya karena env belum diisi. Prisma
  // tetap akan melaporkan error yang jelas saat query pertama dijalankan.
  const databaseUrl = process.env.DATABASE_URL
  let url: URL | null = null

  if (databaseUrl) {
    try {
      url = new URL(databaseUrl)
      url.searchParams.set("connection_limit", "15")
      url.searchParams.set("pool_timeout", "30")
    } catch {
      console.warn(
        "[prisma] DATABASE_URL tidak valid, menggunakan konfigurasi default Prisma."
      )
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(url ? { datasources: { db: { url: url.toString() } } } : {}),
  })
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma
