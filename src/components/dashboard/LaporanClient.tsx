"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RotateCcw, FileText, FileSpreadsheet, Loader2, Wallet, ClipboardList, Banknote, CreditCard, Calendar, TrendingUp, BarChart3, GitCompareArrows, ShoppingCart, XCircle, Trophy, Award, Star } from "lucide-react"
import { getLaporanAll, getLaporanBanding } from "@/app/actions/laporan"
import { exportLaporanPDF, exportLaporanExcel } from "@/lib/export-laporan"
import type { ItemLaporanPesanan, MenuTerlaris, GrafikPoint, PerbandinganData, KategoriAnalisis, AnalisisTambahan, BandingData } from "@/types"
import { GrafikPendapatan } from "@/components/laporan/GrafikPendapatan"
import { GrafikMenu } from "@/components/laporan/GrafikMenu"
import { PieMetode } from "@/components/laporan/PieMetode"
import { GrafikPeakHours } from "@/components/laporan/GrafikPeakHours"
import { PieKategori } from "@/components/laporan/PieKategori"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LaporanKasirItem {
  username: string
  totalTransaksi: number
  totalPendapatan: number
  tunai: number
  qris: number
  transfer: number
  rataRata: number
}

const today = () => new Date().toISOString().split("T")[0]
const thisMonth = () => new Date().toISOString().slice(0, 7)
const currentYear = new Date().getFullYear()

function getWeekRange(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
    label: `${monday.toLocaleDateString("id-ID")} - ${sunday.toLocaleDateString("id-ID")}`,
  }
}

function dateToWeekStr(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000)
  const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7)
  return `${year}-W${String(Math.min(weekNum, 53)).padStart(2, "0")}`
}

function weekStrToDate(weekStr: string) {
  const [year, weekNum] = weekStr.split("-W")
  const y = parseInt(year)
  const w = parseInt(weekNum)
  const d = new Date(y, 0, 1 + (w - 1) * 7)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split("T")[0]
}

function isCurrentWeek(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = Math.abs(now.getTime() - d.getTime())
  return diff < 7 * 24 * 60 * 60 * 1000
}

const loadingState = {
  pendapatan: {
    totalPendapatan: 0,
    totalPesanan: 0,
    totalItemTerjual: 0,
    tunai: 0,
    qris: 0,
    transfer: 0,
    rataRataPesanan: 0,
    detailPesanan: [] as ItemLaporanPesanan[],
    label: "",
  },
  menuTerlaris: [] as MenuTerlaris[],
  laporanKasir: { periode: "", label: "", daftarKasir: [] as LaporanKasirItem[] },
  grafik: [] as GrafikPoint[],
  perbandingan: null as PerbandinganData | null,
  kategori: [] as KategoriAnalisis[],
  analisis: {
    totalPesanan: 0,
    totalBatal: 0,
    cancelRate: 0,
    rataItemPerPesanan: 0,
  },
}

