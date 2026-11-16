import {
  CardGridSkeleton,
  FilterBarSkeleton,
  PageTitle,
} from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageTitle>Kelola Pesanan</PageTitle>
      <FilterBarSkeleton />
      <CardGridSkeleton
        title={false}
        cards={6}
        cardHeight="h-60"
        cardClassName="rounded-xl border-2"
        gridClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      />
    </div>
  )
}
