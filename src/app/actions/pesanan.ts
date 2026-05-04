"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { StatusPesanan } from "@prisma/client"
import { StatusBayar, MetodePembayaran } from "@/types/index"

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
  const meja = await prisma.$queryRaw<Array<{
    id: number
    nomor_meja: string
    kapasitas: number
    token_meja: string | null
    status_meja: string
    created_at: Date
    updated_at: Date | null
    deleted_at: Date | null
  }>>`
    SELECT id, nomor_meja, kapasitas, token_meja, status_meja, created_at, updated_at, deleted_at
    FROM meja
    WHERE token_meja = ${tokenMeja} AND deleted_at IS NULL
    LIMIT 1
  `
  return meja[0] || null
}

export async function getMenusForCustomer() {
  const menus = await prisma.$queryRaw<Array<{
    id: number
    nama_menu: string
    deskripsi: string | null
    harga: number
    status_menu: string
    kategori_id: number
    nama_kategori: string
    foto_url: string | null
  }>>`
    SELECT m.id, m.nama_menu, m.deskripsi, m.harga, m.status_menu, 
           m.kategori_id, k.nama_kategori,
           (SELECT foto_url FROM menu_foto WHERE menu_id = m.id ORDER BY urutan ASC LIMIT 1) as foto_url
    FROM menu m
    JOIN kategori_menu k ON m.kategori_id = k.id
    WHERE m.status_menu = 'tersedia' AND m.deleted_at IS NULL
    ORDER BY m.nama_menu ASC
  `
  
  return menus.map(menu => ({
    id: menu.id,
    namaMenu: menu.nama_menu,
    deskripsi: menu.deskripsi,
    harga: Number(menu.harga),
    kategori: menu.nama_kategori,
    statusMenu: menu.status_menu as "tersedia" | "habis" | "nonaktif",
    fotoUrl: menu.foto_url,
  }))
}

export async function createPesanan(data: CreatePesananData) {
  const { tokenMeja, items } = data

  const meja = await getMejaByToken(tokenMeja)
  if (!meja) {
    return { error: "Token meja tidak valid" }
  }

  if (!items || items.length === 0) {
    return { error: "Item pesanan tidak boleh kosong" }
  }

  let totalHarga = 0
  const itemPrices: Record<number, number> = {}

  for (const item of items) {
    const menu = await prisma.$queryRaw<Array<{ id: number; nama_menu: string; harga: number; status_menu: string }>>`
      SELECT id, nama_menu, harga, status_menu FROM menu WHERE id = ${item.menuId} AND deleted_at IS NULL
    `
    
    if (!menu[0]) {
      return { error: `Menu dengan ID ${item.menuId} tidak ditemukan` }
    }

    if (menu[0].status_menu !== "tersedia") {
      return { error: `${menu[0].nama_menu} sedang tidak tersedia` }
    }

    const harga = Number(menu[0].harga)
    itemPrices[item.menuId] = harga
    totalHarga += harga * item.jumlah
  }

  const result = await prisma.$queryRaw<Array<{ id: number }>>`
    INSERT INTO pesanan (meja_id, status_pesanan, total_harga)
    VALUES (${meja.id}, 'menunggu', ${totalHarga})
    RETURNING id
  `

  const pesananId = result[0].id

  for (const item of items) {
    await prisma.$executeRaw`
      INSERT INTO detail_pesanan (pesanan_id, menu_id, jumlah, harga_saat_pesan, catatan_item)
      VALUES (${pesananId}, ${item.menuId}, ${item.jumlah}, ${itemPrices[item.menuId]}, ${item.catatan || null})
    `
  }

  await prisma.$executeRaw`
    UPDATE meja SET status_meja = 'terpakai' WHERE id = ${meja.id}
  `

  revalidatePath("/dashboard/pesanan")
  revalidatePath(`/${tokenMeja}`)

  return { success: true, orderId: pesananId }
}

