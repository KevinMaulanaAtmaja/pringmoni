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
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, ImageIcon, Banknote, CreditCard, Landmark, ChevronDown } from "lucide-react"
import { getMenus, getKategoriMenus } from "@/app/actions/menu"
import { getMeja } from "@/app/actions/meja"
import { createPesanan } from "@/app/actions/pesanan"
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
  const [selectedBank, setSelectedBank] = useState("bca")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [visibleCount, setVisibleCount] = useState(8)

const BANK_OPTIONS = [
  { id: 'bca', label: 'BCA' },
  { id: 'bni', label: 'BNI' },
  { id: 'bri', label: 'BRI' },
  { id: 'mandiri', label: 'Mandiri' },
]

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

  useEffect(() => {
    setVisibleCount(8)
  }, [activeKategori, search])

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
      return exist
        ? prev.map((item) =>
            item.menuId === menu.id
              ? { ...item, jumlah: item.jumlah + 1 }
              : item
          )
        : [
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
    setSuccessMsg(`+1 ${menu.namaMenu} ditambahkan`)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 1500)
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
        catatan: "Dibuat oleh kasir",
        metodePembayaran,
      })

      if ("error" in result) {
        alert(result.error)
        return
      }

      router.push(`/dashboard/kasir/pesanan-baru/${result.id}`)
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
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Buat Pesanan Baru</h1>
      </div>

      {success && (
        <div className="fixed top-20 right-8 z-50 bg-green-700 text-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm animate-in fade-in">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {/* Nama Pelanggan & Meja */}
      <div className="flex gap-2 mb-3 shrink-0">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium mb-1 block">
            Nama Pelanggan <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Nama pelanggan"
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
          />
        </div>
        <div className="w-44 shrink-0">
          <label className="text-sm font-medium mb-1 block">
            Meja <span className="text-red-500">*</span>
          </label>
          <Select value={selectedMejaId} onValueChange={setSelectedMejaId}>
            <SelectTrigger>
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
        </div>
      </div>

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
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredMenus.slice(0, visibleCount).map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => tambahKeCart(menu)}
                      className="bg-white rounded-lg border hover:border-green-400 hover:shadow-sm active:scale-[0.97] transition-all text-left flex flex-col cursor-pointer overflow-hidden group"
                    >
                      <div className="w-full h-14 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {menu.fotoUrl ? (
                          <img
                            src={menu.fotoUrl}
                            alt={menu.namaMenu}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-gray-300" />
                        )}
                      </div>
                      <div className="p-1.5 flex flex-col flex-1">
                        <span className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-green-700">
                          {menu.namaMenu}
                        </span>
                        <span className="mt-auto pt-0.5 text-xs font-bold text-green-700">
                          Rp {Number(menu.harga).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {visibleCount < filteredMenus.length && (
                  <div className="flex justify-center pt-3 pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="text-green-700 hover:text-green-800 hover:bg-green-50 gap-1"
                    >
                      <ChevronDown size={18} />
                      Lihat Menu Lainnya ({filteredMenus.length - visibleCount} lainnya)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Panel */}
        <div className="w-96 bg-white rounded-xl border flex flex-col min-h-0">
          <div className="p-3 border-b shrink-0">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingCart size={20} />
              Keranjang
              {totalItems > 0 && (
                <Badge className="bg-green-600 ml-auto">{totalItems}</Badge>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                Belum ada item
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuId} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.namaMenu}</p>
                      <p className="text-sm text-gray-500">
                        Rp {item.harga.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => hapusDariCart(item.menuId)}
                      className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                      onClick={() => updateJumlah(item.menuId, -1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center font-bold text-sm">
                      {item.jumlah}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                      onClick={() => updateJumlah(item.menuId, 1)}
                    >
                      <Plus size={14} />
                    </Button>
                    <input
                      placeholder="Catatan..."
                      value={item.catatan}
                      onChange={(e) => updateCatatan(item.menuId, e.target.value)}
                      className="flex-1 min-w-0 h-8 px-3 text-sm bg-white border rounded-lg outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom: Order Info + Submit */}
          <div className="border-t p-3 space-y-2 shrink-0">
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
                      onClick={() => setMetodePembayaran(m.value)}
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

            {metodePembayaran === "transfer" && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Pilih Bank Tujuan <span className="text-red-500">*</span>
                </label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
