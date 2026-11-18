import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <TableSkeleton
      columns={7}
      rows={6}
      titleText="Kelola Meja"
      titleClassName="text-lg"
    />
  )
}
