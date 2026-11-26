"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { MejaReservasiAktif } from "@/types"
import { StatusReservasi } from "@prisma/client"

export type MejaResult = {
  id: number
  nomorMeja: string
  tipeMeja: string
  kapasitas: number
  tokenMeja: string | null
  statusMeja: string
  tipeMejaId: number | null
  namaTipe: string | null
  tokenTipe: string | null
  prefixKode: string | null
  khususSatuCustomer: boolean
  modeBebas: boolean
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
  reservasiAktif: MejaReservasiAktif | null
}

export async function getMeja() {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const meja = await prisma.$queryRaw<MejaResult[]>`
    SELECT 
      m.id, 
      m.nomor_meja as "nomorMeja", 
      m.kapasitas, 
      m.token_meja as "tokenMeja", 
      m.status_meja as "statusMeja", 
      m.tipe_meja_id as "tipeMejaId",
      k.nama_tipe as "namaTipe",
      k.token_tipe as "tokenTipe",
      k.prefix_kode as "prefixKode",
      COALESCE(k.khusus_satu_customer, false) as "khususSatuCustomer",
      COALESCE(k.mode_bebas, false) as "modeBebas",
      m.created_at as "createdAt", 
      m.updated_at as "updatedAt", 
      m.deleted_at as "deletedAt",
      COALESCE(k.nama_tipe, 'Umum') as "tipeMeja"
    FROM meja m
    LEFT JOIN tipe_meja k ON k.id = m.tipe_meja_id AND k.deleted_at IS NULL
    WHERE m.deleted_at IS NULL
    ORDER BY m.nomor_meja ASC
  `

  const mejaIds = meja.map((m) => m.id)
  const reservasiAktifList = mejaIds.length
    ? await prisma.reservasi.findMany({
        where: {
          mejaId: { in: mejaIds },
          statusReservasi: { in: [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi] },
          batasKonfirmasi: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          mejaId: true,
          kodeReservasi: true,
          namaPelanggan: true,
          statusReservasi: true,
          waktuKedatangan: true,
          jumlahOrang: true,
        },
      })
    : []

  const reservasiAktifMap = new Map(
    reservasiAktifList.map((r) => [r.mejaId, r])
  )

  const data = meja.map((m) => ({
    ...m,
    reservasiAktif: reservasiAktifMap.get(m.id) ?? null,
  }))

  return data
}

async function generateNomorMeja(tipeMejaId: number): Promise<string> {
  const tipe = await prisma.tipeMeja.findFirst({
    where: { id: tipeMejaId, deletedAt: null },
    select: { prefixKode: true },
  })
  if (!tipe) throw new Error("Tipe meja tidak ditemukan")
  const prefix = tipe.prefixKode.toUpperCase()

  const allMeja = await prisma.$queryRaw<Array<{ nomor_meja: string }>>`
    SELECT nomor_meja FROM meja 
    WHERE deleted_at IS NULL
    AND nomor_meja LIKE ${prefix + '%'}
    ORDER BY nomor_meja ASC
  `

  let maxNumber = 0
  for (const m of allMeja) {
    const suffix = m.nomor_meja.slice(prefix.length)
    if (!/^\d+$/.test(suffix)) continue
    const num = parseInt(suffix, 10)
    if (num > maxNumber) maxNumber = num
  }

  return `${prefix}${(maxNumber + 1).toString().padStart(3, "0")}`
}

export async function getNextNomorMeja(tipeMejaId: number): Promise<string> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    throw new Error("Unauthorized")
  }
  return await generateNomorMeja(tipeMejaId)
}

async function validasiTipeMeja(
  nilai: FormDataEntryValue | null,
  wajib = false
): Promise<number | null | { error: string }> {
  const teks = nilai === null || nilai === "" ? null : String(nilai)
  if (teks === null) return wajib ? { error: "Tipe meja wajib dipilih" } : null
  const id = Number(teks)
  if (!Number.isInteger(id) || id <= 0) return { error: "Tipe meja tidak valid" }

  const tipe = await prisma.tipeMeja.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!tipe) return { error: "Tipe meja tidak ditemukan" }
  return tipe.id
}

