"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Armchair,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronUp,
  Clock,
  Copy,
  Download,
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getQrisStaticUrl } from "@/lib/qris-static"
import { hitungRincianDp } from "@/lib/dp"
import {
  BATAS_KEDATANGAN_RESERVASI_MENIT,
  INTERVAL_SLOT_RESERVASI_MENIT,
  JAM_BUKA_RESERVASI_MENIT,
  JAM_TUTUP_RESERVASI_MENIT,
  MAKS_HARI_KE_DEPAN,
  SLOT_RESERVASI,
  formatMenit,
  hitungBatasKonfirmasi,
  periodeJam,
  validasiWaktuKedatangan,
} from "@/lib/reservasi-jadwal"
import { useUploadThing } from "@/lib/uploadthing-client"
import {
  createReservasiCustomer,
  getReservasiCustomer,
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
  tipeMeja: string
  punyaQr: boolean
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

const pad2 = (n: number) => String(n).padStart(2, "0")

function toTanggalInputValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

const PERIODE_RESERVASI = Array.from(new Set(SLOT_RESERVASI.map(periodeJam)))

function sesiTersediaUntukTanggal(tanggal: string) {
  const batasLewat = Date.now() - 5 * 60 * 1000
  return (
    PERIODE_RESERVASI.find((periode) =>
      SLOT_RESERVASI.some(
        (slot) =>
          periodeJam(slot) === periode &&
          new Date(`${tanggal}T${slot}`).getTime() >= batasLewat
      )
    ) ?? PERIODE_RESERVASI[0]
  )
}

function formatTanggalPanjang(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const SARAN_CATATAN = [
  "Acara bukber",
  "Acara ulang tahun",
  "Acara solawatan",
  "Acara tasyakuran",
  "Acara arisan keluarga",
  "Butuh kursi bayi",
  "Area lesehan",
]

const PILIHAN_AREA = [
  "Meja bebas",
  "Indoor",
  "Outdoor",
  "Area ber-AC",
  "Area luas",
  "Lesehan",
  "Dekat jendela",
]

function validasiNoHp(value: string) {
  const digits = value.replace(/[^0-9+]/g, "")
  return /^(\+62|62|0)8[0-9]{7,12}$/.test(digits)
}

const LANGKAH = ["Data & Waktu", "Pre-order", "Ringkasan", "Bayar DP"]

export default function ReservasiCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const kodeAkses = (params?.kodeAkses as string) || ""

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mejas, setMejas] = useState<MejaInfo[]>([])
  const [mejaId, setMejaId] = useState<number | null>(null)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [kategoris, setKategoris] = useState<KategoriItem[]>([])
  const [expiryJam, setExpiryJam] = useState(3)

  const [hariIni, setHariIni] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [step, setStep] = useState(1)
  const [nama, setNama] = useState("")
  const [noHp, setNoHp] = useState("")
  const [jumlahOrang, setJumlahOrang] = useState("2")
  const [tanggalKedatangan, setTanggalKedatangan] = useState(() =>
    toTanggalInputValue(new Date())
  )
  const [jamKedatangan, setJamKedatangan] = useState("")
  const [sesiAktif, setSesiAktif] = useState(() =>
    sesiTersediaUntukTanggal(toTanggalInputValue(new Date()))
  )
  const [catatan, setCatatan] = useState("")
  const [preferensiArea, setPreferensiArea] = useState<string[]>([])
  const [keranjang, setKeranjang] = useState<Record<number, number>>({})
  const [setuju, setSetuju] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [activeKategori, setActiveKategori] = useState("Semua")
  const [search, setSearch] = useState("")

  const [buktiUrl, setBuktiUrl] = useState("")
  const [mengunduhQris, setMengunduhQris] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasil, setHasil] = useState<HasilReservasi | null>(null)
  const [copied, setCopied] = useState(false)

  const meja = useMemo(
    () => mejas.find((m) => m.id === mejaId) ?? null,
    [mejas, mejaId]
  )

  const waktuKedatangan = useMemo(
    () =>
      tanggalKedatangan && jamKedatangan
        ? `${tanggalKedatangan}T${jamKedatangan}`
        : "",
    [tanggalKedatangan, jamKedatangan]
  )

  const { startUpload, isUploading } = useUploadThing("dpBukti", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      if (res?.length) setBuktiUrl(res[0].url)
    },
    onUploadError: () => setFormError("Gagal mengunggah bukti pembayaran"),
  })

  useEffect(() => {
    let aktif = true
    async function load() {
      if (!kodeAkses) {
        setLoadError("Link reservasi tidak valid")
        setLoading(false)
        return
      }
      try {
        const data = await getReservasiCustomer(kodeAkses)
        if (!aktif) return
        if ("error" in data) {
          setLoadError(data.error ?? "Gagal memuat data reservasi")
        } else {
          setMejas(data.mejas)
          setMenus(data.menus as MenuItem[])
          setKategoris(data.kategoris)
          if (data.expiryJam) setExpiryJam(data.expiryJam)
        }
      } catch {
        if (aktif) setLoadError("Gagal memuat data reservasi. Coba muat ulang halaman.")
      } finally {
        if (aktif) setLoading(false)
      }
    }
    load()
    return () => {
      aktif = false
    }
  }, [kodeAkses])

  useEffect(() => {
    const cek = () => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      setHariIni((prev) => (prev.getTime() === d.getTime() ? prev : d))
    }
    const id = window.setInterval(cek, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const hariIniStr = toTanggalInputValue(hariIni)
    if (tanggalKedatangan < hariIniStr) {
      setTanggalKedatangan(hariIniStr)
      setJamKedatangan("")
      setSesiAktif(sesiTersediaUntukTanggal(hariIniStr))
    }
  }, [hariIni, tanggalKedatangan])

  useEffect(() => {
    if (meja && Number(jumlahOrang) > meja.kapasitas) setMejaId(null)
  }, [jumlahOrang, meja])

  const pilihanTanggal = useMemo(() => {
    const daftar: { value: string; label: string; sub: string }[] = []
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    const namaBulan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ]
    const dasar = new Date(hariIni)
    for (let i = 0; i <= MAKS_HARI_KE_DEPAN; i++) {
      const d = new Date(dasar)
      d.setDate(dasar.getDate() + i)
      daftar.push({
        value: toTanggalInputValue(d),
        label: i === 0 ? "Hari ini" : i === 1 ? "Besok" : namaHari[d.getDay()],
        sub: `${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`,
      })
    }
    return daftar
  }, [hariIni])

  function jamTerlewat(jam: string) {
    if (!tanggalKedatangan) return false
    const target = new Date(`${tanggalKedatangan}T${jam}`)
    return target.getTime() < Date.now()
  }

  function pilihTanggal(value: string) {
    setTanggalKedatangan(value)
    if (jamKedatangan) {
      const target = new Date(`${value}T${jamKedatangan}`)
      if (target.getTime() < Date.now()) {
        setJamKedatangan("")
      } else {
        setSesiAktif(periodeJam(jamKedatangan))
        return
      }
    }
    setSesiAktif(sesiTersediaUntukTanggal(value))
  }

  function toggleSaranCatatan(saran: string) {
    setCatatan((prev) => {
      const bersih = prev.trim()
      if (bersih.toLowerCase().includes(saran.toLowerCase())) {
        return bersih
          .replace(new RegExp(`,?\\s*${saran}`, "i"), "")
          .replace(/^,\s*/, "")
          .trim()
      }
      return bersih ? `${bersih}, ${saran}` : saran
    })
  }

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
    return hitungBatasKonfirmasi(t, expiryJam)
  }, [waktuKedatangan, expiryJam])

  const jumlahMenuTotal = useMemo(
    () => Object.values(keranjang).reduce((a, b) => a + b, 0),
    [keranjang]
  )

  const slotSesi = useMemo(
    () => SLOT_RESERVASI.filter((slot) => periodeJam(slot) === sesiAktif),
    [sesiAktif]
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
      const errs: string[] = []
      if (nama.trim().length < 2) errs.push("Nama pelanggan wajib diisi")
      if (!validasiNoHp(noHp))
        errs.push("Nomor HP tidak valid (contoh: 081234567890)")
      const org = Number(jumlahOrang)
      if (!Number.isInteger(org) || org < 1) {
        errs.push("Jumlah orang tidak valid")
      } else if (!meja) {
        errs.push("Pilih meja yang tersedia")
      } else if (org > meja.kapasitas) {
        errs.push(
          `Kapasitas meja ${meja.nomorMeja} maksimal ${meja.kapasitas} orang`
        )
      }
      if (!waktuKedatangan) {
        errs.push("Pilih tanggal & jam kedatangan")
      } else {
        const errorWaktu = validasiWaktuKedatangan(new Date(waktuKedatangan))
        if (errorWaktu) errs.push(errorWaktu)
      }
      if (errs.length) {
        return setFormError(errs.map((e) => `• ${e}`).join("\n"))
      }
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

  async function unduhQris() {
    const url = getQrisStaticUrl()
    if (!url) return
    setMengunduhQris(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Gagal mengunduh QRIS")
      const blob = await res.blob()
      const ext =
        url.split("?")[0].match(/\.(png|jpe?g|webp)$/i)?.[1] ?? "png"
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = `qris-pringmoni.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setMengunduhQris(false)
    }
  }

  async function handleSubmit() {
    setFormError(null)
    if (!mejaId) return setFormError("Pilih meja yang tersedia terlebih dahulu")
    if (!buktiUrl) return setFormError("Unggah bukti pembayaran DP terlebih dahulu")
    setSubmitting(true)
    try {
      const res = await createReservasiCustomer({
        kodeAkses,
        mejaId,
        namaPelanggan: nama.trim(),
        noHp,
        jumlahOrang: Number(jumlahOrang),
        waktuKedatangan: new Date(waktuKedatangan).toISOString(),
        catatan:
          [
            preferensiArea.length
              ? `Preferensi area: ${preferensiArea.join(", ")}`
              : "",
            catatan.trim(),
          ]
            .filter(Boolean)
            .join(" | ") || null,
        items: itemsTerpilih.map((item) => ({ menuId: item.id, jumlah: item.jumlah })),
        dpBuktiUrl: buktiUrl,
      })
      if ("error" in res) {
        setFormError(res.error ?? "Gagal membuat reservasi")
        if (res.error?.includes("Meja")) {
          setMejaId(null)
          void getReservasiCustomer(kodeAkses).then((data) => {
            if (!("error" in data)) setMejas(data.mejas)
          })
        }
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
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="size-4 mr-2" /> Kembali ke Beranda
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
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-2xl px-4 lg:max-w-5xl">
          <div className="h-16 flex items-center gap-2 lg:max-w-2xl">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={() => (step > 1 ? setStep(step - 1) : router.push("/"))}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="font-heading font-semibold text-sm">Reservasi Meja</h1>
              <p className="text-xs text-muted-foreground">
                {meja
                  ? `Meja ${meja.nomorMeja} · maks ${meja.kapasitas} orang`
                  : "Pilih meja, tanggal, dan jam kedatangan"}
              </p>
            </div>
          </div>
          <div className="pb-3 flex items-center gap-1.5 lg:max-w-2xl">
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-5 lg:flex lg:max-w-5xl lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4 lg:max-w-2xl">
        {step === 1 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama">
                  Nama Pelanggan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hp">
                  Nomor HP <span className="text-destructive">*</span>
                </Label>
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
                  <Users className="size-3.5" /> Jumlah Orang{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    aria-label="Kurangi jumlah orang"
                    disabled={Number(jumlahOrang) <= 1}
                    onClick={() =>
                      setJumlahOrang((v) => String(Math.max(1, Number(v) - 1)))
                    }
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Input
                    id="orang"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={meja?.kapasitas}
                    value={jumlahOrang}
                    onChange={(e) => setJumlahOrang(e.target.value)}
                    className="text-center text-base font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    aria-label="Tambah jumlah orang"
                    disabled={!!meja && Number(jumlahOrang) >= meja.kapasitas}
                    onClick={() =>
                      setJumlahOrang((v) =>
                        String(Math.min(meja?.kapasitas ?? 99, Number(v) + 1))
                      )
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {meja
                    ? `Maksimal ${meja.kapasitas} orang sesuai kapasitas Meja ${meja.nomorMeja}.`
                    : "Pilih meja di bawah untuk melihat batas kapasitas."}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Armchair className="size-3.5" /> Pilih Meja{" "}
                  <span className="text-destructive">*</span>
                </Label>
                {mejas.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                    Tidak ada meja kosong saat ini. Silakan hubungi staf restoran.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {mejas.map((m) => {
                      const cukup = Number(jumlahOrang) <= m.kapasitas
                      const aktifMeja = mejaId === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={!cukup}
                          onClick={() => setMejaId(m.id)}
                          className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                            aktifMeja
                              ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                              : cukup
                                ? "border-input hover:bg-muted"
                                : "cursor-not-allowed border-dashed opacity-50"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                aktifMeja ? "text-emerald-800" : ""
                              }`}
                            >
                              Meja {m.nomorMeja}
                            </span>
                            {aktifMeja && <Check className="size-3.5 text-emerald-600" />}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[11px] text-muted-foreground">
                              {m.tipeMeja === "lesehan" ? "Lesehan" : "Kursi"} ·{" "}
                              {m.kapasitas} org
                            </span>
                            {!m.punyaQr && (
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                                Tanpa QR
                              </span>
                            )}
                          </span>
                          {!cukup && (
                            <span className="block text-[10px] text-destructive">
                              Kurang kapasitas
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Semua meja kosong bisa dipilih, termasuk meja bertanda{" "}
                  <b>Tanpa QR</b> yang tetap dilayani staf.
                </p>
                <div className="space-y-2 rounded-xl border border-dashed bg-muted/30 p-3">
                  <Label className="flex items-center gap-1.5">
                    <Armchair className="size-3.5" /> Preferensi Area{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (opsional)
                    </span>
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PILIHAN_AREA.map((area) => {
                      const dipilih = preferensiArea.includes(area)
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() =>
                            setPreferensiArea((prev) =>
                              prev.includes(area)
                                ? prev.filter((a) => a !== area)
                                : [...prev, area]
                            )
                          }
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            dipilih
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                              : "border-input text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {dipilih && <Check className="mr-1 inline size-3" />}
                          {area}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pilih area favorit Anda — kasir menyesuaikan penempatan meja.
                    Preferensi ikut tercatat pada reservasi.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> Waktu Kedatangan{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pilihanTanggal.map((t) => {
                    const aktifTanggal = tanggalKedatangan === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => pilihTanggal(t.value)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          aktifTanggal
                            ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        <span
                          className={`block text-[11px] font-medium ${
                            aktifTanggal ? "text-emerald-700" : "text-muted-foreground"
                          }`}
                        >
                          {t.label}
                        </span>
                        <span
                          className={`block text-sm font-bold leading-tight ${
                            aktifTanggal ? "text-emerald-800" : ""
                          }`}
                        >
                          {t.sub}
                        </span>
                        {aktifTanggal && jamKedatangan && (
                          <span className="mt-0.5 block text-[10px] font-semibold text-emerald-700">
                            {jamKedatangan}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {tanggalKedatangan && (
                  <p className="text-xs font-medium text-emerald-700">
                    {formatTanggalPanjang(tanggalKedatangan)}
                    {jamKedatangan ? ` · pukul ${jamKedatangan}` : ""}
                  </p>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Pilih jam kedatangan</p>
                  {!tanggalKedatangan ? (
                    <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground text-center">
                      Pilih tanggal terlebih dahulu untuk melihat pilihan jam.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {PERIODE_RESERVASI.map((periode) => {
                          const aktif = sesiAktif === periode
                          const jumlahTersedia = SLOT_RESERVASI.filter(
                            (slot) => periodeJam(slot) === periode && !jamTerlewat(slot)
                          ).length
                          return (
                            <button
                              key={periode}
                              type="button"
                              onClick={() => setSesiAktif(periode)}
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                aktif
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-input hover:bg-muted"
                              }`}
                            >
                              {periode}
                              <span
                                className={`ml-1 ${
                                  aktif ? "text-white/70" : "text-muted-foreground"
                                }`}
                              >
                                ({jumlahTersedia})
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {slotSesi.map((jam) => {
                          const lewat = jamTerlewat(jam)
                          const aktifJam = jamKedatangan === jam
                          return (
                            <button
                              key={jam}
                              type="button"
                              disabled={lewat}
                              onClick={() => setJamKedatangan(jam)}
                              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                                aktifJam
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-input hover:bg-muted"
                              } ${lewat ? "cursor-not-allowed opacity-40" : ""}`}
                            >
                              <span className="block text-sm font-semibold leading-tight">
                                {jam}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {slotSesi.every((jam) => jamTerlewat(jam)) && (
                        <p className="text-xs text-muted-foreground">
                          Tidak ada jam tersedia di sesi ini. Pilih sesi lain atau tanggal
                          berikutnya.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Jam {formatMenit(JAM_BUKA_RESERVASI_MENIT)}–
                  {formatMenit(BATAS_KEDATANGAN_RESERVASI_MENIT)} · slot{" "}
                  {INTERVAL_SLOT_RESERVASI_MENIT} menit · maksimal {MAKS_HARI_KE_DEPAN} hari ke
                  depan.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan (opsional)</Label>
                <textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Contoh: butuh kursi bayi, area lesehan, dll."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Saran cepat (ketuk untuk menambahkan):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SARAN_CATATAN.map((saran) => {
                    const dipilih = catatan.toLowerCase().includes(saran.toLowerCase())
                    return (
                      <button
                        key={saran}
                        type="button"
                        onClick={() => toggleSaranCatatan(saran)}
                        className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          dipilih
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-input text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {dipilih && <Check className="mr-1 inline size-3" />}
                        {saran}
                      </button>
                    )
                  })}
                </div>
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
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                {menusTampil.map((menu) => {
                  const qty = keranjang[menu.id] ?? 0
                  const habis = (menu.porsiTersedia ?? 0) <= 0
                  return (
                    <Card
                      key={menu.id}
                      className={`gap-0 py-0 ${habis ? "opacity-60" : ""}`}
                    >
                      <CardContent className="flex h-full flex-col p-0">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {menu.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={menu.fotoUrl}
                              alt={menu.namaMenu}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="size-5 text-muted-foreground" />
                            </div>
                          )}
                          {habis && (
                            <Badge
                              variant="secondary"
                              className="absolute right-1.5 top-1.5 text-[9px]"
                            >
                              Habis
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-2">
                          <p className="line-clamp-2 min-h-9 text-[13px] font-medium leading-tight">
                            {menu.namaMenu}
                          </p>
                          <p className="line-clamp-1 text-[10px] text-muted-foreground">
                            {menu.deskripsi || menu.kategori}
                          </p>
                          <div className="mt-auto space-y-1.5 pt-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <p className="text-[13px] font-semibold text-emerald-700">
                                {formatRupiah(menu.harga)}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                sisa {menu.porsiTersedia ?? 0}
                              </p>
                            </div>
                            {habis ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-full"
                                disabled
                              >
                                Habis
                              </Button>
                            ) : qty === 0 ? (
                              <Button
                                size="sm"
                                className="h-8 w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => tambah(menu, 1)}
                              >
                                <Plus className="mr-1 size-3.5" /> Tambah
                              </Button>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-7"
                                  onClick={() => tambah(menu, -1)}
                                  aria-label={`Kurangi ${menu.namaMenu}`}
                                >
                                  {qty === 1 ? (
                                    <Trash2 className="size-3" />
                                  ) : (
                                    <Minus className="size-3" />
                                  )}
                                </Button>
                                <span className="min-w-5 text-center text-sm font-semibold">
                                  {qty}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-7"
                                  disabled={qty >= (menu.porsiTersedia ?? 0)}
                                  onClick={() => tambah(menu, 1)}
                                  aria-label={`Tambah ${menu.namaMenu}`}
                                >
                                  <Plus className="size-3" />
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
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-1 text-sm">
                  <div className="flex justify-between font-semibold text-emerald-800">
                    <span>DP {rincian.persen}% (dibulatkan)</span>
                    <span>{formatRupiah(rincian.dpNominal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 text-xs">
                    <span>Sisa dibayar saat kedatangan</span>
                    <span>{formatRupiah(rincian.sisaTagihan)}</span>
                  </div>
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
                {preferensiArea.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-muted-foreground">Preferensi area</span>
                    <span className="font-medium text-right">
                      {preferensiArea.join(", ")}
                    </span>
                  </div>
                )}
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
                    <b>{expiryJam} jam setelah jam kedatangan</b>, maksimal pukul{" "}
                    <b>{formatMenit(JAM_TUTUP_RESERVASI_MENIT)}</b> di hari yang sama.
                  </p>
                  <p>DP yang sudah dibayar <b>hangus</b> jika tidak datang / tidak dikonfirmasi.</p>
                </div>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${
                    setuju
                      ? "border-emerald-500 bg-emerald-50/70"
                      : "border-amber-300 bg-amber-50/70"
                  }`}
                >
                  <Checkbox
                    checked={setuju}
                    onCheckedChange={(v) => setSetuju(v === true)}
                    className="mt-0.5 size-5 shrink-0 border-2 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium leading-snug text-foreground">
                      Saya menyetujui kebijakan reservasi dan DP di atas{" "}
                      <span className="text-destructive">*</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Wajib dicentang sebelum melanjutkan.
                    </span>
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
                  <p className="text-xs text-muted-foreground">
                    Sisa {formatRupiah(rincian.sisaTagihan)} dibayar saat kedatangan
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border flex flex-col items-center">
                  {getQrisStaticUrl() ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getQrisStaticUrl()}
                        alt="QRIS Statis"
                        className="w-56 h-56 object-contain"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={unduhQris}
                        disabled={mengunduhQris}
                      >
                        {mengunduhQris ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Download className="mr-1.5 size-3.5" />
                        )}
                        Unduh QRIS
                      </Button>
                    </>
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
                  <Label>
                    Bukti Pembayaran DP <span className="text-destructive">*</span>
                  </Label>
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
        </div>

        {step === 2 && (
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-72 lg:shrink-0">
            <div className="overflow-hidden rounded-2xl border bg-background/95 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-emerald-600" />
                  <p className="font-heading text-sm font-semibold">Keranjang</p>
                </div>
                <Badge variant="secondary">{jumlahMenuTotal} item</Badge>
              </div>
              <div className="max-h-[45vh] space-y-3 overflow-y-auto px-4 py-3">
                {itemsTerpilih.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Belum ada menu yang dipilih.
                  </p>
                ) : (
                  itemsTerpilih.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.fotoUrl}
                            alt={item.namaMenu}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="size-3.5 text-muted-foreground" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.namaMenu}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatRupiah(item.harga * item.jumlah)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          onClick={() => tambah(item, -1)}
                          aria-label={`Kurangi ${item.namaMenu}`}
                        >
                          {item.jumlah === 1 ? (
                            <Trash2 className="size-3" />
                          ) : (
                            <Minus className="size-3" />
                          )}
                        </Button>
                        <span className="w-4 text-center text-xs font-semibold">
                          {item.jumlah}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          disabled={item.jumlah >= (item.porsiTersedia ?? 0)}
                          onClick={() => tambah(item, 1)}
                          aria-label={`Tambah ${item.namaMenu}`}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-1 border-t px-4 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total pre-order</span>
                  <span>{jumlahMenuTotal} item</span>
                </div>
                <p className="text-base font-bold text-emerald-700">
                  {formatRupiah(totalHarga)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  DP {rincian.persen}% · {formatRupiah(rincian.dpNominal)}
                </p>
              </div>
            </div>
          </aside>
        )}
      </main>

      {formError && (
        <div className="fixed right-4 top-4 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-destructive/30 bg-destructive/10 p-3 shadow-lg backdrop-blur">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-destructive">Periksa Kembali</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-destructive/90">
                {formError}
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup peringatan"
              onClick={() => setFormError(null)}
              className="shrink-0 rounded-md p-0.5 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 sm:gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              className="pointer-events-auto h-11 shrink-0 rounded-full border bg-background/95 px-3 shadow-lg backdrop-blur sm:px-4"
              onClick={() => setStep(step - 1)}
              disabled={submitting}
              aria-label="Kembali ke langkah sebelumnya"
            >
              <ArrowLeft className="size-4" />
              <span className="ml-1 hidden sm:inline">Kembali</span>
            </Button>
          )}
          {step === 2 && (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="pointer-events-auto flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border bg-background/95 px-3 text-left shadow-lg backdrop-blur transition-colors hover:bg-muted/60 lg:hidden"
                  aria-label="Lihat keranjang pre-order"
                >
                  {itemsTerpilih.length > 0 ? (
                    <span className="flex shrink-0 -space-x-2">
                      {itemsTerpilih.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="size-8 overflow-hidden rounded-full border-2 border-background bg-muted"
                        >
                          {item.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.fotoUrl}
                              alt={item.namaMenu}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="size-3.5 text-muted-foreground" />
                            </span>
                          )}
                        </span>
                      ))}
                      {itemsTerpilih.length > 3 && (
                        <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold">
                          +{itemsTerpilih.length - 3}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <ShoppingBag className="size-4 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] text-muted-foreground">
                      {jumlahMenuTotal} item dipilih
                    </span>
                    <span className="block truncate text-sm font-semibold">
                      {totalHarga > 0 ? formatRupiah(totalHarga) : "Belum dipilih"}
                    </span>
                  </span>
                  <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-4 pb-8">
                <SheetHeader className="text-left">
                  <SheetTitle>Keranjang Pre-order</SheetTitle>
                  <SheetDescription>
                    {jumlahMenuTotal > 0
                      ? `${jumlahMenuTotal} item · ${formatRupiah(totalHarga)}`
                      : "Belum ada menu yang dipilih."}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {itemsTerpilih.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Pilih menu di halaman sebelumnya untuk melihat ringkasan di sini.
                    </p>
                  ) : (
                    itemsTerpilih.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.fotoUrl}
                              alt={item.namaMenu}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="size-4 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.namaMenu}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRupiah(item.harga * item.jumlah)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-7"
                            onClick={() => tambah(item, -1)}
                            aria-label={`Kurangi ${item.namaMenu}`}
                          >
                            {item.jumlah === 1 ? (
                              <Trash2 className="size-3" />
                            ) : (
                              <Minus className="size-3" />
                            )}
                          </Button>
                          <span className="w-5 text-center text-sm font-semibold">
                            {item.jumlah}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-7"
                            disabled={item.jumlah >= (item.porsiTersedia ?? 0)}
                            onClick={() => tambah(item, 1)}
                            aria-label={`Tambah ${item.namaMenu}`}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
          {step >= 3 && (
            <div className="pointer-events-auto flex-1 rounded-full border bg-background/95 px-4 py-1.5 shadow-lg backdrop-blur">
              <p className="text-[10px] text-muted-foreground">
                {jumlahMenuTotal} item · DP {rincian.persen}%
              </p>
              <p className="text-sm font-semibold text-emerald-700">
                {formatRupiah(rincian.dpNominal)}
              </p>
            </div>
          )}
          {step < 4 ? (
            <Button
              className="pointer-events-auto ml-auto h-12 shrink-0 rounded-full bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 sm:px-6"
              onClick={lanjut}
            >
              Lanjut <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button
              className="pointer-events-auto ml-auto h-12 shrink-0 rounded-full bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 sm:px-6"
              disabled={submitting || isUploading || !buktiUrl}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Memproses...
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
