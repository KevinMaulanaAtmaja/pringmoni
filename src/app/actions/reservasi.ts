"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createLog } from "@/lib/log"
import { expireReservasiLazy, getExpiryJam } from "@/lib/reservasi"
import {
  hitungBatasKonfirmasi,
  validasiWaktuKedatangan,
} from "@/lib/reservasi-jadwal"
import { triggerPusher, ORDERS_CHANNEL, PESANAN_EVENTS } from "@/lib/pusher"
import { Prisma, MetodePembayaran, StatusMeja, StatusPesanan, StatusBayar, StatusReservasi } from "@prisma/client"
import crypto from "crypto"
import { DP_PERSEN, hitungRincianDp } from "@/lib/dp"

const ALLOWED_ROLES = ["cashier"] as const
const METODE_DP = [MetodePembayaran.tunai, MetodePembayaran.qris, MetodePembayaran.transfer]

export interface CreateReservasiItem {
  menuId: number
  jumlah: number
  catatan?: string | null
}

export interface CreateReservasiData {
  mejaId: number
  namaPelanggan: string
  noHp?: string | null
  jumlahOrang: number
  waktuKedatangan: string | Date
  catatan?: string | null
  items?: CreateReservasiItem[]
  batasMenit?: number
  dpMetode?: MetodePembayaran | null
}

async function requireReservasiRole() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" as const }
  const rawRole = String(session.user.role ?? "").toLowerCase()
  const role = rawRole === "kasir" ? "cashier" : rawRole
  if (!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
    return { error: "Hanya kasir yang bisa mengelola reservasi" as const }
  }
  return { session }
}

function activeReservationStatuses(): StatusReservasi[] {
  return [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi]
}

