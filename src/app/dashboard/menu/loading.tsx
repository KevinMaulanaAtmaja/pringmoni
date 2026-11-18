import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <TableSkeleton
      columns={8}
      rows={6}
      titleText="Kelola Menu"
      titleClassName="text-lg"
    />
  )
}
