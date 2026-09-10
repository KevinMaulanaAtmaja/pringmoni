"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GrafikPoint } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function formatRupiah(v: number) {
  if (v >= 1000000) return `Rp${(v / 1000000).toFixed(1)}jt`
  if (v >= 1000) return `Rp${(v / 1000).toFixed(0)}rb`
  return `Rp${v}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-emerald-600">Pendapatan: Rp {data.pendapatan.toLocaleString("id-ID")}</p>
      <p className="text-blue-600">Pesanan: {data.pesanan}</p>
    </div>
  )
}

export function GrafikPendapatan({ data, loading }: { data: GrafikPoint[]; loading: boolean }) {
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
          <p className="text-center text-gray-500 py-8">Belum ada data grafik.</p>
        </CardContent>
      </Card>
    )
  }

  const maxPendapatan = Math.max(...data.map(d => d.pendapatan), 1)
  const barSize = Math.max(8, Math.min(40, 400 / data.length))
  const highestTick = Math.ceil(maxPendapatan / 50000) * 50000
  const ticks: number[] = []
  for (let v = 0; v <= highestTick + 50000; v += 50000) ticks.push(v)

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-semibold mb-4">Tren Pendapatan</h3>
        <div className="h-64" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                interval={data.length <= 31 ? 0 : "preserveStartEnd"}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatRupiah}
                domain={[0, highestTick + 50000]}
                ticks={ticks}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="pendapatan" radius={[4, 4, 0, 0]} barSize={barSize}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pendapatan === maxPendapatan ? "#059669" : "#10b981"}
                    fillOpacity={entry.pendapatan === maxPendapatan ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
