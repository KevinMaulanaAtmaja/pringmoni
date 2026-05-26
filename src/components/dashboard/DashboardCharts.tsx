"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from "recharts"
import { TrendingUp, Sofa, Utensils, Clock, CreditCard, Banknote, QrCode } from "lucide-react"

const METODE_COLORS: Record<string, string> = {
  tunai: "#f59e0b",
  qris: "#7c3aed",
  transfer: "#3b82f6",
}

const STATUS_COLORS: Record<string, string> = {
  menunggu: "#f59e0b",
  diproses: "#3b82f6",
  selesai: "#10b981",
  dibatalkan: "#ef4444",
}

interface ChartItem {
  label: string
  value: number
  nama?: string
  total?: number
}

interface MejaData {
  terpakai: number
  kosong: number
}

interface MetodePerJam {
  label: string
  tunai: number
  qris: number
  transfer: number
}

interface DashboardChartData {
  pendapatan7Hari?: ChartItem[]
  meja?: MejaData
  topMenu?: ChartItem[]
  metodePembayaran?: ChartItem[]
  pesananPerJam?: ChartItem[]
  statusPesanan?: ChartItem[]
  statusPembayaran?: ChartItem[]
  perbandinganMetode?: MetodePerJam[]
  statusAntarItem?: ChartItem[]
}

function formatRupiah(v: number) {
  if (v >= 1000000) return `Rp${(v / 1000000).toFixed(1)}jt`
  if (v >= 1000) return `Rp${(v / 1000).toFixed(0)}rb`
  return `Rp${v}`
}

interface TooltipItem {
  name: string
  value: number
  color: string
  payload: Record<string, unknown>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((d, i) => (
        <p key={i} style={{ color: d.color }} className="font-medium">
          {d.name}: {typeof d.value === 'number' && d.value > 1000 ? formatRupiah(d.value) : d.value}
        </p>
      ))}
    </div>
  )
}

function ensureData(arr: ChartItem[] | undefined): ChartItem[] {
  return arr && arr.length > 0 ? arr : [{ label: "", value: 0 }]
}

function ensureMetode(arr: MetodePerJam[] | undefined): MetodePerJam[] {
  return arr && arr.length > 0 ? arr : [{ label: "", tunai: 0, qris: 0, transfer: 0 }]
}

