"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Bell } from "lucide-react"
import { getPesananBelumBayar, getPaidOrdersForNotification } from "@/app/actions/kasir"
import { useNotification } from "@/hooks/use-notification"
import { useOrdersRealtime } from "@/hooks/use-orders-realtime"

interface NotifOrder {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  metodePembayaran: string | null
}

interface PaidOrder {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  totalHarga: number
  biayaAdmin: number | null
  ppn: number | null
}

type ToastData = { type: "new_order" | "order_paid"; meja: string; nama: string | null } | null

/**
 * Global notification untuk area kasir.
 * 1) Pesanan baru di-trigger saat customer menekan tombol "Konfirmasi Pembayaran"
 *    di halaman checkout (metode pembayaran ter-set).
 * 2) Konfirmasi pembayaran oleh kasir → notif suara + toast.
 * Berlaku di halaman kasir manapun.
 */
export function KasirOrderNotifications() {
  const { notifyNewOrder, notifyOrderPaid } = useNotification()
  const [toast, setToast] = useState<ToastData>(null)
  const seenConfirmedRef = useRef<Set<number>>(new Set())
  const seenPaidRef = useRef<Set<number>>(new Set())
  const initializedRef = useRef(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((data: Exclude<ToastData, null>) => {
    setToast(data)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 6000)
  }, [])

  const run = useCallback(async () => {
    const belumResult = await getPesananBelumBayar()
    if ("error" in belumResult || !Array.isArray(belumResult)) return

    const orders = belumResult as unknown as NotifOrder[]
    const confirmed = orders.filter(o => o.metodePembayaran)

    for (const order of confirmed) {
      if (!initializedRef.current) {
        seenConfirmedRef.current.add(order.id)
        continue
      }
      if (!seenConfirmedRef.current.has(order.id)) {
        seenConfirmedRef.current.add(order.id)
        notifyNewOrder(order.nomorMeja, order.namaPelanggan)
        showToast({ type: "new_order", meja: order.nomorMeja, nama: order.namaPelanggan })
      }
    }

    const paidResult = await getPaidOrdersForNotification()
    if ("error" in paidResult || !Array.isArray(paidResult)) return

    const paidOrders = paidResult as unknown as PaidOrder[]

    for (const order of paidOrders) {
      if (!initializedRef.current) {
        seenPaidRef.current.add(order.id)
        continue
      }
      if (!seenPaidRef.current.has(order.id)) {
        seenPaidRef.current.add(order.id)
        const total = order.totalHarga + (order.biayaAdmin || 0) + (order.ppn || 0)
        notifyOrderPaid(order.nomorMeja, order.namaPelanggan, total)
        showToast({ type: "order_paid", meja: order.nomorMeja, nama: order.namaPelanggan })
      }
    }

    if (!initializedRef.current) initializedRef.current = true
  }, [notifyNewOrder, notifyOrderPaid, showToast])

  useEffect(() => {
    const t = setTimeout(() => { void run() }, 0)
    return () => clearTimeout(t)
  }, [run])

  // Fallback polling lambat + trigger realtime via Pusher
  useEffect(() => {
    const interval = setInterval(run, 30000)
    return () => clearInterval(interval)
  }, [run])

  useOrdersRealtime(run)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  if (!toast) return null

  return (
    <div className="fixed top-24 right-4 z-[60] pointer-events-none">
      <div
        className={`bg-white border-2 rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-top duration-200 max-w-sm ${
          toast.type === "order_paid" ? "border-blue-400" : "border-green-400"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "order_paid" ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            <Bell className={`size-6 ${toast.type === "order_paid" ? "text-blue-600" : "text-green-600"}`} />
          </div>
          <div>
            <p className={`font-bold ${toast.type === "order_paid" ? "text-blue-800" : "text-green-800"}`}>
              {toast.type === "order_paid" ? "Pembayaran Berhasil!" : "Pesanan Baru Masuk!"}
            </p>
            <p className={`text-sm ${toast.type === "order_paid" ? "text-blue-700" : "text-green-700"}`}>
              Meja {toast.meja}
              {toast.nama && <span> - {toast.nama}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}