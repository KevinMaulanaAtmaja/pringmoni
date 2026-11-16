import { PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="space-y-4">
        <PageTitle className="text-4xl">Pringmoni</PageTitle>
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border p-6 space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
