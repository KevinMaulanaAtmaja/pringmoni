import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <TableSkeleton
      columns={8}
      rows={6}
      titleText="Stok Bahan"
      titleClassName="text-xl sm:text-2xl"
    />
  )
}
