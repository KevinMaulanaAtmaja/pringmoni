"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, Phone, Clock, XCircle, CheckCircle, Plus, Minus, Search, Trash2, ImageIcon, ShoppingBag, ArrowLeft, ArrowRight, AlertTriangle, X } from "lucide-react"
import { useSession } from "next-auth/react"

import {
  getReservasi,
  createReservasi,
  confirmKedatanganReservasi,
  cancelReservasi,
  expireReservasi,
  getMejaUntukReservasi,
  verifikasiDpCustomer,
} from "@/app/actions/reservasi"
import { getMenusForCustomer } from "@/app/actions/pesanan"
import { getKategoriMenus } from "@/app/actions/menu"
import { hitungRincianDp, DP_PERSEN } from "@/lib/dp"

type StatusFilter = "all" | "menunggu_kedatangan" | "dikonfirmasi" | "batal" | "expired"

interface ReservasiItemRow {
  id: number
  menuId: number
  namaMenu: string
  jumlah: number
  hargaSaatPesan: number
  catatanItem: string | null
}

interface ReservasiRow {
  id: number
  kodeReservasi: string | null
  sumber: string
  mejaId: number
  nomorMeja: string
  namaPelanggan: string
  noHp: string | null
  jumlahOrang: number
  waktuKedatangan: Date | string
  batasKonfirmasi: Date | string
  catatan: string | null
  statusReservasi: string
  pesananId: number | null
  createdBy: string | null
  confirmedBy: string | null
  confirmedAt: Date | string | null
  cancelledAt: Date | string | null
  createdAt: Date | string
  items: ReservasiItemRow[]
  totalHarga: number
  dpPersen: number
  dpNominal: number
  dpMetode: string | null
  dpStatus: string
  dpPaidAt: Date | string | null
  dpBuktiUrl: string | null
  alasanBatal: string | null
}

interface MejaRow {
  id: number
  nomorMeja: string
  kapasitas: number
  statusMeja: string
  tokenMeja: string
  reservasiAktif: {
    id: number
    mejaId: number
    namaPelanggan: string
    waktuKedatangan: Date | string
    statusReservasi: string
  } | null
}

interface MenuRow {
  id: number
  namaMenu: string
  harga: number
  statusMenu: string
  porsiTersedia: number
  fotoUrl?: string | null
  kategori?: string
  deskripsi?: string | null
}

interface ReservasiItemDraft {
  menuId: number
  jumlah: number
  catatan: string
}

const ALASAN_CEPAT = [
  "Pelanggan tidak datang",
  "Jadwal berubah",
  "Salah input data",
  "Meja dibutuhkan",
]

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Semua",
  menunggu_kedatangan: "Menunggu Kedatangan",
  dikonfirmasi: "Dikonfirmasi",
  batal: "Dibatalkan",
  expired: "Expired",
}

const METODE_DP_LABEL: Record<string, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
}

function formatKategoriNama(nama: string) {
  return nama
    .split(" ")
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ")
}

