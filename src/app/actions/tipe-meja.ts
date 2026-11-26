"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import prisma from "@/lib/prisma"

interface TipeMejaFormState {
  error?: string
  success?: boolean
}

function tokenUnik(): string {
  return `K${crypto.randomUUID().replace(/-/g, "").slice(0, 7).toUpperCase()}`
}

function hurufTipe(nama: string): string {
  return nama.toUpperCase().replace(/[^A-Z]/g, "")
}

async function generatePrefixKode(nama: string, excludeId?: number): Promise<string> {
  const letters = hurufTipe(nama) || "K"
  const existing = await prisma.tipeMeja.findMany({
    where: { id: excludeId ? { not: excludeId } : undefined },
    select: { prefixKode: true },
  })
  const used = new Set(existing.map((k) => k.prefixKode.toUpperCase()))
  for (let len = 1; len <= Math.max(letters.length, 1); len++) {
    const base = letters.slice(0, Math.min(len, letters.length))
    const candidate =
      len <= letters.length ? base : `${letters}${len - letters.length}`
    if (!used.has(candidate.toUpperCase())) return candidate
  }
  let n = 1
  while (used.has(`${letters}${n}`.toUpperCase())) n++
  return `${letters}${n}`
}

async function tokenTipeUnik(excludeId?: number): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const token = tokenUnik()
    const ada = await prisma.tipeMeja.findFirst({
      where: { tokenTipe: token, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!ada) return token
  }
  throw new Error("Gagal menghasilkan token tipe unik")
}

/** Normalisasi alias token (hanya tipe Bebas). "" → null (kembali ke token asli). */
function normalisasiAlias(raw: unknown): { alias: string | null; error?: string } {
  const alias = (raw ?? "").toString().trim().toUpperCase()
  if (!alias) return { alias: null }
  if (!/^[A-Z0-9][A-Z0-9_-]{1,23}$/.test(alias)) {
    return { alias: null, error: "Alias token: 2–24 karakter, hanya huruf/angka, - atau _" }
  }
  return { alias }
}

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { error: "Unauthorized" as const }
  }
  return null
}

export async function getTipeMejas() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" as const }

  const tipeMejas = await prisma.tipeMeja.findMany({
    where: { deletedAt: null },
    orderBy: [{ modeBebas: "desc" }, { namaTipe: "asc" }],
    select: {
      id: true,
      namaTipe: true,
      tokenTipe: true,
      tokenTipeAlias: true,
      prefixKode: true,
      khususSatuCustomer: true,
      modeBebas: true,
      _count: { select: { mejas: { where: { deletedAt: null } } } },
    },
  })

  return tipeMejas.map((k) => ({
    id: k.id,
    namaTipe: k.namaTipe,
    tokenTipe: k.tokenTipe,
    tokenTipeAlias: k.tokenTipeAlias,
    prefixKode: k.prefixKode,
    khususSatuCustomer: k.khususSatuCustomer,
    modeBebas: k.modeBebas,
    jumlahMeja: k._count.mejas,
  }))
}

