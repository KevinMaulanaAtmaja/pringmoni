import { StatCard } from "./StatCard"
import { ClipboardList, DollarSign, Sofa, Clock, Loader2, ShoppingCart } from "lucide-react"
import type { RoleUser } from "@/types"

interface StatGridProps {
  stats: {
    pesananHariIni: number
    totalPendapatan?: number
    mejaKosong?: number
    mejaTerpakai?: number
    pesananMenunggu: number
    pesananDiproses?: number
    itemTerjual?: number
    showMeja?: boolean
    showPendapatan?: boolean
    showPesananDiproses?: boolean
  }
  role?: RoleUser
}

export function StatGrid({ stats, role }: StatGridProps) {
  const cards = []

  cards.push(
    <StatCard
      key="pesanan"
      title="Pesanan Hari Ini"
      value={stats.pesananHariIni}
      icon={ClipboardList}
    />
  )

  if (stats.showPendapatan !== false && role !== 'waiter') {
    cards.push(
      <StatCard
        key="pendapatan"
        title="Pendapatan Hari Ini"
        value={`Rp ${(stats.totalPendapatan || 0).toLocaleString('id-ID')}`}
        icon={DollarSign}
      />
    )
  }

  if (stats.showMeja !== false && role === 'owner') {
    cards.push(
      <StatCard
        key="meja"
        title="Menu Terjual"
        value={stats.itemTerjual || 0}
        icon={ShoppingCart}
      />
    )
  }

  cards.push(
    <StatCard
      key="menunggu"
      title="Pesanan Menunggu"
      value={stats.pesananMenunggu}
      icon={Clock}
    />
  )

  if (stats.showPesananDiproses && role === 'waiter') {
    cards.push(
      <StatCard
        key="diproses"
        title="Sedang Diproses"
        value={stats.pesananDiproses || 0}
        icon={Loader2}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards}
    </div>
  )
}
