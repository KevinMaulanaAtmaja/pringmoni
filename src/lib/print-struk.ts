import { jsPDF } from "jspdf"
import { hitungAdminFee } from "@/lib/fee"

interface StrukItem {
  nama: string
  jumlah: number
  harga: number
}

interface StrukData {
  id: number
  nomorMeja: string
  items: StrukItem[]
  totalHarga: number
  metodePembayaran?: string | null
  jumlahBayar?: number | null
  kembalian?: number
  createdAt: Date | string
  waiterUsername?: string | null
  kasirUsername?: string | null
  namaPelanggan?: string | null
  subtotal?: number
  adminFee?: number
  ppn?: number
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

function rightText(doc: jsPDF, text: string, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const textWidth = doc.getTextWidth(text)
  doc.text(text, pageWidth - 10 - textWidth, y)
}

function nomorPesanan(id: number, date: Date | string) {
  const d = new Date(date)
  const tgl = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `ORD/${tgl}/${String(id).padStart(4, '0')}`
}

function keyValue(doc: jsPDF, key: string, value: string, y: number) {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(key, 10, y)
  doc.setFont("helvetica", "bold")
  const vw = doc.getTextWidth(value)
  doc.text(value, 55, y)
  if (doc.getTextWidth(key) + vw > 65) {
    doc.setFont("helvetica", "normal")
    doc.text(value, 55, y + 4)
    return 8
  }
  return 5
}

function renderStruk(doc: jsPDF, data: StrukData, startY: number, kitchen: boolean = false, showWifi: boolean = true): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = startY

  if (!kitchen) {
    doc.setFont("helvetica", "bold")
    centerText(doc, "PRINGMONI", y, 18)
    y += 8
    doc.setFont("helvetica", "normal")
    centerText(doc, "Restoran Pringsewu", y, 9)
    y += 5
    if (data.namaPelanggan) {
      centerText(doc, `Atas Nama: ${data.namaPelanggan}`, y, 9)
      y += 5
    }

    y += 3
    doc.setDrawColor(180)
    doc.setLineWidth(0.5)
    doc.line(5, y, pageWidth - 5, y)
    y += 6
  } else {
    doc.setFont("helvetica", "bold")
    centerText(doc, "KITCHEN ORDER", y, 12)
    y += 6
  }

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(nomorPesanan(data.id, data.createdAt), kitchen ? 10 : 10, y)
  doc.setFont("helvetica", "normal")
  rightText(doc, data.nomorMeja, y)
  y += 5
  doc.text(new Date(data.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), 10, y)
  y += 5

  if (!kitchen) {
    if (data.kasirUsername) {
      doc.text(`Kasir: ${data.kasirUsername}`, 10, y)
      y += 4
    }
    if (data.metodePembayaran) {
      doc.text(`Metode: ${data.metodePembayaran.toUpperCase()}`, 10, y)
      y += 4
    }
  }

  y += 2
  doc.setDrawColor(180)
  doc.setLineWidth(0.5)
  doc.line(5, y, pageWidth - 5, y)
  y += 5

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("Item", 10, y)
  if (!kitchen) rightText(doc, "Harga", y)
  y += 4
  doc.setFont("helvetica", "normal")

  for (const item of data.items) {
    const nama = item.nama.length > (kitchen ? 30 : 20) ? item.nama.slice(0, (kitchen ? 29 : 19)) + ".." : item.nama
    doc.text(`${item.jumlah}x ${nama}`, 10, y)
    if (!kitchen) rightText(doc, formatRupiah(item.harga * item.jumlah), y)
    y += 4
  }

  if (!kitchen) {
    y += 3
    doc.setDrawColor(180)
    doc.setLineWidth(0.5)
    doc.line(5, y, pageWidth - 5, y)
    y += 6

    const subtotal = data.subtotal ?? data.totalHarga
    const adminFee = data.adminFee ?? (
      data.metodePembayaran === 'transfer' || data.metodePembayaran === 'qris'
        ? hitungAdminFee(data.metodePembayaran, subtotal)
        : 0
    )
    const ppn = data.ppn ?? 0

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("Subtotal", 10, y)
    rightText(doc, formatRupiah(subtotal), y)
    y += 5

    if (adminFee > 0) {
      doc.text("Biaya Admin", 10, y)
      rightText(doc, formatRupiah(adminFee), y)
      y += 5
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    const grandTotal = subtotal + adminFee + ppn
    const totalStr = `Rp ${grandTotal.toLocaleString("id-ID")}`
    doc.text("TOTAL", 10, y)
    rightText(doc, totalStr, y)
    y += 7

    if (data.jumlahBayar) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Dibayar:`, 10, y)
      rightText(doc, formatRupiah(data.jumlahBayar), y)
      y += 4
    }
    if (data.kembalian && data.kembalian > 0) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Kembalian:`, 10, y)
      rightText(doc, formatRupiah(data.kembalian), y)
      y += 4
    }

    y += 5
    doc.line(5, y, pageWidth - 5, y)
    y += 8

    doc.setFont("helvetica", "normal")

    if (showWifi) {
      centerText(doc, "WiFi: pringsewu osing | Pass: pesandulu", y, 8)
      y += 6
    }

    centerText(doc, "Terima kasih sudah memesan!", y, 9)
    y += 6
    centerText(doc, "~ Selamat menikmati ~", y, 9)
    y += 8
  }

  return y
}

function renderAllPages(doc: jsPDF, data: StrukData): number {
  const pw = doc.internal.pageSize.getWidth()

  let y = 10
  centerText(doc, "--- COPY PELANGGAN ---", y, 8)
  y += 6
  y = renderStruk(doc, data, y, false, true)

  y += 6
  doc.setDrawColor(200)
  doc.setLineWidth(0.3)
  doc.setLineDashPattern([2, 3], 0)
  doc.line(10, y, pw - 10, y)
  doc.setLineDashPattern([], 0)
  centerText(doc, "--- COPY KITCHEN ---", y + 3, 8)
  y += 8

  y = renderStruk(doc, data, y, false, true)

  const footerY = y + 5
  doc.setFontSize(7)
  centerText(doc, `Printed: ${new Date().toLocaleString("id-ID")}`, footerY, 7)

  return footerY + 7
}

export function printStruk(data: StrukData) {
  const width = 80

  const tempDoc = new jsPDF({ unit: "mm", format: [width, 500] })
  const finalY = renderAllPages(tempDoc, data)
  const pageHeight = Math.ceil(finalY) + 20

  const doc = new jsPDF({ unit: "mm", format: [width, pageHeight] })
  renderAllPages(doc, data)

  doc.autoPrint()
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)
  window.open(url)
}
