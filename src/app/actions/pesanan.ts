"use server"

import crypto from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cache } from "react"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { triggerPusher, ORDERS_CHANNEL, PESANAN_EVENTS } from "@/lib/pusher"
import { Prisma, StatusPesanan, StatusBayar, MetodePembayaran, StatusAntar } from "@prisma/client"
import { getKategoriMenus } from "./menu"
import { potongStokDapur } from "@/lib/stok"
import { butuhBumbu, hitungKetersediaanResep } from "@/lib/resep"
import { hitungPotonganDiskon } from "@/lib/voucher"

export async function updateStatusPesanan(id: number, status: StatusPesanan) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role === 'owner') {
    return { error: "Owner tidak bisa mengubah status pesanan" }
  }

  const validStatuses: StatusPesanan[] = [StatusPesanan.menunggu, StatusPesanan.diproses, StatusPesanan.selesai, StatusPesanan.dibatalkan]
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

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

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
  kodeVoucher?: string | null
}

export async function getMejaByToken(tokenMeja: string) {
  return await prisma.meja.findFirst({
    where: { tokenMeja, deletedAt: null },
  })
}

export async function getMenusForCustomer() {
  const menus = await prisma.menu.findMany({
    // Menu 'habis' tetap ditampilkan ke customer (dengan tombol pesan disabled),
    // hanya 'nonaktif' yang disembunyikan.
    where: { statusMenu: { in: ['tersedia', 'habis'] }, deletedAt: null },
    select: {
      id: true,
      namaMenu: true,
      deskripsi: true,
      harga: true,
      statusMenu: true,
      kategori: {
        select: {
          namaKategori: true,
          lokasi: true,
          pilihanSuhu: true,
        },
      },
      menuFoto: {
        select: {
          id: true,
          fotoUrl: true,
        },
        orderBy: { urutan: 'asc' },
      },
      resep: {
        select: {
          jumlah: true,
          stokBahan: {
            select: {
              namaBahan: true,
              kategori: true,
              satuan: true,
              stokQty: true,
              deletedAt: true,
            },
          },
        },
      },
    },
    orderBy: { namaMenu: 'asc' },
  })

  return menus.map(menu => {
    const bahanAktif = menu.resep
      .filter((r) => !r.stokBahan.deletedAt)
      .map((r) => ({
        namaBahan: r.stokBahan.namaBahan,
        satuan: r.stokBahan.satuan,
        jumlahPerPorsi: Number(r.jumlah),
        stokQty: Number(r.stokBahan.stokQty),
        kategori: r.stokBahan.kategori,
      }))
    const ketersediaan = hitungKetersediaanResep(
      bahanAktif,
      bahanAktif.filter((b) => b.kategori === 'bahan_utama').length,
      bahanAktif.filter((b) => b.kategori === 'bumbu').length,
      butuhBumbu(menu.kategori.namaKategori)
    )

    return {
      id: menu.id,
      namaMenu: menu.namaMenu,
      deskripsi: menu.deskripsi,
      harga: Number(menu.harga),
      kategori: menu.kategori.namaKategori,
      lokasi: menu.kategori.lokasi,
      /** Kategori ini punya pilihan panas/dingin → pelanggan memilih varian */
      pilihanSuhu: menu.kategori.pilihanSuhu,
      statusMenu: menu.statusMenu as "tersedia" | "habis" | "nonaktif",
      fotoUrl: menu.menuFoto[0]?.fotoUrl || null,
      menuFoto: menu.menuFoto.map(f => ({ id: f.id, fotoUrl: f.fotoUrl })),
      adaResep: ketersediaan.adaResep,
      resepLengkap: ketersediaan.lengkap,
      porsiTersedia: ketersediaan.porsiTersedia,
      bahanPembatas: ketersediaan.bahanPembatas,
    }
  })
}

