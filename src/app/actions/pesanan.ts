"use server"

import crypto from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { Prisma, StatusPesanan, StatusBayar, MetodePembayaran, StatusAntar } from "@prisma/client"
import { hitungAdminFee } from "@/lib/fee"

export async function updateStatusPesanan(id: number, status: StatusPesanan) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role === 'owner') {
    return { error: "Owner tidak bisa mengubah status pesanan" }
  }

  const validStatuses = [StatusPesanan.menunggu, StatusPesanan.diproses, StatusPesanan.selesai, StatusPesanan.dibatalkan]
  if (!validStatuses.includes(status)) {
    return { error: "Status tidak valid" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id, deletedAt: null },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (status === StatusPesanan.dibatalkan && pesanan.statusPembayaran === 'berhasil') {
    return { error: "Tidak bisa membatalkan pesanan yang sudah dibayar" }
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

  const publicId = crypto.randomUUID()

  const pesanan = await prisma.pesanan.create({
    data: {
      mejaId: meja.id,
      statusPesanan: StatusPesanan.menunggu,
      totalHarga: totalHarga,
      namaPelanggan: namaPelanggan || null,
      midtransOrderId: publicId,
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

  return { success: true, orderId: pesanan.midtransOrderId }
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

  const whereClause: Prisma.PesananWhereInput = {
    deletedAt: null,
    ...(filters?.status && filters.status !== 'all' ? { statusPesanan: filters.status as StatusPesanan } : {}),
    ...(filters?.tanggal ? {
      createdAt: {
        gte: new Date(filters.tanggal),
        lt: (() => { const d = new Date(filters.tanggal); d.setDate(d.getDate() + 1); return d })(),
      },
    } : {}),
    ...(filters?.mejaId ? { mejaId: filters.mejaId } : {}),
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
      metodePembayaran: data.metodePembayaran as MetodePembayaran,
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
    biaya_admin: pesanan.biayaAdmin ? Number(pesanan.biayaAdmin) : null,
    ppn: pesanan.ppn ? Number(pesanan.ppn) : null,
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
      status_antar: item.statusAntar,
    })),
  }
}

export async function getPesananForCheckout(publicId: string) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, deletedAt: null },
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
    id: pesanan.id,
    items: pesanan.detailPesanan.map(item => ({
      id: item.menuId,
      namaMenu: item.menu.namaMenu,
      harga: Number(item.hargaSaatPesan),
      jumlah: item.jumlah,
      catatan: item.catatanItem,
    })),
    subtotal: Number(pesanan.totalHarga),
    total: Number(pesanan.totalHarga),
    biayaAdmin: pesanan.biayaAdmin ? Number(pesanan.biayaAdmin) : null,
    ppn: pesanan.ppn ? Number(pesanan.ppn) : null,
    waktu: pesanan.createdAt.toISOString(),
  }
}

