"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { MenuTerlaris } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{data.namaMenu}</p>
      <p className="text-emerald-600">{data.totalTerjual} terjual</p>
      <p className="text-gray-600">Pendapatan: Rp {data.totalPendapatan.toLocaleString("id-ID")}</p>
    </div>
  )
}

export function GrafikMenu({ data, loading }: { data: MenuTerlaris[]; loading: boolean }) {
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
      <Card>
        <CardContent className="pt-4">
          <p className="text-center text-gray-500 py-8">Belum ada data menu terjual.</p>
        </CardContent>
      </Card>
    )
  }

  const top10 = data.slice(0, 10)
  const maxTerjual = Math.max(...top10.map(d => d.totalTerjual), 1)

  const chartData = top10.map(d => ({
    ...d,
    namaPendek: d.namaMenu.length > 20 ? d.namaMenu.slice(0, 19) + ".." : d.namaMenu,
  })).reverse()

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-semibold mb-1">Grafik Menu Terlaris</h3>
        <p className="text-[11px] text-gray-400 mb-4">Top {Math.min(10, data.length)} menu berdasarkan jumlah terjual</p>
        <div className="h-80" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="namaPendek"
                tick={{ fontSize: 10, fill: "#555" }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="totalTerjual" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
