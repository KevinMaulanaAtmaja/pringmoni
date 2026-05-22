"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Banknote, CreditCard, QrCode } from "lucide-react"

const COLORS = {
  tunai: "#f59e0b",
  qris: "#7c3aed",
  transfer: "#3b82f6",
}

interface PieMetodeProps {
  tunai: number
  qris: number
  transfer: number
}

function formatRupiah(v: number) {
  if (v >= 1000000) return `Rp${(v / 1000000).toFixed(1)}jt`
  if (v >= 1000) return `Rp${(v / 1000).toFixed(0)}rb`
  return `Rp${v}`
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{d.name}</p>
      <p>Rp {d.value.toLocaleString("id-ID")}</p>
    </div>
  )
}

export function PieMetode({ tunai, qris, transfer }: PieMetodeProps) {
  const total = tunai + qris + transfer
  if (total === 0) return null

  const data = [
    { name: "Tunai", value: tunai, color: COLORS.tunai },
    { name: "QRIS", value: qris, color: COLORS.qris },
    { name: "Transfer", value: transfer, color: COLORS.transfer },
  ].filter(d => d.value > 0)

  const items = [
    { label: "Tunai", value: tunai, color: COLORS.tunai, icon: Banknote },
    { label: "QRIS", value: qris, color: COLORS.qris, icon: QrCode },
    { label: "Transfer", value: transfer, color: COLORS.transfer, icon: CreditCard },
  ]

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 shrink-0" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={38}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-1.5">
        {items.map(item => {
          const Icon = item.icon
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <Icon className="w-3 h-3" style={{ color: item.color }} />
              <span className="text-gray-500 w-14">{item.label}</span>
              <span className="font-medium text-gray-800">{pct}%</span>
              <span className="text-gray-400">{formatRupiah(item.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
