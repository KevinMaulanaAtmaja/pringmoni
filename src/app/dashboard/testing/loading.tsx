import {
  CardGridSkeleton,
  PageTitle,
} from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <PageTitle>Whitebox Testing</PageTitle>
      <CardGridSkeleton
        title={false}
        cards={5}
        cardHeight="h-20"
        gridClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      />
      <CardGridSkeleton
        title={false}
        cards={4}
        cardHeight="h-32"
        gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  )
}
