import {
  CardGridSkeleton,
  PageTitle,
  TableSkeleton,
} from "@/components/ui/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <PageTitle>Detail Pesanan</PageTitle>
      </div>
      <CardGridSkeleton
        title={false}
        cards={2}
        cardHeight="h-96"
        gridClassName="grid grid-cols-1 gap-6 md:grid-cols-2"
      />
      <TableSkeleton columns={6} rows={4} />
    </div>
  )
}
