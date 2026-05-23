import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats, getDashboardCharts, getStaleOrders, autoCancelStaleUnpaid } from "@/app/actions/dashboard"
import { StatGrid } from "@/components/dashboard/StatGrid"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"
import { StaleOrdersWarning } from "@/components/dashboard/StaleOrdersWarning"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  if (role !== 'owner') {
    try {
      const { cancelled } = await autoCancelStaleUnpaid()
      if (cancelled > 0) {
        console.log(`Auto-cancelled ${cancelled} stale unpaid orders`)
      }
    } catch {}
  }

  let stats
  try {
    stats = await getDashboardStats()
  } catch {
    stats = {
      pesananHariIni: 0,
      totalPendapatan: 0,
      mejaKosong: 0,
      mejaTerpakai: 0,
      pesananMenunggu: 0,
      pesananDiproses: 0,
      itemTerjual: 0,
      showMeja: true,
      showPesananDiproses: true,
    }
  }

  let charts: Record<string, unknown> = {}
  try {
    charts = await getDashboardCharts()
  } catch {
    charts = {}
  }

  let staleOrders: Awaited<ReturnType<typeof getStaleOrders>> = []
  if (role !== 'owner') {
    try {
      staleOrders = await getStaleOrders()
    } catch {
      staleOrders = []
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Dashboard {role === 'owner' ? 'Owner' : role === 'cashier' ? 'Kasir' : 'Waiter'}
      </h1>
      {role !== 'owner' && <StaleOrdersWarning orders={staleOrders} />}
      <StatGrid stats={stats} role={role} />
      <DashboardCharts charts={charts} />
    </div>
  )
}
