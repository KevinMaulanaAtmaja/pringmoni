"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, ImageIcon, Banknote, CreditCard, Landmark, ChevronLeft, ChevronRight } from "lucide-react"
import { getMenus, getKategoriMenus } from "@/app/actions/menu"
import { getMeja } from "@/app/actions/meja"
import { createPesanan } from "@/app/actions/pesanan"
import { prosesPembayaranQRIS, prosesPembayaranTransfer } from "@/app/actions/kasir"
import type { KategoriMenu } from "@prisma/client"
import type { MenuWithKategori } from "@/app/actions/menu"

interface CartItem {
  menuId: number
  namaMenu: string
  harga: number
  jumlah: number
  catatan: string
}

export default function PesananBaruPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<MenuWithKategori[]>([])
  const [kategoris, setKategoris] = useState<KategoriMenu[]>([])
  const [mejas, setMejas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeKategori, setActiveKategori] = useState<number | "all">("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedMejaId, setSelectedMejaId] = useState<string>("")
  const [namaPelanggan, setNamaPelanggan] = useState("")
  const [metodePembayaran, setMetodePembayaran] = useState<string>("")
  const [jumlahBayar, setJumlahBayar] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    Promise.all([
      getMenus(),
      getKategoriMenus(),
      getMeja(),
    ]).then(([menusData, kategorisData, mejaData]) => {
      setMenus(menusData)
      setKategoris(kategorisData)
      setMejas(Array.isArray(mejaData) ? mejaData : [])
    }).finally(() => setLoading(false))
  }, [])

  const filteredMenus = useMemo(() => {
    let result = menus
    if (activeKategori !== "all") {
      result = result.filter((m) => m.kategoriId === activeKategori)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.namaMenu.toLowerCase().includes(q) ||
          (m.deskripsi?.toLowerCase() || "").includes(q)
      )
    }
    return result.filter((m) => m.statusMenu === "tersedia")
  }, [menus, activeKategori, search])

  const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0)
  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0)

  function tambahKeCart(menu: MenuWithKategori) {
    setCart((prev) => {
      const exist = prev.find((item) => item.menuId === menu.id)
      if (exist) {
        return prev.map((item) =>
          item.menuId === menu.id
            ? { ...item, jumlah: item.jumlah + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          menuId: menu.id,
          namaMenu: menu.namaMenu,
          harga: Number(menu.harga),
          jumlah: 1,
          catatan: "",
        },
      ]
    })
  }

  function updateJumlah(menuId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuId === menuId
            ? { ...item, jumlah: Math.max(0, item.jumlah + delta) }
            : item
        )
        .filter((item) => item.jumlah > 0)
    )
  }

  function updateCatatan(menuId: number, catatan: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.menuId === menuId ? { ...item, catatan } : item
      )
    )
  }

  function hapusDariCart(menuId: number) {
    setCart((prev) => prev.filter((item) => item.menuId !== menuId))
  }

  async function handleSubmit() {
    if (!selectedMejaId) {
      alert("Pilih meja terlebih dahulu")
      return
    }
    if (cart.length === 0) {
      alert("Pilih menu terlebih dahulu")
      return
    }
    if (!namaPelanggan.trim()) {
      alert("Nama pelanggan wajib diisi")
      return
    }
    if (!metodePembayaran) {
      alert("Pilih metode pembayaran")
      return
    }

    const meja = mejas.find((m: any) => m.id === Number(selectedMejaId))
    if (!meja?.tokenMeja) {
      alert("Meja tidak memiliki token")
      return
    }

    setSubmitting(true)
    try {
      const result = await createPesanan({
        tokenMeja: meja.tokenMeja,
        items: cart.map((item) => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
          catatan: item.catatan || null,
        })),
        namaPelanggan: namaPelanggan || null,
      })

      if ("error" in result) {
        alert(result.error)
        return
      }

      const orderId = result.orderId
      let paymentResult: any = { success: true }

      if (metodePembayaran === "tunai") {
        const bayar = Number(jumlahBayar)
        if (!bayar || bayar < totalHarga) {
          alert("Jumlah bayar kurang dari total")
          setSubmitting(false)
          return
        }
        const { prosesPembayaranTunai } = await import("@/app/actions/kasir")
        paymentResult = await prosesPembayaranTunai(orderId, bayar)
      } else if (metodePembayaran === "qris") {
        paymentResult = await prosesPembayaranQRIS(orderId)
      } else if (metodePembayaran === "transfer") {
        paymentResult = await prosesPembayaranTransfer(orderId)
      }

      if ("error" in paymentResult) {
        alert(paymentResult.error)
        return
      }

      const params = new URLSearchParams({
        metode: metodePembayaran,
        nama: namaPelanggan,
        meja: mejas.find((m: any) => m.id === Number(selectedMejaId))?.nomorMeja || "",
      })
      if (metodePembayaran === "tunai") {
        params.set("jumlahBayar", jumlahBayar)
        params.set("kembalian", String(paymentResult.kembalian || 0))
      }
      router.push(`/dashboard/kasir/pesanan-baru/${orderId}?${params.toString()}`)
    } catch {
      alert("Gagal membuat pesanan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Memuat data...
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Buat Pesanan Baru</h1>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 shrink-0">
          <Check size={20} />
          {successMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Menu Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search & Category */}
          <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-[220px] text-sm pl-9"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              <Button
                variant={activeKategori === "all" ? "default" : "outline"}
                size="sm"
                className="h-9 px-4 shrink-0 rounded-full text-sm"
                onClick={() => setActiveKategori("all")}
              >
                Semua
              </Button>
              {kategoris.map((k) => (
                <Button
                  key={k.id}
                  variant={activeKategori === k.id ? "default" : "outline"}
                  size="sm"
                  className="h-9 px-4 shrink-0 rounded-full text-sm"
                  onClick={() => setActiveKategori(k.id)}
                >
                  {k.namaKategori}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredMenus.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Tidak ada menu ditemukan
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredMenus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => tambahKeCart(menu)}
                    className="bg-white rounded-xl border hover:border-green-400 hover:shadow-md active:scale-[0.97] transition-all text-left flex flex-col cursor-pointer overflow-hidden"
                  >
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {menu.fotoUrl ? (
                        <img
                          src={menu.fotoUrl}
                          alt={menu.namaMenu}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-8 text-gray-300" />
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <span className="font-semibold text-sm leading-tight line-clamp-2">
                        {menu.namaMenu}
                      </span>
                      {menu.deskripsi && (
                        <span className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {menu.deskripsi}
                        </span>
                      )}
                      <span className="mt-auto pt-2 text-sm font-bold text-green-700">
                        Rp {Number(menu.harga).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Panel */}
        <div className="w-80 lg:w-96 bg-white rounded-xl border flex flex-col shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingCart size={20} />
              Keranjang
              {totalItems > 0 && (
                <Badge className="bg-green-600 ml-auto">{totalItems}</Badge>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                Belum ada item
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuId} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.namaMenu}</p>
                      <p className="text-xs text-gray-500">
                        Rp {item.harga.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => hapusDariCart(item.menuId)}
                      className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-lg"
                      onClick={() => updateJumlah(item.menuId, -1)}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="w-8 text-center font-semibold text-sm">
                      {item.jumlah}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-lg"
                      onClick={() => updateJumlah(item.menuId, 1)}
                    >
                      <Plus size={16} />
                    </Button>
                    <input
                      placeholder="Catatan..."
                      value={item.catatan}
                      onChange={(e) => updateCatatan(item.menuId, e.target.value)}
                      className="flex-1 min-w-0 h-9 px-2 text-xs bg-white border rounded-lg outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom: Order Info + Submit */}
          <div className="border-t p-4 space-y-3">
            <Select value={selectedMejaId} onValueChange={setSelectedMejaId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Pilih Meja" />
              </SelectTrigger>
              <SelectContent position="popper" align="center">
                {mejas.map((m: any) => {
                  const kosong = m.statusMeja === "kosong"
                  return (
                    <SelectItem
                      key={m.id}
                      value={String(m.id)}
                      disabled={!kosong}
                      className={!kosong ? "opacity-50" : ""}
                    >
                      <span className="flex items-center gap-2">
                        Meja {m.nomorMeja} ({m.kapasitas} kursi)
                        {!kosong && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                            Terpakai
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Masukkan nama pelanggan"
                value={namaPelanggan}
                onChange={(e) => setNamaPelanggan(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Metode Pembayaran <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "tunai", label: "Tunai", icon: Banknote },
                  { value: "qris", label: "QRIS", icon: CreditCard },
                  { value: "transfer", label: "Transfer", icon: Landmark },
                ].map((m) => {
                  const Icon = m.icon
                  const active = metodePembayaran === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setMetodePembayaran(m.value)
                        if (m.value !== "tunai") setJumlahBayar("")
                      }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm ${
                        active
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="font-medium">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {metodePembayaran === "tunai" && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Jumlah Bayar <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah uang"
                  value={jumlahBayar}
                  onChange={(e) => setJumlahBayar(e.target.value)}
                  className="h-12 text-base"
                />
                {jumlahBayar && Number(jumlahBayar) >= totalHarga && (
                  <p className="text-xs text-green-600 mt-1">
                    Kembalian: Rp {(Number(jumlahBayar) - totalHarga).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total item</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-700">
                Rp {totalHarga.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0 || !selectedMejaId || !namaPelanggan.trim() || !metodePembayaran}
              className="w-full h-12 text-base font-semibold"
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
