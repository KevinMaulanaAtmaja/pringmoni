"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, Edit, Trash2, Plus, Save, X } from "lucide-react"
import { getJadwalShift, simpanJadwalShift, updateJadwalShift, hapusJadwalShift, getRiwayatShift, getDaftarKasir, getDaftarKasirLengkap, bukaShift, tutupShift } from "@/app/actions/shift"
import { formatJam, jamDariTeks } from "@/lib/jadwal"
import type { JadwalShift, ShiftRiwayat } from "@/types"

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`

function tanggalLabel(iso: string): string {
  const d = new Date(iso)
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  ).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function tanggalSingkat(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso)
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function jamSingkat(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function tanggalJamSingkat(iso: string | null): string {
  if (!iso) return "-"
  const d = new Date(iso)
  return `${tanggalSingkat(d)} · ${d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`
}

function durasiShift(waktuMasuk: string, waktuKeluar: string | null): string {
  const selesai = waktuKeluar ? new Date(waktuKeluar).getTime() : Date.now()
  const menit = Math.max(0, Math.floor((selesai - new Date(waktuMasuk).getTime()) / 60000))
  return `${Math.floor(menit / 60)}j ${menit % 60}m`
}

function isDifferentDay(a: string, b: string | null): boolean {
  if (!b) return false
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() !== db.getFullYear() ||
    da.getMonth() !== db.getMonth() ||
    da.getDate() !== db.getDate()
  )
}

function RiwayatShiftCard({ s }: { s: ShiftRiwayat }) {
  const selisih = s.selisihKas ?? 0
  const aktif = s.statusShift === "ACTIVE"
  const durasiTeks = durasiShift(s.waktuMasuk, s.waktuKeluar)
  const bedaHari = isDifferentDay(s.waktuMasuk, s.waktuKeluar)

  return (
    <div className="min-w-0 rounded-xl border bg-white p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium truncate">{s.kasirUsername}</span>
            {aktif ? (
              <Badge className="border-green-300 bg-green-100 px-1.5 py-0 text-[10px] text-green-800">
                Aktif
              </Badge>
            ) : (
              <Badge className="border-gray-300 bg-gray-100 px-1.5 py-0 text-[10px] text-gray-600">
                Tutup
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {bedaHari ? (
              <>
                {tanggalJamSingkat(s.waktuMasuk)} → {tanggalJamSingkat(s.waktuKeluar)} · {durasiTeks}
              </>
            ) : (
              <>
                {tanggalLabel(s.tanggal)} · {jamSingkat(s.waktuMasuk)}
                {aktif ? " → sekarang" : ` → ${jamSingkat(s.waktuKeluar)}`} · {durasiTeks}
              </>
            )}
          </p>
          {s.sumberShiftKasir && (
            <p className="mt-0.5 text-xs font-medium text-amber-700">
              Modal dari {s.sumberShiftKasir}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Selisih</p>
          <p
            className={`text-sm font-medium ${
              aktif
                ? "text-gray-400"
                : selisih === 0
                  ? "text-green-700"
                  : selisih > 0
                    ? "text-blue-600"
                    : "text-red-600"
            }`}
          >
            {aktif
              ? "-"
              : selisih === 0
                ? "Sesuai"
                : selisih > 0
                  ? `+${rupiah(selisih)}`
                  : `-${rupiah(Math.abs(selisih))}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <div>
          <p className="text-gray-400">Kas awal</p>
          <p className="font-medium">{rupiah(s.uangAwal)}</p>
        </div>
        <div>
          <p className="text-gray-400">Tunai masuk</p>
          <p className="font-medium text-green-700">+{rupiah(s.totalTunai)}</p>
        </div>
        <div>
          <p className="text-gray-400">Uang akhir</p>
          <p className="font-medium">{aktif ? "-" : rupiah(s.uangAkhir ?? 0)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        {s.totalTransaksi} transaksi · pendapatan {rupiah(s.totalPendapatan)} · seharusnya{" "}
        {rupiah(s.uangHarapAkhir)}
      </p>
    </div>
  )
}

