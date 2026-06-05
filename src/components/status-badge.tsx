import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const merchantStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const subscriptionStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  cancelled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  past_due: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

interface StatusBadgeProps {
  status: string
  type?: 'merchant' | 'subscription'
}

export function StatusBadge({ status, type = 'merchant' }: StatusBadgeProps) {
  const colorMap = type === 'merchant' ? merchantStatusColors : subscriptionStatusColors
  const colorClass = colorMap[status] ?? 'bg-zinc-100 text-zinc-600'

  return (
    <Badge className={cn('capitalize border-0 text-xs', colorClass)}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