export async function createReservasi(data: CreateReservasiData) {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult
  const { session } = authResult

  const userId = session.user.id ? parseInt(session.user.id) : null
  if (!userId) return { error: "Sesi tidak valid" }

  const {
    mejaId,
    namaPelanggan,
    noHp,
    jumlahOrang,
    waktuKedatangan,
    catatan,
    items = [],
    dpMetode,
  } = data

  const expiryJam = data.batasMenit ?? (await getExpiryJam())
  const batasMenit = expiryJam * 60

  if (!Number.isInteger(mejaId) || mejaId <= 0) {
    return { error: "Meja tidak valid" }
  }
  if (!namaPelanggan || namaPelanggan.trim() === "") {
    return { error: "Nama pelanggan wajib diisi" }
  }
  if (!Number.isInteger(jumlahOrang) || jumlahOrang < 1) {
    return { error: "Jumlah orang tidak valid" }
  }

  const waktuKedatanganDate = new Date(waktuKedatangan)
  if (Number.isNaN(waktuKedatanganDate.getTime())) {
    return { error: "Waktu kedatangan tidak valid" }
  }
  const errorJadwal = validasiWaktuKedatangan(waktuKedatanganDate)
  if (errorJadwal) {
    return { error: errorJadwal }
  }

  const meja = await prisma.meja.findFirst({
    where: { id: mejaId, deletedAt: null },
    select: { id: true, nomorMeja: true },
  })
  if (!meja) {
    return { error: "Meja tidak ditemukan" }
  }

  const reservasiAktif = await prisma.reservasi.findFirst({
    where: {
      mejaId,
      statusReservasi: { in: activeReservationStatuses() },
    },
    select: { id: true },
  })
  if (reservasiAktif) {
    return { error: "Meja sudah memiliki reservasi aktif" }
  }

  const pesananAktif = await prisma.pesanan.findFirst({
    where: {
      mejaId,
      statusPesanan: { in: [StatusPesanan.menunggu, StatusPesanan.diproses] },
      statusPembayaran: { not: StatusBayar.berhasil },
      deletedAt: null,
    },
    select: { id: true },
  })
  if (pesananAktif) {
    return { error: "Meja masih memiliki pesanan aktif" }
  }

  const jumlahPerMenu = new Map<number, number>()
  for (const item of items) {
    if (!Number.isInteger(item.menuId) || item.menuId <= 0) continue
    if (!Number.isInteger(item.jumlah) || item.jumlah <= 0) continue
    jumlahPerMenu.set(item.menuId, (jumlahPerMenu.get(item.menuId) ?? 0) + item.jumlah)
  }

  const itemPrices = new Map<number, number>()
  let totalHarga = 0

  for (const [menuId, jumlahTotal] of jumlahPerMenu) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
      select: { id: true, namaMenu: true, harga: true, statusMenu: true, stokManual: true },
    })
    if (!menu) {
      return { error: `Menu dengan ID ${menuId} tidak ditemukan` }
    }
    if (menu.statusMenu !== "tersedia") {
      return { error: `${menu.namaMenu} sedang tidak tersedia` }
    }
    if ((menu.stokManual ?? 0) < jumlahTotal) {
      return { error: `${menu.namaMenu} hanya tersisa ${menu.stokManual ?? 0} porsi` }
    }
    const harga = Number(menu.harga)
    itemPrices.set(menuId, harga)
    totalHarga += harga * jumlahTotal
  }

  if (totalHarga <= 0) {
    return { error: "Reservasi wajib memesan minimal 1 menu (DP 20% dihitung dari total pre-order)" }
  }
  if (!dpMetode || !METODE_DP.includes(dpMetode)) {
    return { error: "Metode pembayaran DP wajib dipilih" }
  }
  const rincianDp = hitungRincianDp(totalHarga)
  const dpNominal = rincianDp.dpNominal

  const batasKonfirmasi = hitungBatasKonfirmasi(
    waktuKedatanganDate,
    batasMenit / 60
  )

  const reservasi = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM meja WHERE id = ${mejaId} FOR UPDATE
    `
    const created = await tx.reservasi.create({
      data: {
        mejaId,
        namaPelanggan: namaPelanggan.trim(),
        noHp: noHp?.trim() || null,
        jumlahOrang,
        waktuKedatangan: waktuKedatanganDate,
        batasKonfirmasi,
        catatan: catatan?.trim() || null,
        statusReservasi: StatusReservasi.menunggu_kedatangan,
        createdById: userId,
        dpPersen: DP_PERSEN,
        dpNominal: new Prisma.Decimal(dpNominal),
        dpMetode,
        dpStatus: StatusBayar.berhasil,
        dpPaidAt: new Date(),
        detailReservasi: {
          create: items
            .filter((item) => itemPrices.has(item.menuId) && item.jumlah > 0)
            .map((item) => ({
              menuId: item.menuId,
              jumlah: item.jumlah,
              hargaSaatPesan: new Prisma.Decimal(itemPrices.get(item.menuId) ?? 0),
              catatanItem: item.catatan?.trim() || null,
            })),
        },
      },
    })

    await tx.meja.update({
      where: { id: mejaId },
      data: { statusMeja: StatusMeja.dipesan },
    })

    return created
  })

  await createLog(
    "CREATE_RESERVASI",
    `Reservasi #${reservasi.id} dibuat untuk ${namaPelanggan} di Meja ${meja.nomorMeja} (${jumlahOrang} org) pada ${waktuKedatanganDate.toLocaleString("id-ID")}. DP ${DP_PERSEN}% via ${dpMetode} sebesar Rp${dpNominal.toLocaleString("id-ID")}${rincianDp.pembulatan > 0 ? ` (pembulatan +Rp${rincianDp.pembulatan.toLocaleString("id-ID")})` : ""}, sisa tagihan Rp${rincianDp.sisaTagihan.toLocaleString("id-ID")}`,
    userId
  )

  revalidatePath("/dashboard/reservasi")
  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/meja")
  revalidatePath("/dashboard/pesanan")

  return {
    success: true,
    reservasiId: reservasi.id,
    totalHarga,
    dpNominal,
    sisaTagihan: rincianDp.sisaTagihan,
    pembulatan: rincianDp.pembulatan,
  }
}

