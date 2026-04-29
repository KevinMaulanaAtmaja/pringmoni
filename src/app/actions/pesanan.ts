"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface CreatePesananItem {
  menuId: number
  jumlah: number
  catatan: string | null
}

export interface CreatePesananData {
  tokenMeja: string
  items: CreatePesananItem[]
}

export async function getMejaByToken(tokenMeja: string) {
  const meja = await prisma.meja.findUnique({
    where: { tokenMeja },
  })
  return meja
}

export async function getMenusForCustomer() {
  const menus = await prisma.menu.findMany({
    where: { statusMenu: "tersedia" },
    include: {
      kategori: true,
      menuFoto: {
        take: 1,
        orderBy: { urutan: "asc" },
      },
    },
    orderBy: { namaMenu: "asc" },
  })
  
  return menus.map(menu => ({
    ...menu,
    harga: Number(menu.harga),
    kategori: menu.kategori.namaKategori,
    fotoUrl: menu.menuFoto[0]?.fotoUrl || null,
  }))
}

export async function createPesanan(data: CreatePesananData) {
  const { tokenMeja, items } = data

  let meja = await prisma.meja.findFirst({
    where: { tokenMeja },
  })

  if (!meja) {
    meja = await prisma.meja.findFirst()
  }

  if (!meja) {
    return { error: "Meja tidak ditemukan" }
  }

  if (!items || items.length === 0) {
    return { error: "Item pesanan tidak boleh kosong" }
  }

  let totalHarga = 0
  const itemPrices: Record<number, number> = {}

  for (const item of items) {
    const menu = await prisma.menu.findUnique({
      where: { id: item.menuId },
    })

    if (!menu) {
      return { error: `Menu dengan ID ${item.menuId} tidak ditemukan` }
    }

    if (menu.statusMenu !== "tersedia") {
      return { error: `${menu.namaMenu} sedang tidak tersedia` }
    }

    const harga = Number(menu.harga)
    itemPrices[item.menuId] = harga
    totalHarga += harga * item.jumlah
  }

  const pesanan = await prisma.pesanan.create({
    data: {
      mejaId: meja.id,
      statusPesanan: "menunggu",
      totalHarga,
      detailPesanan: {
        create: items.map((item) => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
          catatanItem: item.catatan,
          hargaSaatPesan: itemPrices[item.menuId],
        })),
      },
    },
    include: {
      detailPesanan: {
        include: { menu: true },
      },
      meja: true,
    },
  })

  await prisma.meja.update({
    where: { id: meja.id },
    data: { statusMeja: "terpakai" },
  })

  revalidatePath("/dashboard/pesanan")
  revalidatePath(`/${tokenMeja}`)

  return { success: true, orderId: pesanan.id }
}

export async function getActivePesananByToken(tokenMeja: string) {
  const meja = await prisma.meja.findUnique({
    where: { tokenMeja },
  })

  if (!meja) return null

  const pesanan = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPembayaran: "menunggu",
    },
    include: {
      detailPesanan: {
        include: { menu: true },
      },
      meja: true,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!pesanan) return null

  return {
    id: pesanan.id,
    items: pesanan.detailPesanan.map(d => ({
      id: d.menu.id,
      namaMenu: d.menu.namaMenu,
      harga: Number(d.hargaSaatPesan),
      jumlah: d.jumlah,
      catatan: d.catatanItem,
    })),
    total: Number(pesanan.totalHarga),
    status: pesanan.statusPesanan,
    waktu: pesanan.createdAt.toISOString(),
  }
}

export async function getPesananById(orderId: number) {
  const pesanan = await prisma.pesanan.findUnique({
    where: { id: orderId },
    include: {
      detailPesanan: {
        include: { menu: true },
      },
    },
  })

  if (!pesanan) return null

  return {
    id: pesanan.id,
    items: pesanan.detailPesanan.map(d => ({
      id: d.menu.id,
      namaMenu: d.menu.namaMenu,
      harga: Number(d.hargaSaatPesan),
      jumlah: d.jumlah,
      catatan: d.catatanItem,
    })),
    subtotal: Number(pesanan.totalHarga),
    total: Number(pesanan.totalHarga),
  }
}

export async function updatePembayaran(
  pesananId: number,
  data: { metodePembayaran: string; jumlahBayar: number | null; kembalian: number }
) {
  const pesanan = await prisma.pesanan.findUnique({
    where: { id: pesananId },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      metodePembayaran: data.metodePembayaran as "tunai" | "qris",
      jumlahBayar: data.jumlahBayar,
      kembalian: data.kembalian,
      statusPembayaran: "berhasil",
    },
  })

  revalidatePath("/dashboard/pesanan")
  return { success: true }
}
