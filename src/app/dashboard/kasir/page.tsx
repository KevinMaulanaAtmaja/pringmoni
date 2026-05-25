"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, Clock, CheckCircle, SearchX, XCircle, Banknote, CreditCard, Landmark, ArrowRightLeft, Printer, ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { MetodePembayaran, StatusBayar } from "@/types"
import { getPesananBelumBayar, getPesananRiwayatKasir, prosesPembayaranTunai, prosesPembayaranTransfer, batalkanPesananKasir, accPesanan, generateQRISCode, confirmQrisPayment } from "@/app/actions/kasir"
import { checkMidtransStatusReadOnly } from "@/app/actions/pesanan"
import { useSession } from "next-auth/react"
import { printStruk } from "@/lib/print-struk"

const metodeLabels: Record<MetodePembayaran, string> = {
  qris: "QRIS",
  tunai: "Tunai",
  transfer: "Transfer",
}

const metodeIcons: Record<MetodePembayaran, React.ReactNode> = {
  qris: <CreditCard className="w-6 h-6" />,
  tunai: <Banknote className="w-6 h-6" />,
  transfer: <Landmark className="w-6 h-6" />,
}

const statusBayarColors: Record<StatusBayar, string> = {
  menunggu: "bg-yellow-100 text-yellow-800 border-yellow-300",
  berhasil: "bg-green-100 text-green-800 border-green-300",
  dibatalkan: "bg-red-100 text-red-800 border-red-300",
}

const metodeColors: Record<MetodePembayaran, string> = {
  qris: "bg-blue-100 text-blue-800 border-blue-300",
  tunai: "bg-green-100 text-green-800 border-green-300",
  transfer: "bg-purple-100 text-purple-800 border-purple-300",
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
  biayaAdmin: number | null
  ppn: number | null
  metodePembayaran: string | null
  jumlahBayar: number | null
  kembalian: number
  midtransOrderId: string | null
  createdAt: Date | string
  updatedAt?: Date | string
  waiterUsername: string | null
  kasirUsername?: string | null
  namaPelanggan?: string | null
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
  const [inputRibuan, setInputRibuan] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [filterText, setFilterText] = useState("")
  const [filterId, setFilterId] = useState("")
  const [belumFilter, setBelumFilter] = useState<'all' | 'konfirmasi' | 'menunggu'>('all')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelPesananId, setCancelPesananId] = useState<number | null>(null)
  const [isConfirmCancelDialogOpen, setIsConfirmCancelDialogOpen] = useState(false)
  const [cancelConfirmInput, setCancelConfirmInput] = useState("")
  const [isBayarTunaiFinal, setIsBayarTunaiFinal] = useState(false)
