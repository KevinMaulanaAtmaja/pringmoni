"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPesananForDashboard, updateStatusPesanan, markPesananSelesai, getPesananById } from "@/app/actions/pesanan"
import { StatusPesanan } from "@prisma/client"
import { getMeja } from "@/app/actions/meja"
import type { Meja } from "@/types"
import { Eye, RotateCcw, Printer, CheckCircle, SearchX, Inbox, XCircle, ChevronLeft, ChevronRight, Clock, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { printStruk } from "@/lib/print-struk"

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
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
  mejaId: number
  meja: string
  tipeMeja: string
  status: string
  statusBayar: string
  total: number
  items: number
  waktu: string
  waiterUsername?: string | null
  namaPelanggan?: string | null
}

interface PesananDetail {
  id: number
  nomor_meja: string
  tipe_meja: string
  status_pesanan: string
  status_pembayaran: string
  total_harga: number
  metode_pembayaran?: string | null
  jumlah_bayar?: number | null
  kembalian?: number
  created_at: Date
  waiter_username: string | null
  kasir_username: string | null
  nama_pelanggan?: string | null
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
  const { data: session } = useSession()
  const isOwner = session?.user?.role === 'owner'

  const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif")

  const [pesanan, setPesanan] = useState<PesananItem[]>([])
  const [mejas, setMejas] = useState<Meja[]>([])
  const [loading, setLoading] = useState(true)

