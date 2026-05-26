"use client"

import { TrendingUp, TrendingDown, Minus, Wallet, ClipboardList } from "lucide-react"
import type { PerbandinganData } from "@/types"

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v)
}

export function PerbandinganCard({ data, loading }: { data: PerbandinganData | null; loading: boolean }) {
  if (loading || !data) return null

  const growthColor = data.growthPendapatan > 0
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : data.growthPendapatan < 0
    ? "text-red-600 bg-red-50 border-red-200"
    : "text-gray-600 bg-gray-50 border-gray-200"

  const GrowthIcon = data.growthPendapatan > 0 ? TrendingUp : data.growthPendapatan < 0 ? TrendingDown : Minus
  const growthAbs = Math.abs(data.growthPendapatan)

  const growthPesananColor = data.growthPesanan > 0
    ? "text-blue-600"
    : data.growthPesanan < 0
    ? "text-red-600"
    : "text-gray-600"

  return (
    <div className="bg-white rounded-xl border shadow-sm px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Wallet className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Pendapatan</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {formatRupiah(data.nominalSekarang)}
              </span>
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium border ${growthColor}`}>
                <GrowthIcon className="w-3 h-3" />
                {data.growthPendapatan > 0 ? "+" : ""}{growthAbs}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {data.periodeSebelumnya}: {formatRupiah(data.nominalSebelumnya)}
            </p>
          </div>
        </div>

        <div className="w-px h-10 bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <ClipboardList className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Pesanan</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {data.pesananSekarang}
              </span>
              <span className={`text-[11px] font-medium ${growthPesananColor}`}>
                {data.growthPesanan > 0 ? "+" : ""}{data.growthPesanan}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {data.periodeSebelumnya}: {data.pesananSebelumnya}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
