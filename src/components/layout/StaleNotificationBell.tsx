"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  PackageCheck,
  Receipt,
  RefreshCcw,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react"
import {
  getNotifikasiDashboard,
  type NotifikasiItem,
  type NotifikasiKind,
} from "@/app/actions/notifikasi"
import { useOrdersRealtime } from "@/hooks/use-orders-realtime"
import { useNotification } from "@/hooks/use-notification"
import { ListSkeleton } from "@/components/ui/page-skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const POLLING_MS = 30_000

function formatDurasi(menit: number) {
  if (menit <= 0) return "-"
  if (menit >= 60) {
    const j = Math.floor(menit / 60)
    const m = menit % 60
    return m > 0 ? `${j}j ${m}m` : `${j}j`
  }
  return `${menit}m`
}

function formatRupiah(total?: number) {
  if (total === undefined || total === null) return null
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(total)
}

type KindMeta = {
  icon: typeof Bell
  iconClass: string
  chipClass: string
  label: string
}

const KIND_META: Record<NotifikasiKind, KindMeta> = {
  terlambat: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    chipClass: "border-red-200 bg-transparent text-red-600",
    label: "Terlambat >30 menit",
  },
  belum_dibayar: {
    icon: Receipt,
    iconClass: "text-amber-500",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Belum dibayar",
  },
  perlu_diproses: {
    icon: ShoppingCart,
    iconClass: "text-emerald-600",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Perlu diproses",
  },
  belum_diantar: {
    icon: UtensilsCrossed,
    iconClass: "text-emerald-600",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Belum diantar",
  },
  siap_selesai: {
    icon: PackageCheck,
    iconClass: "text-emerald-600",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Siap diselesaikan",
  },
  refund: {
    icon: RefreshCcw,
    iconClass: "text-slate-500",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Refund",
  },
  stok_menipis: {
    icon: AlertCircle,
    iconClass: "text-amber-500",
    chipClass: "border-border bg-transparent text-muted-foreground",
    label: "Stok menipis/habis",
  },
}

function labelStatus(statusPesanan: string) {
  if (statusPesanan === "diproses") return "Sedang diproses"
  if (statusPesanan === "menunggu") return "Menunggu diproses"
  if (statusPesanan === "selesai") return "Selesai"
  if (statusPesanan === "dibatalkan") return "Dibatalkan"
  if (statusPesanan === "refund") return "Refund"
  return statusPesanan
}

function buildSubtext(item: NotifikasiItem) {
  if (item.kind === "stok_menipis") {
    const qty = item.stokQty !== undefined ? `${item.stokQty} ${item.satuan ?? ""}`.trim() : "-"
    const status = item.statusStok === "habis" ? "HABIS" : "MENIPIS"
    return `Stok ${qty} · ${status}`
  }

  const parts: string[] = []
  if (item.pesananId) parts.push(`#${item.pesananId}`)
  parts.push(labelStatus(item.statusPesanan ?? "menunggu"))
  if (item.statusPembayaran) {
    if (item.statusPembayaran === "menunggu") parts.push("Belum bayar")
    else if (item.statusPembayaran === "berhasil") parts.push("Sudah bayar")
    else if (item.statusPembayaran === "refund") parts.push("Pembayaran refund")
    else if (item.statusPembayaran === "dibatalkan") parts.push("Pembayaran dibatalkan")
  }
  if (item.jumlahItem) parts.push(`${item.jumlahItem} item`)
  if (item.itemBelumDiantar && item.itemBelumDiantar > 0) {
    parts.push(`${item.itemBelumDiantar} belum diantar`)
  }
  const harga = formatRupiah(item.totalHarga)
  if (harga) parts.push(harga)
  if (item.lamaMenit > 0) parts.push(`${formatDurasi(item.lamaMenit)}`)
  return parts.join(" · ")
}

