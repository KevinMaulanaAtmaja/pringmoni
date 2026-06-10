"use server"

import crypto from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { Prisma, StatusPesanan, StatusBayar, MetodePembayaran, StatusAntar } from "@prisma/client"
import { hitungAdminFee, hitungExpiryMenit } from "@/lib/fee"

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

  if (status === StatusPesanan.dibatalkan) {
    await createLog('CANCEL_ORDER_KASIR', `Pesanan #${id} dibatalkan oleh ${session.user.username || 'staff'} (${session.user.role}) — status sebelumnya: ${pesanan.statusPesanan}`)
  } else {
    await createLog('UPDATE_ORDER_STATUS', `Status pesanan #${id} diubah dari ${pesanan.statusPesanan} → ${status} oleh ${session.user.username || 'staff'} (${session.user.role})`)
  }

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
  catatan?: string | null
  metodePembayaran?: string | null
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
  const { tokenMeja, items, namaPelanggan, catatan, metodePembayaran } = data

  const session = await auth()
  const kasirId = session?.user?.id ? Number(session.user.id) : null

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
  const transactionId = metodePembayaran && metodePembayaran !== "tunai" ? `SIM-${crypto.randomUUID()}` : null

  const pesanan = await prisma.pesanan.create({
    data: {
      mejaId: meja.id,
      kasirId,
      statusPesanan: StatusPesanan.menunggu,
      totalHarga: totalHarga,
      namaPelanggan: namaPelanggan || null,
      catatan: catatan || null,
      metodePembayaran: (metodePembayaran as MetodePembayaran) || null,
      biayaAdmin: 0,
      ppn: 0,
      midtransOrderId: publicId,
      midtransTransactionId: transactionId,
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

  const itemsSummary = items.map(i => `${i.jumlah}x menu #${i.menuId}`).join(', ')
  await createLog('CREATE_ORDER', `Pesanan baru #${pesanan.id} dari ${meja.nomorMeja}: ${itemsSummary} (Total: Rp${totalHarga.toLocaleString('id-ID')})`)

  revalidatePath("/dashboard/pesanan")
  revalidatePath(`/${tokenMeja}`)

  return { success: true, orderId: pesanan.midtransOrderId, id: pesanan.id }
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
      detailPesanan: {
        include: { menu: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
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
    updatedAt: p.updatedAt?.toISOString() || p.createdAt.toISOString(),
    items: p.detailPesanan.length,
    itemNames: p.detailPesanan.slice(0, 3).map(d => d.menu.namaMenu),
    sisaItems: Math.max(0, p.detailPesanan.length - 3),
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
  if (!session?.user || session.user.role !== 'cashier') {
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
      kasirId: parseInt(session.user.id),
    },
  })

  await createLog('PROCESS_PAYMENT', `Pembayaran pesanan #${pesananId}: Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')} (${data.metodePembayaran}) oleh ${session.user.username || 'staff'} — bayar: Rp${Number(data.jumlahBayar).toLocaleString('id-ID')}, kembalian: Rp${Number(data.kembalian).toLocaleString('id-ID')}`)

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
    updated_at: pesanan.updatedAt || pesanan.createdAt,
    waiter_username: pesanan.waiter?.username || null,
    kasir_username: pesanan.kasir?.username || null,
    nama_pelanggan: pesanan.namaPelanggan || null,
    catatan: pesanan.catatan || null,
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
    namaPelanggan: pesanan.namaPelanggan,
  }
}

export async function createMidtransPayment(publicId: string, tokenMeja: string, metode: 'qris' | 'transfer', bank: string = 'bca') {
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
  const expiryMenit = hitungExpiryMenit(metode)
  const midtransOrderId = `PRING-${publicId}`

  // Kalo udah pernah generate, skip Midtrans API
  if (pesanan.midtransTransactionId) {
    // SIM transaction — kembalikan data simulasi tanpa Midtrans API
    if (pesanan.midtransTransactionId.startsWith("SIM-")) {
      const simAdminFee = Number(pesanan.biayaAdmin) || hitungAdminFee(metode, totalHarga)
      const simTotalBayar = totalHarga + simAdminFee
      const simExpiry = hitungExpiryMenit(metode)

      if (metode === "qris") {
        const simQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SIMULASI-QRIS-${publicId}`
        return {
          success: true,
          payment_type: "gopay" as const,
          qr_url: simQrUrl,
          transaction_id: pesanan.midtransTransactionId,
          adminFee: simAdminFee,
          totalBayar: simTotalBayar,
          expiryMenit: simExpiry,
        }
      }

      if (metode === "transfer") {
        const simBank = bank || "bca"
        return {
          success: true,
          payment_type: "bank_transfer" as const,
          bank: simBank,
          va_number: "SIM-" + publicId.replace(/-/g, "").slice(0, 12),
          biller_code: simBank === "mandiri" ? "70012" : null,
          transaction_id: pesanan.midtransTransactionId,
          adminFee: simAdminFee,
          totalBayar: simTotalBayar,
          expiryMenit: simExpiry,
        }
      }
    }

    const { checkMidtransTransaction } = await import("@/lib/midtrans")
    const result = await checkMidtransTransaction(midtransOrderId)

    if (!result.success) {
      return { error: "Transaksi tidak ditemukan" }
    }

    const data = result.data as Record<string, unknown>

    if (metode === "transfer") {
      const vaNumbers = data.va_numbers as Array<{ bank: string; va_number: string }> | undefined
      const permataVa = data.permata_va_number as string | undefined
      const billKey = data.bill_key as string | undefined
      const billerCode = data.biller_code as string | undefined
      const actualPaymentType = data.payment_type as string | undefined

      let vaNumber: string | null = null
      let actualBank = "bca"

      if (actualPaymentType === "echannel" && billKey) {
        vaNumber = billKey
        actualBank = "mandiri"
      } else if (permataVa) {
        vaNumber = permataVa
        actualBank = "permata"
      } else if (vaNumbers?.[0]) {
        vaNumber = vaNumbers[0].va_number || null
        actualBank = vaNumbers[0].bank || "bca"
      }

      return {
        success: true,
        payment_type: "bank_transfer" as const,
        bank: actualBank,
        va_number: vaNumber,
        biller_code: billerCode || null,
        transaction_id: data.transaction_id as string || pesanan.midtransTransactionId,
        adminFee,
        totalBayar: grossAmount,
        expiryMenit,
      }
    }

    if (metode === "qris") {
      const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
      const qrV2 = actions?.find(a => a.name === "generate-qr-code-v2")
      const qrV1 = actions?.find(a => a.name === "generate-qr-code")
      const qrAction = qrV2 || qrV1
      const transactionId = (data.transaction_id as string) || pesanan.midtransTransactionId || ''
      let qrUrl: string | null = qrAction?.url || null

      if (!qrUrl && transactionId) {
        const baseUrl = process.env.NODE_ENV === "production"
          ? "https://api.midtrans.com"
          : "https://api.sandbox.midtrans.com"
        qrUrl = `${baseUrl}/v2/gopay/${transactionId}/qr-code`
      }

      return {
        success: true,
        payment_type: "gopay" as const,
        qr_url: qrUrl,
        transaction_id: transactionId,
        adminFee,
        totalBayar: grossAmount,
        expiryMenit,
      }
    }

    return { error: "Metode pembayaran tidak didukung" }
  }

  // First time: call Midtrans API
  const paymentType = metode === "transfer"
    ? (bank === "mandiri" ? "echannel" as const : "bank_transfer" as const)
    : "gopay" as const
  const { createCorePayment } = await import("@/lib/midtrans")
  const result = await createCorePayment({
    order_id: midtransOrderId,
    gross_amount: grossAmount,
    payment_type: paymentType,
    bank: metode === "transfer" ? bank : undefined,
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
    expiry: { duration: expiryMenit, unit: "minute" },
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
          updatedAt: new Date(),
        },
      })
      return buildPaymentResult(metode, data, adminFee, grossAmount, data.transaction_id as string, expiryMenit)
    }

    // Simulation fallback for sandbox/development (Midtrans not active)
    if (process.env.NODE_ENV !== "production") {
      const simTransactionId = `SIM-${crypto.randomUUID()}`

      if (metode === "qris") {
        const simQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SIMULASI-QRIS-${publicId}`

        await prisma.pesanan.update({
          where: { id: pesanan.id },
          data: {
            metodePembayaran: metode as MetodePembayaran,
            midtransTransactionId: simTransactionId,
            biayaAdmin: adminFee,
            ppn: 0,
            updatedAt: new Date(),
          },
        })

        return {
          success: true,
          payment_type: "gopay" as const,
          qr_url: simQrUrl,
          transaction_id: simTransactionId,
          adminFee,
          totalBayar: grossAmount,
          expiryMenit,
        }
      }

      if (metode === "transfer") {
        const simBank = bank || "bca"
        await prisma.pesanan.update({
          where: { id: pesanan.id },
          data: {
            metodePembayaran: metode as MetodePembayaran,
            midtransTransactionId: simTransactionId,
            biayaAdmin: adminFee,
            ppn: 0,
            updatedAt: new Date(),
          },
        })

        return {
          success: true,
          payment_type: "bank_transfer" as const,
          bank: simBank,
          va_number: "SIM-" + publicId.replace(/-/g, "").slice(0, 12),
          biller_code: simBank === "mandiri" ? "70012" : null,
          transaction_id: simTransactionId,
          adminFee,
          totalBayar: grossAmount,
          expiryMenit,
        }
      }
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
      updatedAt: new Date(),
    },
  })

  return buildPaymentResult(metode, data, adminFee, grossAmount, data.transaction_id as string, expiryMenit)
}

