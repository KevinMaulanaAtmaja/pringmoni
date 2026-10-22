"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Loader2, Trash2, Upload, AlertTriangle } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing-client"
import { ajukanRefund } from "@/app/actions/refund"

export interface RefundTargetPesanan {
  id: number
  nomorMeja: string
  totalHarga: number
  namaPelanggan?: string | null
}

interface UploadedBukti {
  url: string
  key: string
}

const MAX_BUKTI = 3

export function RefundDialog({
  open,
  onOpenChange,
  pesanan,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pesanan: RefundTargetPesanan | null
  onSuccess?: () => void
}) {
  const [catatan, setCatatan] = useState("")
  const [bukti, setBukti] = useState<UploadedBukti[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { startUpload } = useUploadThing("refundBukti", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      setUploading(false)
      if (res?.length) {
        setBukti((prev) => [
          ...prev,
          ...res.map((f) => ({ url: f.url, key: f.key })),
        ].slice(0, MAX_BUKTI))
      }
    },
    onUploadError: () => {
      setUploading(false)
      setError("Gagal mengunggah bukti foto")
    },
  })

  const reset = () => {
    setCatatan("")
    setBukti([])
    setError(null)
    setUploading(false)
    setSubmitting(false)
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError(null)

    const sisa = MAX_BUKTI - bukti.length
    if (sisa <= 0) {
      setError(`Maksimal ${MAX_BUKTI} bukti foto`)
      e.target.value = ""
      return
    }

    const selected = Array.from(files).slice(0, sisa)
    setUploading(true)
    try {
      await startUpload(selected)
    } catch {
      setUploading(false)
      setError("Gagal mengunggah bukti foto")
    }
    e.target.value = ""
  }

  const removeBukti = (index: number) => {
    setBukti((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!pesanan) return
    setError(null)

    if (catatan.trim().length < 3) {
      setError("Catatan refund wajib diisi (minimal 3 karakter)")
      return
    }
    if (bukti.length === 0) {
      setError("Bukti foto refund wajib diunggah minimal 1 foto")
      return
    }

    setSubmitting(true)
    const result = await ajukanRefund(
      pesanan.id,
      catatan.trim(),
      bukti.map((b) => ({ url: b.url, fileKey: b.key }))
    )
    setSubmitting(false)

    if ("error" in result && result.error) {
      setError(result.error)
      return
    }

    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refund Pesanan #{pesanan?.id}</DialogTitle>
          <DialogDescription>
            Meja {pesanan?.nomorMeja}
            {pesanan?.namaPelanggan ? ` · ${pesanan.namaPelanggan}` : ""} · Total Rp{" "}
            {Number(pesanan?.totalHarga || 0).toLocaleString("id-ID")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              Refund akan mengubah status pembayaran & pesanan menjadi{" "}
              <strong>Refund</strong> dan hanya bisa dilakukan <strong>satu kali</strong>.
              Wajib menyertakan bukti foto.
            </p>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="refund-catatan" className="text-xs">
              Catatan Refund <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="refund-catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Alasan refund, mis. pesanan salah / pelanggan membatalkan..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid gap-1">
            <Label className="text-xs">
              Bukti Foto <span className="text-red-500">*</span>{" "}
              <span className="text-gray-400">
                ({bukti.length}/{MAX_BUKTI})
              </span>
            </Label>

            {bukti.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {bukti.map((b, i) => (
                  <div key={b.url} className="relative group rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.url} alt={`Bukti ${i + 1}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeBukti(i)}
                      className="absolute top-1 right-1 rounded-full bg-red-600 text-white p-1 opacity-90 hover:opacity-100"
                      title="Hapus bukti"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {bukti.length < MAX_BUKTI && (
              <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-4 text-sm text-gray-500 cursor-pointer hover:bg-gray-50">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Pilih foto bukti
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading || submitting}
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
              <ImageIcon className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={submitting || uploading || bukti.length === 0 || catatan.trim().length < 3}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Memproses...
              </>
            ) : (
              "Proses Refund"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RefundStatusBadge({ statusBayar }: { statusBayar: string }) {
  if (statusBayar !== "refund") return null
  return (
    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
      Refund
    </Badge>
  )
}