export const getCustomerMenuData = cache(async (tokenMeja: string) => {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) {
    return { meja: null, menus: [], kategoris: [] }
  }

  const [menus, kategoris] = await Promise.all([
    getMenusForCustomer(),
    getKategoriMenus(),
  ])

  return { meja, menus, kategoris }
})

export async function createPesanan(data: CreatePesananData) {
  const { tokenMeja, items, namaPelanggan, catatan, metodePembayaran, kodeVoucher } = data

  const session = await auth()
  const kasirId = session?.user?.id ? Number(session.user.id) : null

  const meja = await getMejaByToken(tokenMeja)
  if (!meja) {
    return { error: "Token meja tidak valid" }
  }

  const pesananMenungguBayar = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPembayaran: StatusBayar.menunggu,
      metodePembayaran: { not: null },
      deletedAt: null,
    },
    select: { id: true },
  })

  if (pesananMenungguBayar) {
    return { error: "Pesanan Anda masih menunggu pembayaran. Selesaikan pembayaran terlebih dahulu sebelum memesan lagi." }
  }

  if (!items || items.length === 0) {
    return { error: "Item pesanan tidak boleh kosong" }
  }

  let totalHarga = 0
  const itemPrices: Record<number, number> = {}

  // Gabung jumlah per menu (item dengan catatan berbeda dihitung satu),
  // supaya validasi stok memakai total yang benar.
  const jumlahPerMenu = new Map<number, number>()
  for (const item of items) {
    jumlahPerMenu.set(item.menuId, (jumlahPerMenu.get(item.menuId) ?? 0) + item.jumlah)
  }

  for (const [menuId, jumlahTotal] of jumlahPerMenu) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
      include: {
        kategori: { select: { namaKategori: true } },
        resep: {
          include: { stokBahan: true },
        },
      },
    })

    if (!menu) {
      return { error: `Menu dengan ID ${menuId} tidak ditemukan` }
    }

    if (menu.statusMenu !== "tersedia") {
      return { error: `${menu.namaMenu} sedang tidak tersedia` }
    }

    const bahanAktif = menu.resep
      .filter((r) => !r.stokBahan.deletedAt)
      .map((r) => ({
        namaBahan: r.stokBahan.namaBahan,
        satuan: r.stokBahan.satuan,
        jumlahPerPorsi: Number(r.jumlah),
        stokQty: Number(r.stokBahan.stokQty),
        kategori: r.stokBahan.kategori,
      }))
    const wajibBumbu = butuhBumbu(menu.kategori?.namaKategori)
    const ketersediaan = hitungKetersediaanResep(
      bahanAktif,
      bahanAktif.filter((b) => b.kategori === 'bahan_utama').length,
      bahanAktif.filter((b) => b.kategori === 'bumbu').length,
      wajibBumbu
    )

    // Gerbang resep: makanan wajib punya bahan utama + bumbu; minuman & camilan
    // cukup bahan utama (bumbu opsional). Menu yang belum lengkap tidak boleh
    // dipesan walau statusMenu 'tersedia'.
    if (!ketersediaan.lengkap) {
      const butuh = wajibBumbu
        ? 'butuh bahan utama & bumbu'
        : 'butuh minimal 1 bahan utama'
      return { error: `${menu.namaMenu} belum dapat dipesan — resep belum lengkap (${butuh})` }
    }

    // Porsi yang boleh dipesan ditentukan stok bahan dapur, bukan hanya
    // statusMenu — ini gerbang terakhir supaya customer tidak bisa pesan
    // menu yang porsinya habis.
    if (ketersediaan.porsiTersedia <= 0) {
      return { error: `${menu.namaMenu} sedang habis — stok bahan tidak mencukupi` }
    }
    if (jumlahTotal > ketersediaan.porsiTersedia) {
      return { error: `${menu.namaMenu} hanya tersisa ${ketersediaan.porsiTersedia} porsi` }
    }

    const harga = Number(menu.harga)
    itemPrices[menuId] = harga
    totalHarga += harga * jumlahTotal
  }

  // Voucher divalidasi ulang di server — nilai dari client tidak pernah dipercaya.
  let voucherTerpakai: { id: number; kode: string; namaVoucher: string; diskonPersen: number } | null = null
  let diskonVoucher = 0

  if (kodeVoucher?.trim()) {
    const kode = kodeVoucher.trim().toUpperCase()
    const voucher = await prisma.voucher.findFirst({
      where: { kode, deletedAt: null },
    })

    if (!voucher) {
      return { error: "Kode voucher tidak ditemukan" }
    }
    if (voucher.statusVoucher !== "aktif") {
      return { error: "Voucher sedang tidak aktif" }
    }
    if (totalHarga < Number(voucher.minimalBelanja)) {
      return {
        error: `Minimal belanja untuk voucher ${voucher.kode} adalah Rp ${Number(voucher.minimalBelanja).toLocaleString("id-ID")}`,
      }
    }

    diskonVoucher = hitungPotonganDiskon(totalHarga, voucher.diskonPersen)
    totalHarga = Math.max(totalHarga - diskonVoucher, 0)
    voucherTerpakai = {
      id: voucher.id,
      kode: voucher.kode,
      namaVoucher: voucher.namaVoucher,
      diskonPersen: voucher.diskonPersen,
    }
  }

  const publicId = crypto.randomUUID()

  const pesanan = await prisma.pesanan.create({
    data: {
      mejaId: meja.id,
      kasirId,
      statusPesanan: StatusPesanan.menunggu,
      totalHarga: totalHarga,
      voucherId: voucherTerpakai?.id ?? null,
      diskonVoucher: diskonVoucher,
      namaPelanggan: namaPelanggan || null,
      catatan: catatan || null,
      metodePembayaran: (metodePembayaran as MetodePembayaran) || null,
      biayaAdmin: 0,
      ppn: 0,
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

  const itemsSummary = items.map(i => `${i.jumlah}x menu #${i.menuId}`).join(', ')
  const voucherSummary = voucherTerpakai
    ? ` | Voucher ${voucherTerpakai.kode} (${voucherTerpakai.diskonPersen}% - Rp${diskonVoucher.toLocaleString("id-ID")})`
    : ""
  await createLog('CREATE_ORDER', `Pesanan baru #${pesanan.id} dari ${meja.nomorMeja}: ${itemsSummary} (Total: Rp${totalHarga.toLocaleString('id-ID')})${voucherSummary}`)

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.newOrder, {})

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
    metodePembayaran: p.metodePembayaran,
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

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderPaid, {})

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
      voucher: true,
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
    diskon_voucher: Number(pesanan.diskonVoucher || 0),
    voucher_kode: pesanan.voucher?.kode || null,
    voucher_nama: pesanan.voucher?.namaVoucher || null,
    voucher_diskon_persen: pesanan.voucher?.diskonPersen ?? null,
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
      voucher: true,
    },
  })

  if (!pesanan) {
    return null
  }

  const diskon = Number(pesanan.diskonVoucher || 0)

  return {
    id: pesanan.id,
    items: pesanan.detailPesanan.map(item => ({
      id: item.menuId,
      namaMenu: item.menu.namaMenu,
      harga: Number(item.hargaSaatPesan),
      jumlah: item.jumlah,
      catatan: item.catatanItem,
    })),
    subtotal: Number(pesanan.totalHarga) + diskon,
    diskon,
    total: Number(pesanan.totalHarga),
    voucher: pesanan.voucher
      ? {
          kode: pesanan.voucher.kode,
          namaVoucher: pesanan.voucher.namaVoucher,
          diskonPersen: pesanan.voucher.diskonPersen,
        }
      : null,
    biayaAdmin: pesanan.biayaAdmin ? Number(pesanan.biayaAdmin) : null,
    ppn: pesanan.ppn ? Number(pesanan.ppn) : null,
    waktu: pesanan.createdAt.toISOString(),
    namaPelanggan: pesanan.namaPelanggan,
    statusPembayaran: pesanan.statusPembayaran,
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

    await potongStokDapur(tx, id, parseInt(session.user.id))
  })

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

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

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

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
      detailPesanan: { include: { menu: true } },
      meja: true,
    },
  })

  if (!pesanan) return null

  const subtotal = Number(pesanan.totalHarga)
  const adminFee = 0
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
      fotoUrl: null,
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
  if (!['tunai', 'qris'].includes(metode)) {
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

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

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

  const newStatus: StatusAntar = detail.statusAntar === 'diantar' ? 'belum' : 'diantar'

  await prisma.detailPesanan.update({
    where: { id: detailId },
    data: { statusAntar: newStatus },
  })

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

  revalidatePath("/dashboard/pesanan")

  return { success: true, statusAntar: newStatus }
}