export async function createMeja(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  const kapasitas = parseInt(formData.get("kapasitas") as string)
  if (!kapasitas || kapasitas < 1 || kapasitas > 20) {
    return { error: "Kapasitas harus antara 1-20 orang" }
  }

  const tipeMejaId = await validasiTipeMeja(formData.get("tipeMejaId"), true)
  if (tipeMejaId === null || typeof tipeMejaId === "object") {
    return { error: tipeMejaId?.error ?? "Tipe meja wajib dipilih" }
  }

  const nomorMeja = await generateNomorMeja(tipeMejaId)

  const existingMeja = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM meja WHERE nomor_meja = ${nomorMeja}
  `

  if (existingMeja.length > 0) {
    return { error: "Nomor meja sudah ada" }
  }

  // Generate unique token
  let token: string
  let tokenExists: boolean
  do {
    token = crypto.randomUUID().substring(0, 8).toUpperCase()
    const existing = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM meja WHERE token_meja = ${token}
    `
    tokenExists = existing.length > 0
  } while (tokenExists)

  await prisma.$executeRaw`
    INSERT INTO meja (nomor_meja, kapasitas, token_meja, status_meja, tipe_meja_id)
    VALUES (${nomorMeja}, ${kapasitas}, ${token}, 'kosong', ${tipeMejaId})
  `

  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function updateMeja(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  const kapasitas = parseInt(formData.get("kapasitas") as string)

  if (!kapasitas || kapasitas < 1 || kapasitas > 20) {
    return { error: "Kapasitas harus antara 1-20 orang" }
  }

  const tipeMejaId = await validasiTipeMeja(formData.get("tipeMejaId"))
  if (typeof tipeMejaId === "object" && tipeMejaId !== null) {
    return { error: tipeMejaId.error }
  }

  await prisma.$executeRaw`
    UPDATE meja 
    SET kapasitas = ${kapasitas}, tipe_meja_id = ${tipeMejaId}
    WHERE id = ${id}
  `

  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function deleteMeja(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  const meja = await prisma.$queryRaw<Array<{ status_meja: string }>>`
    SELECT status_meja FROM meja WHERE id = ${id}
  `

  if (meja[0]?.status_meja === 'terpakai') {
    return { error: "Meja sedang digunakan, tidak dapat dihapus" }
  }

  if (meja[0]?.status_meja === 'dipesan') {
    return { error: "Meja sedang direservasi, tidak dapat dihapus" }
  }

  await prisma.$executeRaw`
    UPDATE meja SET deleted_at = NOW() WHERE id = ${id}
  `

  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function kosongkanMeja(id: number) {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== 'owner' &&
      session.user.role !== 'cashier' &&
      session.user.role !== 'waiter')
  ) {
    return { error: "Unauthorized" }
  }

  const meja = await prisma.$queryRaw<Array<{ nomor_meja: string; status_meja: string }>>`
    SELECT nomor_meja, status_meja FROM meja WHERE id = ${id} AND deleted_at IS NULL
  `

  if (meja.length === 0) {
    return { error: "Meja tidak ditemukan" }
  }

  if (meja[0].status_meja === 'kosong') {
    return { error: "Meja sudah kosong" }
  }

  const pesananAktif = await prisma.$queryRaw<Array<{ id: number; statusPembayaran: string; totalHarga: number }>>`
    SELECT id, status_pembayaran as "statusPembayaran", total_harga as "totalHarga"
    FROM pesanan
    WHERE meja_id = ${id} AND deleted_at IS NULL AND status_pesanan NOT IN ('dibatalkan', 'selesai')
  `

  const belumBayar = pesananAktif.filter(p => p.statusPembayaran === 'menunggu')
  if (belumBayar.length > 0) {
    await prisma.pesanan.updateMany({
      where: { id: { in: belumBayar.map(p => p.id) } },
      data: { statusPesanan: 'dibatalkan', statusPembayaran: 'dibatalkan', updatedAt: new Date() },
    })
  }

  const reservasiDibatalkan = await prisma.reservasi.updateMany({
    where: {
      mejaId: id,
      statusReservasi: { in: ['menunggu_kedatangan', 'dikonfirmasi'] },
      pesananId: null,
    },
    data: {
      statusReservasi: 'batal',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    },
  })

  await prisma.$executeRaw`
    UPDATE meja SET status_meja = 'kosong', updated_at = NOW() WHERE id = ${id}
  `

  const byStatus = pesananAktif.reduce<Record<string, number>>((acc, p) => {
    acc[p.statusPembayaran] = (acc[p.statusPembayaran] || 0) + 1
    return acc
  }, {})
  const total = pesananAktif.reduce((sum, p) => sum + Number(p.totalHarga), 0)

  let logMsg = `Meja ${meja[0].nomor_meja} dikosongkan oleh ${session.user.username || session.user.role}`
  if (pesananAktif.length > 0) {
    const ringkasan = Object.entries(byStatus).map(([s, n]) => `${s}: ${n}`).join(', ')
    logMsg += ` — ${belumBayar.length} pesanan dibatalkan (total: ${ringkasan}), nominal Rp${total.toLocaleString('id-ID')}`
  } else {
    logMsg += ' — tidak ada pesanan aktif'
  }

  if (reservasiDibatalkan.count > 0) {
    logMsg += ` — ${reservasiDibatalkan.count} reservasi dibatalkan`
  }

  await createLog('UPDATE_ORDER_STATUS', logMsg)

  revalidatePath("/dashboard/meja")
  return { success: true }
}