export async function getReservasi(filters?: { status?: string }) {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult

  const where: Prisma.ReservasiWhereInput = {}
  if (filters?.status && filters.status !== "all") {
    where.statusReservasi = filters.status as StatusReservasi
  }

  const reservasi = await prisma.reservasi.findMany({
    where,
    include: {
      meja: { select: { nomorMeja: true } },
      createdBy: { select: { username: true } },
      confirmedBy: { select: { username: true } },
      pesanan: { select: { id: true } },
      voucher: { select: { kode: true, namaVoucher: true } },
      detailReservasi: {
        include: { menu: { select: { namaMenu: true } } },
      },
    },
    orderBy: { waktuKedatangan: "asc" },
    take: 300,
  })

  return reservasi.map((r) => ({
    id: r.id,
    kodeReservasi: r.kodeReservasi,
    sumber: r.sumber,
    mejaId: r.mejaId,
    nomorMeja: r.meja?.nomorMeja ?? "-",
    namaPelanggan: r.namaPelanggan,
    noHp: r.noHp,
    jumlahOrang: r.jumlahOrang,
    waktuKedatangan: r.waktuKedatangan,
    batasKonfirmasi: r.batasKonfirmasi,
    catatan: r.catatan,
    statusReservasi: r.statusReservasi,
    pesananId: r.pesananId ?? r.pesanan?.id ?? null,
    createdBy: r.createdBy?.username ?? null,
    confirmedBy: r.confirmedBy?.username ?? null,
    confirmedAt: r.confirmedAt,
    cancelledAt: r.cancelledAt,
    createdAt: r.createdAt,
    items: r.detailReservasi.map((d) => ({
      id: d.id,
      menuId: d.menuId,
      namaMenu: d.menu?.namaMenu ?? "-",
      jumlah: d.jumlah,
      hargaSaatPesan: Number(d.hargaSaatPesan),
      catatanItem: d.catatanItem,
    })),
    totalHarga: Math.max(
      0,
      r.detailReservasi.reduce(
        (sum, d) => sum + Number(d.hargaSaatPesan) * d.jumlah,
        0
      ) - Number(r.diskonVoucher)
    ),
    subtotalHarga: r.detailReservasi.reduce(
      (sum, d) => sum + Number(d.hargaSaatPesan) * d.jumlah,
      0
    ),
    diskonVoucher: Number(r.diskonVoucher),
    voucherKode: r.voucher?.kode ?? null,
    voucherNama: r.voucher?.namaVoucher ?? null,
    dpPersen: r.dpPersen,
    dpNominal: Number(r.dpNominal),
    dpMetode: r.dpMetode,
    dpStatus: r.dpStatus,
    dpPaidAt: r.dpPaidAt,
    dpBuktiUrl: r.dpBuktiUrl,
    alasanBatal: r.alasanBatal,
  }))
}

