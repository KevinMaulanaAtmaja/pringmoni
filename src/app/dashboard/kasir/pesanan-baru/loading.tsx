import { PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <PageTitle>Buat Pesanan Baru</PageTitle>
      </div>
      <div className="flex gap-2 mb-3 shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="w-96 rounded-2xl border flex flex-col min-h-0">
          <div className="p-3 border-b">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1 p-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="border-t p-3">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
