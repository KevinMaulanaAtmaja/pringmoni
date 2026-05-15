"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Download } from "lucide-react"

// Mock data dengan tanggal yang jelas
const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const monthStr = today.toISOString().slice(0, 7)

const mockLaporanHarian = {
  tanggal: todayStr,
  totalPendapatan: 1250000,
  totalPesanan: 15,
  tunai: 750000,
  qris: 500000,
  detailPesanan: [
    { id: 1, total: 150000, status: "selesai", metode: "tunai", waktu: todayStr + "T10:30:00.000Z" },
    { id: 2, total: 85000, status: "selesai", metode: "qris", waktu: todayStr + "T11:15:00.000Z" },
    { id: 3, total: 120000, status: "menunggu", metode: null, waktu: todayStr + "T12:00:00.000Z" },
  ]
}

const mockLaporanMingguan = {
  minggu: "2026-W18",
  rentangTanggal: "2026-05-01 - 2026-05-07",
  totalPendapatan: 8500000,
  totalPesanan: 120,
  tunai: 5000000,
  qris: 3500000,
  detailPesanan: [
    { id: 4, total: 200000, status: "selesai", metode: "tunai", waktu: "2026-05-01T10:00:00.000Z" },
    { id: 5, total: 150000, status: "selesai", metode: "qris", waktu: "2026-05-02T11:00:00.000Z" },
    { id: 6, total: 300000, status: "selesai", metode: "tunai", waktu: "2026-05-03T12:00:00.000Z" },
  ]
}

const mockLaporanBulanan = {
  bulan: monthStr,
  namaBulan: "Mei 2026", // Static to avoid hydration mismatch
  totalPendapatan: 35000000,
  totalPesanan: 450,
  tunai: 20000000,
  qris: 15000000,
  detailPesanan: [
    { id: 7, total: 1000000, status: "selesai", metode: "tunai", waktu: monthStr + "-01T10:00:00.000Z" },
    { id: 8, total: 1500000, status: "selesai", metode: "qris", waktu: monthStr + "-02T11:00:00.000Z" },
    { id: 9, total: 1000000, status: "selesai", metode: "tunai", waktu: monthStr + "-03T12:00:00.000Z" },
  ]
}

const mockMenuTerlaris = [
  { namaMenu: "Ayam Geprek", kategori: "Makanan Utama", totalTerjual: 120, totalPendapatan: 18000000 },
  { namaMenu: "Es Teh Manis", kategori: "Minuman", totalTerjual: 95, totalPendapatan: 4750000 },
  { namaMenu: "Nasi Goreng", kategori: "Makanan Utama", totalTerjual: 88, totalPendapatan: 13200000 },
]

