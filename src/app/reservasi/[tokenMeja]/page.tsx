"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { getQrisStaticUrl } from "@/lib/qris-static"
import { hitungRincianDp } from "@/lib/dp"
import { ACARA_RESERVASI, gabungCatatanReservasi } from "@/lib/reservasi-catatan"
import { useUploadThing } from "@/lib/uploadthing-client"
import {
  createReservasiCustomer,
  getReservasiCustomerByToken,
} from "@/app/actions/reservasi-customer"

interface MenuItem {
  id: number
  namaMenu: string
  deskripsi: string | null
  harga: number
  kategori: string
  lokasi?: string
  pilihanSuhu?: boolean
  statusMenu: string
  fotoUrl: string | null
  porsiTersedia?: number
}

interface KategoriItem {
  id: number
  namaKategori: string
  lokasi: string
  pilihanSuhu: boolean
}

interface MejaInfo {
  id: number
  nomorMeja: string
  kapasitas: number
  statusMeja: string
}

interface HasilReservasi {
  reservasiId: number
  kodeReservasi: string
  dpNominal: number
  totalHarga: number
  sisaTagihan: number
  batasKonfirmasi: string
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

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function validasiNoHp(value: string) {
  const digits = value.replace(/[^0-9+]/g, "")
  return /^(\+62|62|0)8[0-9]{7,12}$/.test(digits)
}

const LANGKAH = ["Data & Waktu", "Pre-order", "Ringkasan", "Bayar DP"]

export default function ReservasiCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const tokenMeja = (params?.tokenMeja as string) || ""

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [meja, setMeja] = useState<MejaInfo | null>(null)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [kategoris, setKategoris] = useState<KategoriItem[]>([])
  const [tidakBisa, setTidakBisa] = useState(false)
  const [expiryJam, setExpiryJam] = useState(3)

  const [step, setStep] = useState(1)
  const [nama, setNama] = useState("")
  const [noHp, setNoHp] = useState("")
  const [jumlahOrang, setJumlahOrang] = useState("2")
  const [waktuKedatangan, setWaktuKedatangan] = useState("")
  const [acara, setAcara] = useState("")
  const [catatan, setCatatan] = useState("")
  const [keranjang, setKeranjang] = useState<Record<number, number>>({})
  const [setuju, setSetuju] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [activeKategori, setActiveKategori] = useState("Semua")
  const [search, setSearch] = useState("")

  const [buktiUrl, setBuktiUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasil, setHasil] = useState<HasilReservasi | null>(null)
  const [copied, setCopied] = useState(false)

