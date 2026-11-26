import { CardGridSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <CardGridSkeleton
      cards={2}
      cardHeight="h-40"
      gridClassName="grid grid-cols-1 gap-3 md:grid-cols-2"
      cardClassName="rounded-lg"
      className="max-w-6xl mx-auto"
      titleText="Shift"
    />
  )
}
