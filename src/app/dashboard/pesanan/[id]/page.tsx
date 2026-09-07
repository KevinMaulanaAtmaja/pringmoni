"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPesananById, updateStatusPesanan, cancelPesanan } from "@/app/actions/pesanan"
import type { DetailPesananItem } from "@/types"
import { StatusPesanan } from "@prisma/client"
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { printStruk } from "@/lib/print-struk"

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-chart-5/15 text-chart-5",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusBayarColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  berhasil: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

export default function PesananDetailPage() {
  const { data: session } = useSession()
  const isOwner = session?.user?.role === 'owner'

  const params = useParams()
  const router = useRouter()
  const orderId = parseInt(params.id as string)
  
  interface PesananDetailView {
    id: number
    mejaId: number
    statusPesanan: "menunggu" | "diproses" | "selesai" | "dibatalkan"
    statusPembayaran: "menunggu" | "berhasil" | "dibatalkan"
    totalHarga: number
    biayaAdmin: number | null
    ppn: number | null
    metodePembayaran?: "qris" | "tunai" | "transfer"
    jumlahBayar?: number
    kembalian: number
    createdAt: string
    updatedAt: string
    meja: {
      id: number
      nomorMeja: string
      tipeMeja: "lesehan" | "kursi"
      kapasitas: number
      statusMeja: "kosong"
    }
    catatan: string | null
    detailPesanan: DetailPesananItem[]
    waiterUsername?: string | null
    kasirUsername?: string | null
    namaPelanggan?: string | null
  }

  const [pesanan, setPesanan] = useState<PesananDetailView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageIndexes, setImageIndexes] = useState<Record<number, number>>({})

  const loadPesanan = async () => {
    setLoading(true)
    try {
      const result: any = await getPesananById(orderId)
      if (!result || result.error) {
        setError("Pesanan tidak ditemukan")
      } else {
        const items = (result.items || []).map((item: { id: number; menu_id: number; nama_menu: string; jumlah: number; harga_saat_pesan: number; catatan_item: string | null; foto_urls?: string[] }) => ({
          id: item.id,
          menuId: item.menu_id,
          menuName: item.nama_menu,
          jumlah: item.jumlah,
          hargaSaatPesan: Number(item.harga_saat_pesan),
          catatanItem: item.catatan_item,
          fotoUrls: item.foto_urls || [],
        }))

        const mappedResult: PesananDetailView = {
          id: result.id,
          mejaId: result.meja_id,
          statusPesanan: result.status_pesanan as "menunggu" | "diproses" | "selesai" | "dibatalkan",
          statusPembayaran: result.status_pembayaran as "menunggu" | "berhasil" | "dibatalkan",
          totalHarga: Number(result.total_harga),
          biayaAdmin: result.biaya_admin ? Number(result.biaya_admin) : null,
          ppn: result.ppn ? Number(result.ppn) : null,
          metodePembayaran: (result.metode_pembayaran || undefined) as "qris" | "tunai" | "transfer" | undefined,
          jumlahBayar: result.jumlah_bayar ? Number(result.jumlah_bayar) : undefined,
          kembalian: Number(result.kembalian),
          createdAt: result.created_at!.toISOString(),
          updatedAt: (result.updated_at || result.created_at!).toISOString(),
          meja: {
            id: result.meja_id,
            nomorMeja: result.nomor_meja,
            tipeMeja: result.tipe_meja as "lesehan" | "kursi",
            kapasitas: 0,
            statusMeja: "kosong" as const,
          },
          waiterUsername: result.waiter_username || null,
          kasirUsername: result.kasir_username || null,
          namaPelanggan: result.nama_pelanggan || null,
          catatan: result.catatan || null,
          detailPesanan: items,
        }
        setPesanan(mappedResult)
      }
    } catch {
      setError("Gagal memuat detail pesanan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      loadPesanan()
    }
  }, [orderId])

  const handleImageNav = (itemId: number, direction: 'prev' | 'next', maxLength: number) => {
    setImageIndexes(prev => {
      const current = prev[itemId] || 0
      const newIndex = direction === 'next' 
        ? (current + 1) % maxLength
        : (current - 1 + maxLength) % maxLength
      return { ...prev, [itemId]: newIndex }
    })
  }

  const handleUpdateStatus = async (status: StatusPesanan) => {
    const result = await updateStatusPesanan(orderId, status)
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }
    loadPesanan()
  }

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return
    const result = await cancelPesanan(orderId)
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }
    loadPesanan()
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  )
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!pesanan) return <div className="p-8 text-center">Pesanan tidak ditemukan</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detail Pesanan #{pesanan.id}</h1>
      </div>

      {/* Info Pesanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Info Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meja</span>
              <span className="font-medium">{pesanan.meja?.nomorMeja} ({pesanan.meja?.tipeMeja === 'lesehan' ? 'Lesehan' : 'Kursi'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={statusColors[pesanan.statusPesanan]}>
                {pesanan.statusPesanan === 'menunggu' ? 'Menunggu' : 
                 pesanan.statusPesanan === 'diproses' ? 'Diproses' :
                 pesanan.statusPesanan === 'selesai' ? 'Selesai' : 'Dibatalkan'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Bayar</span>
              <Badge className={statusBayarColors[pesanan.statusPembayaran]}>
                {pesanan.statusPembayaran === 'menunggu' ? 'Menunggu' : 
                 pesanan.statusPembayaran === 'berhasil' ? 'Berhasil' : 'Dibatalkan'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pesanan Dibuat</span>
              <span className="font-medium">
                {new Date(pesanan.createdAt).toLocaleString("id-ID", {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terakhir Dilayani</span>
              <span className="font-medium">
                {new Date(pesanan.updatedAt).toLocaleString("id-ID", {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {pesanan.catatan && (
              <div>
                <span className="text-muted-foreground">Catatan</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">{pesanan.catatan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Info Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rp {pesanan.totalHarga.toLocaleString("id-ID")}</span>
            </div>
            {(pesanan.biayaAdmin ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Admin</span>
                <span className="font-medium">Rp {pesanan.biayaAdmin!.toLocaleString("id-ID")}</span>
              </div>
            )}
            {(pesanan.ppn ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPN</span>
                <span className="font-medium">Rp {pesanan.ppn!.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-4">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">Rp {(pesanan.totalHarga + (pesanan.biayaAdmin ?? 0) + (pesanan.ppn ?? 0)).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-medium">
                {pesanan.metodePembayaran
                  ? pesanan.metodePembayaran === "tunai"
                    ? "Tunai"
                    : pesanan.metodePembayaran === "qris"
                      ? "QRIS"
                      : "Transfer"
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Bayar</span>
              <span className="font-medium">
                {pesanan.jumlahBayar ? `Rp ${pesanan.jumlahBayar.toLocaleString("id-ID")}` : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kembalian</span>
              <span className="font-medium">Rp {pesanan.kembalian.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waiter</span>
              <span className="font-medium">{pesanan.waiterUsername || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kasir</span>
              <span className="font-medium">{pesanan.kasirUsername || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Item Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pesanan.detailPesanan.map((item: DetailPesananItem) => {
                const fotoUrls = item.fotoUrls || []
                const currentIndex = imageIndexes[item.id] || 0
                const hasMultiple = fotoUrls.length > 1
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {fotoUrls.length > 0 ? (
                        <div className="w-20">
                          <div className="relative w-20 h-20">
                            <img 
                              src={fotoUrls[currentIndex]} 
                              alt={item.menuName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            {hasMultiple && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleImageNav(item.id, 'prev', fotoUrls.length)}
                                  className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImageNav(item.id, 'next', fotoUrls.length)}
                                  className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                          {hasMultiple && (
                            <div className="flex justify-center gap-1 mt-1">
                              {fotoUrls.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setImageIndexes(prev => ({ ...prev, [item.id]: idx }))}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    idx === currentIndex ? 'bg-chart-5' : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.menuName}</TableCell>
                    <TableCell>Rp {item.hargaSaatPesan.toLocaleString("id-ID")}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>Rp {(item.hargaSaatPesan * item.jumlah).toLocaleString("id-ID")}</TableCell>
                    <TableCell>{item.catatanItem || '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       {/* Actions */}
       <div className="flex gap-4 flex-wrap">
         {pesanan.statusPembayaran === 'berhasil' && (
           <Button
             variant="outline"
             onClick={() => printStruk({
               id: pesanan.id,
               nomorMeja: pesanan.meja.nomorMeja,
               items: pesanan.detailPesanan.map(i => ({
                 nama: i.menuName,
                 jumlah: i.jumlah,
                 harga: Number(i.hargaSaatPesan),
               })),
               totalHarga: Number(pesanan.totalHarga),
               adminFee: pesanan.biayaAdmin ? Number(pesanan.biayaAdmin) : undefined,
               ppn: pesanan.ppn ? Number(pesanan.ppn) : undefined,
               metodePembayaran: pesanan.metodePembayaran,
               jumlahBayar: pesanan.jumlahBayar ? Number(pesanan.jumlahBayar) : undefined,
               kembalian: Number(pesanan.kembalian),
               createdAt: new Date(pesanan.createdAt),
               kasirUsername: pesanan.kasirUsername,
               namaPelanggan: pesanan.namaPelanggan,
             })}
           >
             <Printer className="w-4 h-4 mr-2" />
             Cetak Struk
           </Button>
         )}
         {!isOwner && pesanan.statusPesanan === 'menunggu' && (
           <>
             <Button onClick={() => handleUpdateStatus('selesai')}>
               <CheckCircle className="w-4 h-4 mr-2" />
               Selesai
             </Button>
             <Button variant="destructive" onClick={handleCancel}>
               <XCircle className="w-4 h-4 mr-2" />
               Batalkan
             </Button>
           </>
         )}
         <Button variant="outline" asChild>
           <Link href="/dashboard/pesanan">Kembali ke Daftar</Link>
         </Button>
       </div>
    </div>
  )
}