export async function createMidtransPayment(publicId: string, tokenMeja: string, metode: 'qris' | 'transfer') {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) return { error: "Token meja tidak valid" }

  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, mejaId: meja.id, deletedAt: null },
    include: {
      detailPesanan: { include: { menu: true } },
    },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== StatusBayar.menunggu) return { error: "Pesanan sudah dibayar" }

  const totalHarga = Number(pesanan.totalHarga)
  const adminFee = hitungAdminFee(metode, totalHarga)
  const grossAmount = totalHarga + adminFee
  const midtransOrderId = `PRING-${publicId}`

  // Kalo udah pernah generate, skip Midtrans API
  if (pesanan.midtransTransactionId) {
    const { checkMidtransTransaction } = await import("@/lib/midtrans")
    const result = await checkMidtransTransaction(midtransOrderId)

    if (!result.success) {
      return { error: "Transaksi tidak ditemukan" }
    }

    const data = result.data as Record<string, unknown>

    if (metode === "transfer") {
      const vaNumbers = data.va_numbers as Array<{ bank: string; va_number: string }> | undefined
      return {
        success: true,
        payment_type: "bank_transfer" as const,
        bank: "bca" as const,
        va_number: vaNumbers?.[0]?.va_number || null,
        transaction_id: data.transaction_id as string || pesanan.midtransTransactionId,
        adminFee,
        totalBayar: grossAmount,
      }
    }

    if (metode === "qris") {
      const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
      const qrAction = actions?.find(a => a.name === "generate-qr-code")
      const qrUrl = qrAction?.url || null
      return {
        success: true,
        payment_type: "qris" as const,
        qr_url: qrUrl,
        transaction_id: data.transaction_id as string || pesanan.midtransTransactionId,
        adminFee,
        totalBayar: grossAmount,
      }
    }

    return { error: "Metode pembayaran tidak didukung" }
  }

  // First time: call Midtrans API
  const { createCorePayment } = await import("@/lib/midtrans")
  const result = await createCorePayment({
    order_id: midtransOrderId,
    gross_amount: grossAmount,
    payment_type: metode === "transfer" ? "bank_transfer" : "qris",
    bank: "bca",
    customer_details: {
      first_name: pesanan.namaPelanggan || "Customer",
    },
    item_details: [
      ...pesanan.detailPesanan.map(item => ({
        id: String(item.menuId),
        price: Number(item.hargaSaatPesan),
        quantity: item.jumlah,
        name: item.menu.namaMenu,
      })),
      {
        id: "admin-fee",
        price: adminFee,
        quantity: 1,
        name: metode === "transfer" ? "Biaya Admin Transfer" : "Biaya Admin QRIS",
      },
    ],
  })

  if (!result.success) {
    // Coba ambil transaksi yg udah ada di Midtrans (406 conflict)
    const { checkMidtransTransaction } = await import("@/lib/midtrans")
    const existing = await checkMidtransTransaction(midtransOrderId)

    if (existing.success) {
      const data = existing.data as Record<string, unknown>
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: {
          metodePembayaran: metode as MetodePembayaran,
          midtransTransactionId: data.transaction_id as string,
          biayaAdmin: adminFee,
          ppn: 0,
        },
      })
      return buildPaymentResult(metode, data, adminFee, grossAmount, data.transaction_id as string)
    }

    return { error: result.error || "Gagal membuat transaksi pembayaran" }
  }

  const data = result.data as Record<string, unknown>

  // Simpan transactionId + metode setelah Midtrans berhasil
  await prisma.pesanan.update({
    where: { id: pesanan.id },
    data: {
      metodePembayaran: metode as MetodePembayaran,
      midtransTransactionId: data.transaction_id as string,
      biayaAdmin: adminFee,
      ppn: 0,
    },
  })

  return buildPaymentResult(metode, data, adminFee, grossAmount, data.transaction_id as string)
}

function buildPaymentResult(
  metode: 'qris' | 'transfer',
  data: Record<string, unknown>,
  adminFee: number,
  totalBayar: number,
  transactionId: string | null,
) {
  if (metode === "transfer") {
    const vaNumbers = data.va_numbers as Array<{ bank: string; va_number: string }> | undefined
    return {
      success: true,
      payment_type: "bank_transfer" as const,
      bank: "bca" as const,
      va_number: vaNumbers?.[0]?.va_number || null,
      transaction_id: transactionId,
      adminFee,
      totalBayar,
    }
  }

  if (metode === "qris") {
    const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
    const qrAction = actions?.find(a => a.name === "generate-qr-code")
    let qrUrl: string | null = qrAction?.url || null

    if (!qrUrl && transactionId) {
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://api.midtrans.com"
        : "https://api.sandbox.midtrans.com"
      qrUrl = `${baseUrl}/v2/qris/${transactionId}/qr-code`
    }

    return {
      success: true,
      payment_type: "qris" as const,
      qr_url: qrUrl,
      transaction_id: transactionId,
      adminFee,
      totalBayar,
    }
  }

  return { error: "Metode pembayaran tidak didukung" }
}

