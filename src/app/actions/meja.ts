"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { TipeMeja } from "@/types"

export type MejaResult = {
  id: number
  nomorMeja: string
  tipeMeja: string
  kapasitas: number
  tokenMeja: string | null
  statusMeja: string
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export async function getMeja() {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const meja = await prisma.$queryRaw<MejaResult[]>`
    SELECT 
      id, 
      nomor_meja as "nomorMeja", 
      kapasitas, 
      token_meja as "tokenMeja", 
      status_meja as "statusMeja", 
      created_at as "createdAt", 
      updated_at as "updatedAt", 
      deleted_at as "deletedAt",
      CASE 
        WHEN nomor_meja LIKE 'L%' THEN 'lesehan'::text
        WHEN nomor_meja LIKE 'K%' THEN 'kursi'::text
        ELSE 'kursi'::text
      END as "tipeMeja"
    FROM meja
    WHERE deleted_at IS NULL
    ORDER BY nomor_meja ASC
  `
  return meja
}

async function generateNomorMeja(tipe: TipeMeja): Promise<string> {
  // Determine prefix based on tipe
  const prefix = tipe === 'lesehan' ? 'L' : 'K'

  // Get meja with the same prefix, extract numbers, find max
  const allMeja = await prisma.$queryRaw<Array<{ nomor_meja: string }>>`
    SELECT nomor_meja FROM meja 
    WHERE deleted_at IS NULL
    AND nomor_meja LIKE ${prefix + '%'}
    ORDER BY nomor_meja ASC
  `

  let maxNumber = 0
  for (const m of allMeja) {
    const numStr = m.nomor_meja.replace(/[^0-9]/g, '')
    const num = parseInt(numStr) || 0
    if (num > maxNumber) {
      maxNumber = num
    }
  }

  const newNumber = (maxNumber + 1).toString().padStart(3, '0')
  
  return `${prefix}${newNumber}`
}

export async function getNextNomorMeja(tipe: TipeMeja): Promise<string> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    throw new Error("Unauthorized")
  }
  return await generateNomorMeja(tipe)
}

export async function createMeja(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  const kapasitas = parseInt(formData.get("kapasitas") as string)
  const tipe = formData.get("tipeMeja") as TipeMeja

  if (!kapasitas || kapasitas < 1 || kapasitas > 20) {
    return { error: "Kapasitas harus antara 1-20 orang" }
  }

  if (!tipe || (tipe !== 'lesehan' && tipe !== 'kursi')) {
    return { error: "Tipe meja wajib dipilih" }
  }

  const nomorMeja = await generateNomorMeja(tipe)

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
    INSERT INTO meja (nomor_meja, kapasitas, token_meja, status_meja)
    VALUES (${nomorMeja}, ${kapasitas}, ${token}, 'kosong')
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

  await prisma.$executeRaw`
    UPDATE meja 
    SET kapasitas = ${kapasitas}
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

  await prisma.$executeRaw`
    UPDATE meja SET deleted_at = NOW() WHERE id = ${id}
  `

  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function kosongkanMeja(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
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

  await prisma.$executeRaw`
    UPDATE meja SET status_meja = 'kosong', updated_at = NOW() WHERE id = ${id}
  `

  await createLog('EMPTY_TABLE', `Meja ${meja[0].nomor_meja} dikosongkan oleh ${session.user.username || 'owner'} (${session.user.role})`)

  revalidatePath("/dashboard/meja")
  return { success: true }
}
