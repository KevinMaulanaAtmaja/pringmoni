"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  MetodePembayaran,
  Prisma,
  StatusBayar,
  StatusMeja,
  StatusPesanan,
  StatusReservasi,
} from "@prisma/client"
import prisma from "@/lib/prisma"
import { hitungRincianDp } from "@/lib/dp"
import { createLogNoSession } from "@/lib/log"
import { triggerPusher, ORDERS_CHANNEL } from "@/lib/pusher"
import {
  EXPIRY_JAM_DEFAULT,
  MAKS_HARI_KE_DEPAN,
  expireReservasiLazy,
  generateKodeReservasi,
} from "@/lib/reservasi"
import { getMenusForCustomer } from "@/app/actions/pesanan"
import { getKategoriMenus } from "@/app/actions/menu"

interface ItemReservasiInput {
  menuId: number
  jumlah: number
  catatan?: string | null
}

interface CreateReservasiCustomerInput {
  tokenMeja: string
  namaPelanggan: string
  noHp: string
  jumlahOrang: number
  waktuKedatangan: string
  catatan?: string | null
  items: ItemReservasiInput[]
  dpBuktiUrl: string
  /** Honeypot — wajib kosong. */
  website?: string
}

interface RateEntry {
  attempts: number
  firstAttempt: number
  blockedUntil: number | null
}

const RATE_KEY = "__reservasiCustomerRateLimit"
const globalStore = globalThis as unknown as { [key: string]: Map<string, RateEntry> }
const rateStore = globalStore[RATE_KEY] ?? new Map<string, RateEntry>()
if (!globalStore[RATE_KEY]) globalStore[RATE_KEY] = rateStore

const JENDELA_MS = 30 * 60 * 1000
const BLOKIR_MS = 30 * 60 * 1000
const MAKS_PER_NOHP = 3
const MAKS_PER_IP = 10

function cekDanCatatRate(key: string, maks: number): { allowed: boolean; retryMenit: number } {
  const now = Date.now()
  const entry = rateStore.get(key)

  if (!entry || now - entry.firstAttempt > JENDELA_MS) {
    rateStore.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true, retryMenit: 0 }
  }
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryMenit: Math.ceil((entry.blockedUntil - now) / 60000) }
  }
  if (entry.attempts >= maks) {
    entry.blockedUntil = now + BLOKIR_MS
    rateStore.set(key, entry)
    return { allowed: false, retryMenit: Math.ceil(BLOKIR_MS / 60000) }
  }
  entry.attempts += 1
  rateStore.set(key, entry)
  return { allowed: true, retryMenit: 0 }
}

async function getIp(): Promise<string> {
  try {
    const h = await headers()
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown"
    )
  } catch {
    return "unknown"
  }
}

function normalisasiNoHp(input: string): string | null {
  const digits = (input || "").replace(/[^0-9+]/g, "")
  if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(digits)) return null
  if (digits.startsWith("+62")) return "0" + digits.slice(3)
  if (digits.startsWith("62")) return "0" + digits.slice(2)
  return digits
}

export async function getReservasiCustomerByToken(tokenMeja: string) {
  if (!tokenMeja) return { error: "Token meja tidak valid" as const }

  const meja = await prisma.meja.findFirst({
    where: { tokenMeja, deletedAt: null },
    select: { id: true, nomorMeja: true, kapasitas: true, statusMeja: true },
  })
  if (!meja) return { error: "Meja tidak ditemukan" as const }

  const [menus, kategoris, reservasiAktif, pesananAktif] = await Promise.all([
    getMenusForCustomer(),
    getKategoriMenus(),
    prisma.reservasi.findFirst({
      where: {
        mejaId: meja.id,
        statusReservasi: {
          in: [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi],
        },
      },
      select: { id: true },
    }),
    prisma.pesanan.findFirst({
      where: {
        mejaId: meja.id,
        statusPesanan: { in: [StatusPesanan.menunggu, StatusPesanan.diproses] },
        statusPembayaran: { not: StatusBayar.berhasil },
        deletedAt: null,
      },
      select: { id: true },
    }),
  ])

  return {
    meja,
    menus,
    kategoris: kategoris.map((k) => ({
      id: k.id,
      namaKategori: k.namaKategori,
      lokasi: k.lokasi,
      pilihanSuhu: k.pilihanSuhu,
    })),
    tidakBisaReservasi:
      meja.statusMeja !== StatusMeja.kosong || !!reservasiAktif || !!pesananAktif,
    expiryJam: EXPIRY_JAM_DEFAULT,
  }
}

