"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Clock, Loader2 } from "lucide-react"
import {
  getNotifikasiTerlambat,
  type NotifikasiPesananTerlambat,
} from "@/app/actions/notifikasi"
import { useOrdersRealtime } from "@/hooks/use-orders-realtime"
import { useNotification } from "@/hooks/use-notification"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const POLLING_MS = 30_000

function formatDurasi(menit: number) {
  if (menit >= 60) {
    const j = Math.floor(menit / 60)
    const m = menit % 60
    return m > 0 ? `${j}j ${m}m` : `${j}j`
  }
  return `${menit}m`
}

function labelStatus(statusPesanan: string) {
  return statusPesanan === "diproses" ? "Belum diantar" : "Belum diproses"
}

/**
 * Lonceng notifikasi di header dashboard.
 *
 * - Selalu terlihat (untuk owner, cashier, dan waiter).
 * - Badge menampilkan jumlah pesanan yang sudah >30 menit dan belum ditangani
 *   (status `menunggu` atau `diproses`).
 * - Notifikasi ter-reset saat lewat tengah malam: sisa pesanan yang belum
 *   dibayar otomatis dibatalkan (lihat `getNotifikasiTerlambat`).
 */
export function StaleNotificationBell() {
  const [orders, setOrders] = useState<NotifikasiPesananTerlambat[]>([])
  const [loading, setLoading] = useState(true)
  const seenIdsRef = useRef<Set<number>>(new Set())
  const initializedRef = useRef(false)
  const { notifyStaleOrder, notifyStaleOrders } = useNotification()

  const refresh = useCallback(async () => {
    try {
      const result = await getNotifikasiTerlambat()
      const list = result?.orders ?? []
      setOrders(list)
      setLoading(false)

      if (!initializedRef.current) {
        // Muat pertama: jangan bunyi, hanya daemonkan pesanan yang sudah terlambat
        initializedRef.current = true
        list.forEach((o) => seenIdsRef.current.add(o.id))
        return
      }

      const baru = list.filter((o) => !seenIdsRef.current.has(o.id))
      baru.forEach((o) => seenIdsRef.current.add(o.id))

      if (baru.length === 1) {
        notifyStaleOrder(baru[0].nomorMeja, baru[0].lamaMenit)
      } else if (baru.length > 1) {
        notifyStaleOrders(baru.length)
      }
    } catch {
      // Gagal ambil data notifikasi — biarkan badge tetap seperti sebelumnya
    }
  }, [notifyStaleOrder, notifyStaleOrders])

  useEffect(() => {
    // Ditunda setTimeout agar setState tidak dipanggil sinkron di dalam effect
    const initial = setTimeout(() => {
      void refresh()
    }, 0)
    const interval = setInterval(() => {
      void refresh()
    }, POLLING_MS)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [refresh])

  // Realtime: pesanan baru / status berubah -> refresh badge
  useOrdersRealtime(() => {
    void refresh()
  })

  const total = orders.length

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) void refresh()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            total > 0
              ? `Notifikasi pesanan terlambat, ${total} pesanan`
              : "Notifikasi pesanan terlambat"
          }
          title="Pesanan terlambat (>30 menit belum ditangani)"
          className="relative flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition"
        >
          <Bell
            className={`size-4 ${total > 0 ? "text-amber-600" : "text-gray-500"}`}
          />
          {total > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold flex items-center justify-center">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
          <p className="font-heading text-sm font-medium">Pesanan Terlambat</p>
          <span className="text-[10px] text-muted-foreground">lewat 30 menit</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Memuat...
          </div>
        ) : orders.length === 0 ? (
          <p className="py-6 px-3 text-center text-xs text-muted-foreground">
            Tidak ada pesanan terlambat
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto p-2 space-y-1">
            {orders.map((o) => (
              <DropdownMenuItem key={o.id} asChild className="p-0">
                <Link
                  href={`/dashboard/pesanan/${o.id}`}
                  className="flex items-start gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 px-2.5 py-2 transition"
                >
                  <Clock className="size-3.5 mt-0.5 text-amber-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-amber-900 truncate">
                      Meja {o.nomorMeja}
                      {o.namaPelanggan ? ` - ${o.namaPelanggan}` : ""}
                    </p>
                    <p className="text-[10px] text-amber-700">
                      #{o.id} · {labelStatus(o.statusPesanan)} ·{" "}
                      {formatDurasi(o.lamaMenit)}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <div className="border-t p-1">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/pesanan"
              className="justify-center text-xs font-medium"
            >
              Lihat semua pesanan
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