export default function ShiftPage() {
  const { data: session, status } = useSession()
  const isOwner = session?.user?.role === "owner"

  const [jadwalList, setJadwalList] = useState<JadwalShift[]>([])
  const [shifts, setShifts] = useState<ShiftRiwayat[]>([])
  const [loadingJadwal, setLoadingJadwal] = useState(true)
  const [loadingRiwayat, setLoadingRiwayat] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nama: "",
    jamMulai: "08:00",
    jamSelesai: "16:00",
    jamSelesaiTengahMalam: false,
    urutan: 1,
    aktif: true,
  })

  const [period, setPeriod] = useState<"all" | "today" | "week" | "month">("all")
  const [activeTab, setActiveTab] = useState<"jadwal" | "riwayat" | "atur">("riwayat")
  const [filterKasir, setFilterKasir] = useState("all")
  const [daftarKasir, setDaftarKasir] = useState<string[]>([])
  const [daftarKasirLengkap, setDaftarKasirLengkap] = useState<Array<{ id: number; username: string }>>([])
  const [page, setPage] = useState(1)
  const perPage = 10
  const [showAturModal, setShowAturModal] = useState(false)
  const [selectedKasirId, setSelectedKasirId] = useState<number | "">("")
  const [selectedJadwalId, setSelectedJadwalId] = useState<number | "">("")
  const [uangAwalAtur, setUangAwalAtur] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchJadwal = useCallback(async () => {
    setLoadingJadwal(true)
    try {
      const result = await getJadwalShift()
      if (!("error" in result)) {
        setJadwalList(result.jadwal)
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error)
    } finally {
      setLoadingJadwal(false)
    }
  }, [])

  const fetchRiwayat = useCallback(async () => {
    setLoadingRiwayat(true)
    try {
      const result = await getRiwayatShift({
        period,
        kasirUsername: isOwner ? filterKasir : undefined,
      })
      if ("error" in result) {
        setShifts([])
      } else {
        setShifts(result.shifts)
      }
    } catch (error) {
      console.error("Error fetching riwayat:", error)
    } finally {
      setLoadingRiwayat(false)
    }
  }, [period, filterKasir, isOwner])

  useEffect(() => {
    // Jadwal shift hanya boleh diakses owner — kasir tidak perlu memanggilnya.
    if (isOwner) {
      fetchJadwal()
      getDaftarKasir().then((hasil) => {
        if (!("error" in hasil)) setDaftarKasir(hasil.kasir)
      })
      getDaftarKasirLengkap().then((hasil) => {
        if (!("error" in hasil)) setDaftarKasirLengkap(hasil.kasir)
      })
    }
    fetchRiwayat()
  }, [fetchJadwal, fetchRiwayat, isOwner])

  useEffect(() => {
    if (!isOwner) return
    getDaftarKasir().then((hasil) => {
      if (!("error" in hasil)) setDaftarKasir(hasil.kasir)
    })
    getDaftarKasirLengkap().then((hasil) => {
      if (!("error" in hasil)) setDaftarKasirLengkap(hasil.kasir)
    })
  }, [isOwner])

  useEffect(() => {
    if (isOwner) setActiveTab("atur")
  }, [isOwner])

  const resetForm = () => {
    setFormData({
      nama: "",
      jamMulai: "08:00",
      jamSelesai: "16:00",
      jamSelesaiTengahMalam: false,
      urutan: 1,
      aktif: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const jamMulai = jamDariTeks(formData.jamMulai)
    const jamSelesai = formData.jamSelesaiTengahMalam
      ? 1440
      : jamDariTeks(formData.jamSelesai)

    if (jamMulai === null) {
      alert("Format jam mulai tidak valid")
      return
    }
    if (jamSelesai === null) {
      alert("Format jam selesai tidak valid")
      return
    }

    try {
      const payload = {
        nama: formData.nama,
        jamMulai,
        jamSelesai,
        urutan: formData.urutan || 1,
        aktif: formData.aktif,
      }
      if (editingId) {
        await updateJadwalShift(editingId, payload)
      } else {
        await simpanJadwalShift(payload)
      }
      resetForm()
      fetchJadwal()
    } catch (error) {
      console.error("Error saving jadwal:", error)
      alert("Gagal menyimpan jadwal")
    }
  }

  const handleEdit = (jadwal: JadwalShift) => {
    const tengahMalam = jadwal.jamSelesai === 1440
    setFormData({
      nama: jadwal.nama,
      jamMulai: formatJam(jadwal.jamMulai),
      jamSelesai: tengahMalam ? "23:59" : formatJam(jadwal.jamSelesai),
      jamSelesaiTengahMalam: tengahMalam,
      urutan: jadwal.urutan,
      aktif: jadwal.aktif,
    })
    setEditingId(jadwal.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus jadwal ini?")) return
    try {
      await hapusJadwalShift(id)
      fetchJadwal()
    } catch (error) {
      console.error("Error deleting jadwal:", error)
      alert("Gagal menghapus jadwal")
    }
  }

  const filtered = shifts
  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [filtered.length, period, filterKasir])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Shift</h1>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
      {isOwner && (
        <>
          <Button
            onClick={() => setActiveTab("atur")}
            variant={activeTab === "atur" ? "default" : "outline"}
            aria-pressed={activeTab === "atur"}
            className={
              activeTab === "atur"
                ? "bg-green-700 text-white hover:bg-green-800"
                : "hover:bg-green-100 hover:text-green-800 hover:border-green-300"
            }
          >
            <Edit className="w-4 h-4 mr-2" /> Atur Shift Kasir
          </Button>
          <Button
            onClick={() => setActiveTab("jadwal")}
            variant={activeTab === "jadwal" ? "default" : "outline"}
            aria-pressed={activeTab === "jadwal"}
            className={
              activeTab === "jadwal"
                ? "bg-green-700 text-white hover:bg-green-800"
                : "hover:bg-green-100 hover:text-green-800 hover:border-green-300"
            }
          >
            <Calendar className="w-4 h-4 mr-2" /> Jadwal Shift
          </Button>
        </>
      )}
        <Button
          onClick={() => setActiveTab("riwayat")}
          variant={activeTab === "riwayat" ? "default" : "outline"}
          aria-pressed={activeTab === "riwayat"}
          className={
            activeTab === "riwayat"
              ? "bg-green-700 text-white hover:bg-green-800"
              : "hover:bg-green-100 hover:text-green-800 hover:border-green-300"
          }
        >
          <History className="w-4 h-4 mr-2" /> Riwayat Shift
        </Button>
      </div>

      {activeTab === "atur" && isOwner && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Atur Shift Kasir</h2>
              <p className="text-sm text-gray-600">Atur penugasan kasir ke slot jadwal. Pilih kasir dan slot jadwal untuk mengatur shift.</p>
            </div>
            <Button onClick={() => { setShowAturModal(true); setSelectedKasirId(""); setSelectedJadwalId(""); setUangAwalAtur("") }}>
              <Plus className="w-4 h-4 mr-2" />
              Atur Shift Kasir
            </Button>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shift Aktif Saat Ini</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { fetchJadwal(); fetchRiwayat() }}>Refresh</Button>
              </div>
            </div>
            {shifts.filter((s) => s.statusShift === "ACTIVE").length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada shift kasir yang sedang aktif.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shifts
                  .filter((s) => s.statusShift === "ACTIVE")
                  .map((s) => (
                    <div key={s.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{s.kasirUsername}</p>
                          <p className="text-xs text-gray-500">
                            Masuk {jamSingkat(s.waktuMasuk)} · {s.namaJadwal || "-"}
                          </p>
                        </div>
                        <Badge className="border-green-300 bg-green-100 text-green-800">Aktif</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Uang awal</p>
                          <p className="font-medium">{rupiah(s.uangAwal)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tunai masuk</p>
                          <p className="font-medium text-green-700">+{rupiah(s.totalTunai)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading}
                        onClick={async () => {
                          const uangAkhirStr = prompt(`Tutup shift ${s.kasirUsername}. Masukkan uang akhir fisik (Rp):`)
                          if (uangAkhirStr === null) return
                          const uangAkhir = Number(uangAkhirStr.replace(/[^0-9]/g, ""))
                          if (!Number.isFinite(uangAkhir) || uangAkhir <= 0) {
                            alert("Nominal tidak valid")
                            return
                          }
                      setActionLoading(true)
                      try {
                        const res = await tutupShift(uangAkhir, "Ditutup oleh Owner", true, s.kasirId)
                        if ("error" in res) {
                          alert(res.error)
                        } else if ("warning" in res) {
                          if (confirm(res.warning)) {
                            const res2 = await tutupShift(uangAkhir, "Ditutup oleh Owner", true, s.kasirId)
                            if ("error" in res2) alert(res2.error)
                            else alert("Shift berhasil ditutup")
                          }
                        } else {
                          alert("Shift berhasil ditutup")
                        }
                        fetchRiwayat()
                      } catch (e) {
                        console.error(e)
                        alert("Gagal menutup shift")
                      } finally {
                        setActionLoading(false)
                      }
                        }}
                      >
                        Tutup Shift
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {showAturModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Atur Shift Kasir</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowAturModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Pilih Kasir</Label>
                    <Select value={selectedKasirId === "" ? "" : String(selectedKasirId)} onValueChange={(v) => setSelectedKasirId(v ? Number(v) : "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kasir" />
                      </SelectTrigger>
                      <SelectContent>
                        {daftarKasirLengkap.map((k) => (
                          <SelectItem key={k.id} value={String(k.id)}>
                            {k.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pilih Jadwal Shift</Label>
                    <Select value={selectedJadwalId === "" ? "" : String(selectedJadwalId)} onValueChange={(v) => setSelectedJadwalId(v ? Number(v) : "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih slot jadwal" />
                      </SelectTrigger>
                      <SelectContent>
                        {jadwalList
                          .filter((j) => j.aktif)
                          .map((j) => (
                            <SelectItem key={j.id} value={String(j.id)}>
                              {j.nama} ({formatJam(j.jamMulai)} - {j.jamSelesai === 1440 ? "24:00" : formatJam(j.jamSelesai)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Tentukan kasir untuk jadwal shift ini.</p>
                  </div>
                  <div>
                    <Label>Uang Awal</Label>
                    <Input
                      value={uangAwalAtur}
                      onChange={(e) => setUangAwalAtur(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Kosongkan jika ingin otomatis"
                      inputMode="numeric"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bisa dikosongkan, sistem akan mengambil saran uang awal.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <Button
                    disabled={actionLoading || selectedKasirId === "" || selectedJadwalId === ""}
                    onClick={async () => {
                      setActionLoading(true)
                      try {
                    const uangAwalVal = uangAwalAtur ? Number(uangAwalAtur) : 0
                    const jadwalTarget = selectedJadwalId === "" ? null : (selectedJadwalId as number)
                    const res = await bukaShift(uangAwalVal, null, false, selectedKasirId as number, jadwalTarget)
                    if ("error" in res) {
                      alert(res.error)
                    } else if ("perluKonfirmasiReopen" in res) {
                      if (confirm(res.pesan)) {
                        const res2 = await bukaShift(uangAwalVal, null, true, selectedKasirId as number, jadwalTarget)
                        if ("error" in res2) alert(res2.error)
                        else {
                          alert("Shift berhasil dibuka")
                          setShowAturModal(false)
                          setSelectedKasirId("")
                          setSelectedJadwalId("")
                          setUangAwalAtur("")
                          fetchRiwayat()
                        }
                      }
                    } else {
                      alert("Shift berhasil dibuka")
                      setShowAturModal(false)
                      setSelectedKasirId("")
                      setSelectedJadwalId("")
                      setUangAwalAtur("")
                      fetchRiwayat()
                    }
                      } catch (e) {
                        console.error(e)
                        alert("Gagal membuka shift")
                      } finally {
                        setActionLoading(false)
                      }
                    }}
                  >
                    Buka Shift
                  </Button>
                  <Button variant="outline" onClick={() => setShowAturModal(false)}>Batal</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "jadwal" && isOwner && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Kelola Jadwal Shift</h2>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Slot
            </Button>
          </div>

              {showForm && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                    {editingId ? "Edit Jadwal Shift" : "Tambah Jadwal Shift"}
                    <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="nama">Nama Slot</Label>
                        <Input
                          id="nama"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          placeholder="Contoh: Pagi, Sore, Malam"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jamMulai">Jam Mulai</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="jamMulai"
                            type="time"
                            step="900"
                            lang="id-ID"
                            inputMode="numeric"
                            value={formData.jamMulai}
                            onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                            required
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {(() => {
                              const [hStr] = formData.jamMulai.split(":")
                              const h = Number(hStr)
                              if (Number.isNaN(h) || hStr.length !== 2) return ""
                              if (h >= 5 && h < 11) return "Pagi"
                              if (h >= 11 && h < 15) return "Siang"
                              if (h >= 15 && h < 18) return "Sore"
                              if (h >= 18 && h < 24) return "Malam"
                              return "Dini Hari"
                            })()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="jamSelesai">Jam Selesai</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="jamSelesai"
                            type="time"
                            step="900"
                            lang="id-ID"
                            inputMode="numeric"
                            value={formData.jamSelesaiTengahMalam ? "23:59" : formData.jamSelesai}
                            onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value, jamSelesaiTengahMalam: false })}
                            disabled={formData.jamSelesaiTengahMalam}
                            required
                            className="flex-1"
                          />
                          {!formData.jamSelesaiTengahMalam && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {(() => {
                                const [hStr] = formData.jamSelesai.split(":")
                                const h = Number(hStr)
                                if (Number.isNaN(h) || hStr.length !== 2) return ""
                                if (h >= 5 && h < 11) return "Pagi"
                                if (h >= 11 && h < 15) return "Siang"
                                if (h >= 15 && h < 18) return "Sore"
                                if (h >= 18 && h < 24) return "Malam"
                                return "Dini Hari"
                              })()}
                            </span>
                          )}
                          {formData.jamSelesaiTengahMalam && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">Malam/Tengah Malam</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="jamSelesaiTengahMalam"
                            checked={formData.jamSelesaiTengahMalam}
                            onChange={(e) => setFormData({ ...formData, jamSelesaiTengahMalam: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                          />
                          <Label htmlFor="jamSelesaiTengahMalam" className="cursor-pointer text-xs text-gray-600">
                            Sampai tengah malam (24:00)
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="aktif"
                        checked={formData.aktif}
                        onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="aktif" className="cursor-pointer">Aktif</Label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingId ? "Simpan Perubahan" : "Simpan"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jam Mulai</TableHead>
                      <TableHead>Jam Selesai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loadingJadwal ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Memuat...
                          </TableCell>
                        </TableRow>
                      ) : jadwalList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Belum ada jadwal shift. Klik &quot;Tambah Slot&quot; untuk membuat.
                          </TableCell>
                        </TableRow>
                      ) : (
                        jadwalList.map((j) => (
                          <TableRow key={j.id}>
                            <TableCell className="font-medium">{j.nama}</TableCell>
                            <TableCell>{formatJam(j.jamMulai)}</TableCell>
                            <TableCell>{formatJam(j.jamSelesai)}</TableCell>
                            <TableCell>
                              <Badge variant={j.aktif ? "default" : "secondary"}>
                                {j.aktif ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(j)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(j.id)} className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-gray-500">
                * Jam disimpan sebagai menit dari tengah malam (00:00). Contoh: 480 = 08:00, 960 = 16:00, 1320 = 22:00
              </p>
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="min-w-0 space-y-4">
          {isOwner && (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Riwayat Shift Kasir</h2>
              <p className="text-sm text-gray-600 sm:max-w-md sm:text-right">
                Monitoring shift seluruh kasir. Buka/tutup shift hanya bisa dilakukan oleh kasir yang bersangkutan.
              </p>
            </div>
          )}

            {!isOwner && (
              <p className="text-sm text-gray-600">
                Riwayat shift milikmu sendiri. Membuka/menutup shift hanya bisa dilakukan lewat halaman Kasir.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1">
                {([
                  ["all", "Semua"],
                  ["today", "Hari Ini"],
                  ["week", "Minggu Ini"],
                  ["month", "Bulan Ini"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={period === value ? "default" : "outline"}
                    onClick={() => setPeriod(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {isOwner && (
                <Select value={filterKasir} onValueChange={setFilterKasir}>
                  <SelectTrigger className="h-9 w-full sm:w-44">
                    <SelectValue placeholder="Semua kasir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kasir</SelectItem>
                    {daftarKasir.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loadingRiwayat ? (
              <div className="text-center py-8">
                Memuat riwayat shift...
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum ada data shift</p>
                <p className="text-sm mt-1">
                  Shift akan muncul di sini setelah kasir membuka shift pertamanya.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 md:hidden">
                  {paginated.map((s) => (
                    <RiwayatShiftCard key={s.id} s={s} />
                  ))}
                </div>
                <div className="hidden w-full min-w-0 overflow-x-auto rounded-xl border bg-white md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap px-3 text-xs uppercase tracking-wide text-gray-500">
                        Kasir
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-3 text-xs uppercase tracking-wide text-gray-500">
                        Waktu
                      </TableHead>
                      <TableHead
                        className="whitespace-nowrap px-3 text-right text-xs uppercase tracking-wide text-gray-500"
                        title="Uang awal (modal) dan kas tunai masuk"
                      >
                        Kas (awal / tunai)
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-3 text-right text-xs uppercase tracking-wide text-gray-500">
                        Transaksi
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-3 text-right text-xs uppercase tracking-wide text-gray-500">
                        Uang Akhir
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-3 text-right text-xs uppercase tracking-wide text-gray-500">
                        Selisih
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((s) => {
                      const selisih = s.selisihKas ?? 0
                      const durasiTeks = durasiShift(s.waktuMasuk, s.waktuKeluar)
                      const aktif = s.statusShift === "ACTIVE"

                      return (
                        <TableRow key={s.id}>
                          <TableCell className="px-3 py-3 align-top">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{s.kasirUsername}</span>
                              {aktif ? (
                                <Badge className="border-green-300 bg-green-100 px-1.5 py-0 text-[10px] text-green-800">
                                  Aktif
                                </Badge>
                              ) : (
                                <Badge className="border-gray-300 bg-gray-100 px-1.5 py-0 text-[10px] text-gray-600">
                                  Tutup
                                </Badge>
                              )}
                            </div>
                            {s.sumberShiftKasir ? (
                              <p className="mt-1 whitespace-nowrap text-xs font-medium text-amber-700">
                                Modal dari {s.sumberShiftKasir}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-gray-400">Modal sendiri</p>
                            )}
                          </TableCell>
                            <TableCell className="px-3 py-3 align-top">
                              {isDifferentDay(s.waktuMasuk, s.waktuKeluar) ? (
                                <>
                                  <p className="whitespace-nowrap text-sm">
                                    {tanggalJamSingkat(s.waktuMasuk)}
                                  </p>
                                  <p className="whitespace-nowrap text-xs text-gray-500">
                                    {aktif ? "→ sekarang" : `→ ${tanggalJamSingkat(s.waktuKeluar)}`}
                                    {" · "}
                                    {durasiTeks}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="whitespace-nowrap text-sm">
                                    {tanggalLabel(s.tanggal)} · {jamSingkat(s.waktuMasuk)}
                                  </p>
                                  <p className="whitespace-nowrap text-xs text-gray-500">
                                    {aktif ? "→ sekarang" : `→ ${jamSingkat(s.waktuKeluar)}`}
                                    {" · "}
                                    {durasiTeks}
                                  </p>
                                </>
                              )}
                            </TableCell>
                          <TableCell className="px-3 py-3 text-right align-top">
                            <p className="whitespace-nowrap text-sm">{rupiah(s.uangAwal)}</p>
                            <p className="whitespace-nowrap text-xs text-green-700">
                              +{rupiah(s.totalTunai)}
                            </p>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right align-top">
                            <p className="text-sm">{s.totalTransaksi}</p>
                            <p className="whitespace-nowrap text-xs text-gray-500">
                              {rupiah(s.totalPendapatan)}
                            </p>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right align-top">
                            {aktif ? (
                              <p className="text-sm text-gray-400">-</p>
                            ) : (
                              <>
                                <p className="whitespace-nowrap text-sm font-medium">
                                  {rupiah(s.uangAkhir ?? 0)}
                                </p>
                                <p className="whitespace-nowrap text-xs text-gray-500">
                                  harusnya {rupiah(s.uangHarapAkhir)}
                                </p>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right align-top">
                            {aktif ? (
                              <span className="text-sm text-gray-400">-</span>
                            ) : (
                              <span
                                className={`whitespace-nowrap text-sm font-medium ${
                                  selisih === 0
                                    ? "text-green-700"
                                    : selisih > 0
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }`}
                              >
                                {selisih === 0
                                  ? "Sesuai"
                                  : selisih > 0
                                    ? `+${rupiah(selisih)}`
                                    : `-${rupiah(Math.abs(selisih))}`}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </div>
              </>
            )}

            {shifts.length > perPage && (
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

      )}
    </div>
  )
}