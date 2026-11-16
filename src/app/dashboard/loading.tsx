import { PageSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <PageSkeleton
      statCards={4}
      chartCards={4}
      titleText="Dashboard Owner"
      titleClassName="capitalize"
    />
  )
}