function buildPaymentResult(
  metode: 'qris' | 'transfer',
  data: Record<string, unknown>,
  adminFee: number,
  totalBayar: number,
  transactionId: string | null,
  expiryMenit: number,
) {
  if (metode === "transfer") {
    const vaNumbers = data.va_numbers as Array<{ bank: string; va_number: string }> | undefined
    const permataVa = data.permata_va_number as string | undefined
    const billKey = data.bill_key as string | undefined
    const billerCode = data.biller_code as string | undefined
    const actualPaymentType = data.payment_type as string | undefined

    let vaNumber: string | null = null
    let actualBank = "bca"

    if (actualPaymentType === "echannel" && billKey) {
      vaNumber = billKey
      actualBank = "mandiri"
    } else if (permataVa) {
      vaNumber = permataVa
      actualBank = "permata"
    } else if (vaNumbers?.[0]) {
      vaNumber = vaNumbers[0].va_number || null
      actualBank = vaNumbers[0].bank || "bca"
    }

    return {
      success: true,
      payment_type: "bank_transfer" as const,
      bank: actualBank,
      va_number: vaNumber,
      biller_code: billerCode || null,
      transaction_id: transactionId,
      adminFee,
      totalBayar,
      expiryMenit,
    }
  }

  if (metode === "qris") {
    const actions = data.actions as Array<{ name: string; method: string; url: string }> | undefined
    const qrV2 = actions?.find(a => a.name === "generate-qr-code-v2")
    const qrV1 = actions?.find(a => a.name === "generate-qr-code")
    const qrAction = qrV2 || qrV1
    let qrUrl: string | null = qrAction?.url || null

    if (!qrUrl && transactionId) {
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://api.midtrans.com"
        : "https://api.sandbox.midtrans.com"
      qrUrl = `${baseUrl}/v2/gopay/${transactionId}/qr-code`
    }

    return {
      success: true,
      payment_type: "gopay" as const,
      qr_url: qrUrl,
      transaction_id: transactionId,
      adminFee,
      totalBayar,
      expiryMenit,
    }
  }

  return { error: "Metode pembayaran tidak didukung" }
}

