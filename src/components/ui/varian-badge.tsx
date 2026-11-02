import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'

interface VarianBadgeProps {
  varian: string | null | undefined
  className?: string
}

export function VarianBadge({ varian, className }: VarianBadgeProps) {
  if (!varian) return null
  return (
    <Badge variant='outline' className={cn('text-[10px] px-1.5 py-0 h-4 border-blue-200 text-blue-700 bg-blue-50', className)}>
      {varian}
    </Badge>
  )
}