export async function confirmKedatanganReservasi(reservasiId: number) {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult
  const { session } = authResult

  const userId = session.user.id ? parseInt(session.user.id) : null
  if (!userId) return { error: "Sesi tidak valid" }

  if (!Number.isInteger(reservasiId) || reservasiId <= 0) {
    return { error: "Reservasi tidak valid" }
  }

  const reservasi = await prisma.reservasi.findFirst({
    where: { id: reservasiId },
    include: {
      meja: { select: { id: true, nomorMeja: true } },
      detailReservasi: {
        include: {
          menu: {
            select: {
              id: true,
              namaMenu: true,
              statusMenu: true,
              stokManual: true,
              harga: true,
            },
          },
        },
      },
    },
  })

  if (!reservasi) {
    return { error: "Reservasi tidak ditemukan" }
  }
  if (
    reservasi.statusReservasi === StatusReservasi.batal ||
    reservasi.statusReservasi === StatusReservasi.expired
  ) {
    return { error: "Reservasi sudah dibatalkan/expired" }
  }
  if (reservasi.statusReservasi === StatusReservasi.dikonfirmasi || reservasi.pesananId) {
    return { error: "Reservasi sudah dikonfirmasi menjadi pesanan" }
  }

  const now = new Date()
  const batasKonfirmasiDate = new Date(reservasi.batasKonfirmasi)
  if (Number.isNaN(batasKonfirmasiDate.getTime()) || now > batasKonfirmasiDate) {
    return { error: "Reservasi sudah expired (batas konfirmasi lewat)" }
  }

  const jumlahPerMenu = new Map<number, number>()
  for (const detail of reservasi.detailReservasi) {
    jumlahPerMenu.set(detail.menuId, (jumlahPerMenu.get(detail.menuId) ?? 0) + detail.jumlah)
  }

  for (const [menuId, jumlahTotal] of jumlahPerMenu) {
    const detail = reservasi.detailReservasi.find((d) => d.menuId === menuId)
    const menu = detail?.menu
    if (!menu) {
      return { error: `Menu dengan ID ${menuId} tidak ditemukan` }
    }
    if (menu.statusMenu !== "tersedia") {
      return { error: `${menu.namaMenu} sedang tidak tersedia` }
    }
    if ((menu.stokManual ?? 0) < jumlahTotal) {
      return { error: `${menu.namaMenu} hanya tersisa ${menu.stokManual ?? 0} porsi` }
    }
  }

  const subtotalHarga = reservasi.detailReservasi.reduce(
    (sum, d) => sum + Number(d.hargaSaatPesan) * d.jumlah,
    0
  )
  const diskonVoucher = Number(reservasi.diskonVoucher)
  const totalHarga = Math.max(0, subtotalHarga - diskonVoucher)

  const pesanan = await prisma.$transaction(async (tx) => {
    const created = await tx.pesanan.create({
      data: {
        mejaId: reservasi.mejaId,
        kasirId: userId,
        waiterId: null,
        statusPesanan: StatusPesanan.menunggu,
        totalHarga,
        dpNominal: reservasi.dpNominal,
        voucherId: reservasi.voucherId ?? null,
        diskonVoucher: new Prisma.Decimal(diskonVoucher),
        namaPelanggan: reservasi.namaPelanggan,
        catatan: reservasi.catatan,
        metodePembayaran: null,
        biayaAdmin: 0,
        ppn: 0,
        midtransOrderId: crypto.randomUUID(),
        detailPesanan: {
          create: reservasi.detailReservasi.map((d) => ({
            menuId: d.menuId,
            jumlah: d.jumlah,
            hargaSaatPesan: d.hargaSaatPesan,
            catatanItem: d.catatanItem,
          })),
        },
      },
    })

    for (const [menuId, jumlahTotal] of jumlahPerMenu) {
      const menu = await tx.menu.findUnique({
        where: { id: menuId },
        select: { stokManual: true, statusMenu: true },
      })
      if (!menu) throw new Error(`Menu dengan ID ${menuId} tidak ditemukan`)
      if (menu.statusMenu === "nonaktif") throw new Error("Menu sedang nonaktif")

      const sisaStok = (menu.stokManual ?? 0) - jumlahTotal
      if (sisaStok < 0) throw new Error("Stok tidak mencukupi")

      await tx.menu.update({
        where: { id: menuId },
        data: {
          stokManual: sisaStok,
          statusMenu: sisaStok <= 0 ? "habis" : "tersedia",
        },
      })
    }

    await tx.reservasi.update({
      where: { id: reservasiId },
      data: {
        statusReservasi: StatusReservasi.dikonfirmasi,
        pesananId: created.id,
        confirmedById: userId,
        confirmedAt: new Date(),
      },
    })

    await tx.meja.update({
      where: { id: reservasi.mejaId },
      data: { statusMeja: StatusMeja.terpakai },
    })

    return created
  })

  await createLog(
    "CONFIRM_RESERVASI",
    `Reservasi #${reservasiId} dikonfirmasi menjadi Pesanan #${pesanan.id} untuk ${reservasi.namaPelanggan} di Meja ${reservasi.meja?.nomorMeja}`,
    userId
  )

  await triggerPusher(ORDERS_CHANNEL, PESANAN_EVENTS.newOrder, {})

  revalidatePath("/dashboard/reservasi")
  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/meja")
  revalidatePath("/dashboard/pesanan")

  return { success: true, pesananId: pesanan.id }
}