export async function checkMidtransPaymentStatus(publicId: string) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, deletedAt: null },
    select: { id: true, midtransOrderId: true },
  })

  if (!pesanan?.midtransOrderId) {
    return { error: "Belum ada transaksi Midtrans" }
  }

  const midtransOrderId = `PRING-${pesanan.midtransOrderId}`

  try {
    const { checkMidtransTransaction } = await import("@/lib/midtrans")
    const result = await checkMidtransTransaction(midtransOrderId)

    if (!result.success) {
      return { error: result.error || "Gagal mengecek status pembayaran" }
    }

    const status = result.data.transaction_status as string
    const isSuccess = status === "capture" || status === "settlement"

    if (isSuccess) {
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: {
          statusPembayaran: StatusBayar.berhasil,
          statusPesanan: StatusPesanan.diproses,
          jumlahBayar: Number(result.data.gross_amount),
          kembalian: 0,
        },
      })
      revalidatePath("/dashboard/kasir")
      revalidatePath("/dashboard/pesanan")
    }

    return {
      success: true,
      transaction_status: status,
      isSuccess,
    }
  } catch {
    return { error: "Gagal mengecek status pembayaran" }
  }
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

  if (pesanan.statusPesanan !== StatusPesanan.menunggu && pesanan.statusPesanan !== StatusPesanan.diproses) {
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

  if (pesanan.statusPembayaran === 'berhasil') {
    return { error: "Tidak bisa membatalkan pesanan yang sudah dibayar" }
  }

  await prisma.pesanan.update({
    where: { id },
    data: {
      statusPesanan: StatusPesanan.dibatalkan,
      statusPembayaran: StatusBayar.dibatalkan,
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

export async function getPesananByTokenAndId(tokenMeja: string, publicId: string) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) return null

  const pesanan = await prisma.pesanan.findFirst({
    where: {
      midtransOrderId: publicId,
      mejaId: meja.id,
      deletedAt: null,
    },
    include: {
      detailPesanan: { include: { menu: { include: { menuFoto: true } } } },
      meja: true,
    },
  })

  if (!pesanan) return null

  const subtotal = Number(pesanan.totalHarga)
  const adminFee = pesanan.metodePembayaran === 'tunai' || !pesanan.metodePembayaran
    ? 0
    : hitungAdminFee(pesanan.metodePembayaran as 'transfer' | 'qris', subtotal)
  const ppn = 0

  return {
    id: pesanan.id,
    midtransOrderId: pesanan.midtransOrderId,
    items: pesanan.detailPesanan.map(item => ({
      id: item.menuId,
      detailId: item.id,
      namaMenu: item.menu.namaMenu,
      harga: Number(item.hargaSaatPesan),
      jumlah: item.jumlah,
      catatan: item.catatanItem,
      statusAntar: item.statusAntar,
      fotoUrl: item.menu.menuFoto[0]?.fotoUrl || null,
    })),
    subtotal,
    adminFee,
    ppn,
    total: subtotal + adminFee + ppn,
    status: pesanan.statusPesanan,
    statusPembayaran: pesanan.statusPembayaran,
    waktu: pesanan.createdAt.toISOString(),
    namaPelanggan: pesanan.namaPelanggan || null,
    metodePembayaran: pesanan.metodePembayaran,
    nomorMeja: pesanan.meja.nomorMeja,
  }
}

export async function konfirmasiPembayaranCustomer(
  publicId: string,
  tokenMeja: string,
  metode: string
) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) return { error: "Token meja tidak valid" }

  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, mejaId: meja.id, deletedAt: null },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== StatusBayar.menunggu) {
    return { error: "Pesanan sudah dikonfirmasi" }
  }
  if (!['tunai', 'transfer', 'qris'].includes(metode)) {
    return { error: "Metode pembayaran tidak valid" }
  }

  const BATAS_MENIT = 60
  const waktuDibuat = new Date(pesanan.createdAt).getTime()
  const waktuSekarang = Date.now()
  const selisihMenit = (waktuSekarang - waktuDibuat) / 1000 / 60
  if (selisihMenit > BATAS_MENIT) {
    return { error: `Waktu konfirmasi pembayaran telah habis (lebih dari ${BATAS_MENIT} menit). Silakan hubungi kasir.` }
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.pesanan.update({
      where: { id: pesanan.id },
      data: { metodePembayaran: metode as MetodePembayaran },
    })

    if (!updated) {
      throw new Error("Gagal mengupdate pesanan")
    }
  })

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function markItemDiantar(detailId: number) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const detail = await prisma.detailPesanan.findUnique({
    where: { id: detailId },
    select: { id: true, statusAntar: true, pesananId: true },
  })

  if (!detail) {
    return { error: "Item tidak ditemukan" }
  }

  const newStatus = detail.statusAntar === 'diantar' ? 'belum' : 'diantar'

  await prisma.detailPesanan.update({
    where: { id: detailId },
    data: { statusAntar: newStatus as any },
  })

  revalidatePath("/dashboard/pesanan")

  return { success: true, statusAntar: newStatus }
}

export async function updateNamaPelanggan(publicId: string, tokenMeja: string, nama: string) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) return { error: "Token meja tidak valid" }

  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, mejaId: meja.id, deletedAt: null },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }

  await prisma.pesanan.update({
    where: { id: pesanan.id },
    data: { namaPelanggan: nama },
  })

  return { success: true }
}