export function LaporanClient() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [selectedMonth, setSelectedMonth] = useState(monthStr)
  const [selectedWeek, setSelectedWeek] = useState("2026-W18")
  const [activeTab, setActiveTab] = useState('harian')

  const downloadCSV = () => {
    alert("Download CSV - Mock Data")
  }

  const downloadPDF = () => {
    alert("Download PDF - Mock Data")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Toggle Buttons */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {["harian", "mingguan", "bulanan", "menu", "kasir"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
              (activeTab === tab
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900")
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Harian */}
      {activeTab === "harian" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Laporan Harian</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Tanggal */}
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <Label className="text-xs">Pilih Tanggal</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm w-auto"
              />
            </div>
            <Button size="sm" className="text-xs">Filter</Button>
          </div>

          {/* Tanggal Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Tanggal Laporan</p>
            <p className="text-lg font-bold">
              {new Date(selectedDate).toLocaleDateString("id-ID", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pendapatan</p>
                  <p className="text-lg font-bold">Rp {mockLaporanHarian.totalPendapatan.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pesanan</p>
                  <p className="text-lg font-bold">{mockLaporanHarian.totalPesanan}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Tunai</p>
                  <p className="text-lg font-bold">Rp {mockLaporanHarian.tunai.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">QRIS</p>
                  <p className="text-lg font-bold">Rp {mockLaporanHarian.qris.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Metode</TableHead>
                      <TableHead className="text-xs">Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLaporanHarian.detailPesanan.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">#{p.id}</TableCell>
                        <TableCell className="text-sm">Rp {p.total.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <Badge className={
                            p.status === "selesai"
                              ? "bg-green-100 text-green-800 text-xs"
                              : "bg-yellow-100 text-yellow-800 text-xs"
                          }>
                            {p.status === "selesai" ? "Selesai" : "Menunggu"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{p.metode || "-"}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(p.waktu).toLocaleString("id-ID", {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mingguan */}
      {activeTab === "mingguan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Laporan Mingguan</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Minggu */}
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <Label className="text-xs">Pilih Minggu</Label>
              <Input
                type="week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="text-sm w-auto"
              />
            </div>
            <Button size="sm" className="text-xs">Filter</Button>
          </div>

          {/* Minggu Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Periode Mingguan</p>
            <p className="text-lg font-bold">Minggu {selectedWeek}</p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pendapatan</p>
                  <p className="text-lg font-bold">Rp {mockLaporanMingguan.totalPendapatan.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pesanan</p>
                  <p className="text-lg font-bold">{mockLaporanMingguan.totalPesanan}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Tunai</p>
                  <p className="text-lg font-bold">Rp {mockLaporanMingguan.tunai.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">QRIS</p>
                  <p className="text-lg font-bold">Rp {mockLaporanMingguan.qris.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                       <TableHead className="text-xs">ID</TableHead>
                       <TableHead className="text-xs">Total</TableHead>
                       <TableHead className="text-xs">Status</TableHead>
                       <TableHead className="text-xs">Metode</TableHead>
                       <TableHead className="text-xs">Hari</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {mockLaporanMingguan.detailPesanan.map((p) => (
                       <TableRow key={p.id}>
                         <TableCell className="font-medium text-sm">#{p.id}</TableCell>
                         <TableCell className="text-sm">Rp {p.total.toLocaleString("id-ID")}</TableCell>
                         <TableCell>
                           <Badge className={
                             p.status === "selesai"
                               ? "bg-green-100 text-green-800 text-xs"
                               : "bg-yellow-100 text-yellow-800 text-xs"
                           }>
                             {p.status === "selesai" ? "Selesai" : "Menunggu"}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-sm">{p.metode || "-"}</TableCell>
                         <TableCell className="text-xs whitespace-nowrap">
                           {new Date(p.waktu).toLocaleDateString("id-ID", {
                             weekday: 'long'
                           })}
                         </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulanan */}
      {activeTab === "bulanan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Laporan Bulanan</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <Label className="text-xs">Pilih Bulan</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm w-auto"
              />
            </div>
            <Button size="sm" className="text-xs">Filter</Button>
          </div>

          {/* Bulan Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Periode Bulanan</p>
            <p className="text-lg font-bold">
              {new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pendapatan</p>
                  <p className="text-lg font-bold">Rp {mockLaporanBulanan.totalPendapatan.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pesanan</p>
                  <p className="text-lg font-bold">{mockLaporanBulanan.totalPesanan}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Tunai</p>
                  <p className="text-lg font-bold">Rp {mockLaporanBulanan.tunai.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">QRIS</p>
                  <p className="text-lg font-bold">Rp {mockLaporanBulanan.qris.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Metode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLaporanBulanan.detailPesanan.map((d) => (
                       <TableRow key={d.id}>
                         <TableCell className="text-sm">{new Date(d.waktu).toLocaleDateString("id-ID")}</TableCell>
                         <TableCell className="text-sm">Rp {d.total.toLocaleString("id-ID")}</TableCell>
                         <TableCell>
                           <Badge className={
                             d.status === "selesai"
                               ? "bg-green-100 text-green-800 text-xs"
                               : "bg-yellow-100 text-yellow-800 text-xs"
                           }>
                             {d.status === "selesai" ? "Selesai" : "Menunggu"}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-sm">{d.metode || "-"}</TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu Terlaris */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Menu Terlaris</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Bulan Display untuk Menu */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Periode</p>
            <p className="text-lg font-bold">{mockLaporanBulanan.namaBulan}</p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="bg-white rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Rank</TableHead>
                      <TableHead className="text-xs">Menu</TableHead>
                      <TableHead className="text-xs">Kategori</TableHead>
                      <TableHead className="text-xs">Terjual</TableHead>
                      <TableHead className="text-xs">Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMenuTerlaris.map((menu, index) => (
                      <TableRow key={menu.namaMenu}>
                        <TableCell className="text-sm">{index + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{menu.namaMenu}</TableCell>
                        <TableCell className="text-sm">{menu.kategori}</TableCell>
                        <TableCell className="text-sm">{menu.totalTerjual}</TableCell>
                        <TableCell className="text-sm">Rp {menu.totalPendapatan.toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Laporan Kasir */}
      {activeTab === "kasir" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Laporan Kasir</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Bulan untuk Kasir */}
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <Label className="text-xs">Pilih Bulan</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm w-auto"
              />
            </div>
            <Button size="sm" className="text-xs">Filter</Button>
          </div>

          {/* Bulan Display untuk Kasir */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Periode</p>
            <p className="text-lg font-bold">
              {new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Mock Data Kasir */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Total Pendapatan</p>
              <p className="text-lg font-bold">Rp 4.600.000</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Total Transaksi</p>
              <p className="text-lg font-bold">35</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Tunai</p>
              <p className="text-lg font-bold">Rp 2.700.000</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">QRIS</p>
              <p className="text-lg font-bold">Rp 1.900.000</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="bg-white rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Rank</TableHead>
                      <TableHead className="text-xs">Nama Kasir</TableHead>
                      <TableHead className="text-xs">Total Transaksi</TableHead>
                      <TableHead className="text-xs">Pendapatan</TableHead>
                      <TableHead className="text-xs">Tunai</TableHead>
                      <TableHead className="text-xs">QRIS</TableHead>
                      <TableHead className="text-xs">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { nama: "Budi", transaksi: 15, pendapatan: 2000000, tunai: 1200000, qris: 800000 },
                      { nama: "Ani", transaksi: 12, pendapatan: 1600000, tunai: 1000000, qris: 600000 },
                      { nama: "Charlie", transaksi: 8, pendapatan: 1000000, tunai: 500000, qris: 500000 },
                    ].map((kasir, index) => (
                      <TableRow key={kasir.nama}>
                        <TableCell className="text-sm">{index + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{kasir.nama}</TableCell>
                        <TableCell className="text-sm">{kasir.transaksi}</TableCell>
                        <TableCell className="text-sm">Rp {kasir.pendapatan.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-sm">Rp {kasir.tunai.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-sm">Rp {kasir.qris.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-sm">Rp {Math.round(kasir.pendapatan / kasir.transaksi).toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
