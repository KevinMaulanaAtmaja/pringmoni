"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPesananById, updateStatusPesanan, cancelPesanan } from "@/app/actions/pesanan"
import { getMeja } from "@/app/actions/meja"
import type { Pesanan } from "@/types"
import { Eye, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusBayarColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  berhasil: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

export default function PesananDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = parseInt(params.id as string)
  
  const [pesanan, setPesanan] = useState<Pesanan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPesanan = async () => {
    setLoading(true)
    try {
      const result = await getPesananById(orderId)
      if (!result || 'error' in result) {
        setError("Pesanan tidak ditemukan")
      } else {
        // Map snake_case to camelCase for Pesanan type
        const mappedResult = {
          id: result.id,
          mejaId: result.meja_id,
          statusPesanan: result.status_pesanan as "menunggu" | "diproses" | "selesai" | "dibatalkan",
          statusPembayaran: result.status_pembayaran as "menunggu" | "berhasil" | "dibatalkan",
          totalHarga: Number(result.total_harga),
          metodePembayaran: result.metode_pembayaran as "qris" | "tunai" | undefined,
          jumlahBayar: result.jumlah_bayar ? Number(result.jumlah_bayar) : undefined,
          kembalian: Number(result.kembalian),
          createdAt: result.created_at.toISOString(),
          meja: {
            id: result.meja_id,
            nomorMeja: result.nomor_meja,
            tipeMeja: result.tipe_meja as "lesehan" | "kursi",
            kapasitas: 0,
            statusMeja: "kosong" as const,
          },
          waiterId: undefined,
          kasirId: undefined,
          catatan: null,
          detailPesanan: [],
        } as Pesanan
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

  const handleUpdateStatus = async (status: "menunggu" | "diproses" | "selesai" | "dibatalkan") => {
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

  if (loading) return <div className="p-8 text-center">Memuat...</div>
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
              <span className="text-muted-foreground">Waktu</span>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-medium">
                {pesanan.kasirId ? 'Kasir #' + pesanan.kasirId : '-'}
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
            <div className="flex justify-between border-t pt-4">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">Rp {pesanan.totalHarga.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waiter</span>
              <span className="font-medium">{pesanan.waiterId ? 'Waiter #' + pesanan.waiterId : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kasir</span>
              <span className="font-medium">{pesanan.kasirId ? 'Kasir #' + pesanan.kasirId : '-'}</span>
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
                <TableHead>Menu</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pesanan.detailPesanan.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.menuName}</TableCell>
                  <TableCell>Rp {item.hargaSaatPesan.toLocaleString("id-ID")}</TableCell>
                  <TableCell>{item.jumlah}</TableCell>
                  <TableCell>Rp {(item.hargaSaatPesan * item.jumlah).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{item.catatanItem || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        {pesanan.statusPesanan === 'menunggu' && (
          <>
            <Button onClick={() => handleUpdateStatus('diproses')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Proses Pesanan
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan
            </Button>
          </>
        )}
        {pesanan.statusPesanan === 'diproses' && (
          <Button onClick={() => handleUpdateStatus('selesai')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Selesai
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/dashboard/pesanan">Kembali ke Daftar</Link>
        </Button>
      </div>
    </div>
  )
}