export async function cancelReservasi(reservasiId: number, alasan?: string) {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult
  const { session } = authResult

  const userId = session.user.id ? parseInt(session.user.id) : null
  if (!userId) return { error: "Sesi tidak valid" }

  const reservasi = await prisma.reservasi.findFirst({
    where: { id: reservasiId },
    include: { meja: { select: { nomorMeja: true } } },
  })
  if (!reservasi) {
    return { error: "Reservasi tidak ditemukan" }
  }
  if (reservasi.pesananId) {
    return { error: "Reservasi sudah menjadi pesanan. Batalkan lewat halaman kasir/pesanan." }
  }
  if (
    reservasi.statusReservasi === StatusReservasi.batal ||
    reservasi.statusReservasi === StatusReservasi.expired
  ) {
    return { error: "Reservasi sudah dibatalkan" }
  }

  const catatanBaru = alasan?.trim()
    ? `${reservasi.catatan ? reservasi.catatan + " | " : ""}Batal: ${alasan.trim()}`
    : reservasi.catatan

  await prisma.$transaction(async (tx) => {
    await tx.reservasi.update({
      where: { id: reservasiId },
      data: {
        statusReservasi: StatusReservasi.batal,
        cancelledAt: new Date(),
        catatan: catatanBaru,
      },
    })

    await tx.meja.updateMany({
      where: { id: reservasi.mejaId, statusMeja: StatusMeja.dipesan },
      data: { statusMeja: StatusMeja.kosong },
    })
  })

  await createLog(
    "CANCEL_RESERVASI",
    `Reservasi #${reservasiId} dibatalkan (${alasan?.trim() || "tanpa alasan"}) untuk ${reservasi.namaPelanggan} di Meja ${reservasi.meja?.nomorMeja}`,
    userId
  )

  revalidatePath("/dashboard/reservasi")
  revalidatePath("/dashboard/kasir")
  revalidatePath("/dashboard/meja")
  revalidatePath("/dashboard/pesanan")

  return { success: true }
}

export async function expireReservasi() {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult

  const count = await expireReservasiLazy()

  await createLog(
    "EXPIRE_RESERVASI",
    `${count} reservasi otomatis expired karena melewati batas konfirmasi`
  )

  revalidatePath("/dashboard/reservasi")
  revalidatePath("/dashboard/meja")

  return { success: true, count }
}

export async function verifikasiDpCustomer(reservasiId: number) {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult
  const { session } = authResult

  const userId = session.user.id ? parseInt(session.user.id) : null
  if (!userId) return { error: "Sesi tidak valid" }

  if (!Number.isInteger(reservasiId) || reservasiId <= 0) {
    return { error: "Reservasi tidak valid" }
  }

  const reservasi = await prisma.reservasi.findFirst({
    where: { id: reservasiId },
    include: { meja: { select: { nomorMeja: true } } },
  })
  if (!reservasi) return { error: "Reservasi tidak ditemukan" }
  if (reservasi.dpStatus !== StatusBayar.menunggu) {
    return { error: "DP reservasi ini sudah diproses" }
  }
  if (!reservasi.dpBuktiUrl) {
    return { error: "Bukti DP belum diunggah" }
  }

  await prisma.reservasi.update({
    where: { id: reservasiId },
    data: { dpStatus: StatusBayar.berhasil, dpPaidAt: new Date(), updatedAt: new Date() },
  })

  await createLog(
    "VERIFIKASI_DP_CUSTOMER",
    `DP reservasi #${reservasiId} (${reservasi.namaPelanggan}) diverifikasi sebesar Rp${Number(
      reservasi.dpNominal
    ).toLocaleString("id-ID")} — meja ${reservasi.meja?.nomorMeja ?? "-"}`,
    userId
  )

  revalidatePath("/dashboard/reservasi")
  return { success: true }
}

export async function getMejaUntukReservasi() {
  const authResult = await requireReservasiRole()
  if ("error" in authResult) return authResult

  const meja = await prisma.meja.findMany({
    where: { deletedAt: null, statusMeja: StatusMeja.kosong },
    orderBy: { nomorMeja: "asc" },
    select: {
      id: true,
      nomorMeja: true,
      kapasitas: true,
      statusMeja: true,
      tokenMeja: true,
    },
  })

  const reservasiAktif = await prisma.reservasi.findMany({
    where: {
      statusReservasi: { in: activeReservationStatuses() },
    },
    select: {
      id: true,
      mejaId: true,
      namaPelanggan: true,
      waktuKedatangan: true,
      statusReservasi: true,
    },
  })

  const reservasiMap = new Map(reservasiAktif.map((r) => [r.mejaId, r]))

  return meja
    .filter((m) => !reservasiMap.has(m.id))
    .map((m) => ({
      id: m.id,
      nomorMeja: m.nomorMeja,
      kapasitas: m.kapasitas,
      statusMeja: m.statusMeja,
      tokenMeja: m.tokenMeja,
      reservasiAktif: null,
    }))
}
