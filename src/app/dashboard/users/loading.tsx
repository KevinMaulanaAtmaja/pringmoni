import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function Loading() {
  return (
    <TableSkeleton
      columns={6}
      rows={6}
      titleText="Kelola Akun"
      titleClassName="text-lg"
    />
  )
}
