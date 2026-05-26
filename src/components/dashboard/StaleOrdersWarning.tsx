"use client"

import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { StaleOrder } from "@/app/actions/dashboard"

function formatDurasi(menit: number) {
  if (menit >= 60) {
    const j = Math.floor(menit / 60)
    const m = menit % 60
    return m > 0 ? `${j}j ${m}m` : `${j}j`
  }
  return `${menit}m`
}

export function StaleOrdersWarning({ orders }: { orders: StaleOrder[] }) {
  if (orders.length === 0) return null

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-xs font-bold text-amber-700 tracking-wide">
          &gt;30 Menit — {orders.length} pesanan
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {orders.map(o => (
          <Link
            key={o.id}
            href={`/dashboard/pesanan/${o.id}`}
            className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium text-xs px-2 py-1 rounded-full transition"
          >
            <span>Meja {o.nomorMeja}</span>
            <span className="text-[10px] text-amber-600">({formatDurasi(o.lamaMenit)})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ))}
      </div>
    </div>
  )
}