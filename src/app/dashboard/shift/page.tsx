"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { getDaftarKasir, getRiwayatShift } from "@/app/actions/shift"
import type { ShiftRiwayat } from "@/types"

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`

/** Kolom `tanggal` disimpan sebagai DATE, jadi dibaca lewat getter UTC. */
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

function waktuLabel(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  })
}

function durasiLabel(masuk: string, keluar: string | null): string {
  const akhir = keluar ? new Date(keluar).getTime() : Date.now()
  const menit = Math.max(0, Math.floor((akhir - new Date(masuk).getTime()) / 60000))
  const jam = Math.floor(menit / 60)
  return `${jam}j ${menit % 60}m`
}

type Period = "today" | "week" | "month" | "all"

export default function ShiftPage() {
  const { data: session, status } = useSession()
  const isOwner = session?.user?.role === "owner"

  const [shifts, setShifts] = useState<ShiftRiwayat[]>([])
  const [daftarKasir, setDaftarKasir] = useState<string[]>([])
  const [period, setPeriod] = useState<Period>("all")
  const [filterKasir, setFilterKasir] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const perPage = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const hasil = await getRiwayatShift({
        period,
        kasirUsername: isOwner ? filterKasir : undefined,
      })

      if ('error' in hasil) {
        setError(hasil.error)
        setShifts([])
      } else {
        setShifts(hasil.shifts)
      }
    } catch {
      setError("Gagal mengambil data shift")
    } finally {
      setLoading(false)
    }
  }, [period, filterKasir, isOwner])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!isOwner) return
    getDaftarKasir().then((hasil) => {
      if (!('error' in hasil)) setDaftarKasir(hasil.kasir)
    })
  }, [isOwner])

  const filtered = useMemo(() => {
    if (!search.trim()) return shifts
    const q = search.trim().toLowerCase()
    return shifts.filter((s) => s.kasirUsername.toLowerCase().includes(q))
  }, [shifts, search])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [filtered.length, period, filterKasir, search])

  const ringkasan = useMemo(() => {
    const aktif = filtered.filter((s) => s.statusShift === 'ACTIVE')
    const tutup = filtered.filter((s) => s.statusShift === 'CLOSED')
    return {
      totalShift: filtered.length,
      shiftAktif: aktif.length,
      shiftTutup: tutup.length,
      totalPendapatan: tutup.reduce((s, x) => s + x.totalPendapatan, 0),
      totalTunai: tutup.reduce((s, x) => s + x.totalTunai, 0),
      totalSelisih: tutup.reduce((s, x) => s + (x.selisihKas ?? 0), 0),
    }
  }, [filtered])

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Shift Kasir</h1>
      </div>

      {isOwner ? (
        <p className="text-sm text-gray-600">
          Monitoring shift seluruh kasir. Buka/tutup shift hanya bisa dilakukan
          oleh kasir yang bersangkutan.
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Riwayat shift milikmu sendiri.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total Shift</p>
          <p className="text-2xl font-bold mt-1">{ringkasan.totalShift}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Sedang Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {ringkasan.shiftAktif}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total Tunai (shift tutup)</p>
          <p className="text-lg font-bold mt-1">{rupiah(ringkasan.totalTunai)}</p>
        </div>
        <div
          className={`bg-white rounded-xl border p-4 ${
            ringkasan.totalSelisih === 0
              ? ""
              : ringkasan.totalSelisih > 0
                ? "border-blue-300"
                : "border-red-300"
          }`}
        >
          <p className="text-xs text-gray-500">Total Selisih Kas</p>
          <p
            className={`text-lg font-bold mt-1 flex items-center gap-1 ${
              ringkasan.totalSelisih === 0
                ? ""
                : ringkasan.totalSelisih > 0
                  ? "text-blue-600"
                  : "text-red-600"
            }`}
          >
            {ringkasan.totalSelisih !== 0 &&
              (ringkasan.totalSelisih > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              ))}
            {rupiah(ringkasan.totalSelisih)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(
            [
              ["all", "Semua"],
              ["today", "Hari Ini"],
              ["week", "7 Hari"],
              ["month", "Bulan Ini"],
            ] as const
          ).map(([value, label]) => (
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

        <div className="flex gap-2 items-center flex-wrap">
          {isOwner && (
            <Select value={filterKasir} onValueChange={setFilterKasir}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="Semua kasir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kasir</SelectItem>
                {daftarKasir.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari kasir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 h-9 text-sm"
            />
            {search && (
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {!error && !loading && filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Belum ada data shift</p>
          <p className="text-sm mt-1">
            Shift akan muncul di sini setelah kasir membuka shift pertamanya.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Keluar</TableHead>
                  <TableHead className="text-right">Durasi</TableHead>
                  <TableHead className="text-right">Uang Awal</TableHead>
                  <TableHead className="text-right">Trx</TableHead>
                  <TableHead className="text-right">Tunai</TableHead>
                  <TableHead className="text-right">Uang Akhir</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((s) => {
                  const selisih = s.selisihKas ?? 0
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <span className="font-medium">{s.kasirUsername}</span>
                        {s.sumberShiftKasir && (
                          <p className="text-xs text-gray-500">
                            Modal dari {s.sumberShiftKasir}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.statusShift === 'ACTIVE' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                            Tutup
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{waktuLabel(s.waktuMasuk)}</p>
                        <p className="text-xs text-gray-500">
                          {tanggalLabel(s.tanggal)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {waktuLabel(s.waktuKeluar)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {durasiLabel(s.waktuMasuk, s.waktuKeluar)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {rupiah(s.uangAwal)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {s.totalTransaksi}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {rupiah(s.totalTunai)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {s.statusShift === 'CLOSED' ? (
                          <>
                            <p>{rupiah(s.uangAkhir ?? 0)}</p>
                            <p className="text-xs text-gray-500">
                              ({rupiah(s.uangHarapAkhir)})
                            </p>
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {s.statusShift === 'CLOSED' ? (
                          <span
                            className={
                              selisih === 0
                                ? "text-green-700"
                                : selisih > 0
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }
                          >
                            {selisih === 0
                              ? "Sesuai"
                              : `${selisih > 0 ? "+" : ""}${rupiah(selisih).replace("Rp", "Rp")}`}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
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
              className="h-9"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}