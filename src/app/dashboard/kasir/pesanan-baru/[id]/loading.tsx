import { PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="text-center space-y-3">
        <PageTitle className="text-center text-2xl">Pembayaran</PageTitle>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
