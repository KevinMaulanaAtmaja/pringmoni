import { PageTitle } from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border p-6">
        <PageTitle className="text-center text-2xl">Pringmoni</PageTitle>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
