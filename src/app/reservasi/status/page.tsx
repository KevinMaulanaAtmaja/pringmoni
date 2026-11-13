"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChefHat,
  Clock,
  Loader2,
  Search,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cekStatusReservasi } from "@/app/actions/reservasi-customer"

interface StatusData {
  kodeReservasi: string | null
  namaPelanggan: string
  jumlahOrang: number
  nomorMeja: string
  waktuKedatangan: string
  batasKonfirmasi: string
  statusReservasi: string
  dpStatus: string
  dpNominal: number
  totalHarga: number
  sisaTagihan: number
  items: { namaMenu: string; jumlah: number; harga: number }[]
}

function formatRupiah(n: number) {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`
}

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function labelStatus(data: StatusData): { label: string; warna: string; keterangan: string } {
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
  if (data.dpStatus === "menunggu") {
    return {
      label: "Menunggu Verifikasi DP",
      warna: "bg-amber-100 text-amber-700 border-amber-200",
      keterangan: "Kasir sedang memverifikasi bukti pembayaran DP Anda.",
    }
  }
  return {
    label: "Terkonfirmasi",
    warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
    keterangan: "Reservasi aktif. Datang sesuai jam kedatangan.",
  }
}

export default function StatusReservasiPage() {
  const [kode, setKode] = useState("")
  const [noHp, setNoHp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatusData | null>(null)

  async function handleCek(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setData(null)
    setLoading(true)
    try {
      const res = await cekStatusReservasi(kode, noHp)
      if ("error" in res && res.error) {
        setError(res.error)
        return
      }
      if ("data" in res && res.data) {
        setData(res.data as StatusData)
      }
    } catch {
      setError("Gagal memeriksa status. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const status = data ? labelStatus(data) : null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9" asChild>
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="font-heading font-semibold text-sm">Cek Status Reservasi</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCek} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="kode">Kode Reservasi</Label>
                <Input
                  id="kode"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  placeholder="RSV-XXXXXX"
                  className="font-mono tracking-wider"
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
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" /> Memeriksa...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" /> Cek Status
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {data && status && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Kode Reservasi</p>
                  <p className="font-mono font-bold text-lg">{data.kodeReservasi}</p>
                </div>
                <Badge variant="outline" className={status.warna}>
                  {status.label}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{status.keterangan}</p>

              <Separator />

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <CalendarDays className="size-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Jam Kedatangan</p>
                    <p className="font-medium">{formatWaktu(data.waktuKedatangan)}</p>
                    <p className="text-xs text-emerald-700 flex items-center gap-1 mt-0.5">
                      <ChefHat className="size-3.5" />
                      Resto menyiapkan pesanan sebelum jam ini.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="size-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Batas Konfirmasi</p>
                    <p className="font-medium">{formatWaktu(data.batasKonfirmasi)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {data.namaPelanggan} · {data.jumlahOrang} orang · Meja {data.nomorMeja}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                {data.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.jumlah}× {item.namaMenu}
                    </span>
                    <span>{formatRupiah(item.harga * item.jumlah)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-1">
                  <span>Total</span>
                  <span>{formatRupiah(data.totalHarga)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>
                    DP ({data.dpStatus === "berhasil" ? "terverifikasi" : "menunggu verifikasi"})
                  </span>
                  <span>{formatRupiah(data.dpNominal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Sisa saat kedatangan</span>
                  <span>{formatRupiah(data.sisaTagihan)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
