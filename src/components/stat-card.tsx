import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtext?: string
}

export function StatCard({ label, value, icon: Icon, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {subtext && <p className="text-xs text-zinc-400">{subtext}</p>}
          </div>
          <div className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
            <Icon size={18} className="text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