export async function getStatusPesananAktifMeja(tokenMeja: string) {
  const meja = await getMejaByToken(tokenMeja)
  if (!meja) return null

  const pesanan = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPembayaran: StatusBayar.menunggu,
      deletedAt: null,
    },
    select: { id: true, metodePembayaran: true },
    orderBy: { createdAt: 'desc' },
  })

  return {
    adaPesananAktif: Boolean(pesanan),
    sudahPilihMetode: Boolean(pesanan?.metodePembayaran),
  }
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
    select: { id: true, mejaId: true, createdAt: true, updatedAt: true, metodePembayaran: true, midtransTransactionId: true },
  })

  for (const p of expiredWithMethod) {
    const expiryMenit = 60
    const startTime = p.updatedAt || p.createdAt
    const expiredAt = new Date(startTime.getTime() + expiryMenit * 60000)
    if (now >= expiredAt) {
      await prisma.pesanan.update({
        where: { id: p.id, statusPembayaran: 'menunggu' },
        data: {
          statusPembayaran: 'dibatalkan',
          statusPesanan: 'dibatalkan',
          catatan: 'Expired',
        },
      })
      if (p.mejaId) {
        await prisma.meja.update({
          where: { id: p.mejaId },
          data: { statusMeja: 'kosong' },
        })
      }
      await createLog('CANCEL_ORDER_EXPIRED', `Pesanan #${p.id} expired (${p.metodePembayaran}, ${expiryMenit} menit)`)
    }
  }

  // 2. Orders with no method chosen → expired after 1 hour
  const expiredNoMethod = await prisma.pesanan.findMany({
    where: {
      statusPembayaran: 'menunggu',
      metodePembayaran: null,
      deletedAt: null,
    },
    select: { id: true, mejaId: true, createdAt: true },
  })

  for (const p of expiredNoMethod) {
    const expiredAt = new Date(p.createdAt.getTime() + 60 * 60000)
    if (now >= expiredAt) {
      await prisma.pesanan.update({
        where: { id: p.id, statusPembayaran: 'menunggu' },
        data: {
          statusPembayaran: 'dibatalkan',
          statusPesanan: 'dibatalkan',
          catatan: 'Tidak memilih pembayaran',
        },
      })
      if (p.mejaId) {
        await prisma.meja.update({
          where: { id: p.mejaId },
          data: { statusMeja: 'kosong' },
        })
      }
      await createLog('CANCEL_ORDER_EXPIRED', `Pesanan #${p.id} expired (tidak memilih pembayaran, 60 menit)`)
    }
  }

  return { success: true }
}

