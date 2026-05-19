"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Banknote, CreditCard, Landmark, ArrowLeft } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { konfirmasiPembayaran } from "@/app/actions/kasir"
import { useState } from "react"

export default function PesananSelesaiPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  const orderId = params.id as string
  const metode = searchParams.get("metode") || "tunai"
  const nama = searchParams.get("nama") || ""
  const meja = searchParams.get("meja") || ""
  const jumlahBayar = searchParams.get("jumlahBayar") || ""
  const kembalian = searchParams.get("kembalian") || "0"

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

  const vaNumber = `8800${String(orderId).padStart(8, "0")}`

  async function handleKonfirmasi() {
    setConfirming(true)
    try {
      const result = await konfirmasiPembayaran(Number(orderId))
      if ("error" in result) {
        alert(result.error)
      } else {
        router.push("/dashboard/kasir")
      }
    } catch {
      alert("Gagal mengkonfirmasi pembayaran")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <button
        onClick={() => router.push("/dashboard/kasir/pesanan-baru")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
          <CheckCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">Pesanan Dibuat</h1>
        <p className="text-gray-500 mt-1">
          Pesanan #{orderId} — Meja {meja}
        </p>
        {nama && <p className="text-sm text-gray-500">Pelanggan: {nama}</p>}
      </div>

      {/* Payment Detail Card */}
      <Card className="border-2 border-green-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2.5 bg-green-100 rounded-xl text-green-700">
              {metodeIcon}
            </div>
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="font-semibold text-lg">{metodeLabel}</p>
            </div>
          </div>

          {metode === "qris" && (
            <div className="text-center space-y-3 py-4">
              <div className="inline-block bg-white p-4 rounded-xl border">
                <QRCodeSVG
                  value={`Pringmoni-QRIS-${orderId}-${Date.now()}`}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm text-gray-500">
                Scan QR code di atas untuk melakukan pembayaran
              </p>
            </div>
          )}

          {metode === "transfer" && (
            <div className="space-y-3 py-2">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Bank Tujuan</p>
                <p className="font-semibold">Bank Pringmoni</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account</p>
                <p className="font-semibold text-lg tracking-widest font-mono">
                  {vaNumber}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Atas Nama</p>
                <p className="font-semibold">{nama || "Pelanggan"}</p>
              </div>
            </div>
          )}

          {metode === "tunai" && (
            <div className="space-y-3 py-2">
              <div className="flex justify-between bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600">Total Pesanan</span>
                <span className="font-semibold">
                  Rp {Number(jumlahBayar || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600">Jumlah Bayar</span>
                <span className="font-semibold">
                  Rp {Number(jumlahBayar || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between bg-green-50 rounded-xl p-4 border border-green-200">
                <span className="text-green-700 font-medium">Kembalian</span>
                <span className="font-bold text-green-700 text-lg">
                  Rp {Number(kembalian).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-center text-amber-600 bg-amber-50 rounded-xl p-3">
                Pembayaran tunai menunggu konfirmasi kasir
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {metode === "tunai" && (
        <Button
          onClick={handleKonfirmasi}
          disabled={confirming}
          className="w-full h-12 text-base font-semibold"
        >
          {confirming ? "Mengkonfirmasi..." : "Konfirmasi Pembayaran"}
        </Button>
      )}

      {(metode === "qris" || metode === "transfer") && (
        <Button
          onClick={() => router.push("/dashboard/kasir/pesanan-baru")}
          className="w-full h-12 text-base font-semibold"
        >
          Buat Pesanan Lagi
        </Button>
      )}
    </div>
  )
}