/**
 * Lonceng notifikasi di header dashboard.
 *
 * Menampilkan seluruh notifikasi operasional: pesanan terlambat, belum dibayar,
 * sudah dibayar tapi perlu diproses/belum diantar/siap diselesaikan, refund,
 * dan stok menipis/habis sesuai role pengguna.
 */
function NotifikasiRow({ item }: { item: NotifikasiItem }) {
  const meta = KIND_META[item.kind]
  const Icon = meta.icon

  return (
    <DropdownMenuItem
      asChild
      className="p-0 cursor-pointer rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-800 focus:text-inherit! hover:text-inherit! not-data-[variant=destructive]:focus:**:text-inherit! not-data-[variant=destructive]:hover:**:text-inherit! not-data-[variant=destructive]:focus:**:[svg]:text-inherit! not-data-[variant=destructive]:hover:**:[svg]:text-inherit!"
    >
      <Link
        href={item.href}
        className="flex items-start gap-2 rounded-lg px-2.5 py-2 w-full"
      >
        <Icon className={`size-3.5 mt-0.5 ${meta.iconClass} shrink-0`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground truncate">
              {item.kind === "stok_menipis"
                ? item.namaBahan
                : `Meja ${item.nomorMeja ?? "-"}`}
            </p>
            <span
              className={`shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${meta.chipClass}`}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {buildSubtext(item)}
          </p>
        </div>
      </Link>
    </DropdownMenuItem>
  )
}

export function StaleNotificationBell() {
  const [items, setItems] = useState<NotifikasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)
  const { notifyStaleOrder, notifyStaleOrders } = useNotification()

  const refresh = useCallback(async () => {
    try {
      const result = await getNotifikasiDashboard()
      const list = result?.items ?? []
      setItems(list)
      setLoading(false)

      if (!initializedRef.current) {
        // Muat pertama: jangan bunyi, hanya catat ID yang sudah ada
        initializedRef.current = true
        list.forEach((o) => seenIdsRef.current.add(o.id))
        return
      }

      const baru = list.filter((o) => !seenIdsRef.current.has(o.id))
      baru.forEach((o) => seenIdsRef.current.add(o.id))

      const baruTerlambat = baru.filter((o) => o.kind === "terlambat")
      if (baruTerlambat.length === 1) {
        notifyStaleOrder(
          baruTerlambat[0].nomorMeja ?? "-",
          baruTerlambat[0].lamaMenit
        )
      } else if (baruTerlambat.length > 1) {
        notifyStaleOrders(baruTerlambat.length)
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

  const total = items.length
  const adaTerlambat = items.some((i) => i.kind === "terlambat")

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) void refresh()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={total > 0 ? `Notifikasi, ${total} item` : "Notifikasi"}
          title="Notifikasi pesanan & stok"
          className="relative flex items-center gap-1 px-2 py-1 text-xs rounded transition hover:bg-gray-50 focus-visible:ring-0 focus-visible:ring-transparent active:bg-transparent data-[state=open]:bg-transparent"
        >
          <Bell
            className={`size-5 ${
              adaTerlambat
                ? "text-red-500"
                : total > 0
                  ? "text-slate-600"
                  : "text-gray-400"
            }`}
          />
          {total > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-white text-[10px] leading-4 font-semibold flex items-center justify-center ${
                adaTerlambat ? "bg-red-500" : "bg-slate-500"
              }`}
            >
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
          <p className="font-heading text-sm font-medium">Notifikasi</p>
          <span className="text-[10px] text-muted-foreground">
            {total > 0 ? `${total} perlu perhatian` : "Semua aman"}
          </span>
        </div>

        {loading ? (
          <div className="p-2">
            <ListSkeleton rows={3} itemHeight="h-12" className="space-y-2" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-6 px-3 text-center">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <p className="text-xs font-medium">Tidak ada notifikasi</p>
            <p className="text-[10px] text-muted-foreground">
              Semua pesanan & stok dalam kondisi aman
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {items.map((item) => (
              <NotifikasiRow key={item.id} item={item} />
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
