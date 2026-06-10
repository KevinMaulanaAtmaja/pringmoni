import { jsPDF } from "jspdf"
import ExcelJS from "exceljs"
import type { ItemLaporanPesanan, MenuTerlaris } from "@/types"

interface KasirExport {
  username: string
  totalTransaksi: number
  totalPendapatan: number
  tunai: number
  qris: number
  transfer: number
  rataRata: number
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

function centerText(doc: jsPDF, text: string, y: number, size = 10) {
  doc.setFontSize(size)
  const pageWidth = doc.internal.pageSize.getWidth()
  const textWidth = doc.getTextWidth(text)
  doc.text(text, (pageWidth - textWidth) / 2, y)
}

function headerLaporan(doc: jsPDF, title: string, label: string) {
  doc.setFont("helvetica", "bold")
  centerText(doc, "PRINGMONI", 15, 16)
  centerText(doc, "Restoran Pringsewu", 22, 9)
  doc.setFont("helvetica", "normal")
  centerText(doc, title, 29, 11)
  centerText(doc, label, 35, 9)
  doc.setDrawColor(180)
  doc.setLineWidth(0.5)
  doc.line(10, 38, doc.internal.pageSize.getWidth() - 10, 38)
  return 42
}

function footerLaporan(doc: jsPDF, pageY: number) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (pageY > pageHeight - 20) {
    doc.addPage()
    return 15
  }
  return pageY
}

interface MonthPDFData {
  label: string
  pendapatan: {
    totalPendapatan: number
    totalPesanan: number
    totalItemTerjual: number
    tunai: number
    qris: number
    transfer: number
    detailPesanan: ItemLaporanPesanan[]
    rataRataPesanan: number
    label: string
  } | null
  menuTerlaris: MenuTerlaris[]
  peakLabel?: string
  peakPesanan?: number
}

function renderRingkasanPDF(doc: jsPDF, y: number, title: string, monthData: MonthPDFData) {
  const { pendapatan, menuTerlaris, peakLabel, peakPesanan } = monthData
  y = headerLaporan(doc, title, pendapatan?.label || monthData.label)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("RINGKASAN", 10, y)
  y += 5

  const nonTunai = pendapatan ? pendapatan.qris + pendapatan.transfer : 0
  const rasioNonTunai = pendapatan && pendapatan.totalPendapatan > 0
    ? ((nonTunai / pendapatan.totalPendapatan) * 100).toFixed(1)
    : "0"

  const ringkasan = pendapatan ? [
    ["Total Pendapatan", formatRupiah(pendapatan.totalPendapatan)],
    ["Total Pesanan", `${pendapatan.totalPesanan}`],
    ["Total Item Terjual", `${pendapatan.totalItemTerjual}`],
    ["Tunai", formatRupiah(pendapatan.tunai)],
    ["QRIS", formatRupiah(pendapatan.qris)],
    ["Transfer", formatRupiah(pendapatan.transfer)],
    ["Rata-rata per Pesanan", formatRupiah(pendapatan.totalPesanan > 0 ? Math.round(pendapatan.totalPendapatan / pendapatan.totalPesanan) : 0)],
    ["Rasio Non-Tunai", `${rasioNonTunai}%`],
    ["Periode Puncak", peakLabel ? `${peakLabel} (${peakPesanan} pesanan)` : "-"],
  ] : [
    ["Total Pendapatan", "Rp 0"],
    ["Total Pesanan", "0"],
    ["Periode Puncak", "-"],
  ]

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  for (const [key, val] of ringkasan) {
    doc.text(key, 15, y)
    doc.text(val, 100, y)
    y += 5
  }

  if (menuTerlaris.length > 0) {
    y += 5
    y = footerLaporan(doc, y)
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y)
    y += 5

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("MENU TERLARIS", 10, y)
    y += 5

    doc.setFontSize(8)
    doc.text("Menu", 10, y)
    doc.text("Kategori", 60, y)
    doc.text("Terjual", 100, y)
    doc.text("Pendapatan", 130, y)
    y += 3
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y)
    y += 3

    doc.setFont("helvetica", "normal")
    for (const m of menuTerlaris) {
      doc.text(m.namaMenu, 10, y)
      doc.text(m.kategori, 60, y)
      doc.text(`${m.totalTerjual}`, 100, y)
      doc.text(formatRupiah(m.totalPendapatan), 130, y)
      y += 4
      y = footerLaporan(doc, y)
    }
  }

  y += 5
  y = footerLaporan(doc, y)
  doc.setDrawColor(180)
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y)
  y += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  centerText(doc, `Dicetak: ${new Date().toLocaleString("id-ID")}`, y, 8)
  return y
}