export interface MejaTersediaPindah {
  id: number
  nomorMeja: string
  tipeMeja: "lesehan" | "kursi"
  kapasitas: number
  tokenMeja: string
}

export async function getMejaTersediaPindah(tokenMejaSaatIni: string): Promise<
  { mejaSaatIni: { nomorMeja: string; kapasitas: number }; daftar: MejaTersediaPindah[] } | { error: string }
> {
  const meja = await getMejaByToken(tokenMejaSaatIni)
  if (!meja) return { error: "Token meja tidak valid" }

  // Hanya boleh pindah jika ada pesanan aktif yang BELUM dibayar
  const pesananAktif = await prisma.pesanan.findFirst({
    where: {
      mejaId: meja.id,
      statusPembayaran: StatusBayar.menunggu,
      deletedAt: null,
    },
    select: { id: true },
  })
  if (!pesananAktif) {
    return { error: "Tidak ada pesanan aktif yang bisa dipindah di meja ini" }
  }

  const mejaTersedia = await prisma.meja.findMany({
    where: {
      statusMeja: "kosong",
      deletedAt: null,
      id: { not: meja.id },
    },
    select: {
      id: true,
      nomorMeja: true,
      kapasitas: true,
      tokenMeja: true,
    },
    orderBy: { nomorMeja: "asc" },
  })

  return {
    mejaSaatIni: { nomorMeja: meja.nomorMeja, kapasitas: meja.kapasitas },
    daftar: mejaTersedia.map((m) => ({
      id: m.id,
      nomorMeja: m.nomorMeja,
      tipeMeja: m.nomorMeja.startsWith("L") ? ("lesehan" as const) : ("kursi" as const),
      kapasitas: m.kapasitas,
      tokenMeja: m.tokenMeja!,
    })),
  }
}