export function LaporanClient() {
  const [activeTab, setActiveTab] = useState("harian")
  const [selectedDate, setSelectedDate] = useState(today())
  const [selectedMonth, setSelectedMonth] = useState(thisMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const [data, setData] = useState(loadingState)
  const [loading, setLoading] = useState(false)

  const prevMonth = () => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 7)
  }

  const [banding1, setBanding1] = useState(prevMonth())
  const [banding2, setBanding2] = useState(thisMonth())
  const [dataBanding, setDataBanding] = useState<{ periode1: BandingData; periode2: BandingData } | null>(null)
  const [loadingBanding, setLoadingBanding] = useState(false)

  const fetchData = useCallback(async (autoPoll?: boolean) => {
    if (activeTab === "bandingkan") {
      setLoadingBanding(true)
      try {
        const result = await getLaporanBanding("bulanan", banding1 + "-01", banding2 + "-01")
        setDataBanding(result)
      } catch (err) {
        console.error("Error fetching banding:", err)
      } finally {
        setLoadingBanding(false)
      }
      return
    }

    if (!autoPoll) setLoading(true)
    try {
      let periode = activeTab
      let dateStr = selectedDate

      if (activeTab === "bulanan" || activeTab === "menu" || activeTab === "kasir") {
        periode = "bulanan"
        dateStr = selectedMonth + "-01"
      } else if (activeTab === "tahunan") {
        dateStr = selectedYear + "-01-01"
      }

      const result = await getLaporanAll(periode, dateStr)
      setData(result)
    } catch (err) {
      console.error("Error fetching laporan:", err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedDate, selectedMonth, selectedYear, banding1, banding2])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeTab === "bandingkan") return
    const id = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(id)
  }, [fetchData, activeTab])

  const { pendapatan, menuTerlaris, laporanKasir, grafik, perbandingan, kategori, analisis } = data

  const puncakGrafik = grafik.length
    ? grafik.reduce((a, b) => (a.pesanan > b.pesanan ? a : b))
    : null

  const handleDownloadPDF = async () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = (i + 1).toString().padStart(2, "0")
      return { month: m, dateStr: `${selectedYear}-${m}-01` }
    })
    const results = await Promise.all(
      months.map(m => getLaporanAll("bulanan", m.dateStr).catch(() => null))
    )
    const perMonth = months.map((m, i) => {
      const r = results[i]
      return {
        label: new Date(`${selectedYear}-${m.month}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
        pendapatan: r?.pendapatan ?? null,
        menuTerlaris: r?.menuTerlaris ?? [],
        peakLabel: r?.grafik?.length
          ? r.grafik.reduce((a, b) => a.pesanan > b.pesanan ? a : b).label
          : undefined,
        peakPesanan: r?.grafik?.length
          ? r.grafik.reduce((a, b) => a.pesanan > b.pesanan ? a : b).pesanan
          : undefined,
      }
    })
    exportLaporanPDF(`Laporan_Tahunan_${selectedYear}`, selectedYear, perMonth)
  }

  const handleDownloadExcel = async () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = (i + 1).toString().padStart(2, "0")
      return { month: m, dateStr: `${selectedYear}-${m}-01` }
    })
    const results = await Promise.all(
      months.map(m => getLaporanAll("bulanan", m.dateStr).catch(() => null))
    )
    const perMonth = months.map((m, i) => ({
      label: `${m.month} ${selectedYear}`,
      detailPesanan: results[i]?.pendapatan.detailPesanan ?? [],
    }))
    await exportLaporanExcel(`Laporan_Tahunan_${selectedYear}`, [], perMonth)
  }

  const tabs = ["harian", "mingguan", "bulanan", "tahunan", "menu", "kasir", "bandingkan"] as const

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "mingguan") {
      setSelectedDate(today())
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
                (activeTab === tab
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900")
              }
            >
              {tab === "bandingkan" ? (
                <span className="flex items-center gap-1">
                  <GitCompareArrows className="w-3 h-3" />
                  Bandingkan
                </span>
              ) : (
                tab.charAt(0).toUpperCase() + tab.slice(1)
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {activeTab !== "bandingkan" && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownloadExcel} disabled={loading}>
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={loading}>
                <FileText className="w-3 h-3 mr-1" />
                PDF
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading || loadingBanding}>
            {loading || loadingBanding ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
            Refresh
          </Button>
        </div>
      </div>

      {activeTab === "harian" && (
        <TabHarian
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          pendapatan={pendapatan}
          grafik={grafik}
          menuTerlaris={menuTerlaris}
          perbandingan={perbandingan}
          analisis={analisis}
          loading={loading}
        />
      )}
      {activeTab === "mingguan" && (
        <TabMingguan
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          pendapatan={pendapatan}
          grafik={grafik}
          menuTerlaris={menuTerlaris}
          perbandingan={perbandingan}
          analisis={analisis}
          loading={loading}
        />
      )}
      {activeTab === "bulanan" && (
        <TabBulanan
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          pendapatan={pendapatan}
          grafik={grafik}
          menuTerlaris={menuTerlaris}
          perbandingan={perbandingan}
          analisis={analisis}
          loading={loading}
        />
      )}
      {activeTab === "tahunan" && (
        <TabTahunan
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          pendapatan={pendapatan}
          grafik={grafik}
          menuTerlaris={menuTerlaris}
          perbandingan={perbandingan}
          analisis={analisis}
          loading={loading}
        />
      )}
      {activeTab === "menu" && (
        <TabMenu
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          menuTerlaris={menuTerlaris}
          kategori={kategori}
          pendapatan={pendapatan}
          loading={loading}
        />
      )}
      {activeTab === "kasir" && (
        <TabKasir
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          laporanKasir={laporanKasir}
          loading={loading}
        />
      )}
      {activeTab === "bandingkan" && (
        <TabBanding
          banding1={banding1}
          setBanding1={setBanding1}
          banding2={banding2}
          setBanding2={setBanding2}
          data={dataBanding}
          loading={loadingBanding}
        />
      )}
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 border shadow-sm">
        <div className="w-4 h-5 bg-gray-200 rounded shrink-0" />
        <div className="grid gap-2 flex-1">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-44 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-px bg-gray-200 shrink-0 hidden sm:block" />
        <div className="grid gap-1 shrink-0 hidden sm:block">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-gray-100 rounded-xl p-4">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-3">
            <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TabHarian({
  selectedDate,
  setSelectedDate,
  pendapatan,
  grafik,
  menuTerlaris,
  perbandingan,
  analisis,
  loading,
}: {
  selectedDate: string
  setSelectedDate: (v: string) => void
  pendapatan: typeof loadingState.pendapatan
  grafik: GrafikPoint[]
  menuTerlaris: MenuTerlaris[]
  perbandingan: PerbandinganData | null
  analisis: AnalisisTambahan
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Tanggal"
        periodeLabel="Tanggal Laporan"
        periodeValue={pendapatan.label || new Date(selectedDate).toLocaleDateString("id-ID", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
        filter={
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
            }}
            max={today()}
            className="text-sm w-auto h-8"
          />
        }
      />
      <RingkasanCard pendapatan={pendapatan} perbandingan={perbandingan} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrafikPendapatan data={grafik} loading={loading} />
        <GrafikPeakHours data={grafik} loading={loading} />
      </div>
      <AnalisisCard pendapatan={pendapatan} grafik={grafik} analisis={analisis} periodeType="harian" loading={loading} />
    </div>
  )
}

function TabMingguan({
  selectedDate,
  setSelectedDate,
  pendapatan,
  grafik,
  menuTerlaris,
  perbandingan,
  analisis,
  loading,
}: {
  selectedDate: string
  setSelectedDate: (v: string) => void
  pendapatan: typeof loadingState.pendapatan
  grafik: GrafikPoint[]
  menuTerlaris: MenuTerlaris[]
  perbandingan: PerbandinganData | null
  analisis: AnalisisTambahan
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  const week = getWeekRange(selectedDate)
  const weekValue = dateToWeekStr(selectedDate)

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = weekStrToDate(e.target.value)
    setSelectedDate(date)
  }

  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Minggu"
        periodeLabel="Periode Mingguan"
        periodeValue={pendapatan.label || week.label}
        filter={
          <Input
            type="week"
            value={weekValue}
            onChange={handleWeekChange}
            max={dateToWeekStr(today())}
            className="text-sm w-auto h-8"
          />
        }
      />
      <RingkasanCard pendapatan={pendapatan} perbandingan={perbandingan} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrafikPendapatan data={grafik} loading={loading} />
        <GrafikPeakHours data={grafik} loading={loading} />
      </div>
      <AnalisisCard pendapatan={pendapatan} grafik={grafik} analisis={analisis} periodeType="mingguan" loading={loading} />
    </div>
  )
}

function TabBulanan({
  selectedMonth,
  setSelectedMonth,
  pendapatan,
  grafik,
  menuTerlaris,
  perbandingan,
  analisis,
  loading,
}: {
  selectedMonth: string
  setSelectedMonth: (v: string) => void
  pendapatan: typeof loadingState.pendapatan
  grafik: GrafikPoint[]
  menuTerlaris: MenuTerlaris[]
  perbandingan: PerbandinganData | null
  analisis: AnalisisTambahan
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Bulan"
        periodeLabel="Periode Bulanan"
        periodeValue={pendapatan.label || new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
          month: "long", year: "numeric",
        })}
        filter={
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={thisMonth()}
            className="text-sm w-auto h-8"
          />
        }
      />
      <RingkasanCard pendapatan={pendapatan} perbandingan={perbandingan} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrafikPendapatan data={grafik} loading={loading} />
        <GrafikPeakHours data={grafik} loading={loading} />
      </div>
      <AnalisisCard pendapatan={pendapatan} grafik={grafik} analisis={analisis} periodeType="bulanan" loading={loading} />
    </div>
  )
}

function TabTahunan({
  selectedYear,
  setSelectedYear,
  pendapatan,
  grafik,
  menuTerlaris,
  perbandingan,
  analisis,
  loading,
}: {
  selectedYear: string
  setSelectedYear: (v: string) => void
  pendapatan: typeof loadingState.pendapatan
  grafik: GrafikPoint[]
  menuTerlaris: MenuTerlaris[]
  perbandingan: PerbandinganData | null
  analisis: AnalisisTambahan
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Tahun"
        periodeLabel="Periode Tahunan"
        periodeValue={pendapatan.label || selectedYear}
        filter={
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-sm border rounded-md px-2 py-1 h-8"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        }
      />
      <RingkasanCard pendapatan={pendapatan} perbandingan={perbandingan} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrafikPendapatan data={grafik} loading={loading} />
        <GrafikPeakHours data={grafik} loading={loading} />
      </div>
      <AnalisisCard pendapatan={pendapatan} grafik={grafik} analisis={analisis} periodeType="tahunan" loading={loading} />
    </div>
  )
}

function TabMenu({
  selectedMonth,
  setSelectedMonth,
  menuTerlaris,
  kategori,
  pendapatan,
  loading,
}: {
  selectedMonth: string
  setSelectedMonth: (v: string) => void
  menuTerlaris: MenuTerlaris[]
  kategori: KategoriAnalisis[]
  pendapatan: typeof loadingState.pendapatan
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Bulan"
        periodeLabel="Periode"
        periodeValue={pendapatan.label || new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
          month: "long", year: "numeric",
        })}
        filter={
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={thisMonth()}
            className="text-sm w-auto h-8"
          />
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <GrafikMenu data={menuTerlaris} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-4">
              {menuTerlaris.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada data.</p>
              ) : (
                <>
                  <h3 className="text-sm font-semibold mb-3">Menu Paling Sepi</h3>
                  <div className="space-y-1">
                  {menuTerlaris.slice(-6).reverse().map((menu, i) => {
                    const bottomMenus = menuTerlaris.slice(-6)
                    const rank = menuTerlaris.length - bottomMenus.length + (bottomMenus.length - 1 - i) + 1
                    return (
                      <div key={menu.namaMenu} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-bold text-gray-300 w-5 shrink-0">#{rank}</span>
                          <span className="text-xs text-gray-700 truncate">{menu.namaMenu}</span>
                        </div>
                        <span className="text-xs font-semibold text-red-500 shrink-0 ml-2">{menu.totalTerjual} terjual</span>
                      </div>
                    )
                  })}
                  <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400">
                      Dari {menuTerlaris.length} menu yang terjual
                    </p>
                  </div>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <PieKategori data={kategori} loading={loading} />
        </div>
      </div>
    </div>
  )
}

function TabKasir({
  selectedMonth,
  setSelectedMonth,
  laporanKasir,
  loading,
}: {
  selectedMonth: string
  setSelectedMonth: (v: string) => void
  laporanKasir: { periode: string; label: string; daftarKasir: LaporanKasirItem[] }
  loading: boolean
}) {
  if (loading) return <TabSkeleton />
  const daftarKasir = laporanKasir.daftarKasir
  const totalTransaksi = daftarKasir.reduce((s, k) => s + k.totalTransaksi, 0)
  const totalPendapatan = daftarKasir.reduce((s, k) => s + k.totalPendapatan, 0)
  const rataRata = daftarKasir.length > 0 ? Math.round(totalPendapatan / daftarKasir.length) : 0

  return (
    <div className="space-y-4">
      <FilterPeriode
        icon={Calendar}
        label="Pilih Bulan"
        periodeLabel="Periode"
        periodeValue={laporanKasir.label || new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
          month: "long", year: "numeric",
        })}
        filter={
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={thisMonth()}
            className="text-sm w-auto h-8"
          />
        }
      />
      {daftarKasir.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada data kasir.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 border border-white/60 shadow-sm">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Kasir</span>
              <p className="text-2xl font-bold text-blue-700 mt-1">{daftarKasir.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-white/60 shadow-sm">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Transaksi</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{totalTransaksi}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 border border-white/60 shadow-sm">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</span>
              <p className="text-2xl font-bold text-violet-700 mt-1">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-white/60 shadow-sm">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Rata-rata</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">Rp {rataRata.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Kasir</TableHead>
                    <TableHead className="text-xs">Transaksi</TableHead>
                    <TableHead className="text-xs">Pendapatan</TableHead>
                    <TableHead className="text-xs">Tunai</TableHead>
                    <TableHead className="text-xs">QRIS</TableHead>
                    <TableHead className="text-xs">Transfer</TableHead>
                    <TableHead className="text-xs">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daftarKasir.map((k, i) => {
                    return (
                      <TableRow key={k.username}>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>#{i + 1}</span>
                            {i === 0 ? (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            ) : i === 1 ? (
                              <Award className="w-4 h-4 text-gray-400" />
                            ) : i === 2 ? (
                              <Star className="w-4 h-4 text-amber-600" />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{k.username}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <span>{k.totalTransaksi}</span>
                            {totalTransaksi > 0 && (
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${(k.totalTransaksi / totalTransaksi) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">Rp {k.totalPendapatan.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs">Rp {k.tunai.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs">Rp {k.qris.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs">Rp {k.transfer.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs">Rp {k.rataRata.toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function TabBanding({
  banding1,
  setBanding1,
  banding2,
  setBanding2,
  data,
  loading,
}: {
  banding1: string
  setBanding1: (v: string) => void
  banding2: string
  setBanding2: (v: string) => void
  data: { periode1: BandingData; periode2: BandingData } | null
  loading: boolean
}) {
  if (loading) return <TabSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 border shadow-sm">
        <GitCompareArrows className="w-4 h-5 text-gray-400 shrink-0" />
        <div className="grid gap-1.5 flex-1">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Periode 1</span>
          <input
            type="month"
            value={banding1}
            onChange={(e) => setBanding1(e.target.value)}
            max={thisMonth()}
            className="text-sm border rounded-md px-2 py-1 w-40"
          />
        </div>
        <div className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
          VS
        </div>
        <div className="grid gap-1.5 flex-1">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Periode 2</span>
          <input
            type="month"
            value={banding2}
            onChange={(e) => setBanding2(e.target.value)}
            max={thisMonth()}
            className="text-sm border rounded-md px-2 py-1 w-40 ml-auto"
          />
        </div>
      </div>

      {!data ? (
        <p className="text-center text-gray-500 py-8">Pilih dua bulan untuk membandingkan.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[data.periode1, data.periode2].map((p, idx) => (
              <Card key={idx} className="overflow-hidden shadow-sm">
                <div className={`px-4 py-2 ${idx === 0 ? "bg-blue-600" : "bg-emerald-600"} text-white`}>
                  <p className="text-sm font-bold">{p.label}</p>
                </div>
                <CardContent className="pt-4 space-y-1.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Pendapatan</span>
                    <span className="text-sm font-bold text-gray-900">Rp {p.pendapatan.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Pesanan</span>
                    <span className="text-sm font-bold text-gray-900">{p.pesanan}</span>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Item Terjual</span>
                    <span className="text-sm font-bold text-gray-900">{p.itemTerjual}</span>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Rata-rata / Pesanan</span>
                    <span className="text-sm font-bold text-gray-900">Rp {p.rataRata.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Cancel Rate</span>
                    <span className={`text-sm font-bold ${p.cancelRate > 10 ? "text-red-600" : "text-green-600"}`}>{p.cancelRate}%</span>
                  </div>
                  <div className="border-t border-gray-200 my-2" />
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Metode Pembayaran</p>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-gray-400">Tunai</span>
                    <span className="text-xs font-semibold text-gray-700">Rp {p.tunai.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-gray-400">QRIS</span>
                    <span className="text-xs font-semibold text-gray-700">Rp {p.qris.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-gray-400">Transfer</span>
                    <span className="text-xs font-semibold text-gray-700">Rp {p.transfer.toLocaleString("id-ID")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 border-b">
              <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Menu Terlaris
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[data.periode1, data.periode2].map((p, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-semibold text-gray-600 mb-3 border-b pb-2">{p.label}</p>
                    {p.topMenu.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4">Tidak ada data menu</p>
                    ) : (
                      <div className="space-y-3">
                        {p.topMenu.slice(0, 5).map((menu, mi) => {
                          const maxTerjual = Math.max(...p.topMenu.map(m => m.totalTerjual), 1)
                          return (
                            <div key={menu.namaMenu} className="flex items-center gap-3">
                              <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                mi === 0 ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300" :
                                mi === 1 ? "bg-gray-100 text-gray-500 ring-1 ring-gray-300" :
                                mi === 2 ? "bg-orange-100 text-orange-600 ring-1 ring-orange-300" :
                                "bg-gray-50 text-gray-400"
                              }`}>
                                {mi + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-700 font-medium truncate">{menu.namaMenu}</span>
                                  <span className="text-xs font-semibold text-gray-500 ml-2">{menu.totalTerjual} terjual</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${
                                    mi === 0 ? "bg-yellow-400" : mi === 1 ? "bg-gray-400" : mi === 2 ? "bg-orange-400" : "bg-blue-300"
                                  }`} style={{ width: `${(menu.totalTerjual / maxTerjual) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </div>


        </>
      )}
    </div>
  )
}

function AnalisisCard({
  pendapatan,
  grafik,
  analisis,
  periodeType,
  loading,
}: {
  pendapatan: typeof loadingState.pendapatan
  grafik: GrafikPoint[]
  analisis: AnalisisTambahan
  periodeType: "harian" | "mingguan" | "bulanan" | "tahunan"
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!pendapatan.totalPesanan) return null

  const hariAktif = grafik.filter(g => g.pesanan > 0).length || 1
  const rataPerHari = Math.round(pendapatan.totalPendapatan / hariAktif)

  const palingRamai = grafik.length ? grafik.reduce((a, b) => (a.pesanan > b.pesanan ? a : b)) : null
  const palingSepi = grafik.filter(g => g.pesanan > 0).reduce((a, b) => (a.pesanan < b.pesanan ? a : b), grafik.filter(g => g.pesanan > 0)[0] || null)

  const nonTunai = pendapatan.qris + pendapatan.transfer
  const rasioNonTunai = pendapatan.totalPendapatan > 0 ? ((nonTunai / pendapatan.totalPendapatan) * 100).toFixed(1) : "0"

  const labelMap: Record<string, { ramai: string; sepi: string }> = {
    harian: { ramai: "Jam paling ramai", sepi: "Jam paling sepi" },
    mingguan: { ramai: "Hari paling ramai", sepi: "Hari paling sepi" },
    bulanan: { ramai: "Minggu paling ramai", sepi: "Minggu paling sepi" },
    tahunan: { ramai: "Bulan paling ramai", sepi: "Bulan paling sepi" },
  }
  const label = labelMap[periodeType] || labelMap.bulanan

  const rataLabelMap: Record<string, string> = {
    harian: "Rata-rata pendapatan per jam",
    mingguan: "Rata-rata pendapatan per hari",
    bulanan: "Rata-rata pendapatan per minggu",
    tahunan: "Rata-rata pendapatan per bulan",
  }
  const rataLabel = rataLabelMap[periodeType] || rataLabelMap.bulanan

  const items = [
    {
      icon: BarChart3,
      label: label.ramai,
      value: palingRamai ? `${palingRamai.label} (${palingRamai.pesanan} pesanan)` : "-",
      bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100",
    },
    {
      icon: TrendingUp,
      label: label.sepi,
      value: palingSepi ? `${palingSepi.label} (${palingSepi.pesanan} pesanan)` : "-",
      bg: "bg-orange-50", text: "text-orange-700", iconBg: "bg-orange-100",
    },
    {
      icon: CreditCard,
      label: "Rasio non-tunai",
      value: `${rasioNonTunai}%`,
      bg: "bg-violet-50", text: "text-violet-700", iconBg: "bg-violet-100",
    },
    {
      icon: Wallet,
      label: rataLabel,
      value: `Rp ${rataPerHari.toLocaleString("id-ID")}`,
      bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100",
    },
    {
      icon: ShoppingCart,
      label: "Rata-rata item per pesanan",
      value: `${analisis.rataItemPerPesanan} item`,
      bg: "bg-sky-50", text: "text-sky-700", iconBg: "bg-sky-100",
    },
    {
      icon: XCircle,
      label: "Pembatalan",
      value: `${analisis.cancelRate}% (${analisis.totalBatal}/${analisis.totalPesanan})`,
      bg: "bg-red-50", text: "text-red-700", iconBg: "bg-red-100",
    },
  ]

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Analisis Laporan
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 border border-white/40`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`${item.iconBg} p-1.5 rounded-lg shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${item.text}`} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider leading-tight">{item.label}</span>
              </div>
              <p className={`text-sm font-bold ${item.text} break-words`}>{item.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RingkasanCard({
  pendapatan,
  perbandingan,
  loading,
}: {
  pendapatan: typeof loadingState.pendapatan
  perbandingan: PerbandinganData | null
  loading: boolean
}) {
  const items = [
    {
      key: "Pendapatan",
      label: "Pendapatan",
      value: `Rp ${pendapatan.totalPendapatan.toLocaleString("id-ID")}`,
      sub: pendapatan.totalPesanan > 0 ? `Rata-rata Rp ${pendapatan.rataRataPesanan.toLocaleString("id-ID")}/pesanan` : null,
      badge: null,
      icon: Wallet,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    {
      key: "Pesanan",
      label: "Pesanan",
      value: `${pendapatan.totalPesanan}`,
      sub: `${pendapatan.totalItemTerjual} item terjual`,
      badge: null,
      icon: ClipboardList,
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      key: "Tunai",
      label: "Tunai",
      value: `Rp ${pendapatan.tunai.toLocaleString("id-ID")}`,
      sub: null,
      badge: null,
      icon: Banknote,
      bg: "bg-amber-50",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    {
      key: "Non-Tunai",
      label: "Non-Tunai",
      value: `Rp ${(pendapatan.qris + pendapatan.transfer).toLocaleString("id-ID")}`,
      sub: pendapatan.qris + pendapatan.transfer > 0
        ? `QRIS Rp ${pendapatan.qris.toLocaleString("id-ID")}\nTransfer Rp ${pendapatan.transfer.toLocaleString("id-ID")}`
        : null,
      badge: null,
      icon: CreditCard,
      bg: "bg-violet-50",
      text: "text-violet-700",
      iconBg: "bg-violet-100",
    },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className={`${item.bg} rounded-xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2 gap-1 overflow-hidden">
                <div className="flex items-center gap-2 min-w-0 flex-shrink">
                  <div className={`${item.iconBg} p-1.5 rounded-lg shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${item.text}`} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate">{item.label}</span>
                </div>
                <div className="shrink-0">{item.badge}</div>
              </div>
              <p className={`text-lg font-bold ${item.text} break-words`}>{item.value}</p>
              {item.sub && (
                <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {item.sub.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center bg-gray-50 rounded-xl p-3 border border-white/60 shadow-sm shrink-0">
        <PieMetode tunai={pendapatan.tunai} qris={pendapatan.qris} transfer={pendapatan.transfer} />
      </div>
    </div>
  )
}

function FilterPeriode({
  icon: Icon,
  label,
  periodeLabel,
  periodeValue,
  filter,
}: {
  icon: React.ElementType
  label: string
  periodeLabel: string
  periodeValue: string
  filter: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-xl px-4 py-3 border shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="bg-blue-50 p-2 rounded-lg shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="grid gap-0.5 min-w-0">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
          <div className="flex items-center gap-2">
            {filter}
          </div>
        </div>
      </div>
      <div className="hidden sm:block w-px h-10 bg-gray-200 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{periodeLabel}</p>
        <p className="text-sm font-semibold text-gray-800">{periodeValue}</p>
      </div>
    </div>
  )
}
