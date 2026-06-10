"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Banknote, CreditCard, Landmark, ArrowLeft, Loader2, Copy, Check, AlertTriangle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { getPembayaranInfo } from "@/app/actions/kasir"
import { useState, useEffect } from "react"

export default function PesananSelesaiPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const orderId = params.id as string

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getPembayaranInfo(Number(orderId))
        if ('error' in result) {
          setError(result.error || "Gagal memuat data")
        } else {
          setPaymentInfo(result)
        }
      } catch {
        setError("Gagal memuat data pembayaran")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [orderId])

  const metode = paymentInfo?.metodePembayaran || "tunai"
  const namaPelanggan = paymentInfo?.namaPelanggan || ""
  const nomorMeja = paymentInfo?.nomorMeja || ""
  const metodeLabel =
    metode === "tunai" ? "Tunai" : metode === "qris" ? "QRIS" : "Transfer"
  const metodeIcon =
    metode === "tunai" ? (
      <Banknote className="size-8" />
    ) : metode === "qris" ? (
      <CreditCard className="size-8" />
    ) : (
      <Landmark className="size-8" />
    )

  const totalHarga = paymentInfo?.totalHarga || 0
  const biayaAdmin = paymentInfo?.biayaAdmin || 0
  const grandTotal = totalHarga + biayaAdmin

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/dashboard/kasir/pesanan-baru")}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <button
        onClick={() => setShowExitDialog(true)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {metode === "tunai" ? "Menunggu Pembayaran" : metode === "qris" ? "Pembayaran QRIS" : "Pembayaran Transfer"}
        </h1>
        <p className="text-gray-500 mt-1">
          Pesanan #{orderId} — Meja {nomorMeja || "-"}
          {namaPelanggan && <> — Pelanggan: {namaPelanggan}</>}
        </p>
      </div>

      <Card className="border-2 border-green-200">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 pb-1.5 border-b">
            <div className="p-1.5 bg-green-100 rounded-xl text-green-700">
              {metodeIcon}
            </div>
            <div>
              <p className="text-xs text-gray-500">Metode Pembayaran</p>
              <p className="font-semibold">{metodeLabel}</p>
            </div>
          </div>

          {metode === "qris" && (
            <div className="text-center space-y-1">
              <div className="inline-block bg-white p-1 rounded-lg border">
                <QRCodeSVG
                  value={`Pringmoni-QRIS-${orderId}-${paymentInfo?.createdAt || Date.now()}`}
                  size={150}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Scan QR code untuk melakukan pembayaran
              </p>
            </div>
          )}

          {metode === "transfer" && (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Bank Tujuan</p>
                <p className="font-semibold text-lg">{paymentInfo?.bankLabel || "BCA"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-base tracking-widest font-mono break-all">
                    {paymentInfo?.vaNumber || `${(paymentInfo?.bank || 'bca') === 'bca' ? '8800' : (paymentInfo?.bank || 'bca') === 'bni' ? '8801' : (paymentInfo?.bank || 'bca') === 'bri' ? '8802' : '8803'}${String(orderId).padStart(10, '0')}`}
                  </span>
                  <button
                    onClick={() => {
                      const va = paymentInfo?.vaNumber || `${(paymentInfo?.bank || 'bca') === 'bca' ? '8800' : (paymentInfo?.bank || 'bca') === 'bni' ? '8801' : (paymentInfo?.bank || 'bca') === 'bri' ? '8802' : '8803'}${String(orderId).padStart(10, '0')}`
                      navigator.clipboard.writeText(va)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="size-8 shrink-0 rounded-lg border hover:bg-white flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                <div>
                  <span className="text-gray-600">Total Tagihan</span>
                  {biayaAdmin > 0 && (
                    <p className="text-[11px] text-gray-400">termasuk biaya admin Rp {biayaAdmin.toLocaleString()}</p>
                  )}
                </div>
                <span className="font-semibold text-base">Rp {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          )}

          {metode === "tunai" && (
            <div className="space-y-2">
              <div className="flex justify-between bg-amber-50 rounded-xl p-3 border border-amber-200">
                <span className="text-amber-700 font-medium">Status</span>
                <span className="font-bold text-amber-700">Menunggu Pembayaran</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-xl p-3">
                <span className="text-gray-600">Total Pesanan</span>
                <span className="font-semibold">Rp {totalHarga.toLocaleString()}</span>
              </div>
              <Button
                onClick={() => router.push("/dashboard/kasir")}
                className="w-full h-10 text-sm font-semibold"
              >
                Konfirmasi Pembayaran
              </Button>
              <p className="text-xs text-center text-gray-400">
                Konfirmasi pembayaran tunai akan dilakukan di halaman kasir
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="size-5 text-amber-500" />
              Tinggalkan halaman?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Halaman ini tidak dapat diakses lagi setelah Anda kembali. Pastikan customer sudah melihat kode pembayaran.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1">
              Tetap di sini
            </Button>
            <Button variant="destructive" onClick={() => router.push("/dashboard/kasir/pesanan-baru")} className="flex-1">
              Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
