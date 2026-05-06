"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CreditCard,
  Wallet,
  Banknote,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react"
import { MetodePembayaran, StatusBayar } from "@/types"

// Sync with @/types/index.ts
// MetodePembayaran = 'qris' | 'tunai'
// StatusBayar = 'menunggu' | 'berhasil' | 'dibatalkan'

const metodeLabels: Record<MetodePembayaran, string> = {
  qris: "QRIS",
  tunai: "Tunai",
}

const metodeIcons: Record<MetodePembayaran, React.ReactNode> = {
  qris: <CreditCard className="w-6 h-6" />,
  tunai: <Banknote className="w-6 h-6" />,
}

const statusBayarColors: Record<StatusBayar, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  berhasil: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusBayarLabels: Record<StatusBayar, string> = {
  menunggu: "Menunggu",
  berhasil: "Berhasil",
  dibatalkan: "Dibatalkan",
}

// Mock menus for kasir order creation
const mockMenus = [
  { id: 1, namaMenu: "Nasi Gudeg", harga: 25000, kategori: "Makanan Utama" },
  { id: 2, namaMenu: "Es Teh Manis", harga: 5000, kategori: "Minuman" },
  { id: 3, namaMenu: "Ayam Bakar", harga: 30000, kategori: "Makanan Utama" },
  { id: 4, namaMenu: "Sate Ayam", harga: 25000, kategori: "Makanan Utama" },
]

// Mock meja for kasir order creation
const mockMeja = [
  { id: 1, nomorMeja: "A1", statusMeja: "kosong" },
  { id: 2, nomorMeja: "B2", statusMeja: "kosong" },
  { id: 3, nomorMeja: "C3", statusMeja: "terpakai" },
]

const mockPesananBelum = [
  {
    id: 1,
    mejaId: 1,
    waiterId: 1,
    kasirId: null,
    statusPesanan: 'selesai',
    catatan: null,
    totalHarga: 75000,
    metodePembayaran: null,
    jumlahBayar: null,
    kembalian: 0,
    statusPembayaran: 'menunggu',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    meja: { id: 1, nomorMeja: 'A1', kapasitas: 4, tokenMeja: 'ABC123' },
    waiter: { id: 1, username: 'waiter1' },
    detailPesanan: [
      { id: 1, menuId: 1, pesananId: 1, jumlah: 2, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 1, namaMenu: 'Nasi Gudeg' } },
      { id: 2, menuId: 2, pesananId: 1, jumlah: 1, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 2, namaMenu: 'Es Teh Manis' } },
    ],
  },
  {
    id: 2,
    mejaId: 2,
    waiterId: 1,
    kasirId: null,
    statusPesanan: 'selesai',
    catatan: 'Tidak pedas',
    totalHarga: 50000,
    metodePembayaran: null,
    jumlahBayar: null,
    kembalian: 0,
    statusPembayaran: 'menunggu',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    meja: { id: 2, nomorMeja: 'B2', kapasitas: 2, tokenMeja: 'DEF456' },
    waiter: { id: 1, username: 'waiter1' },
    detailPesanan: [
      { id: 3, menuId: 3, pesananId: 2, jumlah: 2, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 3, namaMenu: 'Ayam Bakar' } },
    ],
  },
]

const mockPesananRiwayat = [
  {
    id: 3,
    mejaId: 3,
    waiterId: 1,
    kasirId: 1,
    statusPesanan: 'selesai',
    catatan: null,
    totalHarga: 100000,
    metodePembayaran: 'tunai',
    jumlahBayar: 110000,
    kembalian: 10000,
    statusPembayaran: 'berhasil',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    meja: { id: 3, nomorMeja: 'C3', kapasitas: 6, tokenMeja: 'GHI789' },
    waiter: { id: 1, username: 'waiter1' },
    kasir: { id: 1, username: 'kasir1' },
    detailPesanan: [
      { id: 4, menuId: 4, pesananId: 3, jumlah: 4, hargaSaatPesan: 25000, catatanItem: null, menu: { id: 4, namaMenu: 'Sate Ayam' } },
    ],
  },
]

