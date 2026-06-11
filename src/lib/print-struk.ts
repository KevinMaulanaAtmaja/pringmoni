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

function sep(count = 28) {
  return "=".repeat(count)
}

function centerText(doc: jsPDF, text: string, y: number, size = 11) {
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

function renderStruk(doc: jsPDF, data: StrukData, startY: number, kitchen: boolean = false, showWifi: boolean = true): number {
  let y = startY

  if (!kitchen) {
    doc.setFont("helvetica", "bold")
    centerText(doc, "PRINGMONI", y, 20)
    y += 9
    doc.setFont("helvetica", "normal")
    centerText(doc, "Restoran Pringsewu", y, 11)
    y += 6
    if (data.namaPelanggan) {
      centerText(doc, `Atas Nama: ${data.namaPelanggan}`, y, 11)
      y += 6
    }

    y += 3
    centerText(doc, sep(), y, 9)
    y += 6
  } else {
    doc.setFont("helvetica", "bold")
    centerText(doc, "KITCHEN ORDER", y, 14)
    y += 7
  }

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(nomorPesanan(data.id, data.createdAt), kitchen ? 10 : 10, y)
  doc.setFont("helvetica", "normal")
  rightText(doc, `Meja ${data.nomorMeja}`, y)
  y += 6
  doc.text(new Date(data.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), 10, y)
  y += 6

  if (!kitchen) {
    if (data.kasirUsername) {
      doc.text(`Kasir: ${data.kasirUsername}`, 10, y)
      y += 5
    }
    if (data.metodePembayaran) {
      doc.text(`Metode: ${data.metodePembayaran.toUpperCase()}`, 10, y)
      y += 5
    }
  }

  y += 2
  centerText(doc, sep(), y, 9)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Item", 10, y)
  if (!kitchen) rightText(doc, "Harga", y)
  y += 5
  doc.setFont("helvetica", "normal")

  for (const item of data.items) {
    const nama = item.nama.length > (kitchen ? 30 : 20) ? item.nama.slice(0, (kitchen ? 29 : 19)) + ".." : item.nama
    doc.text(`${item.jumlah}x ${nama}`, 10, y)
    if (!kitchen) rightText(doc, formatRupiah(item.harga * item.jumlah), y)
    y += 5
  }

  if (!kitchen) {
    y += 3
    centerText(doc, sep(), y, 9)
    y += 6

    const subtotal = data.subtotal ?? data.totalHarga
    const adminFee = data.adminFee ?? (
      data.metodePembayaran === 'transfer' || data.metodePembayaran === 'qris'
        ? hitungAdminFee(data.metodePembayaran, subtotal)
        : 0
    )
    const ppn = data.ppn ?? 0

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text("Subtotal", 10, y)
    rightText(doc, formatRupiah(subtotal), y)
    y += 6

    if (adminFee > 0) {
      doc.text("Biaya Admin", 10, y)
      rightText(doc, formatRupiah(adminFee), y)
      y += 6
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    const grandTotal = subtotal + adminFee + ppn
    const totalStr = `Rp ${grandTotal.toLocaleString("id-ID")}`
    doc.text("TOTAL", 10, y)
    rightText(doc, totalStr, y)
    y += 8

    if (data.jumlahBayar) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Dibayar:`, 10, y)
      rightText(doc, formatRupiah(data.jumlahBayar), y)
      y += 5
    }
    if (data.kembalian && data.kembalian > 0) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Kembalian:`, 10, y)
      rightText(doc, formatRupiah(data.kembalian), y)
      y += 5
    }

    y += 3
    centerText(doc, sep(), y, 9)
    y += 6

    doc.setFont("helvetica", "normal")

    if (showWifi) {
      centerText(doc, "WiFi: pringsewu osing | Pass: pesandulu", y, 10)
      y += 6
    }

    centerText(doc, "Terima kasih sudah memesan!", y, 11)
    y += 7
    centerText(doc, "~ Selamat menikmati ~", y, 11)
    y += 7
  }

  return y
}

function renderAllPages(doc: jsPDF, data: StrukData): number {
  let y = 10
  centerText(doc, sep(), y, 11)
  y += 6
  centerText(doc, "COPY PELANGGAN", y, 11)
  y += 6
  centerText(doc, sep(), y, 11)
  y += 8
  y = renderStruk(doc, data, y, false, true)

  y += 6
  centerText(doc, sep(), y, 11)
  y += 6
  centerText(doc, "COPY KITCHEN", y, 11)
  y += 6
  centerText(doc, sep(), y, 11)
  y += 8

  y = renderStruk(doc, data, y, false, true)

  const footerY = y + 5
  centerText(doc, sep(24), footerY, 9)
  y += 5
  centerText(doc, `Printed: ${new Date().toLocaleString("id-ID")}`, footerY + 4, 9)

  return footerY + 8
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
