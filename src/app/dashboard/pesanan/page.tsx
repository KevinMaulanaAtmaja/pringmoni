"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp } from "lucide-react"
import { StatusPesanan } from "@/types"

// Sync with @/types/index.ts
// StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'

const statusColors: Record<StatusPesanan, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusLabels: Record<StatusPesanan, string> = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
}

// Sync with @/types/index.ts
// StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'

const mockPesananList = [
  {
    id: 1,
    mejaId: 1,
    waiterId: 1,
    kasirId: null,
    statusPesanan: 'menunggu' as StatusPesanan,
    catatan: 'Tidak pedas',
    totalHarga: 75000,
    metodePembayaran: null,
    jumlahBayar: null,
    kembalian: 0,
    statusPembayaran: 'menunggu',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    meja: { id: 1, nomorMeja: 'A1', kapasitas: 4, tokenMeja: 'ABC123' },
    waiter: { id: 1, username: 'waiter1' },
    kasir: null,
    detailPesanan: [
      { id: 1, menuId: 1, pesananId: 1, jumlah: 2, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 1, namaMenu: 'Nasi Gudeg' } },
      { id: 2, menuId: 2, pesananId: 1, jumlah: 1, hargaSaatPesan: 25000, catatanItem: 'Kurang es', menu: { id: 2, namaMenu: 'Es Teh Manis' } },
    ],
  },
  {
    id: 2,
    mejaId: 2,
    waiterId: 1,
    kasirId: null,
    statusPesanan: 'diproses' as StatusPesanan,
    catatan: null,
    totalHarga: 50000,
    metodePembayaran: null,
    jumlahBayar: null,
    kembalian: 0,
    statusPembayaran: 'menunggu',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    meja: { id: 2, nomorMeja: 'B2', kapasitas: 2, tokenMeja: 'DEF456' },
    waiter: { id: 1, username: 'waiter1' },
    kasir: null,
    detailPesanan: [
      { id: 3, menuId: 3, pesananId: 2, jumlah: 2, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 3, namaMenu: 'Ayam Bakar' } },
    ],
  },
]

export default function PesananPage() {
  const pageTitle = <h1 className="text-2xl font-bold">Daftar Pesanan</h1>
  const role = 'waiter' as string // TODO: Ambil dari session BE nanti
  const isOwner = role === 'owner'
  const [pesananList] = useState(mockPesananList)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [itemStatus, setItemStatus] = useState<Record<number, Record<number, boolean>>>({})
  const [filterStatus, setFilterStatus] = useState<string>("semua")

  function toggleItem(pesananId: number, detailId: number) {
    setItemStatus((prev) => ({
      ...prev,
      [pesananId]: { ...prev[pesananId], [detailId]: !(prev[pesananId]?.[detailId] ?? false) },
    }))
  }

  function formatHarga(harga: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(harga)
  }

  function handleStatusChange(id: number, status: string) {
    alert(`Simulasi: Pesanan #${id} status diubah ke ${status}`)
  }

  const filteredPesanan = filterStatus === "semua" ? pesananList : pesananList.filter((p) => p.statusPesanan === filterStatus as StatusPesanan)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {pageTitle}

      <div className="flex gap-2 flex-wrap">
          {["semua", "menunggu", "diproses", "selesai", "dibatalkan"].map((status) => (
          <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)}>
            {status === "semua" ? `Semua (${pesananList.length})` : `${statusLabels[status as StatusPesanan]} (${(pesananList as Array<{statusPesanan: StatusPesanan}>).filter((p) => p.statusPesanan === status).length})`}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPesanan.map((pesanan) => {
          const isExpanded = expandedId === pesanan.id
          return (
            <Card key={pesanan.id} className={`border-l-4 ${pesanan.statusPesanan === 'dibatalkan' ? 'border-l-red-500' : pesanan.statusPesanan === 'selesai' ? 'border-l-green-500' : pesanan.statusPesanan === 'diproses' ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Meja {pesanan.meja.nomorMeja}</CardTitle>
                    <p className="text-sm text-gray-500">{new Date(pesanan.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge className={statusColors[pesanan.statusPesanan as StatusPesanan]}>{statusLabels[pesanan.statusPesanan as StatusPesanan]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{pesanan.detailPesanan.length} item</span>
                    <span className="font-semibold">{formatHarga(pesanan.totalHarga)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setExpandedId(isExpanded ? null : pesanan.id)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    {isExpanded ? "Sembunyikan" : "Lihat Detail"}
                  </Button>
                  {isExpanded && (
                    <div className="border-t pt-3">
                      {pesanan.detailPesanan.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg mb-2">
                          <Checkbox
                            checked={itemStatus[pesanan.id]?.[item.id] || false}
                            onCheckedChange={(checked) => {
                              if (typeof checked === 'boolean') {
                                toggleItem(pesanan.id, item.id)
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.menu.namaMenu}</p>
                            <p className="text-xs text-gray-500">{item.jumlah}x {formatHarga(item.hargaSaatPesan)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isOwner && pesanan.statusPesanan !== 'dibatalkan' && (
                    <Button size="sm" className="w-full" onClick={() => handleStatusChange(pesanan.id, pesanan.statusPesanan === 'menunggu' ? 'diproses' : 'selesai')}>
                      {pesanan.statusPesanan === 'menunggu' ? 'Proses' : 'Selesai'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
