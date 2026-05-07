"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { getPesananForDashboard, updateStatusPesanan, markPesananSelesai, getPesananById } from "@/app/actions/pesanan"
import { StatusPesanan } from "@prisma/client"
import { getMeja } from "@/app/actions/meja"
import type { Meja } from "@/types"
import { Eye, Filter, RotateCcw, Truck, ChefHat, CheckCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusBayarColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  berhasil: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

interface PesananItem {
  id: number
  meja: string
  tipeMeja: string
  status: string
  statusBayar: string
  total: number
  items: number
  waktu: string
  waiterUsername?: string | null
}

interface PesananDetail {
  id: number
  nomor_meja: string
  tipe_meja: string
  status_pesanan: string
  status_pembayaran: string
  total_harga: number
  created_at: Date
  waiter_username: string | null
  kasir_username: string | null
  items: Array<{
    id: number
    menu_id: number
    nama_menu: string
    jumlah: number
    harga_saat_pesan: number
    catatan_item: string | null
    foto_urls: string[]
    checked?: boolean
  }>
}

export default function PesananPage() {
  const [pesanan, setPesanan] = useState<PesananItem[]>([])
  const [mejas, setMejas] = useState<Meja[]>([])
  const [loading, setLoading] = useState(true)

  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterTanggal, setFilterTanggal] = useState<string>("")
  const [filterMejaId, setFilterMejaId] = useState<string>("")

  const [selectedPesanan, setSelectedPesanan] = useState<PesananDetail | null>(null)
  const [selectedPesananForComplete, setSelectedPesananForComplete] = useState<PesananDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailLoadingComplete, setDetailLoadingComplete] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [debugError, setDebugError] = useState<string | null>(null)
  
  const fetchData = async () => {
    setLoading(true)
    setDebugError(null)
    try {
      const [pesananResult, mejaResult] = await Promise.all([
        getPesananForDashboard({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          tanggal: filterTanggal || undefined,
          mejaId: filterMejaId ? parseInt(filterMejaId) : undefined,
        }),
        getMeja()
      ])
      
      if (pesananResult && 'error' in pesananResult) {
        setDebugError(pesananResult.error as string)
        setPesanan([])
      } else if (Array.isArray(pesananResult)) {
        setPesanan(pesananResult as PesananItem[])
      }
      
      if (mejaResult && 'error' in mejaResult) {
        // ignore meja error
      } else if (Array.isArray(mejaResult)) {
        setMejas(mejaResult as Meja[])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setDebugError(String(err))
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [filterStatus, filterTanggal, filterMejaId])
  
  const resetFilter = () => {
    setFilterStatus("all")
    setFilterTanggal("")
    setFilterMejaId("")
  }

  const openDetailModal = async (pesananId: number) => {
    setDetailLoading(true)
    setShowDetailModal(true)
    try {
      const result = await getPesananById(pesananId)
      if ('error' in result) {
        setShowDetailModal(false)
      } else {
        const detail = result as unknown as PesananDetail
        setSelectedPesanan({
          ...detail,
          items: detail.items.map(item => ({ ...item, checked: false }))
        })
      }
    } catch {
      setShowDetailModal(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const openDetailModalForComplete = async (pesananId: number) => {
    setDetailLoadingComplete(true)
    setShowCompleteModal(true)
    try {
      const result = await getPesananById(pesananId)
      if ('error' in result) {
        setShowCompleteModal(false)
      } else {
        const detail = result as unknown as PesananDetail
        setSelectedPesananForComplete({
          ...detail,
          items: detail.items.map(item => ({ ...item, checked: false }))
        })
      }
    } catch {
      setShowCompleteModal(false)
    } finally {
      setDetailLoadingComplete(false)
    }
  }

  const toggleItemCheck = (itemId: number) => {
    if (!selectedPesananForComplete) return
    setSelectedPesananForComplete({
      ...selectedPesananForComplete,
      items: selectedPesananForComplete.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    })
  }

  const checkAllItems = () => {
    if (!selectedPesananForComplete) return
    setSelectedPesananForComplete({
      ...selectedPesananForComplete,
      items: selectedPesananForComplete.items.map(item => ({ ...item, checked: true }))
    })
  }

  const uncheckAllItems = () => {
    if (!selectedPesananForComplete) return
    setSelectedPesananForComplete({
      ...selectedPesananForComplete,
      items: selectedPesananForComplete.items.map(item => ({ ...item, checked: false }))
    })
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const result = await updateStatusPesanan(id, newStatus as StatusPesanan)
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }
    fetchData()
  }

  const handleMarkArrived = async (id: number) => {
    const result = await markPesananSelesai(id)
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }
    setShowDetailModal(false)
    setSelectedPesanan(null)
    fetchData()
  }

  if (loading) return <div className="p-8 text-center">Memuat...</div>
  if (debugError) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg font-medium mb-2">Error: {debugError}</p>
          <p className="text-sm text-gray-600 mb-4">Pastikan Anda sudah login dan memiliki akses.</p>
          <Button onClick={() => { setDebugError(null); fetchData(); }}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Status Pesanan</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Tanggal</Label>
              <Input 
                type="date" 
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Meja</Label>
              <Select value={filterMejaId} onValueChange={setFilterMejaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Meja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Meja</SelectItem>
                  {mejas.map((meja) => (
                    <SelectItem key={meja.id} value={meja.id.toString()}>
                      {meja.nomorMeja} ({meja.tipeMeja === 'lesehan' ? 'L' : 'K'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={resetFilter} variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Meja</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Status Bayar</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pesanan.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Tidak ada pesanan
                </TableCell>
              </TableRow>
            ) : (
              pesanan.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">#{p.id}</TableCell>
                  <TableCell>{p.meja}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {p.tipeMeja === 'lesehan' ? 'Lesehan' : 'Kursi'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[p.status]}>
                      {p.status === 'menunggu' ? 'Menunggu' : 
                       p.status === 'diproses' ? 'Diproses' :
                        p.status === 'diproses' ? 'Diproses' :
                       p.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBayarColors[p.statusBayar]}>
                      {p.statusBayar === 'menunggu' ? 'Menunggu' : 
                       p.statusBayar === 'berhasil' ? 'Berhasil' : 'Dibatalkan'}
                    </Badge>
                  </TableCell>
                  <TableCell>Rp {p.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell>{p.items} item</TableCell>
                  <TableCell>
                    {new Date(p.waktu).toLocaleString("id-ID", {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDetailModal(p.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {p.status === 'menunggu' && p.statusBayar === 'berhasil' && (
                        <Button 
                          size="sm" 
                          onClick={() => openDetailModalForComplete(p.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Selesai
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       {/* Detail Modal - View Only */}
       <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Detail Pesanan #{selectedPesanan?.id}</DialogTitle>
           </DialogHeader>
           {detailLoading ? (
             <div className="py-8 text-center">Memuat detail pesanan...</div>
           ) : selectedPesanan ? (
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-gray-500">Meja:</span>
                   <p className="font-medium">{selectedPesanan.nomor_meja}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Tipe:</span>
                   <p className="font-medium">{selectedPesanan.tipe_meja === 'lesehan' ? 'Lesehan' : 'Kursi'}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Status:</span>
                   <Badge className={statusColors[selectedPesanan.status_pesanan]}>
                     {selectedPesanan.status_pesanan === 'menunggu' ? 'Menunggu' : 
                      selectedPesanan.status_pesanan === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                   </Badge>
                 </div>
                 <div>
                   <span className="text-gray-500">Status Bayar:</span>
                   <Badge className={statusBayarColors[selectedPesanan.status_pembayaran]}>
                     {selectedPesanan.status_pembayaran === 'menunggu' ? 'Menunggu' : 
                      selectedPesanan.status_pembayaran === 'berhasil' ? 'Berhasil' : 'Dibatalkan'}
                   </Badge>
                 </div>
                 <div>
                   <span className="text-gray-500">Waiter:</span>
                   <p className="font-medium">{selectedPesanan.waiter_username || '-'}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Kasir:</span>
                   <p className="font-medium">{selectedPesanan.kasir_username || '-'}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Waktu:</span>
                   <p className="font-medium">
                     {new Date(selectedPesanan.created_at).toLocaleString("id-ID")}
                   </p>
                 </div>
                 <div>
                   <span className="text-gray-500">Total:</span>
                   <p className="font-medium">Rp {Number(selectedPesanan.total_harga).toLocaleString("id-ID")}</p>
                 </div>
               </div>
               
               <div>
                 <h4 className="font-medium mb-3">Item Pesanan</h4>
                 <div className="border rounded-lg divide-y">
                   {selectedPesanan.items.map((item) => (
                     <div key={item.id} className="p-3 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div>
                           <p className="font-medium">{item.nama_menu}</p>
                           <p className="text-sm text-gray-500">
                             {item.jumlah}x Rp {Number(item.harga_saat_pesan).toLocaleString("id-ID")}
                           </p>
                           {item.catatan_item && (
                             <p className="text-sm text-amber-600">Catatan: {item.catatan_item}</p>
                           )}
                         </div>
                       </div>
                       <p className="font-medium">
                         Rp {(item.jumlah * Number(item.harga_saat_pesan)).toLocaleString("id-ID")}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ) : null}
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowDetailModal(false)}>
               Tutup
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Complete Modal - With Checkboxes */}
       <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Selesaikan Pesanan #{selectedPesananForComplete?.id}</DialogTitle>
           </DialogHeader>
           {detailLoadingComplete ? (
             <div className="py-8 text-center">Memuat detail pesanan...</div>
           ) : selectedPesananForComplete ? (
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-gray-500">Meja:</span>
                   <p className="font-medium">{selectedPesananForComplete.nomor_meja}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Total:</span>
                   <p className="font-medium">Rp {Number(selectedPesananForComplete.total_harga).toLocaleString("id-ID")}</p>
                 </div>
               </div>
               
               <div>
                 <div className="flex items-center justify-between mb-3">
                   <h4 className="font-medium">Centang Item yang Sudah Diterima</h4>
                   <div className="flex gap-2">
                     <Button size="sm" variant="outline" onClick={checkAllItems}>
                       Cek Semua
                     </Button>
                     <Button size="sm" variant="outline" onClick={uncheckAllItems}>
                       Uncek Semua
                     </Button>
                   </div>
                 </div>
                 <div className="border rounded-lg divide-y">
                   {selectedPesananForComplete.items.map((item) => (
                     <div 
                       key={item.id} 
                       className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                         item.checked ? 'bg-green-50' : 'hover:bg-gray-50'
                       }`}
                       onClick={() => toggleItemCheck(item.id)}
                     >
                       <div className="flex items-center gap-3">
                         <input
                           type="checkbox"
                           checked={item.checked || false}
                           onChange={() => toggleItemCheck(item.id)}
                           className="w-5 h-5 rounded accent-green-600"
                         />
                         <div>
                           <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : ''}`}>
                             {item.nama_menu}
                           </p>
                           <p className="text-sm text-gray-500">
                             {item.jumlah}x Rp {Number(item.harga_saat_pesan).toLocaleString("id-ID")}
                           </p>
                           {item.catatan_item && (
                             <p className="text-sm text-amber-600">Catatan: {item.catatan_item}</p>
                           )}
                         </div>
                       </div>
                       <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : ''}`}>
                         Rp {(item.jumlah * Number(item.harga_saat_pesan)).toLocaleString("id-ID")}
                       </p>
                     </div>
                   ))}
                 </div>
                 <div className="mt-3 text-sm text-gray-500">
                   {selectedPesananForComplete.items.filter(i => i.checked).length} / {selectedPesananForComplete.items.length} item dicek
                 </div>
               </div>
             </div>
           ) : null}
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
               Batal
             </Button>
             {selectedPesananForComplete && (
               <Button 
                 onClick={() => {
                   const allChecked = selectedPesananForComplete.items.every(i => i.checked)
                   if (!allChecked) {
                     alert('Tandai semua item sudah diterima terlebih dahulu!')
                     return
                   }
                   handleMarkArrived(selectedPesananForComplete.id)
                   setShowCompleteModal(false)
                 }}
                 className="bg-green-500 hover:bg-green-600"
               >
                 <CheckCircle className="w-4 h-4 mr-2" />
                 Selesai ({selectedPesananForComplete.items.filter(i => i.checked).length}/{selectedPesananForComplete.items.length})
               </Button>
             )}
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  )
}