export async function createTipeMeja(
  _prevState: TipeMejaFormState | null,
  formData: FormData
): Promise<TipeMejaFormState> {
  const unauthorized = await requireOwner()
  if (unauthorized) return unauthorized

  const namaTipe = (formData.get("namaTipe") || "").toString().trim()
  if (namaTipe.length < 2 || namaTipe.length > 40) {
    return { error: "Nama tipe wajib diisi (2–40 karakter)" }
  }

  const tokenTipe = await tokenTipeUnik()
  const prefixKode = await generatePrefixKode(namaTipe)

  const khususSatuCustomer = formData.get("khususSatuCustomer") === "true"
  const modeBebas = formData.get("modeBebas") === "true"

  const duplikat = await prisma.tipeMeja.findFirst({
    where: { deletedAt: null, namaTipe },
    select: { id: true },
  })
  if (duplikat) return { error: "Nama tipe sudah digunakan" }

  try {
    await prisma.$transaction(async (tx) => {
      if (modeBebas) {
        await tx.tipeMeja.updateMany({
          where: { modeBebas: true, deletedAt: null },
          data: { modeBebas: false },
        })
      }
      await tx.tipeMeja.create({
        data: { namaTipe, tokenTipe, prefixKode, khususSatuCustomer, modeBebas },
      })
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Nama atau token tipe sudah digunakan" }
    }
    return { error: "Gagal menyimpan tipe meja" }
  }

  await createLog(
    "MANAGE_TIPE_MEJA",
    `Buat tipe meja "${namaTipe}" (${tokenTipe}, prefix ${prefixKode})${modeBebas ? " sebagai Meja Bebas" : ""}`
  )
  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function updateTipeMeja(
  id: number,
  formData: FormData
): Promise<TipeMejaFormState> {
  const unauthorized = await requireOwner()
  if (unauthorized) return unauthorized

  const namaTipe = (formData.get("namaTipe") || "").toString().trim()
  if (namaTipe.length < 2 || namaTipe.length > 40) {
    return { error: "Nama tipe wajib diisi (2–40 karakter)" }
  }

  const khususSatuCustomer = formData.get("khususSatuCustomer") === "true"
  const modeBebas = formData.get("modeBebas") === "true"

  const { alias, error: aliasError } = normalisasiAlias(formData.get("tokenTipeAlias"))
  if (aliasError) return { error: aliasError }
  if (alias && !modeBebas) return { error: "Hanya tipe Bebas yang boleh punya alias token" }

  const ada = await prisma.tipeMeja.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, namaTipe: true, tokenTipe: true },
  })
  if (!ada) return { error: "Tipe tidak ditemukan" }

  if (alias) {
    if (alias === ada.tokenTipe.toUpperCase()) {
      return { error: "Alias tidak boleh sama dengan token asli" }
    }
    const aliasDipakai = await prisma.tipeMeja.findFirst({
      where: {
        deletedAt: null,
        id: { not: id },
        OR: [{ tokenTipe: alias }, { tokenTipeAlias: alias }],
      },
      select: { id: true },
    })
    if (aliasDipakai) return { error: "Alias token sudah dipakai tipe lain" }
  }

  const duplikat = await prisma.tipeMeja.findFirst({
    where: { deletedAt: null, id: { not: id }, namaTipe },
    select: { id: true },
  })
  if (duplikat) return { error: "Nama tipe sudah digunakan" }

  const prefixKode =
    ada.namaTipe === namaTipe ? undefined : await generatePrefixKode(namaTipe, id)

  try {
    await prisma.$transaction(async (tx) => {
      if (modeBebas) {
        await tx.tipeMeja.updateMany({
          where: { modeBebas: true, deletedAt: null, id: { not: id } },
          data: { modeBebas: false },
        })
      }
      await tx.tipeMeja.update({
        where: { id },
        data: {
          namaTipe,
          khususSatuCustomer,
          modeBebas,
          tokenTipeAlias: alias,
          ...(prefixKode ? { prefixKode } : {}),
        },
      })
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Nama, token, atau alias tipe sudah digunakan" }
    }
    return { error: "Gagal menyimpan tipe meja" }
  }

  await createLog(
    "MANAGE_TIPE_MEJA",
    `Update tipe meja "${namaTipe}"${modeBebas ? " sebagai Meja Bebas" : ""}${alias ? ` (alias ${alias})` : ""}`
  )
  revalidatePath("/dashboard/meja")
  return { success: true }
}

export async function deleteTipeMeja(id: number): Promise<TipeMejaFormState> {
  const unauthorized = await requireOwner()
  if (unauthorized) return unauthorized

  const tipe = await prisma.tipeMeja.findFirst({
    where: { id, deletedAt: null },
    select: { namaTipe: true, _count: { select: { mejas: { where: { deletedAt: null } } } } },
  })
  if (!tipe) return { error: "Tipe tidak ditemukan" }
  if (tipe._count.mejas > 0) {
    return { error: `Tipe masih dipakai ${tipe._count.mejas} meja. Lepaskan tipe dari meja terlebih dahulu.` }
  }

  await prisma.tipeMeja.update({
    where: { id },
    data: { deletedAt: new Date(), modeBebas: false },
  })
  await createLog("MANAGE_TIPE_MEJA", `Hapus tipe meja "${tipe.namaTipe}"`)
  revalidatePath("/dashboard/meja")
  return { success: true }
}
