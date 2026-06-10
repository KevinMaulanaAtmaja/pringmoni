"use server"

import crypto from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { hitungAdminFee } from "@/lib/fee"
import { MetodePembayaran } from "@/types"

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
  midtransOrderId: string | null
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
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findMany({
    where: {
      OR: [
        { statusPembayaran: 'menunggu', statusPesanan: { in: ['selesai', 'menunggu'] as any } },
        { statusPembayaran: 'berhasil', statusPesanan: 'menunggu' as any },
      ],
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
    midtransOrderId: p.midtransOrderId,
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
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
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
      take: 100,
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
    if (!session?.user || session.user.role !== 'cashier') {
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

    // Void any pending Midtrans transaction (QRIS/Transfer) if exists
    if (pesanan.midtransTransactionId && !pesanan.midtransTransactionId.startsWith("SIM-")) {
      const { voidMidtransTransaction } = await import("@/lib/midtrans")
      const midtransOrderId = `PRING-${pesanan.midtransOrderId}`
      await voidMidtransTransaction(midtransOrderId)
    }

    await prisma.pesanan.update({
      where: { id: pesananId },
      data: {
        metodePembayaran: 'tunai',
        jumlahBayar: jumlahBayar,
        kembalian: kembalian,
        biayaAdmin: 0,
        ppn: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: parseInt(session.user.id),
        midtransTransactionId: null,
        updatedAt: new Date(),
      },
    })

    await createLog('PROCESS_PAYMENT', `Pembayaran tunai pesanan #${pesananId}: Rp${totalHarga.toLocaleString('id-ID')}, kembalian Rp${kembalian.toLocaleString('id-ID')}`)

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
  if (!session?.user || session.user.role !== 'cashier') {
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
      updatedAt: new Date(),
    },
  })

  await createLog('PROCESS_PAYMENT', `Pembayaran QRIS pesanan #${pesananId}: Rp${totalHarga.toLocaleString('id-ID')}`)

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function prosesPembayaranTransfer(pesananId: number, bank?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
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

  const selectedBank = bank || 'bca'
  const totalHarga = Number(pesanan.totalHarga)
  const adminFee = hitungAdminFee('transfer', totalHarga)
  const grandTotal = totalHarga + adminFee
  const vaNumber = generateVANumber(selectedBank, pesananId)
  const bankLabel = BANK_LABELS[selectedBank] || 'BCA'

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
      catatan: `Bank:${selectedBank}|VA:${vaNumber}`,
      updatedAt: new Date(),
    },
  })

  await createLog('PROCESS_PAYMENT', `Pembayaran transfer (${bankLabel}) pesanan #${pesananId}: Rp${totalHarga.toLocaleString('id-ID')}, VA: ${vaNumber}`)

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true, bank: selectedBank, bankLabel, vaNumber, adminFee, totalBayar: grandTotal }
}

const BANK_VA_PREFIX: Record<string, string> = {
  bca: '8800',
  bni: '8801',
  bri: '8802',
  mandiri: '8803',
}

const BANK_LABELS: Record<string, string> = {
  bca: 'BCA',
  bni: 'BNI',
  bri: 'BRI',
  mandiri: 'Mandiri',
}

function generateVANumber(bank: string, orderId: number): string {
  const prefix = BANK_VA_PREFIX[bank] || '8800'
  return `${prefix}${String(orderId).padStart(10, '0')}`
}

