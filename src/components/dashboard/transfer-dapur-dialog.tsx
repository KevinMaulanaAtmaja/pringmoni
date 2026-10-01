'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Warehouse, CookingPot, ChefHat } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StokBahanWithType, transferStokBahan } from '@/app/actions/stok-bahan'

const satuanLabels: Record<string, string> = {
  kg: 'kg',
  pcs: 'pcs',
  pack: 'pack',
}

type TransferDapurDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StokBahanWithType | null
  onDone: () => void
}

export function TransferDapurDialog({
  open,
  onOpenChange,
  item,
  onDone,
}: TransferDapurDialogProps) {
  const [jumlah, setJumlah] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    setJumlah('0')
    setError(null)
    setSuccess(null)
  }, [open, item?.id])

  if (!item) return null

  const satuan = satuanLabels[item.satuan] ?? item.satuan
  const stokGudang = item.stokQty
  const parsed = Number(jumlah) || 0
  const melebihi = parsed > stokGudang
  const stokSesudah = Math.max(0, stokGudang - parsed)

  async function handleSubmit() {
    if (!item) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await transferStokBahan(item.id, parsed)
      if ('error' in result && result.error) {
        setError(result.error)
        return
      }
      setSuccess(
        `${result.dipindah} ${satuan} ${item.namaBahan} dipindahkan ke Dapur.`
      )
      onDone()
    } catch {
      setError('Gagal memindahkan stok')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Pindahkan ke Dapur
          </DialogTitle>
          <DialogDescription className="text-xs">
            Stok {item.namaBahan} dipindah dari Gudang ke Dapur. Total stok
            tidak berubah, hanya lokasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Warehouse className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  Gudang
                </p>
                <p className="text-sm font-semibold">
                  {stokGudang} {satuan}
                </p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <CookingPot className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  Dapur
                </p>
                <p className="text-sm font-semibold text-emerald-700">
                  +{melebihi ? 0 : parsed} {satuan}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transferJumlah" className="text-xs">
              Jumlah dipindahkan ({satuan})
            </Label>
            <div className="flex gap-1.5">
              <Input
                id="transferJumlah"
                type="number"
                min={0}
                max={stokGudang}
                step="any"
                className="h-8 text-sm"
                value={jumlah}
                onChange={(e) => {
                  setSuccess(null)
                  setJumlah(e.target.value)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setSuccess(null)
                  setJumlah(String(stokGudang))
                }}
              >
                Semua
              </Button>
            </div>
          </div>

          {!melebihi && parsed > 0 && (
            <p className="text-xs text-muted-foreground">
              Sisa stok Gudang{' '}
              <span className="font-semibold text-foreground">
                {stokSesudah} {satuan}
              </span>
            </p>
          )}

          {melebihi && (
            <p className="text-xs text-destructive">
              Jumlah melebihi stok gudang ({stokGudang} {satuan}).
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && (
            <p className="text-xs text-emerald-700">{success}</p>
          )}
        </div>

        <DialogFooter>
          {success && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs mr-auto"
              onClick={() => {
                onOpenChange(false)
                router.push('/dashboard/resep')
              }}
            >
              <ChefHat className="w-3.5 h-3.5 mr-1.5" />
              Lanjut Rakit Resep
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={submitting || parsed <= 0 || melebihi}
            onClick={handleSubmit}
          >
            {submitting ? 'Memindahkan...' : 'Pindahkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
