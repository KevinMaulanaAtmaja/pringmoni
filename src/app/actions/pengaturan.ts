"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { RoleUser } from "@/types"

export async function getPengaturan(kunci: string): Promise<string | null> {
  const session = await auth()
  if (!session?.user) return null

  try {
    const row = await prisma.pengaturan.findUnique({ where: { kunci } })
    return row?.nilai ?? null
  } catch {
    return null
  }
}

export async function setPengaturan(kunci: string, nilai: string) {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined
  if (role !== "owner") return { error: "Unauthorized" }

  try {
    await prisma.pengaturan.upsert({
      where: { kunci },
      update: { nilai },
      create: { kunci, nilai },
    })
    revalidatePath("/dashboard/pengaturan")
    return { success: true }
  } catch (error) {
    return { error: String(error) }
  }
}

export async function updateExpiryJam(formData: FormData) {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined
  if (role !== "owner") return { error: "Unauthorized" }

  const raw = formData.get("expiryJam")
  const nilai = String(raw ?? "").trim()
  const parsed = Number(nilai)
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 48) {
    return { error: "Masukkan angka 1-48 jam" }
  }

  return await setPengaturan("reservasi_expiry_jam", nilai)
}
