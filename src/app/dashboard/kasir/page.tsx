"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, Clock, CheckCircle, XCircle, Banknote, CreditCard, Landmark, ArrowRightLeft } from "lucide-react"
import { MetodePembayaran, StatusBayar } from "@/types"
import { getPesananBelumBayar, getPesananRiwayatKasir, prosesPembayaranTunai, prosesPembayaranQRIS, prosesPembayaranTransfer, konfirmasiPembayaran, batalkanPesananKasir } from "@/app/actions/kasir"
import { useSession } from "next-auth/react"

const metodeLabels: Record<MetodePembayaran, string> = {
  qris: "QRIS",
  tunai: "Tunai",
  transfer: "Transfer",
}

const metodeIcons: Record<MetodePembayaran, React.ReactNode> = {
  qris: <CreditCard className="w-8 h-8" />,
  tunai: <Banknote className="w-8 h-8" />,
  transfer: <Landmark className="w-8 h-8" />,
}

const statusBayarColors: Record<StatusBayar, string> = {
  menunggu: "bg-yellow-100 text-yellow-800 border-yellow-300",
  berhasil: "bg-green-100 text-green-800 border-green-300",
  dibatalkan: "bg-red-100 text-red-800 border-red-300",
}

interface PesananItem {
  id: number
  menuId: number
  namaMenu: string
  jumlah: number
  hargaSaatPesan: number
  catatanItem: string | null
}

interface Pesanan {
  id: number
  mejaId: number
  nomorMeja: string
  statusPesanan: string
  statusPembayaran: string
  totalHarga: number
  metodePembayaran: string | null
  jumlahBayar: number | null
  kembalian: number
  createdAt: Date | string
  updatedAt?: Date | string
  waiterUsername: string | null
  kasirUsername?: string | null
  items: PesananItem[]
}