export async function getPembayaranInfo(pesananId: number) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
    include: { meja: true, detailPesanan: { include: { menu: true } } },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }

  let bank = 'bca'
  let bankLabel = 'BCA'
  let vaNumber: string | null = null

  if (pesanan.catatan?.startsWith('Bank:')) {
    const parts = pesanan.catatan.split('|')
    bank = parts[0].replace('Bank:', '')
    bankLabel = BANK_LABELS[bank] || bank.toUpperCase()
    if (parts[1]?.startsWith('VA:')) {
      vaNumber = parts[1].replace('VA:', '')
    }
  }

  return {
    id: pesanan.id,
    midtransOrderId: pesanan.midtransOrderId,
    nomorMeja: pesanan.meja.nomorMeja,
    namaPelanggan: pesanan.namaPelanggan,
    totalHarga: Number(pesanan.totalHarga),
    biayaAdmin: pesanan.biayaAdmin ? Number(pesanan.biayaAdmin) : 0,
    ppn: pesanan.ppn ? Number(pesanan.ppn) : 0,
    metodePembayaran: pesanan.metodePembayaran,
    statusPembayaran: pesanan.statusPembayaran,
    jumlahBayar: pesanan.jumlahBayar ? Number(pesanan.jumlahBayar) : 0,
    kembalian: Number(pesanan.kembalian),
    createdAt: pesanan.createdAt.toISOString(),
    items: pesanan.detailPesanan.map(d => ({
      id: d.id,
      namaMenu: d.menu.namaMenu,
      jumlah: d.jumlah,
      hargaSaatPesan: Number(d.hargaSaatPesan),
    })),
    bank,
    bankLabel,
    vaNumber,
    qrUrl: pesanan.midtransTransactionId?.startsWith('SIM-')
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SIMULASI-QRIS-${pesanan.midtransOrderId}`
      : null,
  }
}

export async function selesaikanPesananKasir(pesananId: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== 'berhasil') return { error: "Pesanan belum dibayar" }
  if (pesanan.statusPesanan !== 'diproses') return { error: "Pesanan belum diproses" }

  await prisma.$transaction(async (tx) => {
    await tx.pesanan.update({
      where: { id: pesananId },
      data: {
        statusPesanan: 'selesai' as any,
        updatedAt: new Date(),
      },
    })

    await tx.meja.update({
      where: { id: pesanan.mejaId },
      data: { statusMeja: 'kosong' },
    })
  })

  await createLog('UPDATE_ORDER_STATUS', `Pesanan #${pesananId} ditandai selesai oleh kasir — meja dikosongkan`)

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
    if (!session?.user || session.user.role !== 'cashier') {
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
        updatedAt: new Date(),
      },
    })

    await createLog('PROCESS_PAYMENT', `Konfirmasi pembayaran pesanan #${pesananId}: Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')}`)

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
  if (!session?.user || session.user.role !== 'cashier') {
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

  // Void Midtrans transaction if exists
  if (pesanan.midtransTransactionId && !pesanan.midtransTransactionId.startsWith('SIM-')) {
    try {
      const { voidMidtransTransaction } = await import("@/lib/midtrans")
      await voidMidtransTransaction(pesanan.midtransTransactionId)
    } catch {}
  }

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      statusPembayaran: 'dibatalkan',
      statusPesanan: 'dibatalkan',
      kasirId: parseInt(session.user.id),
      catatan: 'Dibatalkan kasir',
    },
  })

  await createLog('CANCEL_ORDER_KASIR', `Pesanan #${pesananId} dibatalkan oleh kasir (via halaman kasir)`)

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function accPesanan(pesananId: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== 'berhasil') return { error: "Pesanan belum dibayar" }
  if (pesanan.statusPesanan !== 'menunggu') return { error: "Pesanan sudah diproses" }

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      statusPesanan: 'diproses' as any,
      kasirId: parseInt(session.user.id),
      updatedAt: new Date(),
    },
  })

  await createLog('UPDATE_ORDER_STATUS', `Pesanan #${pesananId} diterima (menunggu → diproses)`)

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function generateQRISCode(pesananId: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
    include: { meja: true, detailPesanan: { include: { menu: true } } },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== 'menunggu') return { error: "Pesanan sudah dibayar" }
  if (!pesanan.midtransOrderId) return { error: "Pesanan belum memiliki order ID" }

  const { createCorePayment, checkMidtransTransaction } = await import("@/lib/midtrans")
  const metode = 'qris'
  const totalHarga = Number(pesanan.totalHarga)
  const adminFee = hitungAdminFee(metode, totalHarga)
  const grossAmount = totalHarga + adminFee
  const expiryMenit = 15
  const midtransOrderId = `PRING-${pesanan.midtransOrderId}`

  // If already generated, return existing
  if (pesanan.midtransTransactionId) {
    const result = await checkMidtransTransaction(midtransOrderId)
    if (!result.success) {
      return { error: "Transaksi tidak ditemukan" }
    }
    const data = result.data as Record<string, unknown>
    const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
    const qrV2 = actions?.find(a => a.name === "generate-qr-code-v2")
    const qrV1 = actions?.find(a => a.name === "generate-qr-code")
    return {
      success: true,
      qrUrl: (qrV2 || qrV1)?.url || null,
      totalBayar: grossAmount,
      adminFee,
      expiryMenit,
    }
  }

  const chargeResult = await createCorePayment({
    order_id: midtransOrderId,
    gross_amount: grossAmount,
    payment_type: "gopay",
    customer_details: { first_name: pesanan.namaPelanggan || "Customer" },
    item_details: [
      ...pesanan.detailPesanan.map(item => ({
        id: String(item.menuId),
        price: Number(item.hargaSaatPesan),
        quantity: item.jumlah,
        name: item.menu.namaMenu,
      })),
      { id: "admin-fee", price: adminFee, quantity: 1, name: "Biaya Admin QRIS" },
    ],
    expiry: { duration: expiryMenit, unit: "minute" },
  })

  if (!chargeResult.success) {
    // SIM- fallback for development
    if (process.env.NODE_ENV !== "production") {
      const simTransactionId = `SIM-${crypto.randomUUID()}`
      const simQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SIMULASI-QRIS-${pesanan.midtransOrderId}`

      await prisma.pesanan.update({
        where: { id: pesananId },
        data: {
          metodePembayaran: 'qris',
          midtransTransactionId: simTransactionId,
          biayaAdmin: adminFee,
          ppn: 0,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        qrUrl: simQrUrl,
        totalBayar: grossAmount,
        adminFee,
        expiryMenit,
      }
    }
    return { error: chargeResult.error || "Gagal membuat QRIS" }
  }

  const data = chargeResult.data as Record<string, unknown>
  const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
  const qrV2 = actions?.find(a => a.name === "generate-qr-code-v2")
  const qrV1 = actions?.find(a => a.name === "generate-qr-code")
  const qrUrl = (qrV2 || qrV1)?.url || null
  const transactionId = data.transaction_id as string

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      metodePembayaran: 'qris',
      midtransTransactionId: transactionId,
      biayaAdmin: adminFee,
      ppn: 0,
      updatedAt: new Date(),
    },
  })

  return {
    success: true,
    qrUrl,
    totalBayar: grossAmount,
    adminFee,
    expiryMenit,
  }
}

export async function confirmQrisPayment(pesananId: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'cashier') {
    return { error: "Unauthorized" }
  }

  const pesanan = await prisma.pesanan.findFirst({
    where: { id: pesananId, deletedAt: null },
  })

  if (!pesanan) return { error: "Pesanan tidak ditemukan" }
  if (pesanan.statusPembayaran !== 'menunggu') return { error: "Pesanan sudah dikonfirmasi" }

  // SIM transaction fallback
  if (pesanan.midtransTransactionId?.startsWith("SIM-")) {
    await prisma.pesanan.update({
      where: { id: pesananId },
      data: {
        jumlahBayar: Number(pesanan.totalHarga) + Number(pesanan.biayaAdmin || 0),
        kembalian: 0,
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        kasirId: parseInt(session.user.id),
        updatedAt: new Date(),
      },
    })
    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/pesanan")
    return { success: true }
  }

  // Verify with Midtrans API
  const { checkMidtransTransaction } = await import("@/lib/midtrans")
  const midtransOrderId = `PRING-${pesanan.midtransOrderId}`
  const result = await checkMidtransTransaction(midtransOrderId)

  if (!result.success) {
    return { error: "Gagal memverifikasi pembayaran di Midtrans" }
  }

  const status = result.data.transaction_status as string
  const isSuccess = status === "capture" || status === "settlement"

  if (!isSuccess) {
    return { error: `Pembayaran belum selesai (status: ${status})` }
  }

  const grossAmount = Number(result.data.gross_amount) || (Number(pesanan.totalHarga) + Number(pesanan.biayaAdmin || 0))

  await prisma.pesanan.update({
    where: { id: pesananId },
    data: {
      jumlahBayar: grossAmount,
      kembalian: 0,
      statusPembayaran: 'berhasil',
      statusPesanan: 'diproses',
      kasirId: parseInt(session.user.id),
      updatedAt: new Date(),
    },
  })

  await createLog('PROCESS_PAYMENT', `Konfirmasi QRIS pesanan #${pesananId}: Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')}`)

  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/pesanan")
  return { success: true }
}
