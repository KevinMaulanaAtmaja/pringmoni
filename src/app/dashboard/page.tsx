import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats } from "@/app/actions/dashboard"
import { StatGrid } from "@/components/dashboard/StatGrid"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
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
      showMeja: true,
      showPesananDiproses: true,
    }
  }
  const role = session.user.role

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Dashboard {role === 'owner' ? 'Owner' : role === 'cashier' ? 'Kasir' : 'Waiter'}
      </h1>
      <StatGrid stats={stats} role={role} />
    </div>
  )
}
