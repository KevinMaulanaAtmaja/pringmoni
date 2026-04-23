"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getMeja() {
  const meja = await prisma.meja.findMany({
    orderBy: { nomorMeja: 'asc' },
  })
  return meja
}

export async function createMeja(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const nomorMeja = formData.get("nomorMeja") as string
  const kapasitas = parseInt(formData.get("kapasitas") as string)

  if (!nomorMeja || !kapasitas) {
    return { error: "Nomor meja dan kapasitas wajib diisi" }
  }

  const existingMeja = await prisma.meja.findFirst({
    where: { nomorMeja },
  })

  if (existingMeja) {
    return { error: "Nomor meja sudah ada" }
  }

  const token = Math.random().toString(36).substring(2, 8).toUpperCase()

  await prisma.meja.create({
    data: {
      nomorMeja,
      kapasitas,
      tokenMeja: token,
      statusMeja: 'kosong',
    },
  })

  revalidatePath("/meja")
  return { success: true }
}

export async function updateMeja(id: number, formData: FormData) {
  const nomorMeja = formData.get("nomorMeja") as string
  const kapasitas = parseInt(formData.get("kapasitas") as string)

  if (!nomorMeja || !kapasitas) {
    return { error: "Nomor meja dan kapasitas wajib diisi" }
  }

  const existingMeja = await prisma.meja.findFirst({
    where: { nomorMeja, NOT: { id } },
  })

  if (existingMeja) {
    return { error: "Nomor meja sudah ada" }
  }

  await prisma.meja.update({
    where: { id },
    data: {
      nomorMeja,
      kapasitas,
    },
  })

  revalidatePath("/meja")
  return { success: true }
}

export async function deleteMeja(id: number) {
  const meja = await prisma.meja.findUnique({
    where: { id },
    include: { pesanan: true },
  })

  if (meja?.statusMeja === 'terpakai') {
    return { error: "Meja sedang digunakan, tidak dapat dihapus" }
  }

  await prisma.meja.delete({ where: { id } })
  revalidatePath("/meja")
  return { success: true }
}

export async function regenerateTokenMeja(id: number) {
  const token = Math.random().toString(36).substring(2, 8).toUpperCase()

  await prisma.meja.update({
    where: { id },
    data: { tokenMeja: token },
  })

  revalidatePath("/meja")
  return { success: true, token }
}
