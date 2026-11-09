import { Prisma, StatusReservasi } from "@prisma/client"
import prisma from "@/lib/prisma"

export type ReservasiOutcome = "selesai" | "batal"

export async function finalizeReservasiUntukMeja(
  mejaId: number,
  outcome: ReservasiOutcome,
  options?: { client?: Prisma.TransactionClient }
) {
  const client = (options?.client ?? (prisma as unknown as Prisma.TransactionClient)) as Prisma.TransactionClient

  const reservasi = await client.reservasi.findFirst({
    where: {
      mejaId,
      statusReservasi: { in: [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      statusReservasi: true,
      pesananId: true,
      catatan: true,
    },
  })

  if (!reservasi) return null

  const now = new Date()
  const data: Prisma.ReservasiUncheckedUpdateInput = { updatedAt: now }

  if (outcome === "selesai") {
    if (reservasi.statusReservasi !== StatusReservasi.dikonfirmasi) return null
    data.statusReservasi = StatusReservasi.selesai
    data.selesaiAt = now
    data.pesananId = reservasi.pesananId ?? null
  } else {
    data.statusReservasi = StatusReservasi.batal
    data.cancelledAt = now
  }

  return client.reservasi.update({
    where: { id: reservasi.id },
    data,
  })
}
