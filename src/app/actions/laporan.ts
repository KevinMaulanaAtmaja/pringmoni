"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { ItemLaporanPesanan, MenuTerlaris, GrafikPoint, PerbandinganData, KategoriAnalisis, AnalisisTambahan, BandingData } from "@/types"

function getDateRange(periode: string, dateStr: string): { startDate: Date; endDate: Date; label: string } {
  const date = new Date(dateStr)
  let startDate: Date, endDate: Date, label: string

  switch (periode) {
    case "harian": {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      label = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      break
    }
    case "mingguan": {
      const dayOfWeek = date.getDay()
      startDate = new Date(date)
      startDate.setDate(date.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)
      label = `Minggu ${date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
      break
    }
    case "bulanan": {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      label = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      break
    }
    case "tahunan": {
      startDate = new Date(date.getFullYear(), 0, 1)
      endDate = new Date(date.getFullYear() + 1, 0, 1)
      label = `${date.getFullYear()}`
      break
    }
    default: {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      label = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }
  }

  return { startDate, endDate, label }
}

function mapPesananToItem(p: any): ItemLaporanPesanan {
  return {
    id: p.id,
    nomorMeja: p.meja?.nomorMeja || "-",
    namaPelanggan: p.namaPelanggan,
    totalHarga: Number(p.totalHarga),
    statusPesanan: p.statusPesanan,
    metodePembayaran: p.metodePembayaran,
    statusPembayaran: p.statusPembayaran,
    createdAt: p.createdAt,
    kasirUsername: p.kasir?.username || null,
    waiterUsername: p.waiter?.username || null,
    items: p.detailPesanan?.map((d: any) => ({
      namaMenu: d.menu?.namaMenu || "Unknown",
      jumlah: d.jumlah,
      hargaSaatPesan: Number(d.hargaSaatPesan),
    })) || [],
  }
}

export async function getLaporanPendapatan(
  periode: string,
  dateStr: string
): Promise<{
  pendapatan: {
    periode: string
    label: string
    totalPendapatan: number
    totalPesanan: number
    totalItemTerjual: number
    tunai: number
    qris: number
    transfer: number
    rataRataPesanan: number
    detailPesanan: ItemLaporanPesanan[]
  }
}> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return {
      pendapatan: {
        periode, label: "", totalPendapatan: 0, totalPesanan: 0,
        totalItemTerjual: 0, tunai: 0, qris: 0, transfer: 0,
        rataRataPesanan: 0, detailPesanan: [],
      },
    }
  }

  const { startDate, endDate, label } = getDateRange(periode, dateStr)

  const pesananList = await prisma.pesanan.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      deletedAt: null,
    },
    include: {
      meja: true,
      kasir: true,
      waiter: true,
      detailPesanan: { include: { menu: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalPendapatan = pesananList
    .filter(p => p.statusPembayaran === "berhasil")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const totalItemTerjual = pesananList
    .filter(p => p.statusPembayaran === "berhasil")
    .reduce((sum, p) => sum + p.detailPesanan.reduce((s, d) => s + d.jumlah, 0), 0)

  const tunai = pesananList
    .filter(p => p.statusPembayaran === "berhasil" && p.metodePembayaran === "tunai")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const qris = pesananList
    .filter(p => p.statusPembayaran === "berhasil" && p.metodePembayaran === "qris")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const transfer = pesananList
    .filter(p => p.statusPembayaran === "berhasil" && p.metodePembayaran === "transfer")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const pesananBerhasil = pesananList.filter(p => p.statusPembayaran === "berhasil").length
  const rataRataPesanan = pesananBerhasil > 0 ? Math.round(totalPendapatan / pesananBerhasil) : 0

  return {
    pendapatan: {
      periode,
      label,
      totalPendapatan,
      totalPesanan: pesananList.length,
      totalItemTerjual,
      tunai,
      qris,
      transfer,
      rataRataPesanan,
      detailPesanan: pesananList.map(mapPesananToItem),
    },
  }
}

export async function getLaporanMenuTerlaris(
  periode: string,
  dateStr: string
): Promise<{ menus: MenuTerlaris[] }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { menus: [] }
  }

  const { startDate, endDate } = getDateRange(periode, dateStr)

  const detailItems = await prisma.detailPesanan.findMany({
    where: {
      pesanan: {
        createdAt: { gte: startDate, lt: endDate },
        statusPembayaran: "berhasil",
        deletedAt: null,
      },
    },
    include: {
      menu: { include: { kategori: true } },
    },
  })

  const menuMap = new Map<string, { terjual: number; pendapatan: number; kategori: string }>()

  for (const item of detailItems) {
    const nama = item.menu.namaMenu
    const existing = menuMap.get(nama) || { terjual: 0, pendapatan: 0, kategori: item.menu.kategori?.namaKategori || "-" }
    existing.terjual += item.jumlah
    existing.pendapatan += Number(item.hargaSaatPesan) * item.jumlah
    menuMap.set(nama, existing)
  }

  const menus: MenuTerlaris[] = Array.from(menuMap.entries())
    .map(([namaMenu, data]) => ({
      namaMenu,
      kategori: data.kategori,
      totalTerjual: data.terjual,
      totalPendapatan: data.pendapatan,
    }))
    .sort((a, b) => b.totalTerjual - a.totalTerjual)

  return { menus }
}

export async function getLaporanKasir(
  periode: string,
  dateStr: string
): Promise<{
  laporanKasir: {
    periode: string
    label: string
    daftarKasir: Array<{
      username: string
      totalTransaksi: number
      totalPendapatan: number
      tunai: number
      qris: number
      transfer: number
      rataRata: number
    }>
  }
}> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return {
      laporanKasir: { periode, label: "", daftarKasir: [] },
    }
  }

  const { startDate, endDate, label } = getDateRange(periode, dateStr)

  const pesananList = await prisma.pesanan.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      kasirId: { not: null },
      statusPembayaran: "berhasil",
      deletedAt: null,
    },
    include: { kasir: true },
  })

  const kasirMap = new Map<string, {
    transaksi: number
    pendapatan: number
    tunai: number
    qris: number
    transfer: number
  }>()

  for (const p of pesananList) {
    const username = p.kasir?.username || "Unknown"
    const existing = kasirMap.get(username) || {
      transaksi: 0, pendapatan: 0, tunai: 0, qris: 0, transfer: 0,
    }
    existing.transaksi += 1
    existing.pendapatan += Number(p.totalHarga)

    if (p.metodePembayaran === "tunai") existing.tunai += Number(p.totalHarga)
    else if (p.metodePembayaran === "qris") existing.qris += Number(p.totalHarga)
    else if (p.metodePembayaran === "transfer") existing.transfer += Number(p.totalHarga)

    kasirMap.set(username, existing)
  }

  const daftarKasir = Array.from(kasirMap.entries())
    .map(([username, data]) => ({
      username,
      totalTransaksi: data.transaksi,
      totalPendapatan: data.pendapatan,
      tunai: data.tunai,
      qris: data.qris,
      transfer: data.transfer,
      rataRata: data.transaksi > 0 ? Math.round(data.pendapatan / data.transaksi) : 0,
    }))
    .sort((a, b) => b.totalPendapatan - a.totalPendapatan)

  return {
    laporanKasir: { periode, label, daftarKasir },
  }
}

function getPreviousDateRange(periode: string, dateStr: string): { startDate: Date; endDate: Date } {
  const date = new Date(dateStr)

  switch (periode) {
    case "harian": {
      const prev = new Date(date)
      prev.setDate(prev.getDate() - 1)
      return {
        startDate: new Date(prev.getFullYear(), prev.getMonth(), prev.getDate()),
        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      }
    }
    case "mingguan": {
      const prev = new Date(date)
      prev.setDate(prev.getDate() - 7)
      return {
        startDate: new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - prev.getDay()),
        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()),
      }
    }
    case "bulanan": {
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
      return {
        startDate: prevMonth,
        endDate: new Date(date.getFullYear(), date.getMonth(), 1),
      }
    }
    case "tahunan": {
      return {
        startDate: new Date(date.getFullYear() - 1, 0, 1),
        endDate: new Date(date.getFullYear(), 0, 1),
      }
    }
    default:
      return { startDate: new Date(0), endDate: new Date(0) }
  }
}

function groupLabel(periode: string, d: Date): string {
  switch (periode) {
    case "harian":
      return `${String(d.getHours()).padStart(2, "0")}:00`
    case "mingguan":
      return d.toLocaleDateString("id-ID", { weekday: "short" })
    case "bulanan": {
      const day = d.getDate()
      if (day <= 7) return "Minggu 1"
      if (day <= 14) return "Minggu 2"
      if (day <= 21) return "Minggu 3"
      if (day <= 28) return "Minggu 4"
      return "Minggu 5"
    }
    case "tahunan":
      return d.toLocaleDateString("id-ID", { month: "short" })
    default:
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }
}

export async function getGrafikPendapatan(
  periode: string,
  dateStr: string
): Promise<{ grafik: GrafikPoint[] }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { grafik: [] }
  }

  const { startDate, endDate } = getDateRange(periode, dateStr)

  const pesananList = await prisma.pesanan.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      deletedAt: null,
    },
    select: {
      totalHarga: true,
      statusPembayaran: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const groupMap = new Map<string, { pendapatan: number; pesanan: number }>()

  for (const p of pesananList) {
    const label = groupLabel(periode, p.createdAt)
    const existing = groupMap.get(label) || { pendapatan: 0, pesanan: 0 }
    if (p.statusPembayaran === "berhasil") {
      existing.pendapatan += Number(p.totalHarga)
    }
    existing.pesanan += 1
    groupMap.set(label, existing)
  }

  const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => {
    if (periode === "harian") return a.localeCompare(b)
    if (periode === "bulanan") {
      const wa = parseInt(a.replace("Minggu ", ""))
      const wb = parseInt(b.replace("Minggu ", ""))
      return wa - wb
    }
    if (periode === "tahunan") {
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
      return months.indexOf(a) - months.indexOf(b)
    }
    return a.localeCompare(b, "id")
  })

  return {
    grafik: sortedKeys.map(label => ({
      label,
      pendapatan: groupMap.get(label)?.pendapatan || 0,
      pesanan: groupMap.get(label)?.pesanan || 0,
    })),
  }
}

export async function getPerbandingan(
  periode: string,
  dateStr: string
): Promise<{ perbandingan: PerbandinganData | null }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { perbandingan: null }
  }

  const { startDate, endDate, label } = getDateRange(periode, dateStr)
  const prev = getPreviousDateRange(periode, dateStr)

  const [currentData, prevData] = await Promise.all([
    prisma.pesanan.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
        deletedAt: null,
      },
      select: { totalHarga: true, statusPembayaran: true },
    }),
    prisma.pesanan.findMany({
      where: {
        createdAt: { gte: prev.startDate, lt: prev.endDate },
        deletedAt: null,
      },
      select: { totalHarga: true, statusPembayaran: true },
    }),
  ])

  const nominalSekarang = currentData
    .filter(p => p.statusPembayaran === "berhasil")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const nominalSebelumnya = prevData
    .filter(p => p.statusPembayaran === "berhasil")
    .reduce((sum, p) => sum + Number(p.totalHarga), 0)

  const pesananSekarang = currentData.length
  const pesananSebelumnya = prevData.length

  const prevLabel = (() => {
    switch (periode) {
      case "harian": {
        const d = new Date(dateStr)
        d.setDate(d.getDate() - 1)
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      }
      case "mingguan": return "Minggu lalu"
      case "bulanan": {
        const d = new Date(dateStr)
        d.setMonth(d.getMonth() - 1)
        return d.toLocaleDateString("id-ID", { month: "long" })
      }
      case "tahunan": return `${new Date(dateStr).getFullYear() - 1}`
      default: return "Periode lalu"
    }
  })()

  const growthPendapatan = nominalSebelumnya > 0
    ? Math.round(((nominalSekarang - nominalSebelumnya) / nominalSebelumnya) * 100)
    : nominalSekarang > 0 ? 100 : 0

  const growthPesanan = pesananSebelumnya > 0
    ? Math.round(((pesananSekarang - pesananSebelumnya) / pesananSebelumnya) * 100)
    : pesananSekarang > 0 ? 100 : 0

  return {
    perbandingan: {
      periodeSebelumnya: prevLabel,
      nominalSebelumnya,
      nominalSekarang,
      pesananSebelumnya,
      pesananSekarang,
      growthPendapatan,
      growthPesanan,
    },
  }
}

export async function getLaporanKategori(
  periode: string,
  dateStr: string
): Promise<{ kategori: KategoriAnalisis[] }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { kategori: [] }
  }

  const { startDate, endDate } = getDateRange(periode, dateStr)

  const detailItems = await prisma.detailPesanan.findMany({
    where: {
      pesanan: {
        createdAt: { gte: startDate, lt: endDate },
        statusPembayaran: "berhasil",
        deletedAt: null,
      },
    },
    include: {
      menu: { include: { kategori: true } },
    },
  })

  const kategoriMap = new Map<string, { terjual: number; pendapatan: number }>()
  let totalPendapatan = 0

  for (const item of detailItems) {
    const nama = item.menu.kategori?.namaKategori || "Tanpa Kategori"
    const existing = kategoriMap.get(nama) || { terjual: 0, pendapatan: 0 }
    existing.terjual += item.jumlah
    existing.pendapatan += Number(item.hargaSaatPesan) * item.jumlah
    kategoriMap.set(nama, existing)
    totalPendapatan += Number(item.hargaSaatPesan) * item.jumlah
  }

  const kategori: KategoriAnalisis[] = Array.from(kategoriMap.entries())
    .map(([namaKategori, data]) => ({
      namaKategori,
      totalTerjual: data.terjual,
      totalPendapatan: data.pendapatan,
      persentase: totalPendapatan > 0 ? Math.round((data.pendapatan / totalPendapatan) * 100) : 0,
    }))
    .sort((a, b) => b.totalPendapatan - a.totalPendapatan)

  return { kategori }
}

export async function getAnalisisTambahan(
  periode: string,
  dateStr: string
): Promise<{ analisis: AnalisisTambahan }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return { analisis: { cancelRate: 0, totalBatal: 0, totalPesanan: 0, rataItemPerPesanan: 0 } }
  }

  const { startDate, endDate } = getDateRange(periode, dateStr)

  const [allPesanan, detailItems] = await Promise.all([
    prisma.pesanan.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
        deletedAt: null,
      },
      select: { id: true, statusPesanan: true },
    }),
    prisma.detailPesanan.findMany({
      where: {
        pesanan: {
          createdAt: { gte: startDate, lt: endDate },
          deletedAt: null,
          statusPembayaran: "berhasil",
        },
      },
      select: { jumlah: true, pesananId: true },
    }),
  ])

  const totalPesanan = allPesanan.length
  const totalBatal = allPesanan.filter(p => p.statusPesanan === "dibatalkan").length
  const cancelRate = totalPesanan > 0 ? Math.round((totalBatal / totalPesanan) * 100) : 0

  const itemMap = new Map<number, number>()
  for (const d of detailItems) {
    itemMap.set(d.pesananId, (itemMap.get(d.pesananId) || 0) + d.jumlah)
  }
  const totalItems = Array.from(itemMap.values()).reduce((a, b) => a + b, 0)
  const rataItemPerPesanan = itemMap.size > 0 ? Math.round(totalItems / itemMap.size) : 0

  return {
    analisis: { cancelRate, totalBatal, totalPesanan, rataItemPerPesanan },
  }
}

export async function getLaporanAll(
  periode: string,
  dateStr: string
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    return {
      pendapatan: { periode: "", label: "", totalPendapatan: 0, totalPesanan: 0, totalItemTerjual: 0, tunai: 0, qris: 0, transfer: 0, rataRataPesanan: 0, detailPesanan: [] },
      menuTerlaris: [],
      laporanKasir: { periode: "", label: "", daftarKasir: [] },
      grafik: [],
      perbandingan: null,
      kategori: [],
      analisis: { cancelRate: 0, totalBatal: 0, totalPesanan: 0, rataItemPerPesanan: 0 },
    }
  }

  const [pendapatan, menus, kasir, grafik, perbandingan, kategori, analisis] = await Promise.all([
    getLaporanPendapatan(periode, dateStr),
    getLaporanMenuTerlaris(periode, dateStr),
    getLaporanKasir(periode, dateStr),
    getGrafikPendapatan(periode, dateStr),
    getPerbandingan(periode, dateStr),
    getLaporanKategori(periode, dateStr),
    getAnalisisTambahan(periode, dateStr),
  ])

  return {
    pendapatan: pendapatan.pendapatan,
    menuTerlaris: menus.menus,
    laporanKasir: kasir.laporanKasir,
    grafik: grafik.grafik,
    perbandingan: perbandingan.perbandingan,
    kategori: kategori.kategori,
    analisis: analisis.analisis,
  }
}

export async function getLaporanBanding(
  periode: string,
  dateStr1: string,
  dateStr2: string
): Promise<{ periode1: BandingData; periode2: BandingData }> {
  const session = await auth()
  const kosong: BandingData = {
    label: "", pendapatan: 0, pesanan: 0, itemTerjual: 0,
    rataRata: 0, tunai: 0, qris: 0, transfer: 0,
    cancelRate: 0, topMenu: [], grafik: [],
  }
  if (!session?.user || session.user.role !== "owner") {
    return { periode1: kosong, periode2: kosong }
  }

  const fetchOne = async (dateStr: string) => {
    const { startDate, endDate, label } = getDateRange(periode, dateStr)
    const prev = getPreviousDateRange(periode, dateStr)

    const [allPesanan, detailItems] = await Promise.all([
      prisma.pesanan.findMany({
        where: { createdAt: { gte: startDate, lt: endDate }, deletedAt: null },
        include: { meja: true, detailPesanan: { include: { menu: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.detailPesanan.findMany({
        where: {
          pesanan: { createdAt: { gte: startDate, lt: endDate }, statusPembayaran: "berhasil", deletedAt: null },
        },
        include: { menu: { include: { kategori: true } } },
      }),
    ])

    const berhasil = allPesanan.filter(p => p.statusPembayaran === "berhasil")
    const pendapatanTotal = berhasil.reduce((s, p) => s + Number(p.totalHarga), 0)
    const itemTerjual = berhasil.reduce((s, p) => s + p.detailPesanan.reduce((s2, d) => s2 + d.jumlah, 0), 0)
    const tunai = berhasil.filter(p => p.metodePembayaran === "tunai").reduce((s, p) => s + Number(p.totalHarga), 0)
    const qris = berhasil.filter(p => p.metodePembayaran === "qris").reduce((s, p) => s + Number(p.totalHarga), 0)
    const transfer = berhasil.filter(p => p.metodePembayaran === "transfer").reduce((s, p) => s + Number(p.totalHarga), 0)
    const rataRata = berhasil.length > 0 ? Math.round(pendapatanTotal / berhasil.length) : 0
    const batal = allPesanan.filter(p => p.statusPesanan === "dibatalkan").length
    const cancelRate = allPesanan.length > 0 ? Math.round((batal / allPesanan.length) * 100) : 0

    // Menu ranking
    const menuMap = new Map<string, { terjual: number; pendapatan: number; kategori: string }>()
    for (const d of detailItems) {
      const nama = d.menu.namaMenu
      const existing = menuMap.get(nama) || { terjual: 0, pendapatan: 0, kategori: d.menu.kategori?.namaKategori || "-" }
      existing.terjual += d.jumlah
      existing.pendapatan += Number(d.hargaSaatPesan) * d.jumlah
      menuMap.set(nama, existing)
    }
    const topMenu: MenuTerlaris[] = Array.from(menuMap.entries())
      .map(([namaMenu, data]) => ({ namaMenu, kategori: data.kategori, totalTerjual: data.terjual, totalPendapatan: data.pendapatan }))
      .sort((a, b) => b.totalTerjual - a.totalTerjual)
      .slice(0, 5)

    // Grafik
    const grafikMap = new Map<string, { pendapatan: number; pesanan: number }>()
    for (const p of allPesanan) {
      const gLabel = groupLabel(periode, p.createdAt)
      const existing = grafikMap.get(gLabel) || { pendapatan: 0, pesanan: 0 }
      if (p.statusPembayaran === "berhasil") existing.pendapatan += Number(p.totalHarga)
      existing.pesanan += 1
      grafikMap.set(gLabel, existing)
    }
    const grafik: GrafikPoint[] = Array.from(grafikMap.entries()).map(([label, data]) => ({ label, ...data }))

    return {
      label, pendapatan: pendapatanTotal, pesanan: allPesanan.length,
      itemTerjual, rataRata, tunai, qris, transfer, cancelRate, topMenu, grafik,
    }
  }

  const [periode1, periode2] = await Promise.all([fetchOne(dateStr1), fetchOne(dateStr2)])
  return { periode1, periode2 }
}


