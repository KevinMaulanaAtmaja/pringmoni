"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hitungAdminFee } from "@/lib/fee"
import { MetodePembayaran } from "@/types/index"

export interface KasirPesananItem {
  id: number
  mejaId: number
  nomorMeja: string
  statusPesanan: string
  statusPembayaran: string
  totalHarga: number
  biayaAdmin: number | null
  ppn: number | null
  metodePembayaran: string | null
  jumlahBayar: number | null
  kembalian: number
  createdAt: Date
  updatedAt: Date
  waiterUsername: string | null
  kasirUsername?: string | null
  namaPelanggan?: string | null
  items: Array<{
    id: number
    menuId: number
    namaMenu: string
    jumlah: number
    hargaSaatPesan: number
    catatanItem: string | null
  }>
}

export async function getPesananBelumBayar() {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findMany({
    where: {
      statusPembayaran: 'menunggu',
       statusPesanan: { in: ['selesai', 'menunggu'] as any },
      deletedAt: null,
      // Include all payment methods that are pending
    },
    include: {
      meja: true,
      waiter: true,
      kasir: true,
      detailPesanan: {
        include: {
          menu: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return pesanan.map(p => ({
    id: p.id,
    mejaId: p.mejaId,
    nomorMeja: p.meja.nomorMeja,
    statusPesanan: p.statusPesanan,
    statusPembayaran: p.statusPembayaran,
    totalHarga: Number(p.totalHarga),
    biayaAdmin: p.biayaAdmin ? Number(p.biayaAdmin) : null,
    ppn: p.ppn ? Number(p.ppn) : null,
    metodePembayaran: p.metodePembayaran,
    jumlahBayar: p.jumlahBayar ? Number(p.jumlahBayar) : null,
    kembalian: Number(p.kembalian),
    createdAt: p.createdAt,
    waiterUsername: p.waiter?.username || null,
    namaPelanggan: p.namaPelanggan || null,
    items: p.detailPesanan.map(item => ({
      id: item.id,
      menuId: item.menuId,
      namaMenu: item.menu.namaMenu,
      jumlah: item.jumlah,
      hargaSaatPesan: Number(item.hargaSaatPesan),
      catatanItem: item.catatanItem,
    })),
  }))
}

export async function getPesananRiwayatKasir(filter?: { period?: 'today' | 'week' | 'month' | 'all' }) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const isOwner = session.user.role === 'owner'
  
  const whereClause: any = {
    statusPembayaran: { in: ['berhasil', 'dibatalkan'] },
    deletedAt: null,
  }

  // Date filter
  const period = filter?.period || 'all'
  if (period !== 'all') {
    const now = new Date()
    let startDate: Date
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      startDate = new Date(0) // all time
    }
    
    whereClause.createdAt = { gte: startDate }
  }

  const [pesanan, kasirUsers] = await Promise.all([
    prisma.pesanan.findMany({
      where: whereClause,
      include: {
        meja: true,
        waiter: true,
        kasir: true,
        detailPesanan: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: period === 'all' ? 100 : undefined,
    }),
    prisma.users.findMany({
      where: { role: 'cashier', status: true },
      select: { username: true },
      orderBy: { username: 'asc' },
    }),
  ])

  return {
    pesanan: pesanan.map(p => ({
      id: p.id,
      mejaId: p.mejaId,
      nomorMeja: p.meja.nomorMeja,
      statusPesanan: p.statusPesanan,
      statusPembayaran: p.statusPembayaran,
      totalHarga: Number(p.totalHarga),
      biayaAdmin: p.biayaAdmin ? Number(p.biayaAdmin) : null,
      ppn: p.ppn ? Number(p.ppn) : null,
      metodePembayaran: p.metodePembayaran as MetodePembayaran,
      jumlahBayar: Number(p.jumlahBayar),
      kembalian: Number(p.kembalian),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      waiterUsername: p.waiter?.username || null,
      kasirUsername: p.kasir?.username || null,
      namaPelanggan: p.namaPelanggan || null,
      items: p.detailPesanan.map(item => ({
        id: item.id,
        menuId: item.menuId,
        namaMenu: item.menu.namaMenu,
        jumlah: item.jumlah,
        hargaSaatPesan: Number(item.hargaSaatPesan),
        catatanItem: item.catatanItem,
      })),
    })),
    daftarKasir: kasirUsers.map(u => u.username),
  }
}

export async function prosesPembayaranTunai(
  pesananId: number,
  jumlahBayar: number
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
      return { error: "Unauthorized" }
    }

    const pesanan = await prisma.pesanan.findFirst({
      where: { id: pesananId, deletedAt: null },
    })

    if (!pesanan) {
      return { error: "Pesanan tidak ditemukan" }
    }

    if (pesanan.statusPembayaran !== 'menunggu') {
      return { error: "Pesanan sudah dibayar" }
    }

    const totalHarga = Number(pesanan.totalHarga)
    const kembalian = jumlahBayar - totalHarga

    if (kembalian < 0) {
      return { error: "Jumlah bayar kurang dari total harga" }
    }

    await prisma.pesanan.update({
      where: { id: pesananId },
      data: {
        metodePembayaran: 'tunai',
        jumlahBayar: jumlahBayar,
        kembalian: kembalian,
        biayaAdmin: 0,
        ppn: 0,
        statusPembayaran: 'menunggu',
        statusPesanan: 'menunggu',
      },
    })

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/pesanan")

    return { success: true, kembalian, pending: true }
  } catch (error) {
    console.error("prosesPembayaranTunai error:", error)
    return { error: "Terjadi kesalahan saat memproses pembayaran" }
  }
}

export async function prosesPembayaranQRIS(pesananId: number) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPembayaran !== 'menunggu') {
    return { error: "Pesanan sudah dibayar" }
  }

  const totalHarga = Number(pesanan.totalHarga)
  const adminFee = hitungAdminFee('qris', totalHarga)
  const grandTotal = totalHarga + adminFee

  // QRIS otomatis langsung berhasil
  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      metodePembayaran: 'qris',
      jumlahBayar: grandTotal,
      kembalian: 0,
      biayaAdmin: adminFee,
      ppn: 0,
      statusPembayaran: 'berhasil',
      statusPesanan: 'diproses' as any,
      kasirId: parseInt(session.user.id),
    },
  })

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function prosesPembayaranTransfer(pesananId: number) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPembayaran !== 'menunggu') {
    return { error: "Pesanan sudah dibayar" }
  }

  // Transfer otomatis langsung berhasil
  const totalHarga = Number(pesanan.totalHarga)
  const adminFee = hitungAdminFee('transfer', totalHarga)
  const grandTotal = totalHarga + adminFee

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      metodePembayaran: 'transfer',
      jumlahBayar: grandTotal,
      kembalian: 0,
      biayaAdmin: adminFee,
      ppn: 0,
      statusPembayaran: 'berhasil',
      statusPesanan: 'diproses' as any,
      kasirId: parseInt(session.user.id),
    },
  })

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function updatePesananMeja(tokenMeja: string, updates: {
  statusPesanan?: string
  catatan?: string
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const meja = await prisma.meja.findFirst({
    where: { tokenMeja, deletedAt: null },
  })

  if (!meja) {
    return { error: "Meja tidak ditemukan" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPesanan: { in: ['menunggu', 'selesai'] as any },
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!pesanan) {
    return { error: "Pesanan aktif tidak ditemukan untuk meja ini" }
  }

  const updateData: any = {}
  if (updates.statusPesanan) {
    updateData.statusPesanan = updates.statusPesanan
  }
  if (updates.catatan !== undefined) {
    updateData.catatan = updates.catatan
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.pesanan.update({
      where: { id: pesanan.id },
      data: updateData,
    })
  }

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function konfirmasiPembayaran(pesananId: number) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
      return { error: "Unauthorized" }
    }

    const pesanan = await prisma.pesanan.findFirst({
      where: { id: pesananId, deletedAt: null },
    })

    if (!pesanan) {
      return { error: "Pesanan tidak ditemukan" }
    }

    if (pesanan.statusPembayaran !== 'menunggu') {
      return { error: "Pesanan sudah dikonfirmasi atau dibatalkan" }
    }

    await prisma.pesanan.update({
      where: { id: pesananId },
      data: {
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses' as any,
        kasirId: parseInt(session.user.id),
      },
    })

    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/pesanan")

    return { success: true }
  } catch (error) {
    console.error("konfirmasiPembayaran error:", error)
    return { error: "Terjadi kesalahan saat konfirmasi pembayaran" }
  }
}

export async function batalkanPesananKasir(pesananId: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPembayaran === 'berhasil') {
    return { error: "Tidak bisa membatalkan pesanan yang sudah dibayar" }
  }

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      statusPembayaran: 'dibatalkan',
      statusPesanan: 'dibatalkan',
      kasirId: parseInt(session.user.id),
    },
  })

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}