export default function KasirPage() {
  const { data: session, status } = useSession()
  const role = session?.user?.role as string || 'kasir'
  const isOwner = role === 'owner'

  const [activeTab, setActiveTab] = useState<"belum" | "riwayat">(isOwner ? "riwayat" : "belum")
  const [pesananBelum, setPesananBelum] = useState<Pesanan[]>([])
  const [pesananRiwayat, setPesananRiwayat] = useState<Pesanan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedMetode, setSelectedMetode] = useState<MetodePembayaran>("qris")
  const [jumlahBayar, setJumlahBayar] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const totalPendapatan = pesananRiwayat.reduce((sum, p) => sum + p.totalHarga, 0)
  const jumlahQRIS = pesananRiwayat.filter(p => p.metodePembayaran === 'qris').length
  const jumlahTunai = pesananRiwayat.filter(p => p.metodePembayaran === 'tunai').length
  const jumlahTransfer = pesananRiwayat.filter(p => p.metodePembayaran === 'transfer').length

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [belumResult, riwayatResult] = await Promise.all([
        getPesananBelumBayar(),
        getPesananRiwayatKasir({ period: filterPeriod })
      ])

      if ('error' in belumResult) {
        setError(belumResult.error)
        setPesananBelum([])
      } else {
        setPesananBelum(belumResult as unknown as Pesanan[])
      }
      
      if ('error' in riwayatResult) {
        setError(riwayatResult.error)
        setPesananRiwayat([])
      } else {
        setPesananRiwayat(riwayatResult as unknown as Pesanan[])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError("Gagal mengambil data: " + (error?.message || "Koneksi database bermasalah"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setError("Tidak terautentikasi. Silakan login ulang.")
      setLoading(false)
    }
  }, [status, fetchData])

  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'riwayat') {
      fetchData()
    }
  }, [filterPeriod])

  function openPayment(pesanan: Pesanan) {
    setSelectedPesanan(pesanan)
    setSelectedMetode("qris")
    setJumlahBayar("")
    setPaymentSuccess(false)
    setIsPaymentOpen(true)
  }

  function openDetail(pesanan: Pesanan) {
    setSelectedPesanan(pesanan)
    setIsDetailOpen(true)
  }

  async function handleBayar() {
    if (!selectedPesanan) return

    setSubmitting(true)
    try {
      if (selectedMetode === "tunai") {
        const jumlah = parseFloat(jumlahBayar)
        if (isNaN(jumlah) || jumlah < selectedPesanan.totalHarga) {
          alert("Jumlah bayar kurang dari total!")
          setSubmitting(false)
          return
        }

        const result = await prosesPembayaranTunai(selectedPesanan.id, jumlah)
        if ('error' in result) {
          alert(result.error)
          setSubmitting(false)
          return
        }
        alert("Pembayaran Tunai pending. Cek di daftar & klik Konfirmasi setelah terima uang.")
        setIsPaymentOpen(false)
        fetchData()
      } else if (selectedMetode === "qris") {
        const result = await prosesPembayaranQRIS(selectedPesanan.id)
        if ('error' in result) {
          alert(result.error)
          setSubmitting(false)
          return
        }
        setPaymentSuccess(true)
        setTimeout(() => {
          setIsPaymentOpen(false)
          setPaymentSuccess(false)
          fetchData()
        }, 1500)
      } else if (selectedMetode === "transfer") {
        const result = await prosesPembayaranTransfer(selectedPesanan.id)
        if ('error' in result) {
          alert(result.error)
          setSubmitting(false)
          return
        }
        setPaymentSuccess(true)
        setTimeout(() => {
          setIsPaymentOpen(false)
          setPaymentSuccess(false)
          fetchData()
        }, 1500)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBatal(id: number) {
    if (!confirm("Yakin batalkan pesanan ini?")) return
    
    const result = await batalkanPesananKasir(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      fetchData()
    }
  }

  async function handleKonfirmasi(id: number) {
    if (!confirm("Konfirmasi pembayaran Tunai ini?")) return
    
    const result = await konfirmasiPembayaran(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      alert("Pembayaran berhasil dikonfirmasi!")
      fetchData()
    }
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function formatWaktu(date: Date | string) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(new Date(date))
  }

  const kembalian =
    selectedMetode === "tunai" && jumlahBayar
      ? parseFloat(jumlahBayar) - (selectedPesanan?.totalHarga || 0)
      : 0

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">Memuat data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium">Error: {error}</p>
          <Button size="lg" className="mt-4" onClick={() => { setError(null); fetchData(); }}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          {!isOwner && (
            <Button
              size="lg"
              variant={activeTab === "belum" ? "default" : "outline"}
              onClick={() => setActiveTab("belum")}
              className="text-base px-6"
            >
              <Clock className="w-5 h-5 mr-2" />
              Belum Bayar ({pesananBelum.length})
            </Button>
          )}
          <Button
            size="lg"
            variant={activeTab === "riwayat" ? "default" : "outline"}
            onClick={() => setActiveTab("riwayat")}
            className="text-base px-6"
          >
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Riwayat ({pesananRiwayat.length})
          </Button>
        </div>

        {/* Filter Period - Only show on Riwayat tab */}
        {activeTab === "riwayat" && (
          <div className="flex gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((period) => (
              <Button
                key={period}
                size="default"
                variant={filterPeriod === period ? "default" : "outline"}
                onClick={() => setFilterPeriod(period)}
                className="text-sm"
              >
                {period === 'all' ? 'Semua (100 Terakhir)' : 
                 period === 'today' ? 'Hari Ini' :
                 period === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
              </Button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "belum" ? (
        /* Tab Belum Bayar */
        pesananBelum.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-400" />
            <p className="text-xl font-medium">Semua pesanan sudah dibayar</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pesananBelum.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border-2 p-5 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Meja {p.nomorMeja}</h3>
                    <p className="text-sm text-gray-500">#{p.id} · {formatWaktu(p.createdAt)}</p>
                    {p.waiterUsername && (
                      <p className="text-xs text-gray-400">Waiter: {p.waiterUsername}</p>
                    )}
                    {p.metodePembayaran && (
                      <p className="text-xs text-gray-400 mt-1">
                        Metode: {metodeLabels[p.metodePembayaran as MetodePembayaran]}
                      </p>
                    )}
                  </div>
                  {p.metodePembayaran ? (
                    <Badge className={`${statusBayarColors.menunggu} text-sm px-3 py-1`}>
                      Menunggu Konfirmasi
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1">
                      Belum Bayar
                    </Badge>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                  {p.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-700">
                      <span className="text-base">{item.jumlah}x {item.namaMenu}</span>
                      <span className="font-medium">{formatRupiah(item.hargaSaatPesan * item.jumlah)}</span>
                    </div>
                  ))}
                  {p.items.length > 3 && (
                    <p className="text-sm text-gray-400 text-center">+{p.items.length - 3} item lainnya</p>
                  )}
                </div>

                {/* Total & Actions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-3xl font-bold text-green-700">{formatRupiah(p.totalHarga)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => openDetail(p)}
                      className="text-base"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    {!isOwner && (
                      <>
                        {p.metodePembayaran === 'tunai' && p.statusPembayaran === 'menunggu' ? (
                          <Button
                            size="lg"
                            className="text-base bg-green-600 hover:bg-green-700"
                            onClick={() => handleKonfirmasi(p.id)}
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Konfirmasi
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className="text-base col-span-2"
                            onClick={() => openPayment(p)}
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Bayar
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={() => handleBatal(p.id)}
                          className="text-base"
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab Riwayat */
        <>
          {/* Stats Cards */}
          {pesananRiwayat.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-800">{pesananRiwayat.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatRupiah(totalPendapatan)}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">QRIS</p>
                <p className="text-3xl font-bold text-blue-600">
                  {jumlahQRIS}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Tunai</p>
                <p className="text-3xl font-bold text-green-600">
                  {jumlahTunai}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Transfer</p>
                <p className="text-3xl font-bold text-purple-600">
                  {jumlahTransfer}
                </p>
              </div>
            </div>
          )}

          {pesananRiwayat.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
              <p className="text-xl font-medium">Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">ID</TableHead>
                      <TableHead className="text-base">Meja</TableHead>
                      <TableHead className="text-base">Metode</TableHead>
                      <TableHead className="text-base">Total</TableHead>
                      <TableHead className="text-base">Status</TableHead>
                      <TableHead className="text-base">Waktu</TableHead>
                      <TableHead className="text-base text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {pesananRiwayat.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-base">#{p.id}</TableCell>
                      <TableCell className="text-base">{p.nomorMeja}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-base px-3 py-1">
                          {p.metodePembayaran ? metodeLabels[p.metodePembayaran as MetodePembayaran] : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-lg">{formatRupiah(p.totalHarga)}</TableCell>
                        <TableCell>
                          <Badge className={`${statusBayarColors[p.statusPembayaran as StatusBayar]} text-base px-3 py-1`}>
                            {p.statusPembayaran === 'berhasil' ? 'Berhasil' : 
                             p.statusPembayaran === 'dibatalkan' ? 'Dibatalkan' : 'Menunggu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-base">
                          {formatWaktu(p.updatedAt || p.createdAt)}
                        </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="lg" onClick={() => openDetail(p)}>
                          <Eye className="w-5 h-5 mr-2" />Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-lg">
          {paymentSuccess ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Pembayaran Berhasil!</h2>
              <p className="text-gray-500 text-lg">Pesanan #{selectedPesanan?.id} telah dibayar</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Pembayaran - Meja {selectedPesanan?.nomorMeja}</DialogTitle>
              </DialogHeader>
              
              {/* Total Display */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-green-800">
                  {selectedPesanan && formatRupiah(selectedPesanan.totalHarga)}
                </p>
                <p className="text-green-600 mt-2">Total Tagihan</p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <p className="text-lg font-semibold">Pilih Metode Pembayaran</p>
                <div className="grid grid-cols-3 gap-4">
                  {(["qris", "tunai", "transfer"] as MetodePembayaran[]).map((metode) => (
                    <button
                      key={metode}
                      type="button"
                      onClick={() => setSelectedMetode(metode)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        selectedMetode === metode
                          ? "border-green-600 bg-green-50 scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {metodeIcons[metode]}
                      <span className="text-base font-semibold">{metodeLabels[metode]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tunai Input */}
              {selectedMetode === "tunai" && (
                <div className="space-y-4 bg-gray-50 rounded-xl p-5">
                  <div>
                    <p className="text-base mb-2">Jumlah Uang Diterima</p>
                    <Input
                      type="number"
                      value={jumlahBayar}
                      onChange={(e) => setJumlahBayar(e.target.value)}
                      placeholder="Masukkan jumlah uang"
                      className="text-2xl py-6 text-center font-bold"
                      autoFocus
                    />
                  </div>
                  {jumlahBayar && (
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-lg">
                        <span>Total</span>
                        <span>{selectedPesanan && formatRupiah(selectedPesanan.totalHarga)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Dibayar</span>
                        <span>{formatRupiah(parseFloat(jumlahBayar) || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Kembalian</span>
                        <span className={kembalian >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatRupiah(kembalian)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsPaymentOpen(false)}
                  className="text-base"
                >
                  Batal
                </Button>
                <Button
                  size="lg"
                  onClick={handleBayar}
                  disabled={submitting || (selectedMetode === "tunai" && (!jumlahBayar || parseFloat(jumlahBayar) < (selectedPesanan?.totalHarga || 0)))}
                  className="text-base px-8"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Konfirmasi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detail Pesanan #{selectedPesanan?.id} - Meja {selectedPesanan?.nomorMeja}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPesanan && selectedPesanan.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-lg font-medium">{item.namaMenu}</p>
                  <p className="text-base text-gray-500">{item.jumlah}x @ {formatRupiah(item.hargaSaatPesan)}</p>
                </div>
                <span className="text-lg font-semibold">{formatRupiah(item.hargaSaatPesan * item.jumlah)}</span>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-green-700">{selectedPesanan && formatRupiah(selectedPesanan.totalHarga)}</span>
              </div>
            </div>
            {selectedPesanan?.metodePembayaran && (
              <div className="text-base text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                <p>Metode: <Badge variant="outline" className="text-base px-3 py-1">{metodeLabels[selectedPesanan.metodePembayaran as MetodePembayaran]}</Badge></p>
                {selectedPesanan.kasirUsername && <p>Kasir: {selectedPesanan.kasirUsername}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setIsDetailOpen(false)} className="text-base">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