export default function ReservasiPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role as string) || "owner"
  const canReservasi = role === "owner" || role === "cashier" || role === "waiter"

  const [reservasiList, setReservasiList] = useState<ReservasiRow[]>([])
  const [mejaReservasi, setMejaReservasi] = useState<MejaRow[]>([])
  const [menusReservasi, setMenusReservasi] = useState<MenuRow[]>([])
  const [kategorisReservasi, setKategorisReservasi] = useState<{ id: number; namaKategori: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReservasi, setLoadingReservasi] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [reservasiForm, setReservasiForm] = useState({
    mejaId: "",
    namaPelanggan: "",
    noHp: "",
    jumlahOrang: "2",
    waktuKedatangan: "",
    catatan: "",
    dpMetode: "tunai",
  })
  const [reservasiItems, setReservasiItems] = useState<ReservasiItemDraft[]>([])
  const [menuSearch, setMenuSearch] = useState("")
  const [activeKategori, setActiveKategori] = useState("Semua")
  const [reservasiStep, setReservasiStep] = useState<1 | 2>(1)
  const [submittingReservasi, setSubmittingReservasi] = useState(false)
  const [filterText, setFilterText] = useState("")
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all")
  const [cancelTarget, setCancelTarget] = useState<ReservasiRow | null>(null)
  const [cancelAlasan, setCancelAlasan] = useState("")
  const [submittingCancel, setSubmittingCancel] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<ReservasiRow | null>(null)
  const [submittingConfirm, setSubmittingConfirm] = useState(false)
  const [verifyingDpId, setVerifyingDpId] = useState<number | null>(null)
  const [confirmResult, setConfirmResult] = useState<{
    pesananId: number
    namaPelanggan: string
    nomorMeja: string
  } | null>(null)
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4500)
    return () => clearTimeout(timer)
  }, [notice])

  function showNotice(type: "success" | "error" | "info", message: string) {
    setNotice({ type, message })
  }

  const fetchReservasiData = useCallback(async () => {
    if (!canReservasi) {
      setLoading(false)
      return
    }
    setLoadingReservasi(true)
    try {
      try {
        await expireReservasi()
      } catch (e) {
        console.error(e)
      }
      const [resSettled, mejaSettled, menuSettled, kategoriSettled] = await Promise.allSettled([
        getReservasi({ status: "all" }),
        getMejaUntukReservasi(),
        getMenusForCustomer(),
        getKategoriMenus(),
      ])
      const resResult = resSettled.status === "fulfilled" ? resSettled.value : undefined
      const mejaResult = mejaSettled.status === "fulfilled" ? mejaSettled.value : undefined
      const menuResult = menuSettled.status === "fulfilled" ? menuSettled.value : undefined
      const kategoriResult = kategoriSettled.status === "fulfilled" ? kategoriSettled.value : undefined
      for (const settled of [resSettled, mejaSettled, menuSettled, kategoriSettled]) {
        if (settled.status === "rejected") console.error(settled.reason)
      }
      if (Array.isArray(resResult)) setReservasiList(resResult as ReservasiRow[])
      if (Array.isArray(mejaResult)) setMejaReservasi(mejaResult as MejaRow[])
      setMenusReservasi(Array.isArray(menuResult) ? (menuResult as MenuRow[]) : [])
      setKategorisReservasi(
        Array.isArray(kategoriResult)
          ? (kategoriResult as { id: number; namaKategori: string }[])
          : []
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingReservasi(false)
      setLoading(false)
    }
  }, [canReservasi])

  useEffect(() => {
    fetchReservasiData()
  }, [fetchReservasiData])

  const filteredReservasi = reservasiList.filter((r) => {
    if (filterStatus !== "all" && r.statusReservasi !== filterStatus) return false
    if (filterText) {
      const q = filterText.toLowerCase()
      const matchNama = r.namaPelanggan.toLowerCase().includes(q)
      const matchMeja = r.nomorMeja.toLowerCase().includes(q)
      const matchHp = r.noHp?.toLowerCase().includes(q) ?? false
      if (!matchNama && !matchMeja && !matchHp) return false
    }
    return true
  })

  const kategoriMenu = useMemo(
    () => ["Semua", ...kategorisReservasi.map((k) => k.namaKategori)],
    [kategorisReservasi]
  )

  const menuTersedia = useMemo(() => {
    let list = menusReservasi.filter((m) => m.statusMenu === "tersedia" && m.porsiTersedia > 0)
    if (activeKategori !== "Semua") list = list.filter((m) => m.kategori === activeKategori)
    const q = menuSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (m) =>
        m.namaMenu.toLowerCase().includes(q) ||
        (m.kategori ?? "").toLowerCase().includes(q)
    )
  }, [menusReservasi, menuSearch, activeKategori])

  const menuById = useMemo(
    () => new Map(menusReservasi.map((m) => [m.id, m])),
    [menusReservasi]
  )

  const totalPreorder = reservasiItems.reduce((sum, item) => {
    const menu = menuById.get(item.menuId)
    return sum + (menu ? menu.harga * item.jumlah : 0)
  }, 0)

  const rincianDp = useMemo(() => hitungRincianDp(totalPreorder), [totalPreorder])
  const dpNominal = rincianDp.dpNominal
  const sisaTagihan = rincianDp.sisaTagihan

  function qtyMenu(menuId: number) {
    return reservasiItems.find((i) => i.menuId === menuId)?.jumlah ?? 0
  }

  function tambahMenu(menuId: number) {
    const stok = menuById.get(menuId)?.porsiTersedia ?? 0
    setReservasiItems((prev) => {
      const exist = prev.find((i) => i.menuId === menuId)
      if (exist) {
        return prev.map((i) =>
          i.menuId === menuId
            ? { ...i, jumlah: Math.min(Math.max(1, stok), i.jumlah + 1) }
            : i
        )
      }
      return [...prev, { menuId, jumlah: 1, catatan: "" }]
    })
  }

  function ubahJumlahMenu(menuId: number, delta: number) {
    const stok = menuById.get(menuId)?.porsiTersedia ?? 1
    setReservasiItems((prev) =>
      prev.map((i) =>
        i.menuId === menuId
          ? { ...i, jumlah: Math.min(Math.max(1, stok), Math.max(1, i.jumlah + delta)) }
          : i
      )
    )
  }

  function setJumlahMenu(menuId: number, value: string) {
    const stok = menuById.get(menuId)?.porsiTersedia ?? 1
    const parsed = parseInt(value)
    setReservasiItems((prev) =>
      prev.map((i) =>
        i.menuId === menuId
          ? { ...i, jumlah: Math.min(Math.max(1, stok), Number.isNaN(parsed) ? 1 : parsed) }
          : i
      )
    )
  }

  function ubahCatatanItem(menuId: number, catatan: string) {
    setReservasiItems((prev) =>
      prev.map((i) => (i.menuId === menuId ? { ...i, catatan } : i))
    )
  }

  function hapusMenu(menuId: number) {
    setReservasiItems((prev) => prev.filter((i) => i.menuId !== menuId))
  }

  function resetFormReservasi() {
    setReservasiForm({ mejaId: "", namaPelanggan: "", noHp: "", jumlahOrang: "2", waktuKedatangan: "", catatan: "", dpMetode: "tunai" })
    setReservasiItems([])
    setMenuSearch("")
    setActiveKategori("Semua")
    setReservasiStep(1)
  }

  function handleNextStep() {
    if (!reservasiForm.mejaId || !reservasiForm.namaPelanggan.trim() || !reservasiForm.waktuKedatangan) {
      showNotice("error", "Meja, nama pelanggan, dan waktu kedatangan wajib diisi")
      return
    }
    if (!reservasiForm.jumlahOrang || parseInt(reservasiForm.jumlahOrang) < 1) {
      showNotice("error", "Jumlah orang minimal 1")
      return
    }
    setReservasiStep(2)
  }

  async function handleCreateReservasi() {
    if (!reservasiForm.mejaId || !reservasiForm.namaPelanggan.trim() || !reservasiForm.waktuKedatangan) {
      showNotice("error", "Meja, nama pelanggan, dan waktu kedatangan wajib diisi")
      return
    }
    if (reservasiItems.length === 0) {
      showNotice("error", "Reservasi wajib memesan minimal 1 menu (DP 20% dihitung dari pre-order)")
      return
    }
    setSubmittingReservasi(true)
    try {
      const items = reservasiItems
        .filter((i) => Number.isInteger(i.menuId) && i.menuId > 0)
        .map((i) => ({ menuId: i.menuId, jumlah: Math.max(1, i.jumlah), catatan: i.catatan || null }))
      const result = await createReservasi({
        mejaId: parseInt(reservasiForm.mejaId),
        namaPelanggan: reservasiForm.namaPelanggan,
        noHp: reservasiForm.noHp || null,
        jumlahOrang: parseInt(reservasiForm.jumlahOrang) || 2,
        waktuKedatangan: new Date(reservasiForm.waktuKedatangan).toISOString(),
        catatan: reservasiForm.catatan || null,
        items,
        dpMetode: reservasiForm.dpMetode as "tunai" | "qris" | "transfer",
      })
      if ("error" in result) {
        showNotice("error", result.error || "Gagal membuat reservasi")
        return
      }
      showNotice("success", "Reservasi berhasil dibuat")
      setIsCreateOpen(false)
      resetFormReservasi()
      fetchReservasiData()
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmittingReservasi(false)
    }
  }

  function openConfirmDialog(reservasi: ReservasiRow) {
    setConfirmTarget(reservasi)
  }

  async function handleConfirmKedatangan() {
    if (!confirmTarget) return
    setSubmittingConfirm(true)
    try {
      const result = await confirmKedatanganReservasi(confirmTarget.id)
      const pesananId = "pesananId" in result ? result.pesananId : undefined
      if (typeof pesananId !== "number") {
        showNotice("error", ("error" in result && result.error) || "Gagal mengonfirmasi reservasi")
        return
      }
      setConfirmResult({
        pesananId,
        namaPelanggan: confirmTarget.namaPelanggan,
        nomorMeja: confirmTarget.nomorMeja,
      })
      setConfirmTarget(null)
      fetchReservasiData()
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmittingConfirm(false)
    }
  }

  async function handleVerifikasiDp(reservasi: ReservasiRow) {
    setVerifyingDpId(reservasi.id)
    try {
      const result = await verifikasiDpCustomer(reservasi.id)
      if ("error" in result) {
        showNotice("error", result.error || "Gagal memverifikasi DP")
        return
      }
      showNotice("success", `DP reservasi ${reservasi.kodeReservasi ?? `#${reservasi.id}`} terverifikasi`)
      fetchReservasiData()
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setVerifyingDpId(null)
    }
  }

  function openCancelDialog(reservasi: ReservasiRow) {
    setCancelTarget(reservasi)
    setCancelAlasan("")
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    setSubmittingCancel(true)
    try {
      const result = await cancelReservasi(cancelTarget.id, cancelAlasan.trim() || undefined)
      if ("error" in result) {
        showNotice("error", result.error || "Gagal membatalkan reservasi")
        return
      }
      showNotice("success", "Reservasi dibatalkan")
      setCancelTarget(null)
      setCancelAlasan("")
      fetchReservasiData()
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmittingCancel(false)
    }
  }

  function formatWaktu(date: Date | string) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(new Date(date))
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Reservasi</h1>
          <p className="text-sm text-gray-500">Kelola reservasi meja secara terpisah dari kasir</p>
        </div>
        {canReservasi && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Buat Reservasi
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center flex-wrap mb-2">
        {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((s) => (
          <Button
            key={s}
            size="default"
            variant={filterStatus === s ? "default" : "outline"}
            onClick={() => setFilterStatus(s)}
            className="text-sm"
          >
            {STATUS_LABEL[s]}
          </Button>
        ))}
        <div className="relative ml-auto">
          <Input
            type="text"
            placeholder="Cari nama pelanggan / meja / no HP..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-[240px] text-sm h-9 pr-8"
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

      {loadingReservasi ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : filteredReservasi.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
          <Search className="w-20 h-20 mx-auto mb-4 text-orange-400" />
          <p className="text-xl font-medium">
            {filterText ? `Tidak ditemukan "${filterText}"` : "Belum ada reservasi"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filteredReservasi.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">Meja {r.nomorMeja}</h3>
                    <Badge
                      className={
                        r.statusReservasi === "menunggu_kedatangan"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.statusReservasi === "dikonfirmasi"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {STATUS_LABEL[r.statusReservasi as StatusFilter] ?? r.statusReservasi}
                    </Badge>
                    {r.sumber === "online" && (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                        Online
                      </Badge>
                    )}
                  </div>
                  {r.kodeReservasi && (
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{r.kodeReservasi}</p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" /> {r.namaPelanggan} - {r.jumlahOrang} orang
                  </p>
                  {r.noHp && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {r.noHp}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Kedatangan: {formatWaktu(r.waktuKedatangan)}
                  </p>
                  {r.batasKonfirmasi && (
                    <p className="text-xs text-gray-500 mt-1">Batas Konfirmasi: {formatWaktu(r.batasKonfirmasi)}</p>
                  )}
                  {r.catatan && <p className="text-xs text-gray-500 mt-1">Catatan: {r.catatan}</p>}
                </div>
              </div>
              {r.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2.5 text-sm space-y-1.5 border border-gray-100">
                  <p className="font-medium text-xs text-gray-600">Pre-order ({r.items.reduce((s, i) => s + i.jumlah, 0)} item):</p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {r.items.map((it) => (
                      <p key={it.id} className="text-xs text-gray-700">
                        • {it.jumlah}x {it.namaMenu}{" "}
                        {it.catatanItem && <span className="text-gray-400">({it.catatanItem})</span>}
                      </p>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-1.5 mt-1 text-xs space-y-0.5">
                    <div className="flex justify-between font-medium text-gray-700">
                      <span>Total Pre-order</span>
                      <span>{formatRupiah(r.totalHarga)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>DP {r.dpPersen}% ({METODE_DP_LABEL[r.dpMetode ?? ""] ?? r.dpMetode ?? "-"})</span>
                      <span>{formatRupiah(r.dpNominal)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Badge
                        variant="outline"
                        className={
                          r.dpStatus === "berhasil"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : r.dpStatus === "menunggu"
                            ? "border-amber-300 bg-amber-50 text-amber-800"
                            : "border-gray-300 bg-gray-50 text-gray-700"
                        }
                      >
                        {r.dpStatus === "berhasil"
                          ? "DP Terverifikasi"
                          : r.dpStatus === "menunggu"
                          ? "DP Menunggu Verifikasi"
                          : `DP ${r.dpStatus}`}
                      </Badge>
                      {r.dpBuktiUrl && (
                        <a
                          href={r.dpBuktiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 underline"
                        >
                          <ImageIcon className="w-3 h-3" /> Lihat bukti DP
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Sisa Tagihan</span>
                      <span>{formatRupiah(Math.max(0, r.totalHarga - r.dpNominal))}</span>
                    </div>
                  </div>
                </div>
              )}
              {r.statusReservasi === "menunggu_kedatangan" && r.sumber === "online" && r.dpStatus === "menunggu" && (
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleVerifikasiDp(r)}
                  disabled={verifyingDpId === r.id}
                >
                  {verifyingDpId === r.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Verifikasi DP
                </Button>
              )}
              {r.statusReservasi === "menunggu_kedatangan" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => openConfirmDialog(r)}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Konfirmasi Kedatangan
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => openCancelDialog(r)}>
                    <XCircle className="w-4 h-4 mr-1" /> Batalkan
                  </Button>
                </div>
              )}
              {r.statusReservasi === "dikonfirmasi" && r.pesananId && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/kasir?tab=riwayat">Lihat di Kasir (Pesanan #{r.pesananId})</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (open) setReservasiStep(1)
        }}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="shrink-0 border-b bg-gradient-to-br from-emerald-50/70 via-white to-white px-6 pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle>Buat Reservasi (Offline)</DialogTitle>
                <DialogDescription>
                  Meja akan di-hold dengan status &quot;Dipesan&quot;. Stok tidak dipotong saat reservasi dibuat, baru
                  dipotong saat kedatangan dikonfirmasi.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  reservasiStep === 1 ? "text-green-700" : "text-gray-400"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    reservasiStep === 1
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  1
                </span>
                Detail Reservasi
              </span>
              <span className="h-px w-6 bg-gray-200" />
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  reservasiStep === 2 ? "text-green-700" : "text-gray-400"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    reservasiStep === 2
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  2
                </span>
                Pilih Menu
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
            {reservasiStep === 1 ? (
            <div className="max-w-3xl mx-auto">
              {/* Kotak 1: Detail Reservasi */}
              <section className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold">Detail Reservasi</h3>
                    <p className="text-xs text-gray-500">Data pelanggan &amp; jadwal kedatangan</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Meja *</Label>
                    <Select
                      value={reservasiForm.mejaId}
                      onValueChange={(v) => setReservasiForm({ ...reservasiForm, mejaId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih meja" />
                      </SelectTrigger>
                      <SelectContent>
                        {mejaReservasi
                          .filter((m) => m.statusMeja === "kosong" && !m.reservasiAktif)
                          .map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              Meja {m.nomorMeja} ({m.kapasitas} org)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Jumlah Orang *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={reservasiForm.jumlahOrang}
                      onChange={(e) => setReservasiForm({ ...reservasiForm, jumlahOrang: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Nama Pelanggan *</Label>
                    <Input
                      value={reservasiForm.namaPelanggan}
                      onChange={(e) => setReservasiForm({ ...reservasiForm, namaPelanggan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>No. HP</Label>
                    <Input
                      value={reservasiForm.noHp}
                      onChange={(e) => setReservasiForm({ ...reservasiForm, noHp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Waktu Kedatangan *</Label>
                    <Input
                      type="datetime-local"
                      value={reservasiForm.waktuKedatangan}
                      onChange={(e) => setReservasiForm({ ...reservasiForm, waktuKedatangan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Catatan</Label>
                    <textarea
                      className="border rounded-lg p-2 text-sm w-full min-h-16 outline-none focus:border-green-400"
                      value={reservasiForm.catatan}
                      onChange={(e) => setReservasiForm({ ...reservasiForm, catatan: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            </div>
            ) : (
            <div className="space-y-4">
              {/* Kotak 2: Pilih Menu Pre-order */}
              <section className="rounded-xl border bg-white flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold">Pilih Menu Pre-order</h3>
                      <p className="text-xs text-gray-500">Wajib · minimal 1 menu (DP 20% dari total)</p>
                    </div>
                  </div>
                  {reservasiItems.length > 0 && (
                    <Badge className="bg-green-600">
                      {reservasiItems.reduce((sum, i) => sum + i.jumlah, 0)} item
                    </Badge>
                  )}
                </div>
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      placeholder="Cari menu..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="h-9 pl-9 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b">
                  {kategoriMenu.map((kat) => (
                    <Button
                      key={kat}
                      type="button"
                      size="sm"
                      variant={activeKategori === kat ? "default" : "outline"}
                      className="rounded-full px-3 shrink-0 text-xs h-7"
                      onClick={() => setActiveKategori(kat)}
                    >
                      {formatKategoriNama(kat)}
                    </Button>
                  ))}
                </div>
                <div className="flex-1 max-h-[300px] overflow-y-auto p-3">
                  {menuTersedia.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-24 text-sm text-gray-400">
                      {activeKategori !== "Semua"
                        ? `Belum ada menu tersedia di kategori ${formatKategoriNama(activeKategori)}`
                        : "Menu tidak ditemukan"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {menuTersedia.map((menu) => {
                        const qty = qtyMenu(menu.id)
                        return (
                          <button
                            key={menu.id}
                            type="button"
                            onClick={() => tambahMenu(menu.id)}
                            className={`relative text-left rounded-lg border-2 overflow-hidden transition-all active:scale-[0.98] ${
                              qty > 0
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-white hover:border-green-300"
                            }`}
                          >
                            <div className="flex gap-2 p-2">
                              <div className="h-11 w-11 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {menu.fotoUrl ? (
                                  <img
                                    src={menu.fotoUrl}
                                    alt={menu.namaMenu}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="size-5 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1 pr-5">
                                <p className="text-xs font-semibold leading-tight line-clamp-2">
                                  {menu.namaMenu}
                                </p>
                                <div className="flex items-center justify-between gap-1 mt-1">
                                  <p className="text-xs font-bold text-green-700">
                                    Rp {menu.harga.toLocaleString("id-ID")}
                                  </p>
                                  <span className="text-[10px] text-gray-400 shrink-0">
                                    sisa {menu.porsiTersedia}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {qty > 0 && (
                              <span className="absolute top-1 right-1 h-5 min-w-5 px-1 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {qty}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>

            {/* Kotak 3: Item Pre-order terpilih */}
            <section className="rounded-xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-heading text-sm font-semibold">Item Pre-order</h3>
                <span className="text-xs text-gray-500">{reservasiItems.length} menu dipilih</span>
              </div>
              {reservasiItems.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Belum ada menu dipilih. Pilih menu di kotak kanan — reservasi wajib memesan minimal 1 menu.
                </div>
              ) : (
                <div className="divide-y">
                  {reservasiItems.map((item) => {
                    const menu = menuById.get(item.menuId)
                    if (!menu) return null
                    return (
                      <div
                        key={item.menuId}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-9 w-9 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {menu.fotoUrl ? (
                              <img
                                src={menu.fotoUrl}
                                alt={menu.namaMenu}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="size-4 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{menu.namaMenu}</p>
                            <p className="text-xs text-gray-500">
                              Rp {menu.harga.toLocaleString("id-ID")} · sisa {menu.porsiTersedia}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <div className="flex items-center rounded-lg border overflow-hidden">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              disabled={item.jumlah <= 1}
                              onClick={() => ubahJumlahMenu(item.menuId, -1)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <input
                              type="number"
                              min={1}
                              max={menu.porsiTersedia}
                              value={item.jumlah}
                              onChange={(e) => setJumlahMenu(item.menuId, e.target.value)}
                              className="w-11 h-8 text-center text-sm border-x outline-none bg-white"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              disabled={item.jumlah >= menu.porsiTersedia}
                              onClick={() => ubahJumlahMenu(item.menuId, 1)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Catatan..."
                            value={item.catatan}
                            onChange={(e) => ubahCatatanItem(item.menuId, e.target.value)}
                            className="h-8 w-36 text-sm"
                          />
                          <span className="w-24 text-right text-sm font-semibold text-green-700">
                            Rp {(menu.harga * item.jumlah).toLocaleString("id-ID")}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                            onClick={() => hapusMenu(item.menuId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {reservasiItems.length > 0 && (
                <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-2.5">
                  <span className="text-sm text-gray-600">Total pre-order</span>
                  <span className="font-bold text-green-700">{formatRupiah(totalPreorder)}</span>
                </div>
              )}
            </section>

            {/* Kotak 4: DP 20% */}
            <section className="rounded-xl border bg-white overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-semibold text-gray-900">Uang Muka (DP 20%)</h3>
                  <Badge className="bg-emerald-600 text-white text-[11px]">Wajib 20%</Badge>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px]">
                  Pembulatan Ribuan
                </Badge>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Pre-order</span>
                    <span className="font-medium text-gray-900">{formatRupiah(totalPreorder)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>DP {DP_PERSEN}% (perhitungan murni)</span>
                    <span>{formatRupiah(rincianDp.dpMentah)}</span>
                  </div>
                  {rincianDp.pembulatan > 0 && (
                    <div className="rounded-lg bg-emerald-50/80 border border-emerald-100 px-3 py-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-800 font-medium">
                        <span>Pembulatan ke atas (kelipatan Rp 1.000)</span>
                        <span>+ {formatRupiah(rincianDp.pembulatan)}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-tight">
                        Dibulatkan agar tidak ada uang receh (misal Rp 150) yang menyulitkan transaksi kasir atau kembalian tunai.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Total DP Wajib Dibayar
                      </p>
                      <p className="text-[11px] text-emerald-700">Dibayar sekarang saat reservasi dibuat</p>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-800">{formatRupiah(dpNominal)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1 border-t">
                  <span className="text-gray-600">Sisa Pelunasan Saat Kedatangan</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(sisaTagihan)}</span>
                </div>

                <div className="pt-1">
                  <Label className="text-sm font-semibold text-gray-800">Metode Pembayaran DP</Label>
                  <p className="text-[11px] text-gray-500 mb-2">Pilih metode yang digunakan pelanggan untuk membayar DP</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["tunai", "qris", "transfer"] as const).map((metode) => (
                      <button
                        key={metode}
                        type="button"
                        onClick={() => setReservasiForm((f) => ({ ...f, dpMetode: metode }))}
                        className={`rounded-lg border-2 px-2.5 py-2 text-xs font-semibold transition-all ${
                          reservasiForm.dpMetode === metode
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {METODE_DP_LABEL[metode]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            </div>
            )}
          </div>

          <DialogFooter
            className={`px-6 py-4 border-t shrink-0 ${
              reservasiStep === 1 ? "sm:justify-end" : "sm:justify-between"
            }`}
          >
            {reservasiStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleNextStep}>
                  Lanjut Pilih Menu <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600 sm:self-center">
                  DP 20%: <span className="font-bold text-emerald-700">{formatRupiah(dpNominal)}</span>
                  {rincianDp.pembulatan > 0 && <span className="text-[11px] text-emerald-600"> (dibulatkan)</span>}
                  <span className="text-gray-400"> · </span>
                  Sisa: <span className="font-medium">{formatRupiah(sisaTagihan)}</span>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => setReservasiStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
                  </Button>
                  <Button onClick={handleCreateReservasi} disabled={submittingReservasi}>
                    {submittingReservasi ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null} Buat Reservasi
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notice && (
        <div className="pointer-events-none fixed right-4 top-20 z-[70] w-[min(20rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-2xl ring-1 ring-foreground/5 ${
              notice.type === "success"
                ? "border-emerald-200"
                : notice.type === "error"
                  ? "border-red-200"
                  : "border-blue-200"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : notice.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-blue-50 text-blue-600"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : notice.type === "error" ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-heading text-sm font-semibold ${
                  notice.type === "success"
                    ? "text-emerald-800"
                    : notice.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }`}
              >
                {notice.type === "success" ? "Berhasil" : notice.type === "error" ? "Gagal" : "Informasi"}
              </p>
              <p className="mt-0.5 break-words text-sm text-muted-foreground">{notice.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !submittingCancel) setCancelTarget(null)
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border p-0 shadow-2xl sm:max-w-md">
          <div className="relative border-b border-red-100 bg-gradient-to-br from-red-50 via-orange-50/40 to-white px-6 pb-5 pt-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100/70 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/25">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1 pr-6">
                <DialogTitle className="font-heading text-lg font-semibold">Batalkan Reservasi?</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Reservasi akan dihapus dari antrean dan meja dilepas kembali. Tindakan ini tidak dapat diurungkan.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {cancelTarget && (
              <div className="rounded-2xl border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pelanggan</p>
                    <p className="font-heading text-base font-semibold text-foreground">{cancelTarget.namaPelanggan}</p>
                  </div>
                  <Badge variant="secondary">Meja {cancelTarget.nomorMeja}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 ring-1 ring-border">
                    <Users className="h-3.5 w-3.5" /> {cancelTarget.jumlahOrang} orang
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 ring-1 ring-border">
                    <Clock className="h-3.5 w-3.5" /> {formatWaktu(cancelTarget.waktuKedatangan)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="alasan-batal" className="text-sm font-medium">
                Alasan pembatalan <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <textarea
                id="alasan-batal"
                value={cancelAlasan}
                onChange={(e) => setCancelAlasan(e.target.value.slice(0, 200))}
                rows={3}
                maxLength={200}
                placeholder="Contoh: pelanggan tidak datang / jadwal berubah..."
                className="w-full resize-none rounded-2xl border border-input bg-muted/30 px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <div className="flex flex-wrap gap-1.5">
                {ALASAN_CEPAT.map((alasan) => (
                  <button
                    key={alasan}
                    type="button"
                    onClick={() => setCancelAlasan(alasan)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      cancelAlasan === alasan
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted"
                    }`}
                  >
                    {alasan}
                  </button>
                ))}
              </div>
              <p className="text-right text-[11px] text-muted-foreground">{cancelAlasan.length}/200</p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row">
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={submittingCancel}>
              Kembali
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={submittingCancel}>
              {submittingCancel ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
              Ya, Batalkan Reservasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open && !submittingConfirm) setConfirmTarget(null)
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border p-0 shadow-2xl sm:max-w-lg">
          <div className="relative border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white px-6 pb-5 pt-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1 pr-6">
                <DialogTitle className="font-heading text-lg font-semibold">Konfirmasi Kedatangan</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Pastikan pelanggan sudah tiba. Stok pre-order akan divalidasi lalu pesanan dibuat otomatis.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-6 py-5">
            {confirmTarget && (
              <>
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pelanggan</p>
                      <p className="font-heading text-base font-semibold text-foreground">{confirmTarget.namaPelanggan}</p>
                    </div>
                    <Badge variant="secondary">Meja {confirmTarget.nomorMeja}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 ring-1 ring-border">
                      <Users className="h-3.5 w-3.5" /> {confirmTarget.jumlahOrang} orang
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 ring-1 ring-border">
                      <Clock className="h-3.5 w-3.5" /> {formatWaktu(confirmTarget.waktuKedatangan)}
                    </span>
                  </div>
                </div>

                {confirmTarget.items.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border">
                    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5" /> Pre-order
                      </span>
                      <span>{confirmTarget.items.reduce((total, item) => total + item.jumlah, 0)} porsi</span>
                    </div>
                    <div className="max-h-40 divide-y overflow-y-auto">
                      {confirmTarget.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.namaMenu}</p>
                            {item.catatanItem && <p className="truncate text-xs text-muted-foreground">{item.catatanItem}</p>}
                          </div>
                          <span className="shrink-0 text-muted-foreground">
                            {item.jumlah}x · {formatRupiah(item.hargaSaatPesan * item.jumlah)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2.5 text-sm font-semibold">
                      <span className="text-gray-700">Total Pre-order</span>
                      <span className="text-gray-900">{formatRupiah(confirmTarget.totalHarga)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t bg-emerald-50 px-4 py-2.5 text-sm">
                      <span className="font-medium text-emerald-900">
                        DP {confirmTarget.dpPersen}% ({METODE_DP_LABEL[confirmTarget.dpMetode ?? ""] ?? confirmTarget.dpMetode ?? "-"} - Telah Lunas)
                      </span>
                      <span className="font-semibold text-emerald-700">- {formatRupiah(confirmTarget.dpNominal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t bg-emerald-100/50 px-4 py-2.5 text-sm font-bold">
                      <span className="text-emerald-950">Sisa Tagihan di Kasir</span>
                      <span className="text-emerald-800 text-base">{formatRupiah(Math.max(0, confirmTarget.totalHarga - confirmTarget.dpNominal))}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Jika stok salah satu menu tidak mencukupi, konfirmasi akan gagal dan reservasi tetap aktif.</span>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row">
            <Button variant="ghost" onClick={() => setConfirmTarget(null)} disabled={submittingConfirm}>
              Nanti
            </Button>
            <Button
              onClick={handleConfirmKedatangan}
              disabled={submittingConfirm}
              className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            >
              {submittingConfirm ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
              Konfirmasi &amp; Buat Pesanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmResult)} onOpenChange={(open) => !open && setConfirmResult(null)}>
        <DialogContent className="gap-0 overflow-hidden border p-0 shadow-2xl sm:max-w-sm">
          <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-6 pb-6 pt-8 text-center">
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -right-6 top-10 h-20 w-20 rounded-full bg-teal-100/60 blur-2xl" />
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 ring-8 ring-emerald-100">
              <CheckCircle className="h-8 w-8" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold">Pesanan Berhasil Dibuat</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-[16rem] text-sm text-muted-foreground">
              {confirmResult
                ? `Pesanan #${confirmResult.pesananId} untuk ${confirmResult.namaPelanggan} di Meja ${confirmResult.nomorMeja} sudah masuk ke kasir dan dapur.`
                : null}
            </DialogDescription>
          </div>
          {confirmResult && (
            <div className="px-6 pb-5">
              <div className="divide-y rounded-2xl border bg-muted/40 text-sm">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Nomor pesanan</span>
                  <span className="font-heading font-semibold">#{confirmResult.pesananId}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Meja</span>
                  <span className="font-medium">Meja {confirmResult.nomorMeja}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-center">
            {confirmResult && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/kasir?tab=riwayat">Lihat di Kasir</Link>
              </Button>
            )}
            <Button className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700" onClick={() => setConfirmResult(null)}>
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