export async function pindahMeja(
  tokenMejaSaatIni: string,
  tokenMejaBaru: string
): Promise<
  { success: true; nomorMejaBaru: string; tokenMejaBaru: string } | { error: string }
> {
  if (!tokenMejaBaru?.trim()) return { error: "Meja tujuan belum dipilih" }
  if (tokenMejaBaru === tokenMejaSaatIni) {
    return { error: "Tidak bisa pindah ke meja yang sama" }
  }

  const mejaLama = await getMejaByToken(tokenMejaSaatIni)
  if (!mejaLama) return { error: "Token meja asal tidak valid" }

  const mejaBaru = await getMejaByToken(tokenMejaBaru)
  if (!mejaBaru) return { error: "Meja tujuan tidak ditemukan" }
  if (mejaBaru.statusMeja !== "kosong") {
    return { error: "Meja tujuan sudah terpakai, silahkan pilih meja lain" }
  }

  // Hanya boleh pindah jika pesanan aktif BELUM dibayar.
  // Setelah pembayaran berhasil, meja terkunci → harus konfirmasi kasir.
  const pesananAktif = await prisma.pesanan.findFirst({
    where: {
      mejaId: mejaLama.id,
      statusPembayaran: StatusBayar.menunggu,
      deletedAt: null,
    },
  })
  if (!pesananAktif) {
    return { error: "Tidak ada pesanan aktif yang bisa dipindah" }
  }

  await prisma.$transaction([
    prisma.pesanan.update({
      where: { id: pesananAktif.id },
      data: { mejaId: mejaBaru.id },
    }),
    prisma.meja.update({
      where: { id: mejaLama.id },
      data: { statusMeja: "kosong" },
    }),
    prisma.meja.update({
      where: { id: mejaBaru.id },
      data: { statusMeja: "terpakai" },
    }),
  ])

  await createLog(
    "PINDAH_MEJA",
    `Pesanan #${pesananAktif.id} dipindah dari meja ${mejaLama.nomorMeja} ke meja ${mejaBaru.nomorMeja}`
  )
  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.orderUpdated, {})

  revalidatePath("/dashboard/pesanan")
  revalidatePath(`/${tokenMejaSaatIni}`)
  revalidatePath(`/${tokenMejaBaru}`)

  return { success: true, nomorMejaBaru: mejaBaru.nomorMeja, tokenMejaBaru }
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
