"use client"

import { XCircle, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import type { AnalisisTambahan } from "@/types"

export function AnalisisTambahanCard({
  analisis,
  peakLabel,
  peakPesanan,
  loading,
}: {
  analisis: AnalisisTambahan
  peakLabel?: string | null
  peakPesanan?: number
  loading: boolean
}) {
  if (loading || !analisis.totalPesanan) return null

  const items = [
    {
      icon: ShoppingCart,
      label: "Rata-rata item per pesanan",
      value: `${analisis.rataItemPerPesanan} item`,
      bg: "bg-sky-50",
      text: "text-sky-700",
      iconBg: "bg-sky-100",
    },
    {
      icon: XCircle,
      label: "Pembatalan",
      value: `${analisis.cancelRate}% (${analisis.totalBatal}/${analisis.totalPesanan})`,
      bg: analisis.cancelRate > 5 ? "bg-red-50" : "bg-gray-50",
      text: analisis.cancelRate > 5 ? "text-red-700" : "text-gray-700",
      iconBg: analisis.cancelRate > 5 ? "bg-red-100" : "bg-gray-100",
    },
    peakLabel
      ? {
          icon: Clock,
          label: "Jam/hari puncak",
          value: `${peakLabel} (${peakPesanan} pesanan)`,
          bg: "bg-amber-50",
          text: "text-amber-700",
          iconBg: "bg-amber-100",
        }
      : null,
    {
      icon: TrendingUp,
      label: "Rata-rata pesanan per jam",
      value: `${(analisis.totalPesanan / 12).toFixed(0)} pesanan/jam`,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; bg: string; text: string; iconBg: string }[]

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Analisis Tambahan
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 border border-white/40`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`${item.iconBg} p-1 rounded-lg`}>
                  <Icon className={`w-3 h-3 ${item.text}`} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className={`text-sm font-bold ${item.text}`}>{item.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
