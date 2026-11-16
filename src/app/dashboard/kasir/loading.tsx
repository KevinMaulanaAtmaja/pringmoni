import { PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageTitle>Kelola Kasir</PageTitle>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-12 w-44 rounded-lg" />
        <Skeleton className="h-12 w-44 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border-2 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
