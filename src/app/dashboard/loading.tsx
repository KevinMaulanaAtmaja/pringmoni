import { PageSkeleton, PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import type { RoleUser } from "@/types"

const ROLE_SKELETON: Record<Exclude<RoleUser, "waiter">, { title: string; statCards: number; chartCards: number }> = {
  owner: { title: "Dashboard Owner", statCards: 4, chartCards: 4 },
  cashier: { title: "Dashboard Kasir", statCards: 3, chartCards: 2 },
  kitchen: { title: "Dashboard Kitchen", statCards: 3, chartCards: 0 },
  gudang: { title: "Dashboard Gudang", statCards: 2, chartCards: 0 },
}

function StatCardSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-2xl bg-card px-6 py-6 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
      <Skeleton className="mt-6 h-9 w-24" />
    </div>
  )
}

function WaiterDashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      <PageTitle>Dashboard Waiter</PageTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton title="Pesanan Hari Ini" />
        <StatCardSkeleton title="Pesanan Menunggu" />
        <StatCardSkeleton title="Sedang Diproses" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-card px-6 py-4 ring-1 ring-foreground/10">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Pesanan Per Jam</h3>
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="rounded-2xl bg-card px-6 py-4 ring-1 ring-foreground/10">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Status Antar Item</h3>
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function Loading() {
  let role: RoleUser = "owner"
  try {
    const session = await auth()
    if (session?.user?.role) role = session.user.role
  } catch {}

  if (role === "waiter") return <WaiterDashboardSkeleton />

  const preset = ROLE_SKELETON[role] ?? ROLE_SKELETON.owner

  return (
    <PageSkeleton
      statCards={preset.statCards}
      chartCards={preset.chartCards}
      titleText={preset.title}
      titleClassName="capitalize"
    />
  )
}