// Cart item type
interface CartItem {
  menuId: number
  namaMenu: string
  harga: number
  jumlah: number
  catatan: string
}

export default function KasirPage() {
  // Note: RoleUser type uses 'kasir' (not 'cashier')
  const role = 'kasir' as string // TODO: Ambil dari session BE nanti
  const isOwner = role === 'owner'

  const pageTitle = <h1 className="text-2xl font-bold">Cashier</h1>

  const [activeTab, setActiveTab] = useState<"belum" | "riwayat" | "buat">("belum")
  const [pesananBelum] = useState(mockPesananBelum)
  const [pesananRiwayat] = useState(mockPesananRiwayat)
  const [selectedPesanan, setSelectedPesanan] = useState<(typeof mockPesananBelum)[0] | (typeof mockPesananRiwayat)[0] | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedMetode, setSelectedMetode] = useState<MetodePembayaran>("tunai")
  const [jumlahBayar, setJumlahBayar] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Create order states
  const [selectedMejaId, setSelectedMejaId] = useState<string>("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedMenuForNote, setSelectedMenuForNote] = useState<typeof mockMenus[0] | null>(null)
  const [noteInput, setNoteInput] = useState("")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)

  function openPayment(pesanan: (typeof mockPesananBelum)[0] | (typeof mockPesananRiwayat)[0]) {
    setSelectedPesanan(pesanan)
    setSelectedMetode("tunai")
    setJumlahBayar("")
    setPaymentSuccess(false)
    setIsPaymentOpen(true)
  }

  function openDetail(pesanan: (typeof mockPesananBelum)[0] | (typeof mockPesananRiwayat)[0]) {
    setSelectedPesanan(pesanan)
    setIsDetailOpen(true)
  }

  function handleBayar() {
    setSubmitting(true)
    setTimeout(() => {
      setPaymentSuccess(true)
      setTimeout(() => {
        setIsPaymentOpen(false)
        setPaymentSuccess(false)
      }, 2000)
      setSubmitting(false)
    }, 1000)
  }

  function handleBatal(id: number) {
    alert("Simulasi: Pesanan #" + id + " dibatalkan")
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function formatWaktu(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  }

  const kembalian =
    selectedMetode === "tunai" && jumlahBayar
      ? parseFloat(jumlahBayar) - (selectedPesanan?.totalHarga || 0)
      : 0

  // Cart functions
  function updateCartItemJumlah(index: number, jumlah: number) {
    if (jumlah < 1) return
    setCart(prev => prev.map((item, i) =>
      i === index ? { ...item, jumlah } : item
    ))
  }

  function getCartTotal() {
    return cart.reduce((total, item) => total + (item.harga * item.jumlah), 0)
  }

  function handleCreateOrder() {
    if (!selectedMejaId || cart.length === 0) {
      alert("Pilih meja dan tambahkan menu")
      return
    }
    alert("Simulasi: Pesanan baru dibuat untuk Meja " + mockMeja.find(m => m.id === parseInt(selectedMejaId))?.nomorMeja)
    setIsCreateOrderOpen(false)
    setSelectedMejaId("")
    setCart([])
  }

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        {pageTitle}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Wallet className="w-4 h-4" />
          <span>Kasir: {role === "owner" ? "Owner" : "Cashier"}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "belum" ? "default" : "outline"}
          onClick={() => setActiveTab("belum")}
        >
          <Clock className="w-4 h-4 mr-2" />
          Belum Bayar ({pesananBelum.length})
        </Button>
        <Button
          variant={activeTab === "riwayat" ? "default" : "outline"}
          onClick={() => setActiveTab("riwayat")}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Riwayat ({pesananRiwayat.length})
        </Button>
        <Button
          variant={activeTab === "buat" ? "default" : "outline"}
          onClick={() => setActiveTab("buat")}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buat Pesanan
        </Button>
      </div>

      {activeTab === "belum" ? (
        pesananBelum.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium">Semua pesanan sudah dibayar</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pesananBelum.map((p) => (
              <div key={p.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Meja {p.meja.nomorMeja}</h3>
                    <p className="text-xs text-gray-500">#{p.id} &middot; {formatWaktu(p.createdAt)}</p>
                  </div>
                  <Badge className={statusBayarColors.menunggu}>Menunggu</Badge>
                </div>
                <div className="space-y-1 mb-3 text-sm">
                  {p.detailPesanan.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span>{item.jumlah}x {item.menu.namaMenu}</span>
                      <span>{formatRupiah(item.hargaSaatPesan * item.jumlah)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-green-700">{formatRupiah(p.totalHarga)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDetail(p)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!isOwner && <Button size="sm" onClick={() => openPayment(p)}>Bayar</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "riwayat" ? (
        pesananRiwayat.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
            <p className="text-lg font-medium">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Meja</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Jumlah Dibayar</TableHead>
                  <TableHead>Kembalian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pesananRiwayat.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">#{p.id}</TableCell>
                    <TableCell>{p.meja.nomorMeja}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.metodePembayaran as string}</Badge></TableCell>
                    <TableCell className="font-medium">{formatRupiah(p.totalHarga)}</TableCell>
                    <TableCell>{p.jumlahBayar ? formatRupiah(p.jumlahBayar) : "-"}</TableCell>
                    <TableCell>{p.kembalian > 0 ? formatRupiah(p.kembalian) : "-"}</TableCell>
                    <TableCell>
                      <Badge className={statusBayarColors[p.statusPembayaran as StatusBayar]}>{statusBayarLabels[p.statusPembayaran as StatusBayar]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetail(p)}>
                        <Eye className="w-4 h-4 mr-1" />Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        // Tab Buat Pesanan
        <div className="space-y-4">
          {/* Pilih Meja */}
          <div className="space-y-2">
            <Label>Pilih Meja</Label>
            <Select value={selectedMejaId} onValueChange={setSelectedMejaId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih meja" />
              </SelectTrigger>
              <SelectContent>
                {mockMeja.map((meja) => (
                  <SelectItem key={meja.id} value={meja.id.toString()}>
                    Meja {meja.nomorMeja} ({meja.statusMeja === 'kosong' ? 'Kosong' : 'Terpakai'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menu Grid */}
          <div className="space-y-2">
            <Label>Pilih Menu</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {mockMenus.map((menu) => {
                const itemInCart = cart.find(item => item.menuId === menu.id)
                const qty = itemInCart?.jumlah || 0
                return (
                  <div
                    key={menu.id}
                    className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2">{menu.namaMenu}</h4>
                      <p className="text-green-700 font-bold text-sm mt-1">
                        {formatRupiah(menu.harga)}
                      </p>
                      {itemInCart?.catatan && (
                        <p className="text-xs text-gray-400 mt-1 truncate">📝 {itemInCart.catatan}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-12 w-12 p-0 rounded-xl"
                          onClick={() => {
                            if (qty <= 1) {
                              setCart(prev => prev.filter(item => item.menuId !== menu.id))
                            } else {
                              updateCartItemJumlah(cart.indexOf(itemInCart!), qty - 1)
                            }
                          }}
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="w-8 text-center text-base font-bold">{qty}</span>
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-12 w-12 p-0 rounded-xl"
                          onClick={() => {
                            if (itemInCart) {
                              updateCartItemJumlah(cart.indexOf(itemInCart), qty + 1)
                            } else {
                              setCart(prev => [...prev, {
                                menuId: menu.id,
                                namaMenu: menu.namaMenu,
                                harga: menu.harga,
                                jumlah: 1,
                                catatan: "",
                              }])
                            }
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-12 px-3 rounded-xl text-base ml-auto"
                          onClick={() => {
                            setSelectedMenuForNote(menu)
                            setNoteInput(itemInCart?.catatan || "")
                            setIsNoteDialogOpen(true)
                          }}
                        >
                          📝
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <Label>Keranjang ({cart.length} item)</Label>
              <div className="border rounded-lg divide-y">
                {cart.map((item, index) => (
                  <div key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.namaMenu}</p>
                        <p className="text-xs text-gray-500">{formatRupiah(item.harga)} x {item.jumlah}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => {
                            updateCartItemJumlah(index, item.jumlah - 1)
                            if (item.jumlah - 1 === 0) {
                              setCart(prev => prev.filter((_, i) => i !== index))
                            }
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center text-base font-bold">{item.jumlah}</span>
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => updateCartItemJumlah(index, item.jumlah + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="lg"
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => {
                            setCart(prev => prev.filter((_, i) => i !== index))
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-gray-500"
                        onClick={() => {
                          const menu = mockMenus.find(m => m.id === item.menuId)
                          if (menu) {
                            setSelectedMenuForNote(menu)
                            setNoteInput(item.catatan || "")
                            setIsNoteDialogOpen(true)
                          }
                        }}
                      >
                        📝 {item.catatan || "Tambah catatan"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-green-700">{formatRupiah(getCartTotal())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setSelectedMejaId("")
              setCart([])
              setMenuQuantities({})
            }}>
              Batal
            </Button>
            <Button onClick={handleCreateOrder} disabled={!selectedMejaId || cart.length === 0}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buat Pesanan
            </Button>
          </div>
        </div>
        )}
       </div>

      {/* Dialog Payment */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-lg">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h2>
              <p className="text-gray-500">Pesanan #{selectedPesanan?.id} telah dibayar</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Pembayaran - Meja {selectedPesanan?.meja.nomorMeja}</DialogTitle>
              </DialogHeader>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-800">
                  {selectedPesanan && formatRupiah(selectedPesanan.totalHarga)}
                </p>
              </div>
              <div className="space-y-3">
                <Label>Pilih Metode Pembayaran</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["qris", "tunai"] as MetodePembayaran[]).map((metode) => (
                    <button key={metode} type="button" onClick={() => setSelectedMetode(metode)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedMetode === metode ? "border-green-600 bg-green-50" : "border-gray-200"
                      }`}>
                      {metodeIcons[metode]}
                      <span className="text-sm font-medium">{metodeLabels[metode]}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedMetode === "tunai" && (
                <div className="space-y-3">
                  <Input type="number" value={jumlahBayar} onChange={(e) => setJumlahBayar(e.target.value)}
                    placeholder="Masukkan jumlah uang" />
                  {jumlahBayar && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between"><span>Kembalian</span><span>{formatRupiah(kembalian)}</span></div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => handleBatal(selectedPesanan!.id)}>
                  <XCircle className="w-4 h-4 mr-2" />Batalkan
                </Button>
                <Button onClick={handleBayar} disabled={submitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />Konfirmasi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Note Per Item */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Catatan - {selectedMenuForNote?.namaMenu}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Catatan (opsional)</Label>
            <Input
              placeholder="Contoh: tanpa bawang, extra pedas..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => {
              if (selectedMenuForNote) {
                const index = cart.findIndex(item => item.menuId === selectedMenuForNote.id)
                if (index >= 0) {
                  setCart(prev => prev.map((item, i) =>
                    i === index ? { ...item, catatan: noteInput } : item
                  ))
                }
              }
              setIsNoteDialogOpen(false)
            }}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesanan #{selectedPesanan?.id} - Meja {selectedPesanan?.meja.nomorMeja}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
                    {selectedPesanan && selectedPesanan.detailPesanan.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.menu.namaMenu}</p>
                  <p className="text-sm text-gray-500">{item.jumlah}x</p>
                </div>
                <span className="font-medium">{formatRupiah(item.hargaSaatPesan * item.jumlah)}</span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-700">{selectedPesanan && formatRupiah(selectedPesanan.totalHarga)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
