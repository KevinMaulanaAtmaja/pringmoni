"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { StatusPesanan, StatusBayar } from "@prisma/client"

export async function updateStatusPesanan(id: number, status: StatusPesanan) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role === 'owner') {
    return { error: "Owner tidak bisa mengubah status pesanan" }
  }

  const validStatuses = [StatusPesanan.menunggu, StatusPesanan.selesai, StatusPesanan.dibatalkan]
  if (!validStatuses.includes(status)) {
    return { error: "Status tidak valid" }
  }

  await prisma.pesanan.update({
    where: { id },
    data: { statusPesanan: status },
  })

  revalidatePath("/dashboard/pesanan")
  return { success: true }
}

export interface CreatePesananItem {
  menuId: number
  jumlah: number
  catatan?: string | null
}

export interface CreatePesananData {
  tokenMeja: string
  items: CreatePesananItem[]
  namaPelanggan?: string | null
}

export async function getMejaByToken(tokenMeja: string) {
  return await prisma.meja.findFirst({
    where: { tokenMeja, deletedAt: null },
  })
}

export async function getMenusForCustomer() {
  const menus = await prisma.menu.findMany({
    where: { statusMenu: 'tersedia', deletedAt: null },
    include: { kategori: true, menuFoto: true },
    orderBy: { namaMenu: 'asc' },
  })
  
  return menus.map(menu => ({
    id: menu.id,
    namaMenu: menu.namaMenu,
    deskripsi: menu.deskripsi,
    harga: Number(menu.harga),
    kategori: menu.kategori.namaKategori,
    statusMenu: menu.statusMenu as "tersedia" | "habis" | "nonaktif",
    fotoUrl: menu.menuFoto[0]?.fotoUrl || null,
    menuFoto: menu.menuFoto.map(f => ({ id: f.id, fotoUrl: f.fotoUrl })),
  }))
}

export async function createPesanan(data: CreatePesananData) {
  const { tokenMeja, items, namaPelanggan } = data

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
    const menu = await prisma.menu.findFirst({
      where: { id: item.menuId, deletedAt: null },
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
      statusPesanan: StatusPesanan.menunggu,
      totalHarga: totalHarga,
      namaPelanggan: namaPelanggan || null,
      detailPesanan: {
        create: items.map(item => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
          hargaSaatPesan: itemPrices[item.menuId],
          catatanItem: item.catatan,
        })),
      },
    },
  })

  await prisma.meja.update({
    where: { id: meja.id },
    data: { statusMeja: 'terpakai' },
  })

  revalidatePath("/dashboard/pesanan")
  revalidatePath(`/${tokenMeja}`)

  return { success: true, orderId: pesanan.id }
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

  const whereClause: any = {
    deletedAt: null,
  }

  if (filters?.status && filters.status !== 'all') {
    whereClause.statusPesanan = filters.status as StatusPesanan
  }

  if (filters?.tanggal) {
    const date = new Date(filters.tanggal)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    whereClause.createdAt = {
      gte: date,
      lt: nextDay,
    }
  }

  if (filters?.mejaId) {
    whereClause.mejaId = filters.mejaId
  }

  const pesanan = await prisma.pesanan.findMany({
    where: whereClause,
    include: {
      meja: true,
      waiter: true,
      kasir: true,
      detailPesanan: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return pesanan.map(p => ({
    id: p.id,
    mejaId: p.mejaId,
    meja: p.meja.nomorMeja,
    tipeMeja: p.meja.nomorMeja.startsWith('L') ? 'lesehan' as const : 'kursi' as const,
    status: p.statusPesanan,
    statusBayar: p.statusPembayaran,
    total: Number(p.totalHarga),
    waktu: p.createdAt.toISOString(),
    items: p.detailPesanan.length,
    waiterUsername: p.waiter?.username || null,
    kasirUsername: p.kasir?.username || null,
    namaPelanggan: p.namaPelanggan || null,
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

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      metodePembayaran: data.metodePembayaran as any,
      jumlahBayar: data.jumlahBayar,
      kembalian: data.kembalian,
      statusPembayaran: StatusBayar.berhasil,
      statusPesanan: StatusPesanan.selesai,
      kasirId: parseInt(session.user.id),
    },
  })

  revalidatePath("/dashboard/pesanan")
  revalidatePath("/dashboard/kasir")
  return { success: true }
}

export async function getPesananById(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id, deletedAt: null },
    include: {
      meja: true,
      waiter: true,
      kasir: true,
      detailPesanan: {
        include: {
          menu: {
            include: {
              menuFoto: true,
            },
          },
        },
      },
    },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  return {
    id: pesanan.id,
    meja_id: pesanan.mejaId,
    nomor_meja: pesanan.meja.nomorMeja,
    tipe_meja: pesanan.meja.nomorMeja.startsWith('L') ? 'lesehan' : 'kursi',
    status_pesanan: pesanan.statusPesanan,
    status_pembayaran: pesanan.statusPembayaran,
    total_harga: Number(pesanan.totalHarga),
    metode_pembayaran: pesanan.metodePembayaran,
    jumlah_bayar: pesanan.jumlahBayar ? Number(pesanan.jumlahBayar) : null,
    kembalian: Number(pesanan.kembalian),
    created_at: pesanan.createdAt,
    waiter_username: pesanan.waiter?.username || null,
    kasir_username: pesanan.kasir?.username || null,
    nama_pelanggan: pesanan.namaPelanggan || null,
    items: pesanan.detailPesanan.map(item => ({
      id: item.id,
      menu_id: item.menuId,
      nama_menu: item.menu.namaMenu,
      jumlah: item.jumlah,
      harga_saat_pesan: Number(item.hargaSaatPesan),
      catatan_item: item.catatanItem,
      foto_urls: item.menu.menuFoto.map(f => f.fotoUrl),
    })),
  }
}

export async function getPesananForCheckout(id: number) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { id, deletedAt: null },
    include: {
      detailPesanan: {
        include: { menu: true },
      },
    },
  })

  if (!pesanan) {
    return null
  }

  return {
    items: pesanan.detailPesanan.map(item => ({
      id: item.menuId,
      namaMenu: item.menu.namaMenu,
      harga: Number(item.hargaSaatPesan),
      jumlah: item.jumlah,
      catatan: item.catatanItem,
    })),
    subtotal: Number(pesanan.totalHarga),
    total: Number(pesanan.totalHarga),
  }
}