export async function createReservasiCustomer(data: CreateReservasiCustomerInput) {
  // Honeypot: bot mengisi field tersembunyi → balas sukses palsu tanpa simpan.
  if (data.website && data.website.trim() !== "") {
    return {
      success: true as const,
      reservasiId: 0,
      kodeReservasi: generateKodeReservasi(),
      dpNominal: 0,
      totalHarga: 0,
      sisaTagihan: 0,
      batasKonfirmasi: new Date().toISOString(),
    }
  }

  const ip = await getIp()
  const noHp = normalisasiNoHp(data.noHp)
  if (!noHp) return { error: "Nomor HP tidak valid (contoh: 081234567890)" }

  const limitHp = cekDanCatatRate(`hp:${noHp}`, MAKS_PER_NOHP)
  if (!limitHp.allowed) {
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${limitHp.retryMenit} menit.` }
  }
  const limitIp = cekDanCatatRate(`ip:${ip}`, MAKS_PER_IP)
  if (!limitIp.allowed) {
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${limitIp.retryMenit} menit.` }
  }

  const nama = (data.namaPelanggan || "").trim()
  if (nama.length < 2 || nama.length > 60) {
    return { error: "Nama pelanggan wajib diisi (2–60 karakter)" }
  }

  const jumlahOrang = Number(data.jumlahOrang)
  if (!Number.isInteger(jumlahOrang) || jumlahOrang < 1) {
    return { error: "Jumlah orang tidak valid" }
  }

  const waktuKedatangan = new Date(data.waktuKedatangan)
  if (Number.isNaN(waktuKedatangan.getTime())) {
    return { error: "Waktu kedatangan tidak valid" }
  }
  const now = new Date()
  if (waktuKedatangan.getTime() < now.getTime() - 5 * 60 * 1000) {
    return { error: "Waktu kedatangan sudah lewat" }
  }
  if (waktuKedatangan.getTime() > now.getTime() + MAKS_HARI_KE_DEPAN * 24 * 60 * 60 * 1000) {
    return { error: `Waktu kedatangan maksimal ${MAKS_HARI_KE_DEPAN} hari ke depan` }
  }

  const dpBuktiUrl = (data.dpBuktiUrl || "").trim()
  if (!/^https?:\/\//i.test(dpBuktiUrl)) {
    return { error: "Bukti pembayaran DP wajib diunggah" }
  }

  const meja = await prisma.meja.findFirst({
    where: { tokenMeja: data.tokenMeja, deletedAt: null },
    select: { id: true, nomorMeja: true, kapasitas: true, statusMeja: true },
  })
  if (!meja) return { error: "Meja tidak ditemukan" }
  if (jumlahOrang > meja.kapasitas) {
    return { error: `Kapasitas meja ${meja.nomorMeja} maksimal ${meja.kapasitas} orang` }
  }

  const itemsRaw = (data.items || []).filter(
    (i) => Number.isInteger(i.menuId) && i.menuId > 0 && Number.isInteger(i.jumlah) && i.jumlah > 0
  )
  if (itemsRaw.length === 0) {
    return { error: "Pilih minimal 1 menu pre-order (DP dihitung dari total pre-order)" }
  }

  const jumlahPerMenu = new Map<number, number>()
  for (const item of itemsRaw) {
    jumlahPerMenu.set(item.menuId, (jumlahPerMenu.get(item.menuId) ?? 0) + item.jumlah)
  }

  const hargaMap = new Map<number, number>()
  let totalHarga = 0
  for (const [menuId, qty] of jumlahPerMenu) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
      select: { id: true, namaMenu: true, harga: true, statusMenu: true, stokManual: true },
    })
    if (!menu) return { error: `Menu tidak ditemukan` }
    if (menu.statusMenu !== "tersedia") return { error: `${menu.namaMenu} sedang tidak tersedia` }
    if ((menu.stokManual ?? 0) < qty) {
      return { error: `${menu.namaMenu} hanya tersisa ${menu.stokManual ?? 0} porsi` }
    }
    const harga = Number(menu.harga)
    hargaMap.set(menuId, harga)
    totalHarga += harga * qty
  }

  const rincian = hitungRincianDp(totalHarga)
  const batasKonfirmasi = new Date(
    waktuKedatangan.getTime() + EXPIRY_JAM_DEFAULT * 60 * 60 * 1000
  )

  let kode = generateKodeReservasi()
  let reservasiId: number | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM meja WHERE id = ${meja.id} FOR UPDATE`

        const mejaNow = await tx.meja.findUnique({
          where: { id: meja.id },
          select: { statusMeja: true },
        })
        if (!mejaNow || mejaNow.statusMeja !== StatusMeja.kosong) {
          throw new Error("MEJA_TERPAKAI")
        }

        const reservasiAktif = await tx.reservasi.findFirst({
          where: {
            mejaId: meja.id,
            statusReservasi: {
              in: [StatusReservasi.menunggu_kedatangan, StatusReservasi.dikonfirmasi],
            },
          },
          select: { id: true },
        })
        if (reservasiAktif) throw new Error("MEJA_TERPAKAI")

        const pesananAktif = await tx.pesanan.findFirst({
          where: {
            mejaId: meja.id,
            statusPesanan: { in: [StatusPesanan.menunggu, StatusPesanan.diproses] },
            statusPembayaran: { not: StatusBayar.berhasil },
            deletedAt: null,
          },
          select: { id: true },
        })
        if (pesananAktif) throw new Error("MEJA_TERPAKAI")

        const reservasi = await tx.reservasi.create({
          data: {
            kodeReservasi: kode,
            mejaId: meja.id,
            namaPelanggan: nama,
            noHp,
            jumlahOrang,
            waktuKedatangan,
            batasKonfirmasi,
            catatan: data.catatan?.trim() || null,
            statusReservasi: StatusReservasi.menunggu_kedatangan,
            sumber: "online",
            createdById: null,
            dpPersen: rincian.persen,
            dpNominal: new Prisma.Decimal(rincian.dpNominal),
            dpMetode: MetodePembayaran.qris,
            dpStatus: StatusBayar.menunggu,
            dpBuktiUrl,
            detailReservasi: {
              create: itemsRaw
                .filter((item) => hargaMap.has(item.menuId))
                .map((item) => ({
                  menuId: item.menuId,
                  jumlah: item.jumlah,
                  hargaSaatPesan: new Prisma.Decimal(hargaMap.get(item.menuId) ?? 0),
                  catatanItem: item.catatan?.trim() || null,
                })),
            },
          },
        })

        await tx.meja.update({
          where: { id: meja.id },
          data: { statusMeja: StatusMeja.dipesan },
        })

        return reservasi
      })

      reservasiId = created.id
      break
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = String((error.meta as { target?: unknown })?.target ?? "")
        if (target.includes("kode_reservasi")) {
          kode = generateKodeReservasi()
          continue
        }
      }
      if (error instanceof Error && error.message === "MEJA_TERPAKAI") {
        return { error: "Meja ini baru saja direservasi atau sedang dipakai. Silakan pilih meja lain." }
      }
      console.error("[createReservasiCustomer]", error)
      return { error: "Gagal membuat reservasi. Silakan coba lagi." }
    }
  }

  if (!reservasiId) {
    return { error: "Gagal membuat kode reservasi. Silakan coba lagi." }
  }

  await createLogNoSession(
    "CREATE_RESERVASI_CUSTOMER",
    `Reservasi online ${kode} oleh ${nama} (${noHp}) di Meja ${meja.nomorMeja}, ${jumlahOrang} org, kedatangan ${waktuKedatangan.toLocaleString("id-ID")}, DP Rp${rincian.dpNominal.toLocaleString("id-ID")} menunggu verifikasi`,
    null,
    ip
  )

  await triggerPusher(ORDERS_CHANNEL, "new_reservation", {
    reservasiId,
    nomorMeja: meja.nomorMeja,
  })

  revalidatePath("/dashboard/reservasi")
  revalidatePath("/dashboard/meja")

  return {
    success: true as const,
    reservasiId,
    kodeReservasi: kode,
    dpNominal: rincian.dpNominal,
    totalHarga,
    sisaTagihan: rincian.sisaTagihan,
    batasKonfirmasi: batasKonfirmasi.toISOString(),
  }
}

export async function cekStatusReservasi(kodeInput: string, noHpInput: string) {
  const kode = (kodeInput || "").trim().toUpperCase()
  const noHp = normalisasiNoHp(noHpInput)
  if (!kode) return { error: "Kode reservasi wajib diisi" }
  if (!noHp) return { error: "Nomor HP tidak valid" }

  try {
    await expireReservasiLazy()
  } catch (error) {
    console.error("[cekStatusReservasi] expire lazy gagal", error)
  }

  const reservasi = await prisma.reservasi.findFirst({
    where: { kodeReservasi: kode, noHp },
    include: {
      meja: { select: { nomorMeja: true } },
      detailReservasi: { include: { menu: { select: { namaMenu: true } } } },
    },
  })
  if (!reservasi) {
    return { error: "Reservasi tidak ditemukan. Periksa kode dan nomor HP." }
  }

  const totalHarga = reservasi.detailReservasi.reduce(
    (sum, d) => sum + Number(d.hargaSaatPesan) * d.jumlah,
    0
  )
  const dpNominal = Number(reservasi.dpNominal)

  return {
    success: true as const,
    data: {
      kodeReservasi: reservasi.kodeReservasi,
      namaPelanggan: reservasi.namaPelanggan,
      jumlahOrang: reservasi.jumlahOrang,
      nomorMeja: reservasi.meja?.nomorMeja ?? "-",
      waktuKedatangan: reservasi.waktuKedatangan.toISOString(),
      batasKonfirmasi: reservasi.batasKonfirmasi.toISOString(),
      statusReservasi: reservasi.statusReservasi,
      dpStatus: reservasi.dpStatus,
      dpNominal,
      totalHarga,
      sisaTagihan: Math.max(0, totalHarga - dpNominal),
      items: reservasi.detailReservasi.map((d) => ({
        namaMenu: d.menu?.namaMenu ?? "-",
        jumlah: d.jumlah,
        harga: Number(d.hargaSaatPesan),
      })),
    },
  }
}
