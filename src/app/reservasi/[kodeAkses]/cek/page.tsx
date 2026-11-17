"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Loader2,
  Search,
  Ticket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cekStatusReservasi } from "@/app/actions/reservasi-customer"
import { LINK_RESERVASI_PUBLIK } from "@/lib/reservasi-akses"
import { HASIL_STORAGE_KEY, type HasilReservasi } from "@/lib/reservasi-hasil"

interface ReservasiTampilan {
  sumber: "lokal" | "cek"
  kodeReservasi: string | null
  namaPelanggan: string
  jumlahOrang: number
  nomorMeja: string
  waktuKedatangan: string
  batasKonfirmasi: string
  statusReservasi?: string
  dpStatus?: string
  dpNominal: number
  subtotalHarga?: number
  diskonVoucher: number
  voucherKode: string | null
  totalHarga: number
  sisaTagihan: number
  items?: { namaMenu: string; jumlah: number; harga: number }[]
}

function formatRupiah(n: number) {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`
}

function formatWaktu(iso: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function labelStatus(data: ReservasiTampilan): { label: string; warna: string; keterangan: string } {
  if (data.statusReservasi === "expired") {
    return {
      label: "Kedaluwarsa",
      warna: "bg-red-100 text-red-700 border-red-200",
      keterangan: "Reservasi melewati batas konfirmasi dan otomatis dibatalkan. DP hangus.",
    }
  }
  if (data.statusReservasi === "batal") {
    return {
      label: "Dibatalkan",
      warna: "bg-red-100 text-red-700 border-red-200",
      keterangan: "Reservasi telah dibatalkan.",
    }
  }
  if (data.statusReservasi === "no_show") {
    return {
      label: "Tidak Datang",
      warna: "bg-red-100 text-red-700 border-red-200",
      keterangan: "Reservasi tidak dihadiri. DP hangus.",
    }
  }
  if (data.statusReservasi === "selesai") {
    return {
      label: "Selesai",
      warna: "bg-slate-100 text-slate-700 border-slate-200",
      keterangan: "Reservasi selesai. Terima kasih!",
    }
  }
  if (data.statusReservasi === "dikonfirmasi") {
    return {
      label: "Sudah Check-in",
      warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
      keterangan: "Kedatangan terkonfirmasi. Pesanan sedang disiapkan.",
    }
  }
  if (data.dpStatus === "berhasil") {
    return {
      label: "Terkonfirmasi",
      warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
      keterangan: "Reservasi aktif. Datang sesuai jam kedatangan.",
    }
  }
  return {
    label: "Menunggu DP",
    warna: "bg-amber-100 text-amber-700 border-amber-200",
    keterangan: "DP menunggu verifikasi kasir. Reservasi aktif setelah DP dikonfirmasi.",
  }
}

export default function CekReservasiPage() {
  const router = useRouter()
  const [data, setData] = useState<ReservasiTampilan | null>(null)
  const [menyiapkan, setMenyiapkan] = useState(true)

  const [cekOpen, setCekOpen] = useState(false)
  const [kode, setKode] = useState("")
  const [noHp, setNoHp] = useState("")
  const [cekLoading, setCekLoading] = useState(false)
  const [cekError, setCekError] = useState<string | null>(null)

  const [backOpen, setBackOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const tersimpan = sessionStorage.getItem(HASIL_STORAGE_KEY)
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan) as HasilReservasi
        if (parsed?.kodeReservasi) {
          setData({
            sumber: "lokal",
            kodeReservasi: parsed.kodeReservasi,
            namaPelanggan: parsed.namaPelanggan ?? "-",
            jumlahOrang: parsed.jumlahOrang ?? 0,
            nomorMeja: parsed.nomorMeja ?? "-",
            waktuKedatangan: parsed.waktuKedatangan ?? "",
            batasKonfirmasi: parsed.batasKonfirmasi,
            dpNominal: parsed.dpNominal,
            subtotalHarga: parsed.subtotalHarga,
            diskonVoucher: parsed.diskonVoucher,
            voucherKode: parsed.voucherKode,
            totalHarga: parsed.totalHarga,
            sisaTagihan: parsed.sisaTagihan,
            statusReservasi: parsed.statusReservasi,
            dpStatus: parsed.dpStatus,
          })
        }
      }
    } catch {
      /* data tersimpan tidak valid */
    } finally {
      setMenyiapkan(false)
    }
  }, [])

  function bukaCek() {
    setCekError(null)
    setKode("")
    setNoHp("")
    setCekOpen(true)
  }

  async function handleCek(e: React.FormEvent) {
    e.preventDefault()
    setCekError(null)
    setCekLoading(true)
    try {
      const res = await cekStatusReservasi(kode, noHp)
      if ("error" in res && res.error) {
        setCekError(res.error)
        return
      }
      if ("data" in res && res.data) {
        setData({ sumber: "cek", ...res.data })
        setCekOpen(false)
      }
    } catch {
      setCekError("Gagal memeriksa status. Coba lagi.")
    } finally {
      setCekLoading(false)
    }
  }

  async function copyKode() {
    if (!data?.kodeReservasi) return
    try {
      await navigator.clipboard.writeText(data.kodeReservasi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const status = data ? labelStatus(data) : null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-2xl items-center justify-center gap-2 px-4">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-4 h-9 w-9"
            aria-label="Kembali ke form reservasi"
            onClick={() => setBackOpen(true)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="font-heading text-sm font-semibold text-center">
            {data?.sumber === "lokal" ? "Reservasi Berhasil" : "Cek Reservasi"}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-10">
        {menyiapkan ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Menyiapkan reservasi...</p>
          </div>
        ) : !data ? (
          <Card className="border-dashed">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
                <Search className="size-7 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-base font-semibold">Belum ada reservasi ditampilkan</h2>
                <p className="text-sm text-muted-foreground">
                  Masukkan kode reservasi dan nomor HP yang dipakai saat memesan untuk melihat
                  detail reservasi Anda.
                </p>
              </div>
              <Button
                className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={bukaCek}
              >
                <Search className="mr-2 size-4" /> Cek Reservasi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-9 text-emerald-600" />
              </div>
              <h2 className="font-heading text-xl font-bold">
                {data.sumber === "lokal" ? "Reservasi Berhasil" : "Detail Reservasi"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.sumber === "lokal"
                  ? "Tunjukkan kode ini kepada staf saat datang"
                  : status?.keterangan}
              </p>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/60">
              <CardContent className="space-y-2 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Kode Reservasi
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-wider">
                    {data.kodeReservasi}
                  </span>
                  <Button size="icon" variant="ghost" className="size-8" onClick={copyKode}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5">
                {status && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {data.namaPelanggan && data.namaPelanggan !== "-"
                        ? `Atas nama ${data.namaPelanggan}`
                        : "Status Reservasi"}
                    </p>
                    <Badge variant="outline" className={status.warna}>
                      {status.label}
                    </Badge>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Jam Kedatangan</p>
                    <p className="font-semibold">{formatWaktu(data.waktuKedatangan)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                      <ChefHat className="size-3.5" />
                      Resto menyiapkan pesanan Anda sebelum jam kedatangan.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Jumlah Orang</p>
                    <p className="font-medium">{data.jumlahOrang} orang</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meja</p>
                    <p className="font-medium">Meja {data.nomorMeja}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DP Dibayar</p>
                    <p className="font-medium">{formatRupiah(data.dpNominal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sisa Tagihan</p>
                    <p className="font-medium">{formatRupiah(data.sisaTagihan)}</p>
                  </div>
                </div>

                {data.items && data.items.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">Pre-order</p>
                      {data.items.map((item, i) => (
                        <div key={i} className="flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            {item.jumlah}× {item.namaMenu}
                          </span>
                          <span className="shrink-0">{formatRupiah(item.harga * item.jumlah)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-1 font-semibold">
                        <span>Total</span>
                        <span>{formatRupiah(data.totalHarga)}</span>
                      </div>
                    </div>
                  </>
                )}

                {Number(data.diskonVoucher ?? 0) > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                      <Ticket className="size-3.5" />
                      Voucher {data.voucherKode ?? ""}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      −{formatRupiah(Number(data.diskonVoucher))}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Batas konfirmasi <b>{formatWaktu(data.batasKonfirmasi)}</b>. Reservasi otomatis
                    batal bila belum dikonfirmasi dan DP hangus.
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2 pt-2">
              <Button
                className="h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={bukaCek}
              >
                <Search className="mr-2 size-4" /> Cek Status Reservasi
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full"
                onClick={() => setBackOpen(true)}
              >
                <ArrowLeft className="mr-2 size-4" /> Kembali ke Form Reservasi
              </Button>
            </div>
          </>
        )}
      </main>

      <Dialog open={cekOpen} onOpenChange={setCekOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Cek Reservasi</DialogTitle>
            <DialogDescription>
              Masukkan kode reservasi dan nomor HP yang dipakai saat memesan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCek} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="kode">Kode Reservasi</Label>
              <Input
                id="kode"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="RSV-XXXXXX"
                className="font-mono tracking-wider"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hp">Nomor HP</Label>
              <Input
                id="hp"
                inputMode="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                autoComplete="tel"
              />
            </div>
            {cekError && (
              <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {cekError}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCekOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={cekLoading}
              >
                {cekLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Memeriksa...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 size-4" /> Cek Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={backOpen} onOpenChange={setBackOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Kembali ke form reservasi?</DialogTitle>
            <DialogDescription>
              Kode reservasi yang sedang ditampilkan tidak akan muncul lagi setelah Anda kembali.
              Salin kode terlebih dahulu bila belum disimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBackOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => router.push(LINK_RESERVASI_PUBLIK)}>Ya, Kembali</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