const [showConfirmProcess, setShowConfirmProcess] = useState(false)
  const [showMethodWarning, setShowMethodWarning] = useState(false)
  const [midtransStatus, setMidtransStatus] = useState<string | null>(null)
  const [qrisQrUrl, setQrisQrUrl] = useState<string | null>(null)
  const [qrisTotalBayar, setQrisTotalBayar] = useState(0)
  const [midtransAutoPaid, setMidtransAutoPaid] = useState(false)
  const midtransAutoPaidRef = useRef(false)
  const pendingMethodAction = useRef<"tunai-step" | null>(null)
  const prevBelumIdsRef = useRef<Set<number>>(new Set())
  const initializedRef = useRef(false)
  const [newOrderAlert, setNewOrderAlert] = useState<{ meja: string; nama: string | null } | null>(null)

  function playNotification(nomorMeja: string, namaPelanggan?: string | null) {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)

      // Double beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = "sine"
        osc2.frequency.value = 660
        gain2.gain.value = 0.3
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 0.25)
      }, 300)
    } catch {}

    try {
      if ("speechSynthesis" in window) {
        const text = namaPelanggan
          ? `Pesanan baru dari meja ${nomorMeja}, atas nama ${namaPelanggan}`
          : `Pesanan baru dari meja ${nomorMeja}`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "id-ID"
        utterance.rate = 1
        speechSynthesis.speak(utterance)
      }
    } catch {}
  }

  const pesananBelumFiltered = pesananBelum.filter(p => {
    if (filterText) {
      const q = filterText.toLowerCase()
      const invoice = nomorPesanan(p.id, p.createdAt).toLowerCase()
      if (!p.nomorMeja.toLowerCase().includes(q) &&
          !invoice.includes(q) &&
          !`#${p.id}`.includes(q)) return false
    }
    if (belumFilter === 'konfirmasi') {
      if (!(p.statusPembayaran === 'berhasil' && p.statusPesanan === 'menunggu')) return false
    } else if (belumFilter === 'menunggu') {
      if (p.statusPembayaran === 'berhasil' && p.statusPesanan === 'menunggu') return false
    }
    return true
  })

  const [belumPage, setBelumPage] = useState(1)
  const belumPerPage = 6
  const totalBelumPages = Math.ceil(pesananBelumFiltered.length / belumPerPage) || 1
  const paginatedBelum = pesananBelumFiltered.slice(
    (belumPage - 1) * belumPerPage,
    belumPage * belumPerPage
  )

  useEffect(() => {
    setBelumPage(1)
  }, [pesananBelumFiltered.length])

  const pesananRiwayatFiltered = pesananRiwayat.filter(p => {
    if (filterId) {
      const q = filterId.toLowerCase()
      const invoice = nomorPesanan(p.id, p.createdAt).toLowerCase()
      if (!p.nomorMeja.toLowerCase().includes(q) &&
          !invoice.includes(q) &&
          !`#${p.id}`.includes(q)) return false
    }
    return true
  })

  const totalPendapatan = pesananRiwayatFiltered.reduce((sum, p) => sum + (p.totalHarga + (p.biayaAdmin || 0) + (p.ppn || 0)), 0)
  const jumlahQRIS = pesananRiwayatFiltered.filter(p => p.metodePembayaran === 'qris').length
  const jumlahTunai = pesananRiwayatFiltered.filter(p => p.metodePembayaran === 'tunai').length
  const jumlahTransfer = pesananRiwayatFiltered.filter(p => p.metodePembayaran === 'transfer').length

  const [riwayatPage, setRiwayatPage] = useState(1)
  const riwayatPerPage = 10
  const totalRiwayatPages = Math.ceil(pesananRiwayatFiltered.length / riwayatPerPage) || 1
  const paginatedRiwayat = pesananRiwayatFiltered.slice(
    (riwayatPage - 1) * riwayatPerPage,
    riwayatPage * riwayatPerPage
  )

  useEffect(() => {
    setRiwayatPage(1)
  }, [pesananRiwayatFiltered.length])

  const filterPeriodRef = useRef(filterPeriod)
  filterPeriodRef.current = filterPeriod

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [belumResult, riwayatResult] = await Promise.all([
        getPesananBelumBayar(),
        getPesananRiwayatKasir({ period: filterPeriodRef.current }),
      ])

      if ('error' in belumResult) {
        setError(belumResult.error)
        setPesananBelum([])
      } else {
        setPesananBelum(belumResult as unknown as Pesanan[])
      }
      
      if ('error' in riwayatResult) {
        setError(riwayatResult.error ?? null)
        setPesananRiwayat([])
      } else {
        setPesananRiwayat(riwayatResult.pesanan as unknown as Pesanan[])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError("Gagal mengambil data: " + (error?.message || "Koneksi database bermasalah"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling 5 detik — tanpa setLoading biar gak refresh halaman
  const pollData = useCallback(async () => {
    try {
      const [belumResult] = await Promise.all([
        getPesananBelumBayar(),
      ])

      if (!('error' in belumResult)) {
        setPesananBelum(belumResult as unknown as Pesanan[])
      }
    } catch {}
  }, [])

  useEffect(() => {
    const interval = setInterval(pollData, 5000)
    return () => clearInterval(interval)
  }, [pollData])

  // Deteksi pesanan baru
  useEffect(() => {
    const currentIds = new Set(pesananBelum.map(p => p.id))
    const newOrders = pesananBelum.filter(p => !prevBelumIdsRef.current.has(p.id))

    if (initializedRef.current && newOrders.length > 0) {
      for (const order of newOrders) {
        playNotification(order.nomorMeja, order.namaPelanggan)
      }
      const latest = newOrders[newOrders.length - 1]
      setNewOrderAlert({ meja: latest.nomorMeja, nama: latest.namaPelanggan ?? null })
      setTimeout(() => setNewOrderAlert(null), 5000)
    }

    if (pesananBelum.length > 0) {
      initializedRef.current = true
    }
    prevBelumIdsRef.current = currentIds
  }, [pesananBelum])

  // Midtrans polling when payment info dialog is open
  useEffect(() => {
    if (!selectedPesanan?.midtransOrderId || !showPaymentInfo || selectedMetode === "tunai" || paymentSuccess || midtransAutoPaid) return

    midtransAutoPaidRef.current = false

    const checkMidtrans = async () => {
      if (midtransAutoPaidRef.current) return
      const result = await checkMidtransStatusReadOnly(selectedPesanan.midtransOrderId!)
      if ('transaction_status' in result) {
        setMidtransStatus(result.transaction_status as string)
        if (result.isSuccess) {
          midtransAutoPaidRef.current = true
          setMidtransAutoPaid(true)
        } else if (result.isExpired) {
          midtransAutoPaidRef.current = true
          setMidtransAutoPaid(true)
          handlePaymentExpired()
        }
      }
    }

    checkMidtrans()
    const timer = setInterval(checkMidtrans, 5000)

    return () => clearInterval(timer)
  }, [selectedPesanan?.midtransOrderId, showPaymentInfo, selectedMetode, paymentSuccess, midtransAutoPaid])

  const fetchRiwayatOnly = useCallback(async () => {
    setError(null)
    try {
      const riwayatResult = await getPesananRiwayatKasir({ period: filterPeriodRef.current })
      if ('error' in riwayatResult) {
        setError(riwayatResult.error ?? null)
        setPesananRiwayat([])
      } else {
        setPesananRiwayat(riwayatResult.pesanan as unknown as Pesanan[])
      }
    } catch (error: any) {
      console.error("Error fetching riwayat:", error)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'riwayat') {
      fetchRiwayatOnly()
    }
  }, [filterPeriod])

  function openPayment(pesanan: Pesanan) {
    setSelectedPesanan(pesanan)
    setShowConfirmProcess(false)
    setSelectedMetode((pesanan.metodePembayaran as MetodePembayaran) || "qris")
    setJumlahBayar("")
    setInputRibuan("")
    setShowPaymentInfo(pesanan.statusPembayaran === 'berhasil')
    setPaymentSuccess(false)
    setIsBayarTunaiFinal(false)
    setMidtransStatus(null)
    setMidtransAutoPaid(false)
    setQrisQrUrl(null)
    setQrisTotalBayar(0)
    midtransAutoPaidRef.current = false
    setSubmitting(false)
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
        if (isNaN(jumlah) || jumlah < getGrandTotal(selectedPesanan, selectedMetode)) {
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
        setPaymentSuccess(true)
        setSubmitting(false)
      } else if (selectedMetode === "qris") {
        const result = await generateQRISCode(selectedPesanan.id)
        if ('error' in result) {
          alert(result.error)
          setSubmitting(false)
          return
        }
        setQrisQrUrl(result.qrUrl)
        setQrisTotalBayar(result.totalBayar)
        setShowPaymentInfo(true)
        setSubmitting(false)
        return
      } else {
        // Transfer: show payment info first
        setShowPaymentInfo(true)
        setSubmitting(false)
        return
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymentExpired() {
    if (!selectedPesanan) return
    setMidtransStatus("expired")
    await batalkanPesananKasir(selectedPesanan.id)
    fetchData()
  }

  function openCancelDialog(id: number) {
    setCancelPesananId(id)
    setIsCancelDialogOpen(true)
  }

  function handleBatalStep1() {
    setIsCancelDialogOpen(false)
    setCancelConfirmInput("")
    setIsConfirmCancelDialogOpen(true)
  }

  async function handleBatalFinal() {
    if (cancelConfirmInput !== "KONFIRMASI" || cancelPesananId === null) return

    setIsConfirmCancelDialogOpen(false)
    setCancelConfirmInput("")
    const id = cancelPesananId
    setCancelPesananId(null)

    const result = await batalkanPesananKasir(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      fetchData()
    }
  }

  async function handlePaymentConfirm() {
    if (!selectedPesanan || !selectedMetode || selectedMetode === "tunai") return

    setSubmitting(true)
    try {
      let result
      if (selectedPesanan.statusPembayaran === 'berhasil') {
        result = await accPesanan(selectedPesanan.id)
      } else if (selectedMetode === "qris") {
        result = await confirmQrisPayment(selectedPesanan.id)
      } else {
        result = await prosesPembayaranTransfer(selectedPesanan.id)
      }
      if ('error' in result) {
        alert(result.error)
        setSubmitting(false)
        return
      }
      setShowPaymentInfo(false)
      setPaymentSuccess(true)
      setSubmitting(false)
    } catch (error) {
      console.error("Payment error:", error)
      alert("Terjadi kesalahan")
      setSubmitting(false)
    }
  }

  function handleBayarTunaiStep(confirmed = false) {
    if (selectedMetode !== "tunai") return
    if (!confirmed && selectedPesanan?.metodePembayaran && selectedMetode !== selectedPesanan.metodePembayaran) {
      pendingMethodAction.current = "tunai-step"
      setShowMethodWarning(true)
      return
    }
    const jumlah = parseFloat(jumlahBayar)
    if (isNaN(jumlah) || jumlah < getGrandTotal(selectedPesanan, selectedMetode)) {
      alert("Jumlah bayar kurang dari total!")
      return
    }
    setIsBayarTunaiFinal(true)
  }



  function handleMethodWarningProceed() {
    setShowMethodWarning(false)
    const action = pendingMethodAction.current
    pendingMethodAction.current = null
    if (action === "tunai-step") handleBayarTunaiStep(true)
  }



  function isWithinMinutes(date: Date | string, menit: number) {
    return Date.now() - new Date(date).getTime() < menit * 60000
  }

  function nomorPesanan(id: number, date: Date | string) {
    const d = new Date(date)
    const tgl = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    return `ORD/${tgl}/${String(id).padStart(4, '0')}`
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function getGrandTotal(p: Pesanan | null | undefined, metode?: string) {
    if (!p) return 0
    const excludeFee = metode === 'tunai'
    return (p.totalHarga || 0) + (excludeFee ? 0 : (p.biayaAdmin || 0)) + (excludeFee ? 0 : (p.ppn || 0))
  }

  function formatSingkat(amount: number) {
    if (amount >= 1000000) {
      const jt = amount / 1000000
      return jt % 1 === 0 ? `${jt} jt` : `${jt.toFixed(1)} jt`
    }
    if (amount >= 1000) {
      const rb = amount / 1000
      return rb % 1 === 0 ? `${rb} rb` : `${rb.toFixed(1)} rb`
    }
    return String(amount)
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
      ? parseFloat(jumlahBayar) - getGrandTotal(selectedPesanan, selectedMetode)
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
    <div className="max-w-6xl mx-auto space-y-6">
      {newOrderAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white border-2 border-green-400 rounded-2xl px-8 py-6 shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200 max-w-sm text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="size-7 text-green-600" />
            </div>
            <p className="font-bold text-green-800 text-lg">Pesanan Baru!</p>
            <p className="text-green-700 mt-1">
              Meja {newOrderAlert.meja}
              {newOrderAlert.nama && <span> - {newOrderAlert.nama}</span>}
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800">Kelola Kasir</h1>
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
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

        {/* Filter */}
        <div className="flex items-center gap-2">
          {activeTab === "belum" ? (
            <>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex gap-1">
                  <Button
                    size="default"
                    variant={belumFilter === 'all' ? "default" : "outline"}
                    onClick={() => { setBelumFilter('all'); setBelumPage(1) }}
                    className="text-sm"
                  >
                    Semua
                  </Button>
                  <Button
                    size="default"
                    variant={belumFilter === 'konfirmasi' ? "default" : "outline"}
                    onClick={() => { setBelumFilter('konfirmasi'); setBelumPage(1) }}
                    className="text-sm"
                  >
                    Menunggu Konfirmasi
                  </Button>
                  <Button
                    size="default"
                    variant={belumFilter === 'menunggu' ? "default" : "outline"}
                    onClick={() => { setBelumFilter('menunggu'); setBelumPage(1) }}
                    className="text-sm"
                  >
                    Menunggu
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Cari #id / meja..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="max-w-[180px] text-sm h-9 pr-8"
                  />
                  {filterText && (
                    <button
                      type="button"
                      onClick={() => setFilterText("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 items-center flex-wrap">
                {(['all', 'today', 'week', 'month'] as const).map((period) => (
                  <Button
                    key={period}
                    size="default"
                    variant={filterPeriod === period ? "default" : "outline"}
                    onClick={() => setFilterPeriod(period)}
                    className="text-sm"
                  >
                    {period === 'all' ? 'Semua' : 
                     period === 'today' ? 'Hari Ini' :
                     period === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                  </Button>
                ))}
                <Input
                  type="text"
                  placeholder="Cari #id / meja..."
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  className="max-w-[160px] text-sm h-9"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterId(""); setFilterPeriod("all") }}
                  className={`h-9 px-2 text-sm ${filterId || filterPeriod !== 'all' ? '' : 'invisible'}`}
                >
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
        </div>

      {activeTab === "belum" ? (
        /* Tab Belum Bayar */
        pesananBelumFiltered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
            {filterText ? (
              <SearchX className="w-20 h-20 mx-auto mb-4 text-orange-400" />
            ) : (
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-400" />
            )}
            <p className="text-xl font-medium">
              {filterText ? `Tidak ditemukan "${filterText}"` : "Semua pesanan sudah dibayar"}
            </p>
          </div>
        ) : (
          <>
            <div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
             {paginatedBelum.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border-2 p-5 hover:shadow-lg transition-shadow flex flex-col">
                {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Meja {p.nomorMeja}</h3>
                      <p className="text-xs text-gray-500 font-mono">{nomorPesanan(p.id, p.createdAt)}</p>
                      <p className="text-sm text-gray-500">{formatWaktu(p.createdAt)}</p>
                      {p.waiterUsername && (
                        <span className="text-xs text-gray-400">Waiter: {p.waiterUsername}</span>
                      )}
                    </div>
                    <div className="flex gap-1 items-start">
                    {isWithinMinutes(p.createdAt, 1) && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">New</Badge>
                    )}
                    {p.statusPembayaran === 'berhasil' && p.statusPesanan === 'menunggu' ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1.5">
                      Sudah Dibayar
                    </Badge>
                  ) : p.metodePembayaran ? (
                    p.jumlahBayar && Number(p.jumlahBayar) > 0 ? (
                      <Badge className={`${statusBayarColors.menunggu} text-sm px-3 py-1.5`}>
                        Menunggu Konfirmasi
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1.5">
                        Menunggu
                      </Badge>
                    )
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1.5">
                      Belum Bayar
                    </Badge>
                  )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3 flex-1">
                  {p.namaPelanggan && (
                    <p className="text-xs text-gray-500 font-medium mb-2">Atas Nama: {p.namaPelanggan}</p>
                  )}
                  {p.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-sm text-gray-700">• {item.jumlah}x {item.namaMenu}</p>
                  ))}
                  {p.items.length > 3 && (
                    <p className="text-sm text-gray-400">...dan {p.items.length - 3} lainnya</p>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t pt-4">
                  {p.metodePembayaran && (
                    <div className="mb-3">
                      <Badge className={`${metodeColors[p.metodePembayaran as MetodePembayaran]} text-sm px-3 py-1`}>
                        {metodeLabels[p.metodePembayaran as MetodePembayaran]}
                      </Badge>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => openDetail(p)}
                      className="text-base min-h-[52px]"
                      aria-label="Lihat detail"
                    >
                      <Eye className="w-6 h-6" />
                    </Button>
                     {!isOwner && (
                      <>
                        {p.metodePembayaran ? (
                          <Button
                            className="text-base min-h-[52px]"
                            onClick={() => openPayment(p)}
                            aria-label="Proses pembayaran"
                          >
                            <CreditCard className="w-6 h-6" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="text-base min-h-[52px] opacity-50 cursor-not-allowed"
                            aria-label="Menunggu metode pembayaran"
                          >
                            <CreditCard className="w-6 h-6" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => openCancelDialog(p.id)}
                          className="text-base min-h-[52px]"
                          aria-label="Batalkan pesanan"
                        >
                          <XCircle className="w-6 h-6" />
                        </Button>
                      </>
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
              onClick={() => setBelumPage(p => Math.max(1, p - 1))}
              disabled={belumPage <= 1}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
              <span className="text-sm text-gray-500">
                {belumPage} / {totalBelumPages}
              </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBelumPage(p => Math.min(totalBelumPages, p + 1))}
              disabled={belumPage >= totalBelumPages}
              className="h-9"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          </>
        )
      ) : (
        /* Tab Riwayat */
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-800">{pesananRiwayatFiltered.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatSingkat(totalPendapatan)}
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

          <div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">No. Pesanan</TableHead>
                    <TableHead className="text-base">Meja</TableHead>
                    <TableHead className="text-base">Metode</TableHead>
                    <TableHead className="text-base">Kasir</TableHead>
                    <TableHead className="text-base">Total</TableHead>
                    <TableHead className="text-base">Status</TableHead>
                    <TableHead className="text-base">Waktu</TableHead>
                    <TableHead className="text-base text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {paginatedRiwayat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400 text-base">
                      {filterId ? "Tidak ada riwayat dengan filter tersebut" : "Belum ada riwayat pembayaran"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRiwayat.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{nomorPesanan(p.id, p.createdAt)}</TableCell>
                      <TableCell className="text-base">{p.nomorMeja}</TableCell>
                      <TableCell>
                        {p.statusPembayaran === 'dibatalkan' ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300 text-base px-3 py-1">-</Badge>
                        ) : p.metodePembayaran ? (
                          <Badge className={`${metodeColors[p.metodePembayaran as MetodePembayaran]} text-base px-3 py-1`}>
                            {metodeLabels[p.metodePembayaran as MetodePembayaran]}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-base">{p.kasirUsername || "-"}</TableCell>
                      <TableCell className="font-bold text-lg">{formatRupiah(p.totalHarga + (p.biayaAdmin || 0) + (p.ppn || 0))}</TableCell>
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
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={(open) => { if (!open) { setShowPaymentInfo(false); setPaymentSuccess(false); setIsPaymentOpen(false) } }}>
        <DialogContent className="max-w-lg gap-3" onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (paymentSuccess) return
            if (showPaymentInfo && selectedMetode !== "tunai") {
              handlePaymentConfirm()
            } else if (selectedMetode === "tunai") {
              if (isBayarTunaiFinal) {
                handleBayar()
              } else {
                handleBayarTunaiStep()
              }
            } else {
              handleBayar()
            }
          }
        }}>
          {paymentSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h2>
              <p className="text-gray-500 text-sm mb-4">Pesanan #{selectedPesanan?.id} telah dibayar</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { setIsPaymentOpen(false); setPaymentSuccess(false); pollData() }}>
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedPesanan) return
                    printStruk({
                      id: selectedPesanan.id,
                      nomorMeja: selectedPesanan.nomorMeja,
                      items: selectedPesanan.items.map(i => ({
                        nama: i.namaMenu,
                        jumlah: i.jumlah,
                        harga: Number(i.hargaSaatPesan),
                      })),
                      totalHarga: Number(selectedPesanan.totalHarga),
                      adminFee: selectedPesanan.biayaAdmin ? Number(selectedPesanan.biayaAdmin) : undefined,
                      ppn: selectedPesanan.ppn ? Number(selectedPesanan.ppn) : undefined,
                      metodePembayaran: selectedPesanan.metodePembayaran,
                      jumlahBayar: selectedPesanan.jumlahBayar ? Number(selectedPesanan.jumlahBayar) : undefined,
                      kembalian: Number(selectedPesanan.kembalian),
                      createdAt: selectedPesanan.createdAt,
                      kasirUsername: session?.user?.name || selectedPesanan.kasirUsername,
                      namaPelanggan: selectedPesanan.namaPelanggan,
                    })
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Cetak
                </Button>
              </div>
            </div>
          ) : showPaymentInfo && selectedMetode !== "tunai" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg text-center">
                  Pembayaran {metodeLabels[selectedMetode]}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-1">
                    {selectedMetode === "qris" ? (
                      <CreditCard className="w-full h-full text-blue-600" />
                    ) : (
                      <Landmark className="w-full h-full text-blue-600" />
                    )}
                  </div>
                  <p className="text-xl font-bold text-blue-800">
                    {selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan, selectedMetode))}
                  </p>
                  <p className="text-blue-600 text-xs">Total Tagihan</p>
                </div>
                {selectedMetode === "qris" && qrisQrUrl && (
                  <div className="bg-white rounded-xl p-4 flex flex-col items-center border">
                    <img
                      src={qrisQrUrl}
                      alt="QR Code Pembayaran"
                      className="w-56 h-56 object-contain"
                    />
                    <p className="text-[10px] text-gray-400 mt-2">Scan QR dengan aplikasi pembayaran</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Transaction ID</span>
                    <span className="font-mono text-xs font-bold">
                      TRX-{new Date().getFullYear()}{String(new Date().getMonth()+1).padStart(2,'0')}{String(new Date().getDate()).padStart(2,'0')}-{String(selectedPesanan?.id).padStart(6,'0')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Order ID</span>
                    <span className="font-mono text-xs font-bold">
                      {selectedPesanan && nomorPesanan(selectedPesanan.id, selectedPesanan.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Gross Amount</span>
                    <span className="font-bold text-sm">{selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan, selectedMetode))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Payment Type</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {metodeLabels[selectedMetode]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Transaction Time</span>
                    <span className="text-xs">{formatWaktu(new Date())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Transaction Status</span>
                    <Badge className={`text-xs ${
                      midtransStatus === "capture" || midtransStatus === "settlement"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : midtransStatus === "expire" || midtransStatus === "cancel" || midtransStatus === "deny" || midtransStatus === "failure" || midtransStatus === "expired"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}>
                      {!midtransStatus ? "Memeriksa..." : 
                       midtransStatus === "capture" || midtransStatus === "settlement" ? "Berhasil" :
                       midtransStatus === "pending" ? "Menunggu" :
                       midtransStatus === "expire" || midtransStatus === "expired" ? "Kadaluarsa" :
                       midtransStatus === "cancel" ? "Dibatalkan" :
                       midtransStatus === "deny" || midtransStatus === "failure" ? "Gagal" :
                       midtransStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Meja</span>
                    <span className="font-bold text-sm">{selectedPesanan?.nomorMeja}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Sistem otomatis mengecek status pembayaran setiap 5 detik.
                  {midtransStatus === "capture" || midtransStatus === "settlement"
                    ? " Pembayaran terdeteksi! Klik Konfirmasi untuk menyelesaikan."
                    : midtransStatus === "expire" || midtransStatus === "expired" || midtransStatus === "cancel" || midtransStatus === "deny" || midtransStatus === "failure"
                    ? " Pembayaran gagal/kadaluarsa. Silakan tutup dialog."
                    : " Tunggu pelanggan menyelesaikan pembayaran..."}
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowPaymentInfo(false); setSubmitting(false); setIsPaymentOpen(false); pollData() }}
                  className="text-sm flex-1"
                >
                  Tutup
                </Button>
                {(midtransStatus === "expire" || midtransStatus === "expired" || midtransStatus === "cancel" || midtransStatus === "deny" || midtransStatus === "failure") ? null : (
                <Button
                  onClick={() => handlePaymentConfirm()}
                  disabled={submitting || !(midtransStatus === "capture" || midtransStatus === "settlement")}
                  className="text-sm flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : midtransStatus === "capture" || midtransStatus === "settlement" ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  )}
                  {!midtransStatus ? "Memeriksa..." :
                   midtransStatus === "capture" || midtransStatus === "settlement" ? "Konfirmasi Pembayaran" :
                   "Menunggu Pembayaran..."}
                </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">Pembayaran - Meja {selectedPesanan?.nomorMeja}</DialogTitle>
              </DialogHeader>
              
              {!(isBayarTunaiFinal && selectedMetode === "tunai") && (
              <>
              {/* Total Display */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-800">
                    {selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan, selectedMetode))}
                </p>
                <p className="text-green-600 text-xs">Total Tagihan</p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Pilih Metode Pembayaran</p>
                {selectedPesanan?.metodePembayaran && (
                  <p className="text-xs text-blue-600">
                    Customer memilih: <strong>{metodeLabels[selectedPesanan.metodePembayaran as MetodePembayaran]}</strong>
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {(["qris", "tunai", "transfer"] as MetodePembayaran[]).map((metode) => {
      const current = selectedPesanan?.metodePembayaran
      const isDisabled = current && current !== metode && (
        current === "tunai" || metode !== "tunai"
      )
                    return (
                      <button
                        key={metode}
                        type="button"
                        disabled={!!isDisabled}
                        onClick={() => setSelectedMetode(metode)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                          selectedMetode === metode
                            ? "border-green-600 bg-green-50 scale-105"
                            : isDisabled
                              ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {metodeIcons[metode]}
                        <span className="text-xs font-semibold">{metodeLabels[metode]}</span>
                      </button>
                    )}
                  )}
                </div>
                {selectedPesanan?.metodePembayaran && selectedMetode !== selectedPesanan.metodePembayaran && (
                  selectedPesanan.metodePembayaran !== "tunai" && selectedMetode === "tunai" ? (
                    <p className="text-xs text-amber-600">
                      Metode diubah dari {metodeLabels[selectedPesanan.metodePembayaran as MetodePembayaran]} — pastikan pelanggan setuju.
                    </p>
                  ) : selectedPesanan.metodePembayaran === "tunai" && selectedMetode !== "tunai" ? (
                    <p className="text-xs text-red-600">
                      Hanya bisa ganti dari QRIS/Transfer ke Tunai
                    </p>
                  ) : null
                )}
              </div>
              </>
              )}

              {/* Tunai Input */}
              {isBayarTunaiFinal && selectedMetode === "tunai" ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 mx-auto text-yellow-600" />
                  <p className="text-base font-bold">Konfirmasi Pembayaran Tunai</p>
                  <div className="bg-white rounded-lg p-3 space-y-1.5 text-left text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Tagihan</span>
                      <span className="font-bold">{selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan, selectedMetode))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibayar</span>
                      <span className="font-bold text-green-700">{formatRupiah(parseFloat(jumlahBayar) || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1.5">
                      <span>Kembalian</span>
                      <span className={kembalian >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatRupiah(kembalian)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700">Pastikan jumlah uang yang diterima sudah sesuai.</p>
                </div>
              ) : selectedMetode === "tunai" && (
                <div className="space-y-3 bg-white rounded-xl border p-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Jumlah Uang Diterima</p>
                    <p className="text-[10px] text-gray-400">Masukkan nominal dalam ribuan (contoh: 50 = Rp 50.000)</p>
                  </div>
                  <div className="relative max-w-xs mx-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold pointer-events-none">Rp</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={inputRibuan}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        const num = parseInt(raw) || 0
                        setInputRibuan(raw)
                        setJumlahBayar(num > 0 ? String(num * 1000) : '')
                      }}
                      placeholder="0"
                      className="text-2xl py-5 text-center font-bold pl-10 pr-14"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold pointer-events-none">
                      .000
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm divide-y divide-gray-200">
                    <div className="flex justify-between pb-1.5">
                      <span className="text-gray-500">Total Tagihan</span>
                      <span className="font-semibold">{selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan, selectedMetode))}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-gray-500">Dibayar</span>
                      <span className="font-semibold text-green-700">{inputRibuan ? formatRupiah(parseFloat(jumlahBayar) || 0) : "-"}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-base">
                      <span className="font-medium">Kembalian</span>
                      <span className={inputRibuan ? (kembalian >= 0 ? "font-bold text-green-600" : "font-bold text-red-600") : "text-gray-400"}>
                        {inputRibuan ? formatRupiah(kembalian) : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                {isBayarTunaiFinal && selectedMetode === "tunai" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsBayarTunaiFinal(false)}
                      className="text-sm flex-1"
                    >
                      Kembali
                    </Button>
                    <Button
                      onClick={() => handleBayar()}
                      disabled={submitting}
                      className="text-sm flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Bayar Tunai
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsPaymentOpen(false)}
                      className="text-sm flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={selectedMetode === "tunai" ? () => handleBayarTunaiStep() : () => handleBayar()}
                      disabled={selectedMetode === "tunai" ? !selectedPesanan?.metodePembayaran : submitting || !selectedPesanan?.metodePembayaran}
                      className="text-sm flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {selectedMetode === "tunai" ? "Bayar Tunai" : "Konfirmasi"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden grid-rows-[auto_1fr_auto]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detail Pesanan #{selectedPesanan?.id} - Meja {selectedPesanan?.nomorMeja}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col min-h-0 overflow-hidden">
            <div className="space-y-4 overflow-y-auto min-h-0 pr-1" style={{ maxHeight: 210 }}>
              {selectedPesanan && selectedPesanan.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-lg font-medium">{item.namaMenu}</p>
                    <p className="text-base text-gray-500">{item.jumlah}x @ {formatRupiah(item.hargaSaatPesan)}</p>
                  </div>
                  <span className="text-lg font-semibold">{formatRupiah(item.hargaSaatPesan * item.jumlah)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-green-700">{selectedPesanan && formatRupiah(getGrandTotal(selectedPesanan))}</span>
              </div>
            </div>
            {selectedPesanan?.metodePembayaran && (
              <div className="text-base text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg mt-4">
                {selectedPesanan.namaPelanggan && <p>Pelanggan: <span className="font-medium">{selectedPesanan.namaPelanggan}</span></p>}
                <p>Metode: <Badge className={`${metodeColors[selectedPesanan.metodePembayaran as MetodePembayaran]} text-base px-3 py-1`}>{metodeLabels[selectedPesanan.metodePembayaran as MetodePembayaran]}</Badge></p>
                {selectedPesanan.kasirUsername && <p>Kasir: {selectedPesanan.kasirUsername}</p>}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {selectedPesanan && selectedPesanan.statusPembayaran !== 'menunggu' && (
              <Button variant="outline" size="lg" onClick={() => printStruk({
                id: selectedPesanan.id,
                nomorMeja: selectedPesanan.nomorMeja,
                items: selectedPesanan.items.map(i => ({
                  nama: i.namaMenu,
                  jumlah: i.jumlah,
                  harga: Number(i.hargaSaatPesan),
                })),
                totalHarga: Number(selectedPesanan.totalHarga),
                adminFee: selectedPesanan.biayaAdmin ? Number(selectedPesanan.biayaAdmin) : undefined,
                ppn: selectedPesanan.ppn ? Number(selectedPesanan.ppn) : undefined,
                metodePembayaran: selectedPesanan.metodePembayaran,
                jumlahBayar: selectedPesanan.jumlahBayar ? Number(selectedPesanan.jumlahBayar) : undefined,
                kembalian: Number(selectedPesanan.kembalian),
                createdAt: selectedPesanan.createdAt,
                waiterUsername: selectedPesanan.waiterUsername,
                kasirUsername: selectedPesanan.kasirUsername,
                namaPelanggan: selectedPesanan.namaPelanggan,
              })}>
                <Printer className="w-5 h-5 mr-2" />
                Cetak Struk
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => setIsDetailOpen(false)} className="text-base">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Cancel Confirmation - Step 1 */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Batalkan Pesanan</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
            <p className="text-xl font-semibold mb-2">Yakin ingin batalkan pesanan ini?</p>
            <p className="text-gray-500">Pesanan #{cancelPesananId} akan dibatalkan dan tidak bisa dikembalikan.</p>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setIsCancelDialogOpen(false)
                setCancelPesananId(null)
              }}
              className="text-base flex-1"
            >
              Tidak
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleBatalStep1}
              className="text-base flex-1"
            >
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation - Step 2: Type KONFIRMASI */}
      <Dialog open={isConfirmCancelDialogOpen} onOpenChange={setIsConfirmCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Konfirmasi Pembatalan</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <p className="text-lg font-semibold text-red-700">PERHATIAN!</p>
              <p className="text-sm text-red-600 mt-1">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Ketik <span className="font-bold text-red-600">KONFIRMASI</span> untuk melanjutkan pembatalan:
              </p>
              <Input
                type="text"
                value={cancelConfirmInput}
                onChange={(e) => setCancelConfirmInput(e.target.value)}
                placeholder="Ketik KONFIRMASI"
                className="text-lg py-5 text-center font-bold tracking-widest"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setIsConfirmCancelDialogOpen(false)
                setCancelConfirmInput("")
                setCancelPesananId(null)
              }}
              className="text-base flex-1"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleBatalFinal}
              disabled={cancelConfirmInput !== "KONFIRMASI"}
              className="text-base flex-1"
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Method Change Warning */}
      <Dialog open={showMethodWarning} onOpenChange={(open) => { if (!open) { setShowMethodWarning(false); pendingMethodAction.current = null } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg text-center text-amber-600">Peringatan!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-amber-600">!</span>
            </div>
            <p className="text-base font-semibold">Metode pembayaran diubah!</p>
            <p className="text-sm text-gray-500">
              Customer memilih <strong>{selectedPesanan?.metodePembayaran ? metodeLabels[selectedPesanan.metodePembayaran as MetodePembayaran] : '-'}</strong>,
              Anda akan memproses dengan <strong>{metodeLabels[selectedMetode]}</strong>.
            </p>
            <p className="text-sm text-amber-700 font-medium">
              Pastikan pelanggan sudah setuju dengan perubahan ini.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowMethodWarning(false); pendingMethodAction.current = null }}
              className="text-sm flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleMethodWarningProceed}
              className="text-sm flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
