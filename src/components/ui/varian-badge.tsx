import { Flame, Snowflake } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VarianBadgeProps {
  varian: string
  className?: string
}

export function VarianBadge({ varian, className }: VarianBadgeProps) {
  const nilai = varian.trim().toLowerCase()
  const dingin = nilai === "dingin"
  const panas = nilai === "panas"

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[10px] font-semibold uppercase tracking-wide",
        dingin && "border-blue-200 bg-blue-50 text-blue-700",
        panas && "border-red-200 bg-red-50 text-red-700",
        !dingin && !panas && "border-muted bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {dingin && <Snowflake className="size-2.5" />}
      {panas && <Flame className="size-2.5" />}
      {varian}
    </Badge>
  )
}
