"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { KategoriAnalisis } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Utensils } from "lucide-react"

const CATEGORY_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308", "#6366f1"]

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{d.name}</p>
      <p className="text-gray-600">{d.payload.terjual} terjual</p>
      <p>Rp {d.value.toLocaleString("id-ID")}</p>
    </div>
  )
}

export function PieKategori({ data, loading }: { data: KategoriAnalisis[]; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="h-full">
        <CardContent className="pt-4">
          <p className="text-center text-gray-500 py-12">Belum ada data kategori.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(d => ({
    name: d.namaKategori,
    value: d.totalPendapatan,
    terjual: d.totalTerjual,
  }))

  const totalPendapatan = data.reduce((s, d) => s + d.totalPendapatan, 0)

  return (
    <Card className="h-full">
      <CardContent className="pt-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          Kategori Menu
        </h3>
        <div className="flex flex-col items-center">
          <div className="w-44 h-44" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-2 space-y-1.5">
            {data.map((item, i) => (
              <div key={item.namaKategori} className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-gray-600 truncate">{item.namaKategori}</span>
                </div>
                <span className="font-medium text-gray-800 ml-2">
                  {item.persentase}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t w-full text-center">
            <p className="text-[11px] text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-800">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