export function DashboardCharts({ charts: raw }: { charts: Record<string, unknown> }) {
  const charts = raw as unknown as DashboardChartData
  const entries = Object.entries(raw)
  if (entries.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {charts.pendapatan7Hari && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-700">Pendapatan 7 Hari</h3>
            </div>
            <div className="h-48" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ensureData(charts.pendapatan7Hari)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={formatRupiah} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Pendapatan" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {charts.meja && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Sofa className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">Status Meja</h3>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-gray-500">Terpakai</span>
                  <span className="font-semibold text-gray-800">{charts.meja.terpakai}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-500">Kosong</span>
                  <span className="font-semibold text-gray-800">{charts.meja.kosong}</span>
                </div>
              </div>
          </CardContent>
        </Card>
      )}

      {charts.topMenu !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-700">Menu Terlaris Hari Ini</h3>
            </div>
            <div className="h-48" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ensureData(charts.topMenu)} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#888" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis type="category" dataKey="nama" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Terjual">
                    {ensureData(charts.topMenu).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#f97316" : i === 1 ? "#fb923c" : i === 2 ? "#fdba74" : "#fed7aa"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {charts.metodePembayaran !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-gray-700">Metode Pembayaran</h3>
            </div>
            {charts.metodePembayaran.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada transaksi hari ini</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={charts.metodePembayaran} dataKey="value" nameKey="label" innerRadius={22} outerRadius={40} paddingAngle={2}>
                        {charts.metodePembayaran.map((m) => (
                          <Cell key={m.label} fill={METODE_COLORS[m.label] || "#888"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {charts.metodePembayaran.map((m) => {
                    const Icon = m.label === "tunai" ? Banknote : m.label === "qris" ? QrCode : CreditCard
                    const total = charts.metodePembayaran!.reduce((s, x) => s + x.value, 0)
                    const pct = total > 0 ? Math.round((m.value / total) * 100) : 0
                    return (
                      <div key={m.label} className="flex items-center gap-2 text-xs">
                        <Icon className="w-3 h-3" style={{ color: METODE_COLORS[m.label] }} />
                        <span className="text-gray-500 w-12 capitalize">{m.label}</span>
                        <span className="font-medium text-gray-800">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {charts.pesananPerJam !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">Pesanan Per Jam</h3>
            </div>
            <div className="h-48" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ensureData(charts.pesananPerJam)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} name="Pesanan" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {charts.statusPesanan !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700">Status Pesanan</h3>
            </div>
            <div className="space-y-2">
                {charts.statusPesanan.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada data pesanan hari ini</p>
                ) : (
                  charts.statusPesanan.map((m) => {
                    const labelMap: Record<string, string> = { menunggu: "Menunggu", diproses: "Diproses", selesai: "Selesai", dibatalkan: "Batal" }
                    return (
                      <div key={m.label} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[m.label] }} />
                        <span className="text-gray-500 w-16">{labelMap[m.label] || m.label}</span>
                        <span className="font-semibold text-gray-800">{m.value}</span>
                      </div>
                    )
                  })
                )}
              </div>
          </CardContent>
        </Card>
      )}

      {charts.statusPembayaran !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-700">Status Pembayaran</h3>
            </div>
            {charts.statusPembayaran.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data pembayaran hari ini</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={charts.statusPembayaran} dataKey="value" nameKey="label" innerRadius={22} outerRadius={40} paddingAngle={2}>
                        {charts.statusPembayaran.map((m) => {
                          const colorMap: Record<string, string> = { berhasil: "#10b981", menunggu: "#f59e0b", dibatalkan: "#ef4444" }
                          return <Cell key={m.label} fill={colorMap[m.label] || "#888"} />
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {charts.statusPembayaran.map((m) => {
                    const labelMap: Record<string, string> = { berhasil: "Berhasil", menunggu: "Menunggu", dibatalkan: "Batal" }
                    const colorMap: Record<string, string> = { berhasil: "#10b981", menunggu: "#f59e0b", dibatalkan: "#ef4444" }
                    const total = charts.statusPembayaran!.reduce((s, x) => s + x.value, 0)
                    const pct = total > 0 ? Math.round((m.value / total) * 100) : 0
                    return (
                      <div key={m.label} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorMap[m.label] || "#888" }} />
                        <span className="text-gray-500 w-16">{labelMap[m.label] || m.label}</span>
                        <span className="font-semibold text-gray-800">{m.value} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {charts.perbandinganMetode !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700">Perbandingan Metode Pembayaran Per Jam</h3>
            </div>
            {charts.perbandinganMetode.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-8 text-center">Belum ada data transaksi hari ini</p>
            ) : (
            <div className="h-48" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ensureMetode(charts.perbandinganMetode)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={formatRupiah} width={50} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="tunai" stackId="a" fill="#f59e0b" name="Tunai" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="qris" stackId="a" fill="#7c3aed" name="QRIS" />
                  <Bar dataKey="transfer" stackId="a" fill="#3b82f6" name="Transfer" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      {charts.statusAntarItem !== undefined && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-semibold text-gray-700">Status Antar Item</h3>
            </div>
            {charts.statusAntarItem.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada item dipesan hari ini</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={charts.statusAntarItem} dataKey="value" nameKey="label" innerRadius={22} outerRadius={40} paddingAngle={2}>
                        {charts.statusAntarItem.map((m) => {
                          const colorMap: Record<string, string> = { diantar: "#10b981", belum: "#f59e0b" }
                          return <Cell key={m.label} fill={colorMap[m.label] || "#888"} />
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {charts.statusAntarItem.map((m) => {
                    const labelMap: Record<string, string> = { diantar: "Sudah Diantar", belum: "Belum Diantar" }
                    const colorMap: Record<string, string> = { diantar: "#10b981", belum: "#f59e0b" }
                    const total = charts.statusAntarItem!.reduce((s, x) => s + x.value, 0)
                    const pct = total > 0 ? Math.round((m.value / total) * 100) : 0
                    return (
                      <div key={m.label} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorMap[m.label] || "#888" }} />
                        <span className="text-gray-500 w-28">{labelMap[m.label] || m.label}</span>
                        <span className="font-semibold text-gray-800">{m.value} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}