import { jsPDF } from "jspdf"

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

export function printStruk(data: StrukData) {
  const doc = new jsPDF({ unit: "mm", format: [80, 250] })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  doc.setFont("helvetica", "bold")
  centerText(doc, "PRINGMONI", y, 16)
  y += 7
  doc.setFont("helvetica", "normal")
  centerText(doc, "Restoran Pringsewu", y, 9)
  y += 4
  if (data.namaPelanggan) {
    centerText(doc, `Atas Nama: ${data.namaPelanggan}`, y, 8)
    y += 4
  }

  y += 2
  doc.setDrawColor(180)
  doc.setLineWidth(0.5)
  doc.line(5, y, pageWidth - 5, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(nomorPesanan(data.id, data.createdAt), 10, y)
  doc.setFont("helvetica", "normal")
  rightText(doc, data.nomorMeja, y)
  y += 5
  doc.text(new Date(data.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), 10, y)
  y += 5
  if (data.waiterUsername) {
    doc.text(`Waiter: ${data.waiterUsername}`, 10, y)
    y += 4
  }
  if (data.kasirUsername) {
    doc.text(`Kasir: ${data.kasirUsername}`, 10, y)
    y += 4
  }
  if (data.metodePembayaran) {
    doc.text(`Metode: ${data.metodePembayaran.toUpperCase()}`, 10, y)
    y += 4
  }

  y += 2
  doc.line(5, y, pageWidth - 5, y)
  y += 5

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("Item", 10, y)
  rightText(doc, "Subtotal", y)
  y += 4
  doc.setFont("helvetica", "normal")

  for (const item of data.items) {
    const nama = item.nama.length > 20 ? item.nama.slice(0, 19) + ".." : item.nama
    doc.text(`${item.jumlah}x ${nama}`, 10, y)
    rightText(doc, formatRupiah(item.harga * item.jumlah), y)
    y += 4

    if (y > 230) {
      doc.addPage()
      y = 15
    }
  }

  y += 3
  doc.setDrawColor(180)
  doc.setLineWidth(0.5)
  doc.line(5, y, pageWidth - 5, y)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  const totalStr = `Rp ${data.totalHarga.toLocaleString("id-ID")}`
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
  y += 7

  doc.setFont("helvetica", "normal")
  centerText(doc, "Terima kasih sudah memesan!", y, 9)
  y += 5
  centerText(doc, "~ Selamat menikmati ~", y, 9)

  doc.autoPrint()
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)
  window.open(url)
}
