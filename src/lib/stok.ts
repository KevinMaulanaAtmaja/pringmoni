import { Prisma, StatusStok } from "@prisma/client"

function hitungStatus(stokQty: number, stokMinimum: number): StatusStok {
  if (stokQty <= 0) return "habis"
  if (stokQty <= stokMinimum) return "menipis"
  return "tersedia"
}

/**
 * Kurangi stok dapur secara otomatis berdasarkan resep menu saat pesanan selesai.
 * Idempotent via `pesanan.stokDeducted`. Wajib dipanggil dalam transaction.
 */
export async function potongStokDapur(
  tx: Prisma.TransactionClient,
  pesananId: number,
  userId?: number | null
): Promise<{ deducted: boolean }> {
  const pesanan = await tx.pesanan.findFirst({
    where: { id: pesananId },
    include: {
      detailPesanan: {
        include: { menu: { include: { resep: true } } },
      },
    },
  })

  if (!pesanan || pesanan.stokDeducted) return { deducted: false }

  const kebutuhan = new Map<number, number>()
  for (const item of pesanan.detailPesanan) {
    for (const r of item.menu.resep) {
      const need = Number(r.jumlah) * item.jumlah
      kebutuhan.set(r.stokBahanId, (kebutuhan.get(r.stokBahanId) || 0) + need)
    }
  }

  if (kebutuhan.size > 0) {
    const bahan = await tx.stokBahan.findMany({
      where: { id: { in: Array.from(kebutuhan.keys()) }, tipe: "dapur" },
    })

    const ops: Promise<unknown>[] = []
    for (const b of bahan) {
      const need = kebutuhan.get(b.id)
      if (!need || need <= 0) continue

      const stokSebelum = Number(b.stokQty)
      const stokSesudah = Math.max(0, stokSebelum - need)

      ops.push(
        tx.stokBahan.update({
          where: { id: b.id },
          data: {
            stokQty: stokSesudah,
            statusStok: hitungStatus(stokSesudah, Number(b.stokMinimum)),
          },
        })
      )
      ops.push(
        tx.riwayatStok.create({
          data: {
            stokBahanId: b.id,
            stokSebelum,
            stokSesudah,
            jumlahPerubahan: need,
            jenisPerubahan: "otomatis",
            keterangan: `Pemakaian otomatis dari pesanan #${pesananId}`,
            userId: userId ?? null,
          },
        })
      )
    }

    await Promise.all(ops)
  }

  await tx.pesanan.update({
    where: { id: pesananId },
    data: { stokDeducted: true, updatedAt: new Date() },
  })

  return { deducted: kebutuhan.size > 0 }
}