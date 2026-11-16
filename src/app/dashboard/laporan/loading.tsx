import {
  ChartBlockSkeleton,
  MiniCardsSkeleton,
  PageTitle,
  StatCardsSkeleton,
  ToolbarSkeleton,
} from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <PageTitle>Laporan &amp; Analitik</PageTitle>
      <div className="space-y-4">
        <ToolbarSkeleton />
        <StatCardsSkeleton variant="compact" />
        <ChartBlockSkeleton />
        <MiniCardsSkeleton />
      </div>
    </div>
  )
}