export async function checkMidtransPaymentStatus(publicId: string) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, deletedAt: null },
    select: { id: true, midtransOrderId: true, midtransTransactionId: true, statusPembayaran: true, totalHarga: true },
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  // If already paid offline (e.g. cashier processed Tunai), return success immediately
  if (pesanan.statusPembayaran === StatusBayar.berhasil) {
    return { success: true, transaction_status: "settlement", isSuccess: true }
  }

  // Simulated QRIS transaction (sandbox/development)
  if (pesanan.midtransTransactionId?.startsWith("SIM-")) {
    await prisma.pesanan.update({
      where: { id: pesanan.id },
      data: {
        statusPembayaran: StatusBayar.berhasil,
      },
    })
    await createLog('PROCESS_PAYMENT', `Pembayaran SIM-QRIS pesanan #${pesanan.id} terkonfirmasi otomatis: Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')}`)
    revalidatePath("/dashboard/kasir")
    revalidatePath("/dashboard/pesanan")
    return { success: true, transaction_status: "settlement", isSuccess: true }
  }

  if (!pesanan.midtransOrderId) {
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
          jumlahBayar: Number(result.data.gross_amount),
          kembalian: 0,
        },
      })
      await createLog('PROCESS_PAYMENT', `Pembayaran Midtrans pesanan #${pesanan.id}: Rp${Number(result.data.gross_amount).toLocaleString('id-ID')}`)
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

export async function getCustomerPaymentStatus(publicId: string) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, deletedAt: null },
    select: { statusPembayaran: true, metodePembayaran: true },
  })

  if (!pesanan) {
    return null
  }

  return {
    statusPembayaran: pesanan.statusPembayaran,
    metodePembayaran: pesanan.metodePembayaran,
  }
}