  const [filterSearchAktif, setFilterSearchAktif] = useState("")
  const [filterStatusAktif, setFilterStatusAktif] = useState<string>("all")
  const [filterSearch, setFilterSearch] = useState("")
  const [filterMejaId, setFilterMejaId] = useState<string>("all")
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const [selectedPesanan, setSelectedPesanan] = useState<PesananDetail | null>(null)
  const [selectedPesananForComplete, setSelectedPesananForComplete] = useState<PesananDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailLoadingComplete, setDetailLoadingComplete] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("checkedMap")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const toggleItemCheck = useCallback((pesananId: number, itemId: number) => {
    setCheckedMap(prev => {
      const next = { ...prev, [`${pesananId}-${itemId}`]: !prev[`${pesananId}-${itemId}`] }
      sessionStorage.setItem("checkedMap", JSON.stringify(next))
      return next
    })
  }, [])
  
  const pesananAktif = pesanan.filter(p => p.status === 'menunggu' || p.status === 'diproses')
  const pesananRiwayat = pesanan.filter(p => p.status !== 'menunggu' && p.status !== 'diproses')

  const filteredAktif = useMemo(() => {
    let result = pesananAktif
    if (filterStatusAktif !== "all") {
      result = result.filter(p => p.status === filterStatusAktif)
    }
    if (filterSearchAktif) {
      const q = filterSearchAktif.toLowerCase()
      result = result.filter(p =>
        `#${p.id}`.includes(q) ||
        p.meja.toLowerCase().includes(q)
      )
    }
    return result
  }, [pesananAktif, filterSearchAktif, filterStatusAktif])

  const [aktifPage, setAktifPage] = useState(1)
  const aktifPerPage = 6
  const totalAktifPages = Math.ceil(filteredAktif.length / aktifPerPage) || 1
  const paginatedAktif = filteredAktif.slice(
    (aktifPage - 1) * aktifPerPage,
    aktifPage * aktifPerPage
  )

  useEffect(() => {
    setAktifPage(1)
  }, [filteredAktif.length])

  const filteredRiwayat = useMemo(() => {
    let result = pesananRiwayat

    if (filterPeriod !== 'all') {
      const now = new Date()
      let startDate: Date
      if (filterPeriod === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (filterPeriod === 'week') {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      result = result.filter(p => new Date(p.waktu) >= startDate)
    }

    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      result = result.filter(p =>
        `#${p.id}`.includes(q) ||
        p.meja.toLowerCase().includes(q)
      )
    }

    if (filterMejaId && filterMejaId !== "all") {
      result = result.filter(p => p.mejaId === parseInt(filterMejaId))
    }

    return result
  }, [pesananRiwayat, filterPeriod, filterSearch, filterMejaId])

  const totalPendapatan = useMemo(() =>
    filteredRiwayat
      .filter(p => p.statusBayar === 'berhasil')
      .reduce((sum, p) => sum + p.total, 0),
    [filteredRiwayat]
  )
  const jumlahSelesai = useMemo(() =>
    filteredRiwayat.filter(p => p.status === 'selesai').length,
    [filteredRiwayat]
  )
  const jumlahDibatalkan = useMemo(() =>
    filteredRiwayat.filter(p => p.status === 'dibatalkan').length,
    [filteredRiwayat]
  )
  const jumlahLunas = useMemo(() =>
    filteredRiwayat.filter(p => p.statusBayar === 'berhasil').length,
    [filteredRiwayat]
  )
  const mejaFavorit = useMemo(() => {
    if (filteredRiwayat.length === 0) return null
    const counts: Record<string, number> = {}
    filteredRiwayat.forEach(p => {
      counts[p.meja] = (counts[p.meja] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return { meja: sorted[0][0], count: sorted[0][1] }
  }, [filteredRiwayat])

  const [riwayatPage, setRiwayatPage] = useState(1)
  const riwayatPerPage = 10
  const totalRiwayatPages = Math.ceil(filteredRiwayat.length / riwayatPerPage) || 1
  const paginatedRiwayat = filteredRiwayat.slice(
    (riwayatPage - 1) * riwayatPerPage,
    riwayatPage * riwayatPerPage
  )

  useEffect(() => {
    setRiwayatPage(1)
  }, [filteredRiwayat.length])

  const fetchData = async () => {
    setLoading(true)
    setDebugError(null)
    try {
      const [pesananResult, mejaResult] = await Promise.all([
        getPesananForDashboard(),
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
  }, [])
  
  const resetFilter = () => {
    setFilterSearchAktif("")
    setFilterSearch("")
    setFilterMejaId("all")
    setFilterPeriod("all")
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
          items: detail.items.map(item => ({
            ...item,
            checked: checkedMap[`${pesananId}-${item.id}`] || false
          }))
        })
      }
    } catch {
      setShowCompleteModal(false)
    } finally {
      setDetailLoadingComplete(false)
    }
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
    setCheckedMap(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${id}-`)) delete next[k]
      })
      sessionStorage.setItem("checkedMap", JSON.stringify(next))
      return next
    })
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs & Filter */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <Button
            size="lg"
            variant={activeTab === "aktif" ? "default" : "outline"}
            onClick={() => setActiveTab("aktif")}
            className={`text-base px-6 ${activeTab === "aktif" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Pesanan Aktif ({filteredAktif.length})
          </Button>
          <Button
            size="lg"
            variant={activeTab === "riwayat" ? "default" : "outline"}
            onClick={() => setActiveTab("riwayat")}
            className={`text-base px-6 ${activeTab === "riwayat" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Riwayat ({pesananRiwayat.length})
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "aktif" && (
            <>
              {(["all", "menunggu", "diproses"] as const).map((s) => (
                <Button
                  key={s}
                  size="default"
                  variant={filterStatusAktif === s ? "default" : "outline"}
                  onClick={() => setFilterStatusAktif(s)}
                  className={`text-sm ${filterStatusAktif === s ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  {s === 'all' ? 'Semua' : s === 'menunggu' ? 'Menunggu' : 'Diproses'}
                </Button>
              ))}
            </>
          )}
          {activeTab === "riwayat" && (
            <>
              {(['all', 'today', 'week', 'month'] as const).map((period) => (
                <Button
                  key={period}
                  size="default"
                  variant={filterPeriod === period ? "default" : "outline"}
                  onClick={() => setFilterPeriod(period)}
                  className={`text-sm ${filterPeriod === period ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  {period === 'all' ? 'Semua' : 
                   period === 'today' ? 'Hari Ini' :
                   period === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                </Button>
              ))}
            </>
          )}
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari #id / meja..."
              value={activeTab === "aktif" ? filterSearchAktif : filterSearch}
              onChange={(e) => activeTab === "aktif" ? setFilterSearchAktif(e.target.value) : setFilterSearch(e.target.value)}
              className="max-w-[160px] text-sm h-9 pr-7"
            />
             {activeTab === "aktif" && filterSearchAktif && (
               <button
                 type="button"
                 onClick={() => setFilterSearchAktif("")}
                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
               >
                 <XCircle className="w-4 h-4" />
               </button>
             )}
          </div>
          {activeTab === "riwayat" && (
            <>
              <Select value={filterMejaId} onValueChange={setFilterMejaId}>
                <SelectTrigger className="w-[100px] h-9 text-sm">
                  <SelectValue placeholder="Meja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {mejas.map((meja) => (
                    <SelectItem key={meja.id} value={meja.id.toString()}>
                      Meja {meja.nomorMeja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilter}
                className={`h-9 px-2 ${filterSearch || filterMejaId || filterPeriod !== 'all' ? '' : 'invisible'}`}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {activeTab === "aktif" ? (
        /* ---- TAB AKTIF ---- */
        filteredAktif.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
            {filterSearchAktif ? (
              <SearchX className="w-20 h-20 mx-auto mb-4 text-orange-400" />
            ) : (
              <Inbox className="w-20 h-20 mx-auto mb-4 text-blue-400" />
            )}
            <p className="text-xl font-medium">{filterSearchAktif ? `Tidak ditemukan "${filterSearchAktif}"` : "Tidak ada pesanan aktif"}</p>
          </div>
        ) : (
          <>
<div className="h-[480px] overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
             {paginatedAktif.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border-2 border-l-blue-500 p-5 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Meja {p.meja}</h3>
                    <p className="text-sm text-gray-500">#{p.id} · {new Date(p.waktu).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                    {p.waiterUsername && <p className="text-xs text-gray-400 mt-0.5">Waiter: {p.waiterUsername}</p>}
                  </div>
                  <Badge className={`${statusBayarColors[p.statusBayar]} text-sm px-3 py-1.5`}>
                    {p.statusBayar === 'menunggu' ? 'Belum Bayar' : p.statusBayar === 'berhasil' ? 'Lunas' : 'Dibatalkan'}
                  </Badge>
                </div>
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3 flex-1">
                  <div className="flex justify-between text-gray-700">
                    <span className="text-base">{p.items} item</span>
                    <span className="font-bold text-lg text-blue-700">Rp {p.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="lg" onClick={() => openDetailModal(p.id)} className="text-base">
                      <Eye className="w-5 h-5 mr-2" /> Detail
                    </Button>
                    {!isOwner && p.statusBayar === 'berhasil' && (
                      <Button size="lg" onClick={() => openDetailModalForComplete(p.id)} className="text-base bg-blue-600 hover:bg-blue-700">
                        <CheckCircle className="w-5 h-5 mr-2" /> Selesai
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
            </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAktifPage(p => Math.max(1, p - 1))}
              disabled={aktifPage <= 1}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm text-gray-500">
              {aktifPage} / {totalAktifPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAktifPage(p => Math.min(totalAktifPages, p + 1))}
              disabled={aktifPage >= totalAktifPages}
              className="h-9"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          </>
        )
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Riwayat</p>
                <p className="text-3xl font-bold text-gray-800">{filteredRiwayat.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-700">
                  {totalPendapatan >= 1000
                    ? totalPendapatan >= 1000000
                      ? `${(totalPendapatan / 1000000).toFixed(1).replace(/\.0$/, "")} jt`
                      : `${(totalPendapatan / 1000).toFixed(1).replace(/\.0$/, "")} rb`
                    : String(totalPendapatan)}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Selesai</p>
                <p className="text-3xl font-bold text-blue-600">{jumlahSelesai}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Dibatalkan</p>
                <p className="text-3xl font-bold text-red-600">{jumlahDibatalkan}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Meja Terfavorit</p>
                <p className="text-2xl font-bold text-purple-600 truncate">
                  {mejaFavorit ? `Meja ${mejaFavorit.meja}` : "-"}
                </p>
                {mejaFavorit && (
                  <p className="text-sm text-gray-400 mt-1">{mejaFavorit.count} pesanan</p>
                )}
              </div>
            </div>

          {/* Table Riwayat */}
          <div className="h-[520px] overflow-y-auto">
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Meja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waiter</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRiwayat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Tidak ada riwayat pesanan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRiwayat.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">#{p.id}</TableCell>
                      <TableCell>{p.meja}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[p.status]}>
                          {p.status === 'menunggu' ? 'Menunggu' : 
                           p.status === 'diproses' ? 'Diproses' :
                           p.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.waiterUsername || '-'}</TableCell>
                      <TableCell>Rp {p.total.toLocaleString("id-ID")}</TableCell>
                      <TableCell>{p.items} item</TableCell>
                      <TableCell>
                        {new Date(p.waktu).toLocaleString("id-ID", {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openDetailModal(p.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
            </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRiwayatPage(p => Math.max(1, p - 1))}
              disabled={riwayatPage <= 1}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm text-gray-500">
              {riwayatPage} / {totalRiwayatPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRiwayatPage(p => Math.min(totalRiwayatPages, p + 1))}
              disabled={riwayatPage >= totalRiwayatPages}
              className="h-9"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

        {/* Detail Modal - View Only */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden grid-rows-[auto_1fr_auto]">
            <DialogHeader>
              <DialogTitle>Detail Pesanan #{selectedPesanan?.id}</DialogTitle>
            </DialogHeader>
              {detailLoading ? (
               <div className="py-8 text-center">Memuat detail pesanan...</div>
             ) : selectedPesanan ? (
               <div className="flex flex-col min-h-0 overflow-hidden">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                   <div>
                     <span className="text-gray-500">Meja:</span>
                     <p className="font-medium">{selectedPesanan.nomor_meja}</p>
                   </div>
                   <div>
                     <span className="text-gray-500">Pelanggan:</span>
                     <p className="font-medium">{selectedPesanan.nama_pelanggan || '-'}</p>
                   </div>
                   <div>
                     <span className="text-gray-500">Tipe:</span>
                     <p className="font-medium">{selectedPesanan.tipe_meja === 'lesehan' ? 'Lesehan' : 'Kursi'}</p>
                   </div>
                   <div>
                     <span className="text-gray-500">Status:</span>
                     <Badge className={`${statusColors[selectedPesanan.status_pesanan]} text-xs px-2 py-0.5`}>
                       {selectedPesanan.status_pesanan === 'menunggu' ? 'Menunggu' : 
                        selectedPesanan.status_pesanan === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                     </Badge>
                   </div>
                   <div>
                     <span className="text-gray-500">Status Bayar:</span>
                     <Badge className={`${statusBayarColors[selectedPesanan.status_pembayaran]} text-xs px-2 py-0.5`}>
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
                 
                 <h4 className="font-medium text-xs mb-1.5 mt-3">Item Pesanan</h4>
                 <div className="overflow-y-auto min-h-0" style={{ maxHeight: 150 }}>
                   <div className="border rounded-lg divide-y">
                     {selectedPesanan.items.map((item) => (
                       <div key={item.id} className="p-2 flex items-center justify-between text-xs">
                         <div className="flex items-center gap-3">
                           <div>
                             <p className="font-medium">{item.nama_menu}</p>
                             <p className="text-gray-500">
                               {item.jumlah}x Rp {Number(item.harga_saat_pesan).toLocaleString("id-ID")}
                             </p>
                             {item.catatan_item && (
                               <p className="text-amber-600">Catatan: {item.catatan_item}</p>
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
            <DialogFooter className="gap-2">
              {selectedPesanan && selectedPesanan.status_pesanan !== 'menunggu' && (
                <Button variant="outline" size="lg" onClick={() => printStruk({
                  id: selectedPesanan.id,
                  nomorMeja: selectedPesanan.nomor_meja,
                  items: selectedPesanan.items.map(i => ({
                    nama: i.nama_menu,
                    jumlah: i.jumlah,
                    harga: Number(i.harga_saat_pesan),
                  })),
                  totalHarga: Number(selectedPesanan.total_harga),
                  metodePembayaran: selectedPesanan.metode_pembayaran,
                  jumlahBayar: selectedPesanan.jumlah_bayar ? Number(selectedPesanan.jumlah_bayar) : undefined,
                  kembalian: selectedPesanan.kembalian ? Number(selectedPesanan.kembalian) : undefined,
                  createdAt: selectedPesanan.created_at,
                  waiterUsername: selectedPesanan.waiter_username,
                  kasirUsername: selectedPesanan.kasir_username,
                  namaPelanggan: selectedPesanan.nama_pelanggan,
                })}>
                  <Printer className="w-4 h-4 mr-1" />
                  Cetak Struk
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Modal - With Checkboxes */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden grid-rows-[auto_1fr_auto]">
            <DialogHeader>
              <DialogTitle>Selesaikan Pesanan #{selectedPesananForComplete?.id}</DialogTitle>
            </DialogHeader>
             {detailLoadingComplete ? (
              <div className="py-8 text-center">Memuat detail pesanan...</div>
            ) : selectedPesananForComplete ? (
              <div className="flex flex-col min-h-0 overflow-hidden">
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
                
                <div className="mb-3 mt-4">
                  <h4 className="font-medium">Centang Item yang Sudah Diterima</h4>
                </div>
                <div className="overflow-y-auto min-h-0" style={{ maxHeight: 210 }}>
                  <div className="border rounded-lg divide-y">
                    {selectedPesananForComplete.items.map((item) => {
                      const isChecked = checkedMap[`${selectedPesananForComplete.id}-${item.id}`] || false
                      return (
                        <div 
                          key={item.id} 
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleItemCheck(selectedPesananForComplete.id, item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemCheck(selectedPesananForComplete.id, item.id)}
                               className="w-5 h-5 rounded accent-blue-600"
                            />
                            <div>
                              <p className={`font-medium ${isChecked ? 'line-through text-gray-400' : ''}`}>
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
                          <p className={`font-medium ${isChecked ? 'line-through text-gray-400' : ''}`}>
                            Rp {(item.jumlah * Number(item.harga_saat_pesan)).toLocaleString("id-ID")}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    {selectedPesananForComplete.items.filter(i => checkedMap[`${selectedPesananForComplete.id}-${i.id}`]).length} / {selectedPesananForComplete.items.length} item dicek
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
                   const allChecked = selectedPesananForComplete.items.every(i => checkedMap[`${selectedPesananForComplete.id}-${i.id}`])
                   if (!allChecked) {
                     alert('Tandai semua item sudah diterima terlebih dahulu!')
                     return
                   }
                   handleMarkArrived(selectedPesananForComplete.id)
                   setShowCompleteModal(false)
                 }}
                  className="bg-blue-600 hover:bg-blue-700"
               >
                 <CheckCircle className="w-4 h-4 mr-2" />
                 Selesai ({selectedPesananForComplete.items.filter(i => checkedMap[`${selectedPesananForComplete.id}-${i.id}`]).length}/{selectedPesananForComplete.items.length})
               </Button>
             )}
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  )
}
