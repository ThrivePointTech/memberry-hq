'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatPHP } from '@/lib/format'

interface MonthlyRevenue {
  year: number
  month: number
  total_amount_centavos: string
  total_net_centavos: string
  transaction_count: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    label: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
    gross: Number(d.total_amount_centavos) / 100,
    net: Number(d.total_net_centavos) / 100,
    transactions: d.transaction_count,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          className="fill-zinc-500"
        />
        <YAxis
          tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12 }}
          className="fill-zinc-500"
        />
        <Tooltip
          formatter={(value, name) => [
            formatPHP(Number(value) * 100),
            name === 'gross' ? 'Gross Revenue' : 'Net Revenue',
          ]}
        />
        <Bar dataKey="gross" name="gross" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="net" name="net" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
