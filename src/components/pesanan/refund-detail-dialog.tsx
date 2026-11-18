"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ImageIcon, Loader2 } from "lucide-react"
import { getRefundInfo, type RefundInfo } from "@/app/actions/refund"

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0)
}

function formatTanggal(value: Date | string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function RefundDetailDialog({
  open,
  onOpenChange,
  pesananId,
  nomorMeja,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pesananId: number | null
  nomorMeja?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<RefundInfo | null>(null)
  const loading = !info && !error

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setInfo(null)
      setError(null)
    }
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open || !pesananId) return

    let cancelled = false

    getRefundInfo(pesananId)
      .then((res) => {
        if (cancelled) return
        if ("error" in res && res.error) {
          setError(res.error)
        } else {
          setInfo(res as RefundInfo)
        }
      })
      .catch(() => {
        if (cancelled) return
        setError("Gagal memuat data refund")
      })

    return () => {
      cancelled = true
    }
  }, [open, pesananId])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bukti Refund Pesanan #{pesananId}</DialogTitle>
          <DialogDescription>
            {info?.nomorMeja ?? nomorMeja ? `Meja ${info?.nomorMeja ?? nomorMeja}` : "Detail refund"}
            {info?.namaPelanggan ? ` · ${info.namaPelanggan}` : ""}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat data refund...
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <ImageIcon className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        ) : info ? (
          <div className="space-y-4 py-1">
            <div className="rounded-md border bg-gray-50 p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Refund</span>
                <span className="font-bold">{formatRupiah(info.totalHarga)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                    {info.statusPembayaran}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {info.statusPesanan}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Metode</span>
                <span className="font-medium">{info.metodePembayaran || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Diproses oleh</span>
                <span className="font-medium">{info.refundedByUsername || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Waktu Refund</span>
                <span className="font-medium">{formatTanggal(info.refundedAt)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Catatan Refund</p>
              <p className="text-sm rounded-md border p-3 whitespace-pre-wrap">
                {info.refundCatatan || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Bukti Foto ({info.bukti.length})
              </p>
              {info.bukti.length === 0 ? (
                <p className="text-sm text-gray-400 rounded-md border border-dashed p-4 text-center">
                  Tidak ada bukti foto
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {info.bukti.map((b, i) => (
                    <a
                      key={b.id}
                      href={b.fotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-md overflow-hidden border"
                      title={`Buka bukti ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.fotoUrl}
                        alt={`Bukti refund ${i + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="text-base">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