  const { startUpload, isUploading } = useUploadThing("dpBukti", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      if (res?.length) setBuktiUrl(res[0].url)
    },
    onUploadError: () => setFormError("Gagal mengunggah bukti pembayaran"),
  })

  useEffect(() => {
    let aktif = true
    async function load() {
      if (!tokenMeja) {
        setLoadError("Token meja tidak valid")
        setLoading(false)
        return
      }
      try {
        const data = await getReservasiCustomerByToken(tokenMeja)
        if (!aktif) return
        if ("error" in data) {
          setLoadError(data.error ?? "Gagal memuat data meja")
        } else {
          setMeja(data.meja)
          setMenus(data.menus as MenuItem[])
          setKategoris(data.kategoris)
          setTidakBisa(data.tidakBisaReservasi)
          if (data.expiryJam) setExpiryJam(data.expiryJam)
        }
      } catch {
        if (aktif) setLoadError("Gagal memuat data meja. Coba muat ulang halaman.")
      } finally {
        if (aktif) setLoading(false)
      }
    }
    load()
    return () => {
      aktif = false
    }
  }, [tokenMeja])

  const minWaktu = useMemo(() => toLocalInputValue(new Date()), [])
  const maxWaktu = useMemo(
    () => toLocalInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    []
  )

  const itemsTerpilih = useMemo(
    () =>
      menus
        .filter((m) => (keranjang[m.id] ?? 0) > 0)
        .map((m) => ({ ...m, jumlah: keranjang[m.id] })),
    [menus, keranjang]
  )

  const totalHarga = useMemo(
    () => itemsTerpilih.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
    [itemsTerpilih]
  )
  const rincian = useMemo(() => hitungRincianDp(totalHarga), [totalHarga])

  const batasKonfirmasi = useMemo(() => {
    if (!waktuKedatangan) return null
    const t = new Date(waktuKedatangan)
    if (Number.isNaN(t.getTime())) return null
    return new Date(t.getTime() + expiryJam * 60 * 60 * 1000)
  }, [waktuKedatangan, expiryJam])

  const jumlahMenuTotal = useMemo(
    () => Object.values(keranjang).reduce((a, b) => a + b, 0),
    [keranjang]
  )

  const menusTampil = useMemo(() => {
    return menus.filter((m) => {
      if (activeKategori !== "Semua" && m.kategori !== activeKategori) return false
      if (search.trim() && !m.namaMenu.toLowerCase().includes(search.trim().toLowerCase()))
        return false
      return true
    })
  }, [menus, activeKategori, search])

  const tambah = useCallback((menu: MenuItem, delta: number) => {
    setKeranjang((prev) => {
      const maks = menu.porsiTersedia ?? 0
      const berikut = Math.max(0, Math.min(maks, (prev[menu.id] ?? 0) + delta))
      if (berikut <= 0) {
        const { [menu.id]: _, ...sisa } = prev
        return sisa
      }
      return { ...prev, [menu.id]: berikut }
    })
  }, [])

  function lanjut() {
    setFormError(null)
    if (step === 1) {
      if (nama.trim().length < 2) return setFormError("Nama pelanggan wajib diisi")
      if (!validasiNoHp(noHp)) return setFormError("Nomor HP tidak valid (contoh: 081234567890)")
      const org = Number(jumlahOrang)
      if (!Number.isInteger(org) || org < 1) return setFormError("Jumlah orang tidak valid")
      if (meja && org > meja.kapasitas)
        return setFormError(`Kapasitas meja maksimal ${meja.kapasitas} orang`)
      if (!waktuKedatangan) return setFormError("Pilih tanggal & jam kedatangan")
      const t = new Date(waktuKedatangan).getTime()
      if (Number.isNaN(t)) return setFormError("Waktu kedatangan tidak valid")
      if (t < Date.now() - 5 * 60 * 1000) return setFormError("Waktu kedatangan sudah lewat")
      if (t > Date.now() + 7 * 24 * 60 * 60 * 1000)
        return setFormError("Waktu kedatangan maksimal 7 hari ke depan")
    }
    if (step === 2 && itemsTerpilih.length === 0) {
      return setFormError("Pilih minimal 1 menu pre-order")
    }
    if (step === 3 && !setuju) {
      return setFormError("Centang persetujuan kebijakan reservasi & DP")
    }
    setStep((s) => Math.min(4, s + 1))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFormError(null)
    setBuktiUrl("")
    try {
      await startUpload([file])
    } catch {
      setFormError("Gagal mengunggah bukti pembayaran")
    } finally {
      e.target.value = ""
    }
  }

  async function handleSubmit() {
    setFormError(null)
    if (!buktiUrl) return setFormError("Unggah bukti pembayaran DP terlebih dahulu")
    setSubmitting(true)
    try {
      const res = await createReservasiCustomer({
        tokenMeja,
        namaPelanggan: nama.trim(),
        noHp,
        jumlahOrang: Number(jumlahOrang),
        waktuKedatangan: new Date(waktuKedatangan).toISOString(),
        catatan: gabungCatatanReservasi(acara, catatan),
        items: itemsTerpilih.map((item) => ({ menuId: item.id, jumlah: item.jumlah })),
        dpBuktiUrl: buktiUrl,
      })
      if ("error" in res) {
        setFormError(res.error ?? "Gagal membuat reservasi")
        return
      }
      setHasil({
        reservasiId: res.reservasiId,
        kodeReservasi: res.kodeReservasi,
        dpNominal: res.dpNominal,
        totalHarga: res.totalHarga,
        sisaTagihan: res.sisaTagihan,
        batasKonfirmasi: res.batasKonfirmasi,
      })
    } catch {
      setFormError("Gagal membuat reservasi. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  async function copyKode() {
    if (!hasil) return
    try {
      await navigator.clipboard.writeText(hasil.kodeReservasi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Memuat data reservasi...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="size-10 text-destructive mx-auto" />
            <p className="font-semibold">{loadError}</p>
            <Button variant="outline" onClick={() => router.push(`/${tokenMeja}`)}>
              <ArrowLeft className="size-4 mr-2" /> Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tidakBisa) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="size-7 text-amber-600" />
            </div>
            <h1 className="font-heading font-bold text-lg">Meja Tidak Dapat Direservasi</h1>
            <p className="text-sm text-muted-foreground">
              Meja {meja?.nomorMeja ?? ""} sudah direservasi customer lain atau sedang dipakai.
              Silakan pilih meja lain atau hubungi staf restoran.
            </p>
            <Button variant="outline" onClick={() => router.push(`/${tokenMeja}`)}>
              <ArrowLeft className="size-4 mr-2" /> Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasil) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="size-9 text-emerald-600" />
            </div>
            <h1 className="font-heading font-bold text-xl">Reservasi Berhasil</h1>
            <p className="text-sm text-muted-foreground">
              Tunjukkan kode ini kepada staf saat datang
            </p>
          </div>

          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="p-5 text-center space-y-2">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                Kode Reservasi
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-2xl tracking-wider">
                  {hasil.kodeReservasi}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyKode}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <CalendarDays className="size-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Jam Kedatangan</p>
                  <p className="font-semibold">{formatWaktu(waktuKedatangan)}</p>
                  <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                    <ChefHat className="size-3.5" />
                    Resto menyiapkan pesanan Anda sebelum jam kedatangan.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Jumlah Orang</p>
                  <p className="font-medium">{jumlahOrang} orang</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meja</p>
                  <p className="font-medium">Meja {meja?.nomorMeja}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">DP Dibayar</p>
                  <p className="font-medium">{formatRupiah(hasil.dpNominal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sisa Tagihan</p>
                  <p className="font-medium">{formatRupiah(hasil.sisaTagihan)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
                <Clock className="size-4 shrink-0 mt-0.5" />
                <span>
                  DP sedang menunggu verifikasi kasir. Reservasi otomatis batal jika belum
                  dikonfirmasi hingga <b>{formatWaktu(hasil.batasKonfirmasi)}</b> dan DP hangus.
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2 pt-2">
            <Button asChild className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/reservasi/status">Cek Status Reservasi</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12">
              <Link href={`/${tokenMeja}`}>Kembali ke Menu</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            onClick={() => (step > 1 ? setStep(step - 1) : router.push(`/${tokenMeja}`))}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="font-heading font-semibold text-sm">Reservasi Meja</h1>
            <p className="text-xs text-muted-foreground">
              Meja {meja?.nomorMeja} · maks {meja?.kapasitas} orang
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-1.5">
          {LANGKAH.map((label, i) => {
            const n = i + 1
            const aktif = n === step
            const selesai = n < step
            return (
              <div key={label} className="flex-1 space-y-1">
                <div
                  className={`h-1.5 rounded-full ${
                    selesai || aktif ? "bg-emerald-600" : "bg-muted"
                  }`}
                />
                <p
                  className={`text-[10px] text-center ${
                    aktif ? "text-emerald-700 font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
              </div>
            )
          })}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 1 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama">Nama Pelanggan *</Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hp">Nomor HP *</Label>
                <Input
                  id="hp"
                  inputMode="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="081234567890"
                />
                <p className="text-xs text-muted-foreground">
                  Dipakai untuk mengecek status reservasi.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orang" className="flex items-center gap-1.5">
                  <Users className="size-3.5" /> Jumlah Orang *
                </Label>
                <Input
                  id="orang"
                  type="number"
                  min={1}
                  max={meja?.kapasitas}
                  value={jumlahOrang}
                  onChange={(e) => setJumlahOrang(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="waktu" className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> Waktu Kedatangan *
                </Label>
                <Input
                  id="waktu"
                  type="datetime-local"
                  min={minWaktu}
                  max={maxWaktu}
                  value={waktuKedatangan}
                  onChange={(e) => setWaktuKedatangan(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maksimal 7 hari ke depan. Resto mulai menyiapkan pesanan menjelang jam ini.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="catatan">Catatan (opsional)</Label>
                <p className="text-xs text-muted-foreground">
                  Pilih jenis acara jika ada, lalu tambahkan detail kebutuhan.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ACARA_RESERVASI.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAcara((prev) => (prev === item ? "" : item))}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        acara === item
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-input text-muted-foreground hover:border-emerald-300"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Contoh: dekat jendela, butuh kursi bayi, area lesehan, dll."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {["Semua", ...Array.from(new Set(menus.map((m) => m.kategori)))].map((kat) => (
                  <Button
                    key={kat}
                    size="sm"
                    variant={activeKategori === kat ? "default" : "outline"}
                    className={`rounded-full shrink-0 ${
                      activeKategori === kat ? "bg-emerald-600 hover:bg-emerald-700" : ""
                    }`}
                    onClick={() => setActiveKategori(kat)}
                  >
                    {kat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {menusTampil.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Menu tidak ditemukan.
                  </CardContent>
                </Card>
              )}
              {menusTampil.map((menu) => {
                const qty = keranjang[menu.id] ?? 0
                const habis = (menu.porsiTersedia ?? 0) <= 0
                return (
                  <Card key={menu.id} className={habis ? "opacity-60" : ""}>
                    <CardContent className="p-3 flex gap-3">
                      <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {menu.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={menu.fotoUrl}
                            alt={menu.namaMenu}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{menu.namaMenu}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {menu.deskripsi || menu.kategori}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div>
                            <p className="text-sm font-semibold text-emerald-700">
                              {formatRupiah(menu.harga)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              sisa {menu.porsiTersedia ?? 0} porsi
                            </p>
                          </div>
                          {habis ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Habis
                            </Badge>
                          ) : qty === 0 ? (
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => tambah(menu, 1)}
                            >
                              <Plus className="size-4 mr-1" /> Tambah
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => tambah(menu, -1)}
                              >
                                {qty === 1 ? (
                                  <Trash2 className="size-3.5" />
                                ) : (
                                  <Minus className="size-3.5" />
                                )}
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                disabled={qty >= (menu.porsiTersedia ?? 0)}
                                onClick={() => tambah(menu, 1)}
                              >
                                <Plus className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="font-semibold text-sm flex items-center gap-1.5">
                  <ShoppingBag className="size-4" /> Pre-order
                </h2>
                {itemsTerpilih.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.jumlah}× {item.namaMenu}
                    </span>
                    <span className="font-medium">{formatRupiah(item.harga * item.jumlah)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total Pre-order</span>
                  <span>{formatRupiah(totalHarga)}</span>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                  <div className="flex justify-between font-semibold text-emerald-800">
                    <span>DP {rincian.persen}% (dibulatkan)</span>
                    <span>{formatRupiah(rincian.dpNominal)}</span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-amber-500/50 bg-amber-50/80 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Sisa Pelunasan Saat Kedatangan
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Dibayar saat Anda tiba di resto
                      </p>
                    </div>
                    <span className="text-2xl font-extrabold text-amber-800">
                      {formatRupiah(rincian.sisaTagihan)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground">
                    Total Bayar <span className="text-xs">(DP + pelunasan)</span>
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(rincian.dpNominal + rincian.sisaTagihan)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3 text-sm">
                <h2 className="font-semibold flex items-center gap-1.5">
                  <Clock className="size-4" /> Jadwal & Kebijakan
                </h2>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jam kedatangan</span>
                  <span className="font-medium text-right">{formatWaktu(waktuKedatangan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batas konfirmasi</span>
                  <span className="font-medium text-right">
                    {batasKonfirmasi
                      ? batasKonfirmasi.toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
                  <p>
                    Reservasi otomatis <b>batal</b> jika belum dikonfirmasi hingga{" "}
                    <b>{expiryJam} jam setelah jam kedatangan</b>.
                  </p>
                  <p>DP yang sudah dibayar <b>hangus</b> jika tidak datang / tidak dikonfirmasi.</p>
                </div>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <Checkbox
                    checked={setuju}
                    onCheckedChange={(v) => setSetuju(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    Saya menyetujui kebijakan reservasi dan DP di atas.
                  </span>
                </label>
              </CardContent>
            </Card>
          </>
        )}

        {step === 4 && (
          <>
            <Card className="border-emerald-300">
              <CardContent className="p-5 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <QrCode className="size-6 text-emerald-600" />
                  </div>
                  <h2 className="font-semibold">Bayar DP {rincian.persen}%</h2>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatRupiah(rincian.dpNominal)}
                  </p>
                  <p className="text-sm font-bold text-amber-700">
                    Sisa Pelunasan {formatRupiah(rincian.sisaTagihan)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dibayar saat kedatangan · Total Bayar{" "}
                    {formatRupiah(rincian.dpNominal + rincian.sisaTagihan)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border flex flex-col items-center">
                  {getQrisStaticUrl() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getQrisStaticUrl()}
                      alt="QRIS Statis"
                      className="w-56 h-56 object-contain"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-muted-foreground">
                      QRIS belum tersedia — hubungi staf
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Scan dengan e-wallet / aplikasi pembayaran QRIS
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Bukti Pembayaran DP *</Label>
                  {buktiUrl ? (
                    <div className="flex items-center gap-2 rounded-lg border p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={buktiUrl} alt="Bukti DP" className="size-12 rounded object-cover" />
                      <span className="text-xs text-emerald-700 flex-1">
                        Bukti terunggah. Siap kirim reservasi.
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setBuktiUrl("")}>
                        Ganti
                      </Button>
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 ${
                        isUploading ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="size-6 animate-spin text-emerald-600" />
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isUploading ? "Mengunggah..." : "Ketuk untuk unggah foto bukti"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground flex gap-2">
              <ChefHat className="size-4 shrink-0" />
              <span>
                Resto akan menyiapkan pesanan Anda untuk jam kedatangan{" "}
                <b>{formatWaktu(waktuKedatangan)}</b> setelah DP diverifikasi kasir.
              </span>
            </div>
          </>
        )}

        {formError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            {formError}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {step === 2 && (
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">{jumlahMenuTotal} item dipilih</p>
              <p className="font-semibold text-sm">
                {totalHarga > 0 ? formatRupiah(totalHarga) : "Belum dipilih"}
              </p>
            </div>
          )}
          {step >= 3 && (
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">DP {rincian.persen}%</p>
              <p className="font-semibold text-sm text-emerald-700">
                {formatRupiah(rincian.dpNominal)}
              </p>
            </div>
          )}
          {step < 4 ? (
            <Button
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={lanjut}
            >
              Lanjut <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="h-11 px-6 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={submitting || isUploading || !buktiUrl}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Memproses...
                </>
              ) : (
                "Konfirmasi Reservasi"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