export async function createMidtransPayment(pesananId: number, metode: 'qris' | 'transfer') {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
    include: {
      meja: true,
      detailPesanan: { include: { menu: true } },
    },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPembayaran !== StatusBayar.menunggu) {
    return { error: "Pesanan sudah dibayar" }
  }

  return { error: "Midtrans belum dikonfigurasi" }
}

export async function checkMidtransPaymentStatus(pesananId: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }
  return { error: "Midtrans belum dikonfigurasi" }
}

export async function markPesananSelesai(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role !== 'waiter') {
    return { error: "Hanya waiter yang bisa menandai pesanan selesai" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id, deletedAt: null },
    include: { detailPesanan: true }
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPesanan !== StatusPesanan.menunggu) {
    return { error: "Pesanan belum diproses" }
  }

  await prisma.pesanan.update({
    where: { id },
    data: {
      statusPesanan: StatusPesanan.selesai,
      waiterId: parseInt(session.user.id),
    },
  })

  revalidatePath("/dashboard/pesanan")
  return { success: true, message: "Pesanan berhasil ditandai selesai" }
}

export async function cancelPesanan(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role === 'owner') {
    return { error: "Owner tidak bisa membatalkan pesanan" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id, deletedAt: null },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  await prisma.pesanan.update({
    where: { id },
    data: {
      statusPesanan: StatusPesanan.dibatalkan,
      deletedAt: new Date(),
    },
  })

  await prisma.meja.update({
    where: { id: pesanan.mejaId },
    data: { statusMeja: 'kosong' },
  })

  revalidatePath("/dashboard/pesanan")
  return { success: true }
}

export async function getActivePesananByToken(tokenMeja: string) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) {
    return null
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPesanan: { in: [StatusPesanan.menunggu] },
      deletedAt: null,
    },
    include: {
      detailPesanan: { include: { menu: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!pesanan) {
    return null
  }

  return {
    id: pesanan.id,
    items: pesanan.detailPesanan.map(item => ({
      id: item.menuId,
      namaMenu: item.menu.namaMenu,
      harga: Number(item.hargaSaatPesan),
      jumlah: item.jumlah,
      catatan: item.catatanItem,
    })),
    total: Number(pesanan.totalHarga),
    status: pesanan.statusPesanan,
    waktu: pesanan.createdAt.toISOString(),
    namaPelanggan: pesanan.namaPelanggan || null,
  }
}