export async function getPesananForDashboard(filters?: {
  status?: string
  tanggal?: string
  mejaId?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  let whereClause = `WHERE p.deleted_at IS NULL`
  const params: string[] = []

  if (filters?.status && filters.status !== 'all') {
    whereClause += ` AND p.status_pesanan = '${filters.status}'`
  }

  if (filters?.tanggal) {
    const date = new Date(filters.tanggal)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    whereClause += ` AND p.created_at >= '${date.toISOString()}' AND p.created_at < '${nextDay.toISOString()}'`
  }

  if (filters?.mejaId) {
    whereClause += ` AND p.meja_id = ${filters.mejaId}`
  }

  const pesanan = await prisma.$queryRaw<Array<{
    id: number
    nomor_meja: string
    tipe_meja: string
    status_pesanan: string
    status_pembayaran: string
    total_harga: number
    created_at: Date
    jumlah_item: number
    waiter_username: string | null
    kasir_username: string | null
  }>>`
    SELECT p.id, m.nomor_meja, m.tipe_meja, p.status_pesanan, p.status_pembayaran,
           p.total_harga, p.created_at,
           COUNT(dp.id) as jumlah_item,
           w.username as waiter_username, k.username as kasir_username
    FROM pesanan p
    JOIN meja m ON p.meja_id = m.id
    LEFT JOIN detail_pesanan dp ON p.id = dp.pesanan_id
    LEFT JOIN users w ON p.waiter_id = w.id
    LEFT JOIN users k ON p.kasir_id = k.id
    ${whereClause}
    GROUP BY p.id, m.nomor_meja, m.tipe_meja, p.status_pesanan, p.status_pembayaran,
              p.total_harga, p.created_at, w.username, k.username
    ORDER BY p.created_at DESC
  `

  return pesanan.map(p => ({
    id: p.id,
    meja: p.nomor_meja,
    tipeMeja: p.tipe_meja as "lesehan" | "kursi",
    status: p.status_pesanan,
    statusBayar: p.status_pembayaran,
    total: Number(p.total_harga),
    waktu: p.created_at.toISOString(),
    items: Number(p.jumlah_item),
  }))
}

export async function updatePembayaran(
  pesananId: number,
  data: { metodePembayaran: string; jumlahBayar: number | null; kembalian: number }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM pesanan WHERE id = ${pesananId}
  `

  if (!pesanan[0]) {
    return { error: "Pesanan tidak ditemukan" }
  }

  await prisma.$executeRaw`
    UPDATE pesanan 
    SET metode_pembayaran = ${data.metodePembayaran}, 
        jumlah_bayar = ${data.jumlahBayar}, 
        kembalian = ${data.kembalian},
        status_pembayaran = 'berhasil',
        status_pesanan = 'diproses',
        kasir_id = ${parseInt(session.user.id)}
    WHERE id = ${pesananId}
  `

  revalidatePath("/dashboard/pesanan")
  revalidatePath("/dashboard/kasir")
  return { success: true }
}

export async function getPesananById(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.$queryRaw<Array<{
    id: number
    meja_id: number
    nomor_meja: string
    tipe_meja: string
    status_pesanan: string
    status_pembayaran: string
    total_harga: number
    metode_pembayaran: string | null
    jumlah_bayar: number | null
    kembalian: number | null
    created_at: Date
    waiter_username: string | null
    kasir_username: string | null
  }>>`
    SELECT p.id, p.meja_id, m.nomor_meja, m.tipe_meja, p.status_pesanan, 
           p.status_pembayaran, p.total_harga, p.metode_pembayaran, 
           p.jumlah_bayar, p.kembalian, p.created_at,
           w.username as waiter_username, k.username as kasir_username
    FROM pesanan p
    JOIN meja m ON p.meja_id = m.id
    LEFT JOIN users w ON p.waiter_id = w.id
    LEFT JOIN users k ON p.kasir_id = k.id
    WHERE p.id = ${id} AND p.deleted_at IS NULL
    LIMIT 1
  `

  if (!pesanan[0]) {
    return { error: "Pesanan tidak ditemukan" }
  }

  return pesanan[0]
}

export async function getPesananForCheckout(id: number) {
  const pesanan = await prisma.$queryRaw<Array<{
    id: number
    total_harga: number
    status_pesanan: string
  }>>`
    SELECT id, total_harga, status_pesanan
    FROM pesanan
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `

  if (!pesanan[0]) {
    return null
  }

  const items = await prisma.$queryRaw<Array<{
    menu_id: number
    nama_menu: string
    jumlah: number
    harga_saat_pesan: number
    catatan_item: string | null
  }>>`
    SELECT dp.menu_id, m.nama_menu, dp.jumlah, dp.harga_saat_pesan, dp.catatan_item
    FROM detail_pesanan dp
    JOIN menu m ON dp.menu_id = m.id
    WHERE dp.pesanan_id = ${id}
  `

  const total = Number(pesanan[0].total_harga)

  return {
    items: items.map(item => ({
      id: item.menu_id,
      namaMenu: item.nama_menu,
      harga: Number(item.harga_saat_pesan),
      jumlah: item.jumlah,
      catatan: item.catatan_item,
    })),
    subtotal: total,
    total: total,
  }
}

export async function updateStatusPesanan(id: number, status: StatusPesanan) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  await prisma.$executeRaw`
    UPDATE pesanan SET status_pesanan = ${status} WHERE id = ${id}
  `

  revalidatePath("/dashboard/pesanan")
  return { success: true }
}

export async function cancelPesanan(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  // Get meja_id first
  const pesanan = await prisma.$queryRaw<Array<{ meja_id: number }>>`
    SELECT meja_id FROM pesanan WHERE id = ${id} AND deleted_at IS NULL
  `

  if (!pesanan[0]) {
    return { error: "Pesanan tidak ditemukan" }
  }

  // Update pesanan status and free up the table
  await prisma.$executeRaw`
    UPDATE pesanan 
    SET status_pesanan = 'dibatalkan', deleted_at = NOW() 
    WHERE id = ${id}
  `

  await prisma.$executeRaw`
    UPDATE meja SET status_meja = 'kosong' WHERE id = ${pesanan[0].meja_id}
  `

  revalidatePath("/dashboard/pesanan")
  return { success: true }
}

export async function getActivePesananByToken(tokenMeja: string) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) {
    return null
  }

  const pesanan = await prisma.$queryRaw<Array<{
    id: number
    status_pesanan: string
    status_pembayaran: string
    total_harga: number
    created_at: Date
  }>>`
    SELECT id, status_pesanan, status_pembayaran, total_harga, created_at
    FROM pesanan
    WHERE meja_id = ${meja.id} 
      AND status_pesanan IN ('menunggu', 'diproses', 'siap')
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (!pesanan[0]) {
    return null
  }

  // Get items
  const items = await prisma.$queryRaw<Array<{
    menu_id: number
    nama_menu: string
    jumlah: number
    harga_saat_pesan: number
    catatan_item: string | null
  }>>`
    SELECT dp.menu_id, m.nama_menu, dp.jumlah, dp.harga_saat_pesan, dp.catatan_item
    FROM detail_pesanan dp
    JOIN menu m ON dp.menu_id = m.id
    WHERE dp.pesanan_id = ${pesanan[0].id}
  `

  return {
    id: pesanan[0].id,
    items: items.map(item => ({
      id: item.menu_id,
      namaMenu: item.nama_menu,
      harga: Number(item.harga_saat_pesan),
      jumlah: item.jumlah,
      catatan: item.catatan_item,
    })),
    total: Number(pesanan[0].total_harga),
    status: pesanan[0].status_pesanan as StatusPesanan,
    waktu: pesanan[0].created_at.toISOString(),
  }
}