export function exportLaporanPDF(
  title: string,
  year: string,
  perMonth: MonthPDFData[] | null,
  // params for single-period (non-tahunan, kept for compatibility)
  singleTotalPendapatan?: number,
  singleTotalPesanan?: number,
  singleTotalItemTerjual?: number,
  singleTunai?: number,
  singleQris?: number,
  singleTransfer?: number,
  singleDetailPesanan?: ItemLaporanPesanan[],
  singleMenuTerlaris?: MenuTerlaris[],
  singleDaftarKasir?: KasirExport[],
  singleCancelRate?: number,
  singleRataItem?: number,
  singlePeakLabel?: string,
  singlePeakPesanan?: number,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  if (perMonth) {
    for (let i = 0; i < perMonth.length; i++) {
      if (i > 0) doc.addPage()
      renderRingkasanPDF(doc, 15, `${title} - ${perMonth[i].label}`, perMonth[i])
    }
  } else {
    const fakeMonth: MonthPDFData = {
      label: year,
      pendapatan: singleTotalPendapatan !== undefined ? {
        totalPendapatan: singleTotalPendapatan,
        totalPesanan: singleTotalPesanan || 0,
        totalItemTerjual: singleTotalItemTerjual || 0,
        tunai: singleTunai || 0,
        qris: singleQris || 0,
        transfer: singleTransfer || 0,
        detailPesanan: singleDetailPesanan || [],
        rataRataPesanan: singleTotalPesanan && singleTotalPesanan > 0 ? Math.round((singleTotalPendapatan || 0) / singleTotalPesanan) : 0,
        label: year,
      } : null,
      menuTerlaris: singleMenuTerlaris || [],
      peakLabel: singlePeakLabel,
      peakPesanan: singlePeakPesanan,
    }
    renderRingkasanPDF(doc, 15, title, fakeMonth)
  }

  doc.autoPrint()
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)
  window.open(url)
}

export async function exportLaporanExcel(
  title: string,
  detailPesanan: ItemLaporanPesanan[],
  perMonth?: { label: string; detailPesanan: ItemLaporanPesanan[] }[],
) {
  const wb = new ExcelJS.Workbook()

  const header = ["ID", "Meja", "Pelanggan", "Total", "Status", "Status Bayar", "Metode", "Waktu", "Kasir"]

  if (perMonth) {
    for (const m of perMonth) {
      if (m.detailPesanan.length > 0) {
        const ws = wb.addWorksheet(m.label.slice(0, 31))
        ws.addRow(header)
        ws.addRows(m.detailPesanan.map(p => [
          p.id, p.nomorMeja, p.namaPelanggan || "-",
          Number(p.totalHarga), p.statusPesanan, p.statusPembayaran,
          p.metodePembayaran || "-",
          new Date(p.createdAt).toISOString(),
          p.kasirUsername || "-",
        ]))
      }
    }
  } else if (detailPesanan.length > 0) {
    const ws = wb.addWorksheet("Detail Pesanan")
    ws.addRow(header)
    ws.addRows(detailPesanan.map(p => [
      p.id, p.nomorMeja, p.namaPelanggan || "-",
      Number(p.totalHarga), p.statusPesanan, p.statusPembayaran,
      p.metodePembayaran || "-",
      new Date(p.createdAt).toISOString(),
      p.kasirUsername || "-",
    ]))
  }

  const wbout = await wb.xlsx.writeBuffer()
  const blob = new Blob([wbout], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${(title || "Laporan").replace(/\s+/g, "_")}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
