"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GrafikPoint } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Clock } from "lucide-react"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-orange-600">Pesanan: {data.pesanan}</p>
      <p className="text-amber-600">Pendapatan: Rp {data.pendapatan.toLocaleString("id-ID")}</p>
    </div>
  )
}

const amberGradient = (value: number, max: number) => {
  const ratio = value / max
  if (ratio > 0.8) return "#d97706"
  if (ratio > 0.5) return "#f59e0b"
  if (ratio > 0.2) return "#fbbf24"
  return "#fcd34d"
}

function calcTicks(maxVal: number): { ticks: number[]; domainMax: number } {
  let step: number
  if (maxVal <= 10) step = 2
  else if (maxVal <= 30) step = 5
  else if (maxVal <= 60) step = 10
  else if (maxVal <= 150) step = 20
  else if (maxVal <= 300) step = 50
  else step = 100

  const maxTick = Math.ceil(maxVal / step) * step
  const domainMax = maxTick + step
  const ticks: number[] = []
  for (let v = 0; v <= domainMax; v += step) ticks.push(v)
  return { ticks, domainMax }
}

export function GrafikPeakHours({ data, loading }: { data: GrafikPoint[]; loading: boolean }) {
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

  if (!data.length) return null

  const maxPesanan = Math.max(...data.map(d => d.pesanan), 1)
  const jamSibuk = data.reduce((a, b) => (a.pesanan > b.pesanan ? a : b))
  const { ticks, domainMax } = calcTicks(maxPesanan)

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Jam Sibuk (Peak Hours)</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
            <Clock className="w-3 h-3" />
            Puncak: {jamSibuk.label} ({jamSibuk.pesanan} pesanan)
          </div>
        </div>
        <div className="h-64" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#888" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#888" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}`}
                domain={[0, domainMax]}
                ticks={ticks}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="pesanan" radius={[4, 4, 0, 0]} barSize={12}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={amberGradient(entry.pesanan, maxPesanan)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
