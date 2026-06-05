import { api } from '@/lib/api'
import { formatPHP, formatNumber } from '@/lib/format'
import { StatCard } from '@/components/stat-card'
import { RevenueChart } from '@/components/revenue-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Store,
  Users,
  TrendingUp,
  CreditCard,
  Activity,
} from 'lucide-react'

interface PlatformOverview {
  total_merchants: number
  active_merchants: number
  pending_merchants: number
  suspended_merchants: number
  total_subscriptions: number
  active_subscriptions: number
  total_revenue_centavos: string
  revenue_this_month_centavos: string
  total_transactions: number
}

interface MonthlyRevenue {
  year: number
  month: number
  total_amount_centavos: string
  total_net_centavos: string
  transaction_count: number
}

interface SubscriptionCounts {
  active: number
  expired: number
  cancelled: number
  past_due: number
  pending: number
}

export default async function DashboardPage() {
  const [overview, revenue, subscriptions] = await Promise.all([
    api.get<PlatformOverview>('/admin/analytics/overview'),
    api.get<MonthlyRevenue[]>('/admin/analytics/revenue?months=12'),
    api.get<SubscriptionCounts>('/admin/analytics/subscriptions'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Merchants"
          value={formatNumber(overview.total_merchants)}
          icon={Store}
          subtext={`${overview.active_merchants} active`}
        />
        <StatCard
          label="Active Subscriptions"
          value={formatNumber(overview.active_subscriptions)}
          icon={Users}
          subtext={`${formatNumber(overview.total_subscriptions)} total`}
        />
        <StatCard
          label="Total Revenue"
          value={formatPHP(overview.total_revenue_centavos)}
          icon={TrendingUp}
          subtext={`${formatPHP(overview.revenue_this_month_centavos)} this month`}
        />
        <StatCard
          label="Transactions"
          value={formatNumber(overview.total_transactions)}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriptions by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(subscriptions).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm capitalize text-zinc-600 dark:text-zinc-400">
                  {status.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium">{formatNumber(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} />
              Merchant Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Active</span>
              <span className="font-medium text-green-600">{overview.active_merchants}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Pending</span>
              <span className="font-medium text-yellow-600">{overview.pending_merchants}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Suspended</span>
              <span className="font-medium text-red-600">{overview.suspended_merchants}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
