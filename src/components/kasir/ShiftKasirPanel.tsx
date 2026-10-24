"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Banknote,
  CheckCircle2,
  Clock,
  HandCoins,
  Loader2,
  LogOut,
  Timer,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react"
import { bukaShift, getShiftAktif, tutupShift } from "@/app/actions/shift"
import type { ShiftLainAktif, SaranUangAwalSendiri } from "@/app/actions/shift"
import type { ShiftAktif } from "@/types"

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`

type SaranUangAwal = {
  shiftId: number
  nominal: number
  dariKasir: string
}

type HasilShiftAktif = {
  shift: ShiftAktif | null
  canManage: boolean
  saranUangAwal: SaranUangAwal | null
  saranUangAwalSendiri: SaranUangAwalSendiri | null
  shiftLainAktif: ShiftLainAktif | null
}

type RingkasanTutupShift = {
  totalTransaksi: number
  totalPendapatan: number
  totalTunai: number
  totalNonTunai: number
  totalKasKeluar: number
  uangHarapAkhir: number
  selisihKas: number
  uangAkhirFisik: number
  uangAwalShift: number
}

/**
 * Key sessionStorage untuk menyimpan ringkasan tutup shift terakhir.
 * Dipakai supaya catatan tetap tampil walau komponen ter-remount (mis. refresh data).
 */
const KEY_RINGKASAN = "pringmoni:ringkasan-tutup-shift"

function bacaRingkasanTersimpan(): RingkasanTutupShift | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(KEY_RINGKASAN)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RingkasanTutupShift
    return typeof parsed?.uangAkhirFisik === "number" ? parsed : null
  } catch {
    return null
  }
}

function simpanRingkasan(ringkasan: RingkasanTutupShift | null) {
  if (typeof window === "undefined") return
  try {
    if (ringkasan) {
      window.sessionStorage.setItem(KEY_RINGKASAN, JSON.stringify(ringkasan))
    } else {
      window.sessionStorage.removeItem(KEY_RINGKASAN)
    }
  } catch {
    // storage penuh / diblokir — abaikan, catatan tetap tampil di memori
  }
}

function durasiLabel(dariIso: string): string {
  const selisih = Date.now() - new Date(dariIso).getTime()
  const totalMenit = Math.max(0, Math.floor(selisih / 60000))
  const jam = Math.floor(totalMenit / 60)
  const menit = totalMenit % 60
  if (jam === 0) return `${menit} menit`
  return `${jam} jam ${menit} menit`
}

function jamLabel(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Panel shift kasir.
 *
 * Hanya dirender untuk role kasir — owner/waiter mendapat `canManage: false`
 * sehingga tidak pernah melihat tombol buka/tutup shift.
 */
export function ShiftKasirPanel({
  onShiftChange,
}: {
  onShiftChange?: () => void
}) {
  const [data, setData] = useState<HasilShiftAktif | null>(null)
  const [loading, setLoading] = useState(true)
  const [sudahMuat, setSudahMuat] = useState(false)
  const [dialogBuka, setDialogBuka] = useState(false)
  const [dialogTutup, setDialogTutup] = useState(false)
  const [dialogReopen, setDialogReopen] = useState(false)
  const [reopenInfo, setReopenInfo] = useState<{
    pesan: string
    shiftTertutup: { id: number; waktuKeluar: string | null; uangAkhir: number | null }
  } | null>(null)
  const [uangAwal, setUangAwal] = useState("")
  const [uangAkhir, setUangAkhir] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [sumberShiftId, setSumberShiftId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ringkasan, setRingkasan] = useState<RingkasanTutupShift | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pakaiSisaSebelumnya, setPakaiSisaSebelumnya] = useState(true)
  const ringkasanSudahInit = useRef(false)

  // Catatan tutup shift hanya hilang saat kasir menekan tombol X.
  // Disimpan di sessionStorage agar tetap tampil walau komponen ter-remount.
  useEffect(() => {
    if (!ringkasanSudahInit.current) {
      ringkasanSudahInit.current = true
      const tersimpan = bacaRingkasanTersimpan()
      if (tersimpan) setRingkasan(tersimpan)
      return
    }
    simpanRingkasan(ringkasan)
  }, [ringkasan])

  const muatShift = useCallback(async () => {
    try {
      const hasil = await getShiftAktif()
      if ('error' in hasil) {
        setError(hasil.error)
      } else {
        setData(hasil)
      }
    } catch {
      setError("Gagal memuat data shift")
    } finally {
      setLoading(false)
      setSudahMuat(true)
    }
  }, [])

  useEffect(() => {
    muatShift()
  }, [muatShift])

  // Total berjalan berubah setiap ada pembayaran, jadi disegarkan berkala.
  useEffect(() => {
    if (!data?.shift) return
    const interval = setInterval(muatShift, 15000)
    return () => clearInterval(interval)
  }, [data?.shift, muatShift])

  if (!sudahMuat && loading) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <p className="text-sm text-gray-500">Memuat data shift...</p>
      </div>
    )
  }
  if (!data?.canManage) return null

  const shift = data.shift
  const uangHarapAkhir = shift ? shift.uangAwal + shift.totalTunai : 0
  const saran = data.saranUangAwal
  const modalDariSaran = saran !== null && sumberShiftId === saran.shiftId
  const saranSendiri = data.saranUangAwalSendiri
  const shiftLainAktif = data.shiftLainAktif

  async function submitBuka(konfirmasiReopen = false) {
    const nominal = Number(uangAwal.replace(/\D/g, ""))
    if (!nominal || nominal <= 0) {
      setError("Masukkan uang awal lebih dari 0")
      return
    }

    setSubmitting(true)
    setError(null)
    const sumber = pakaiSisaSebelumnya ? sumberShiftId : null
    const hasil = await bukaShift(nominal, sumber, konfirmasiReopen)
    setSubmitting(false)

    if ("perluKonfirmasiReopen" in hasil) {
      setReopenInfo({ pesan: hasil.pesan, shiftTertutup: hasil.shiftTertutup })
      setDialogBuka(false)
      setDialogReopen(true)
      return
    }

    if ('error' in hasil) {
      setError(hasil.error)
      setDialogBuka(true)
      return
    }

    setDialogBuka(false)
    setDialogReopen(false)
    setReopenInfo(null)
    setUangAwal("")
    setSumberShiftId(null)
    setPakaiSisaSebelumnya(true)
    setRingkasan(null)
    await muatShift()
    onShiftChange?.()
  }

  async function submitTutup() {
    const nominal = Number(uangAkhir.replace(/\D/g, ""))
    if (!nominal || nominal <= 0) {
      setError("Masukkan uang akhir yang dihitung fisik")
      return
    }

    setSubmitting(true)
    setError(null)
    const hasil = await tutupShift(nominal, keterangan, true)
    setSubmitting(false)

    if ('error' in hasil) {
      setError(hasil.error)
      return
    }

    if (!('success' in hasil)) {
      setError("Gagal menutup shift. Silakan coba lagi.")
      return
    }

    // Success — shift closed, tampilkan ringkasan sebagai catatan di halaman
    setDialogTutup(false)
    setKeterangan("")
    setRingkasan({
      ...hasil.ringkasan,
      uangAkhirFisik: nominal,
      uangAwalShift: shift?.uangAwal ?? 0,
    })
    await muatShift()
    onShiftChange?.()
  }

  function bukaDialogTutup() {
    setUangAkhir(String(Math.round(uangHarapAkhir)))
    setKeterangan("")
    setError(null)
    setDialogTutup(true)
  }

  function bukaDialogBuka(pakaiSaranArg = false) {
    if (pakaiSaranArg && saran) {
      setUangAwal(String(saran.nominal))
      setSumberShiftId(saran.shiftId)
      setPakaiSisaSebelumnya(true)
    } else {
      setUangAwal("")
      setSumberShiftId(null)
      setPakaiSisaSebelumnya(true)
    }
    setError(null)
    setDialogBuka(true)
  }

  function pilihSaran() {
    if (!saran) return
    setUangAwal(String(saran.nominal))
    setSumberShiftId(saran.shiftId)
    setPakaiSisaSebelumnya(true)
  }

  const selisihPreview = Number(uangAkhir.replace(/\D/g, "")) - uangHarapAkhir

  return (
    <>
      {ringkasan && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900">Shift Berhasil Ditutup</p>
            <p className="text-sm text-blue-800 mt-0.5">
              Berikut ringkasan perhitungan uang kas shift yang baru saja ditutup.
            </p>
            <div className="bg-white rounded-lg p-3 mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaksi total</span>
                <span className="font-medium">{ringkasan.totalTransaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pendapatan</span>
                <span className="font-medium">{rupiah(ringkasan.totalPendapatan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uang awal</span>
                <span className="font-medium">{rupiah(ringkasan.uangAwalShift)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tunai (kas masuk)</span>
                <span className="font-medium">{rupiah(ringkasan.totalTunai)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Non-tunai</span>
                <span className="font-medium">{rupiah(ringkasan.totalNonTunai)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kas keluar</span>
                <span className="font-medium">{rupiah(ringkasan.totalKasKeluar)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Seharusnya ada di laci</span>
                <span>{rupiah(ringkasan.uangHarapAkhir)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Uang akhir (fisik)</span>
                <span>{rupiah(ringkasan.uangAkhirFisik)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Selisih kas</span>
                <span
                  className={
                    ringkasan.selisihKas === 0
                      ? "text-green-700"
                      : ringkasan.selisihKas > 0
                        ? "text-red-700"
                        : "text-blue-700"
                  }
                >
                  {ringkasan.selisihKas === 0
                    ? "Sesuai"
                    : ringkasan.selisihKas > 0
                      ? `Lebih ${rupiah(ringkasan.selisihKas)}`
                      : `Kurang ${rupiah(Math.abs(ringkasan.selisihKas))}`}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRingkasan(null)}
            className="text-blue-700 hover:bg-blue-100 hover:text-blue-900 shrink-0"
            aria-label="Tutup ringkasan"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {shift ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-green-900">Shift Aktif</p>
                <span className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Masuk {jamLabel(shift.waktuMasuk)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white text-green-700 border border-green-300 px-2 py-0.5 rounded-full">
                  <Timer className="w-3 h-3" />
                  {durasiLabel(shift.waktuMasuk)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-1 mt-2 text-sm">
                <p className="text-green-900">
                  <span className="text-green-700">Uang awal: </span>
                  <span className="font-medium">{rupiah(shift.uangAwal)}</span>
                </p>
                <p className="text-green-900">
                  <span className="text-green-700">Transaksi: </span>
                  <span className="font-medium">{shift.totalTransaksi}</span>
                </p>
                <p className="text-green-900">
                  <span className="text-green-700">Tunai: </span>
                  <span className="font-medium">{rupiah(shift.totalTunai)}</span>
                </p>
                <p className="text-green-900">
                  <span className="text-green-700">Non-tunai: </span>
                  <span className="font-medium">{rupiah(shift.totalNonTunai)}</span>
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={bukaDialogTutup}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 shrink-0"
            variant="outline"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Tutup Shift
          </Button>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Shift belum dibuka</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Masukkan uang awal yang ada di laci kas sebelum mulai bertransaksi.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => bukaDialogBuka(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Buka Shift
            </Button>
          </div>

          {saran && (
            <div className="flex flex-col gap-3 rounded-lg border-2 border-amber-400 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <HandCoins className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Ambil uang kas dari kasir sebelumnya
                  </p>
                  <p className="text-sm text-amber-800">
                    Kasir <span className="font-semibold">{saran.dariKasir}</span>{" "}
                    menutup shift dengan uang akhir{" "}
                    <span className="font-semibold">{rupiah(saran.nominal)}</span>.
                    Ambil uang tersebut dari laci sebagai uang awal shift Anda (uang akhir sudah termasuk modal awal kasir sebelumnya).
                  </p>
                </div>
              </div>
              <Button
                onClick={() => bukaDialogBuka(true)}
                className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
              >
                <Banknote className="mr-2 h-4 w-4" />
                Ambil {rupiah(saran.nominal)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Buka Shift */}
      <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Buka Shift</DialogTitle>
            <DialogDescription>
              Uang awal adalah nominal uang fisik yang tersedia di laci kas saat
              shift dimulai.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="uangAwal"
                className="text-sm font-medium text-gray-700"
              >
                Uang Awal / Modal Kas
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  Rp
                </span>
                <Input
                  id="uangAwal"
                  type="text"
                  inputMode="numeric"
                  value={uangAwal}
                  onChange={(e) => setUangAwal(e.target.value.replace(/\D/g, ""))}
                  placeholder="500000"
                  className="pl-9 text-lg font-semibold"
                  autoFocus
                />
              </div>
              {uangAwal && (
                <p className="text-sm text-gray-500">
                  {rupiah(Number(uangAwal))}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Boleh isi nominal sendiri bila ada penyesuaian uang kembalian.
                Uang akhir kasir sebelumnya sudah termasuk modal awalnya — jangan
                ditambahkan lagi.
              </p>
            </div>

            {saran && (
              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <HandCoins className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div className="space-y-0.5">
                      <Label htmlFor="pakai-sisa" className="text-sm font-semibold text-amber-900">
                        Gunakan sisa shift sebelumnya
                      </Label>
                      <p className="text-xs text-amber-800">
                        Disarankan dari Shift #{saran.shiftId} (Kasir {saran.dariKasir}) •{" "}
                        {rupiah(saran.nominal)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pakai-sisa"
                    checked={pakaiSisaSebelumnya}
                    onCheckedChange={(checked) => {
                      setPakaiSisaSebelumnya(checked)
                      if (checked) {
                        setUangAwal(String(saran.nominal))
                        setSumberShiftId(saran.shiftId)
                      } else {
                        setSumberShiftId(null)
                        setUangAwal("")
                        setError(null)
                      }
                    }}
                  />
                </div>
                {pakaiSisaSebelumnya && (
                  <p className="text-xs text-amber-800">
                    Ini sisa laci dari shift sebelumnya (sudah termasuk modal awal). Bukan patokan wajib — Anda tetap bisa mengedit nominal di atas.
                  </p>
                )}
                {!pakaiSisaSebelumnya && (
                  <p className="text-xs text-gray-600">
                    Tidak menggunakan sisa shift sebelumnya. Isi uang awal secara manual sesuai uang fisik di laci saat ini.
                  </p>
                )}
              </div>
            )}

            {saran && (
              <div
                className={`space-y-3 rounded-xl border-2 p-3 ${
                  modalDariSaran
                    ? "border-green-500 bg-green-50"
                    : "border-amber-400 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${
                      modalDariSaran ? "bg-green-600" : "bg-amber-500"
                    }`}
                  >
                    <HandCoins className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {modalDariSaran
                        ? "Uang kas diambil dari shift sebelumnya"
                        : "Serah terima kas dari kasir sebelumnya"}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      Kasir <span className="font-semibold">{saran.dariKasir}</span>{" "}
                      menutup shift dengan uang akhir{" "}
                      <span className="font-semibold">{rupiah(saran.nominal)}</span>.
                      Ambil uang tersebut dari laci, hitung, lalu masukkan sebagai
                      uang awal.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={pilihSaran}
                  className={`w-full ${
                    modalDariSaran
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {modalDariSaran ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Modal dari {saran.dariKasir} terpasang
                    </>
                  ) : (
                    <>
                      <Banknote className="mr-2 h-4 w-4" />
                      Ambil {rupiah(saran.nominal)} dari {saran.dariKasir}
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogBuka(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={() => submitBuka()}
              disabled={submitting}
              className="flex-1 bg-green-700 hover:bg-green-800"
            >
              {submitting ? "Menyimpan..." : "Buka Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi buka ulang shift di slot yang sudah ditutup hari ini */}
      <Dialog open={dialogReopen} onOpenChange={setDialogReopen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Buka ulang shift?</DialogTitle>
            <DialogDescription>
              Slot jadwal ini sudah kamu tutup hari ini. Membuka lagi akan membuat
              shift baru dan tercatat di log sebagai buka ulang.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {reopenInfo?.pesan}
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Uang awal shift baru</span>
                <span className="font-semibold">{rupiah(Number(uangAwal || 0))}</span>
              </div>
              {reopenInfo?.shiftTertutup.uangAkhir != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Uang akhir shift sebelumnya</span>
                  <span className="font-semibold">
                    {rupiah(reopenInfo.shiftTertutup.uangAkhir)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogReopen(false)
                setReopenInfo(null)
                setDialogBuka(true)
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                setDialogReopen(false)
                setReopenInfo(null)
                submitBuka(true)
              }}
              disabled={submitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? "Menyimpan..." : "Ya, buka ulang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutup Shift */}
      <Dialog open={dialogTutup} onOpenChange={setDialogTutup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Tutup Shift</DialogTitle>
            <DialogDescription>
              Hitung uang fisik di laci, lalu masukkan nominalnya untuk
              membandingkan dengan kas yang seharunya ada.
            </DialogDescription>
          </DialogHeader>

          {shift && (
            <div className="space-y-3 py-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uang awal</span>
                  <span className="font-medium">{rupiah(shift.uangAwal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaksi ({shift.totalTransaksi})</span>
                  <span className="font-medium">{rupiah(shift.totalPendapatan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kas masuk (tunai)</span>
                  <span className="font-medium">{rupiah(shift.totalTunai)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Seharusnya ada di laci</span>
                  <span>{rupiah(uangHarapAkhir)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="uangAkhir"
                  className="text-sm font-medium text-gray-700"
                >
                  Uang Akhir (hasil hitung fisik)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    Rp
                  </span>
                  <Input
                    id="uangAkhir"
                    type="text"
                    inputMode="numeric"
                    value={uangAkhir}
                    onChange={(e) => setUangAkhir(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 text-lg font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              {uangAkhir && (
                <div
                  className={`flex items-center gap-2 text-sm font-medium rounded-lg p-2 ${
                    selisihPreview === 0
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : selisihPreview > 0
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {selisihPreview === 0 ? (
                    <Wallet className="w-4 h-4" />
                  ) : selisihPreview > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {selisihPreview === 0
                    ? "Uang kas sesuai"
                    : selisihPreview > 0
                      ? `Lebih ${rupiah(selisihPreview)}`
                      : `Kurang ${rupiah(Math.abs(selisihPreview))}`}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="keteranganShift"
                  className="text-sm font-medium text-gray-700"
                >
                  Keterangan (opsional)
                </label>
                <Input
                  id="keteranganShift"
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: serah terima ke kasir berikutnya"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                  {error}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogTutup(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={submitTutup}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Menyimpan..." : "Tutup Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Whether kasir punya shift aktif — dipakai untuk mengunci tombol transaksi. */
export function useShiftAktif() {
  const [shift, setShift] = useState<ShiftAktif | null>(null)
  const [ready, setReady] = useState(false)

  const muat = useCallback(async () => {
    try {
      const hasil = await getShiftAktif()
      setShift('error' in hasil ? null : hasil.shift)
    } catch {
      setShift(null)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  return { shift, ready, refreshShift: muat }
}