export async function checkMidtransStatusReadOnly(publicId: string) {
  const pesanan = await prisma.pesanan.findFirst({
    where: { midtransOrderId: publicId, deletedAt: null },
    select: { id: true, midtransOrderId: true, midtransTransactionId: true },
  })

  if (!pesanan?.midtransOrderId) {
    return { error: "Belum ada transaksi Midtrans" }
  }

  // Simulated QRIS transaction (sandbox/development)
  if (pesanan.midtransTransactionId?.startsWith("SIM-")) {
    return {
      success: true,
      transaction_status: "settlement",
      isSuccess: true,
      isExpired: false,
      gross_amount: 0,
    }
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
    const isExpired = status === "expire" || status === "cancel" || status === "deny" || status === "failure"

    return {
      success: true,
      transaction_status: status,
      isSuccess,
      isExpired,
      gross_amount: Number(result.data.gross_amount),
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
    include: { detailPesanan: true, meja: true }
  })

  if (!pesanan) {
    return { error: "Pesanan tidak ditemukan" }
  }

  if (pesanan.statusPesanan !== StatusPesanan.menunggu && pesanan.statusPesanan !== StatusPesanan.diproses) {
    return { error: "Pesanan belum diproses" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.pesanan.update({
      where: { id },
      data: {
        statusPesanan: StatusPesanan.selesai,
        waiterId: parseInt(session.user.id),
        updatedAt: new Date(),
      },
    })

    await tx.meja.update({
      where: { id: pesanan.mejaId },
      data: { statusMeja: 'kosong' },
    })
  })

  await createLog('UPDATE_ORDER_STATUS', `Pesanan #${id} ditandai selesai oleh ${session.user.username || 'waiter'} — meja ${pesanan.mejaId} dikosongkan`)

  revalidatePath("/dashboard/pesanan")
  revalidatePath("/dashboard/kasir")
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

  await createLog('CANCEL_ORDER_KASIR', `Pesanan #${id} dibatalkan oleh ${session.user.username || 'staff'} (${session.user.role}) via detail pesanan — status: ${pesanan.statusPesanan}, total: Rp${Number(pesanan.totalHarga).toLocaleString('id-ID')}`)

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

export async function cancelExpiredOrders() {
  const now = new Date()

  // 1. Orders that chose method but didn't pay → expired after expiry time
  const expiredWithMethod = await prisma.pesanan.findMany({
    where: {
      statusPembayaran: 'menunggu',
      metodePembayaran: { not: null },
      deletedAt: null,
    },
    select: { id: true, createdAt: true, updatedAt: true, metodePembayaran: true, midtransTransactionId: true },
  })

  for (const p of expiredWithMethod) {
    const expiryMenit = p.metodePembayaran === 'qris' ? 15 : 60
    const startTime = p.updatedAt || p.createdAt
    const expiredAt = new Date(startTime.getTime() + expiryMenit * 60000)
    if (now >= expiredAt) {
      await prisma.pesanan.update({
        where: { id: p.id },
        data: {
          statusPembayaran: 'dibatalkan',
          statusPesanan: 'dibatalkan',
          catatan: 'Expired',
        },
      })
      await createLog('CANCEL_ORDER_EXPIRED', `Pesanan #${p.id} expired (${p.metodePembayaran}, ${expiryMenit} menit)`)
      if (p.midtransTransactionId && !p.midtransTransactionId.startsWith('SIM-')) {
        try {
          const { voidMidtransTransaction } = await import("@/lib/midtrans")
          await voidMidtransTransaction(p.midtransTransactionId)
        } catch {}
      }
    }
  }

  // 2. Orders with no method chosen → expired after 1 hour
  const expiredNoMethod = await prisma.pesanan.findMany({
    where: {
      statusPembayaran: 'menunggu',
      metodePembayaran: null,
      deletedAt: null,
    },
    select: { id: true, createdAt: true },
  })

  for (const p of expiredNoMethod) {
    const expiredAt = new Date(p.createdAt.getTime() + 60 * 60000)
    if (now >= expiredAt) {
      await prisma.pesanan.update({
        where: { id: p.id },
        data: {
          statusPembayaran: 'dibatalkan',
          statusPesanan: 'dibatalkan',
          catatan: 'Tidak memilih pembayaran',
        },
      })
      await createLog('CANCEL_ORDER_EXPIRED', `Pesanan #${p.id} expired (tidak memilih pembayaran, 60 menit)`)
    }
  }

  return { success: true }
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
