import { api } from '@/lib/api'
import { formatPHP, formatNumber } from '@/lib/format'
import { RevenueChart } from '@/components/revenue-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MonthlyRevenue {
  year: number
  month: number
  total_amount_centavos: string
  total_net_centavos: string
  transaction_count: number
}

interface Transaction {
  id: string
  amount_centavos: number
  net_centavos: number
  status: string
  created_at: string
}

interface Merchant {
  id: string
  name: string
}

export default async function MerchantEarningsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [merchantDetail, revenueData, transactions] = await Promise.all([
    api.get<{ merchant: Merchant }>(`/admin/merchants/${id}/detail`),
    api.get<MonthlyRevenue>(`/transactions/monthly-revenue/${id}`),
    api.get<Transaction[]>(`/transactions/by-merchant/${id}`),
  ])
  const merchant = merchantDetail.merchant

  const totalGross = revenueData.total_amount_centavos
  const totalNet = revenueData.total_net_centavos

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/merchants/${id}`} className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold">{merchant.name} — Earnings</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Total Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPHP(totalGross)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Total Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPHP(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.transaction_count > 0 ? (
            <RevenueChart data={[revenueData]} />
          ) : (
            <p className="text-sm text-zinc-400 text-center py-8">No revenue data yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 50).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(tx.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{formatPHP(tx.amount_centavos)}</TableCell>
                  <TableCell>{formatPHP(tx.net_centavos)}</TableCell>
                  <TableCell className="capitalize text-sm">{tx.status}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-6">
                    No transactions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
