import { api } from '@/lib/api'
import { formatPHP } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'
import { PaymongoSyncBadge } from '@/components/customers-table'
import { CustomerSyncButton } from '@/components/customer-sync-button'
import { SubscriptionCancelAction } from '@/components/subscription-cancel-action'
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
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  period_start: string
  period_end: string
  created_at: string
  plan_name: string | null
  plan_price_centavos: number | null
  merchant_name: string | null
}

interface Transaction {
  id: string
  amount_centavos: number | string
  status: string
  provider: string
  created_at: string
  plan_name: string | null
  merchant_name: string | null
}

interface CustomerDetail {
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    paymongo_customer_id: string | null
    created_at: string
  }
  subscriptions: Subscription[]
  transactions: Transaction[]
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(id)) notFound()

  const detail = await api.get<CustomerDetail>(`/admin/customers/${id}`)
  const { customer, subscriptions, transactions } = detail
  const synced = customer.paymongo_customer_id !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold">{customer.name}</h1>
        <PaymongoSyncBadge synced={synced} />
        {!synced && (
          <div className="ml-auto">
            <CustomerSyncButton customerId={customer.id} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">Phone</p>
            <p className="text-sm font-medium">{customer.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Email</p>
            <p className="text-sm font-medium">{customer.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Address</p>
            <p className="text-sm font-medium">{customer.address ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Joined</p>
            <p className="text-sm font-medium">{formatDate(customer.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">PayMongo Customer ID</p>
            <p className="text-sm font-medium">{customer.paymongo_customer_id ?? 'Not synced'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {subscriptions.length === 0 ? (
            <p className="text-center text-zinc-400 py-8 text-sm">No subscriptions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.plan_name ?? '—'}</TableCell>
                    <TableCell className="text-zinc-500 text-sm">{sub.merchant_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">
                      {sub.plan_price_centavos !== null ? formatPHP(sub.plan_price_centavos) : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} type="subscription" />
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatDate(sub.period_start)} – {formatDate(sub.period_end)}
                    </TableCell>
                    <TableCell className="text-right">
                      <SubscriptionCancelAction customerId={customer.id} subscriptionId={sub.id} status={sub.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-center text-zinc-400 py-8 text-sm">No transactions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-zinc-500 text-sm">{formatDate(tx.created_at)}</TableCell>
                    <TableCell className="font-medium">{tx.plan_name ?? '—'}</TableCell>
                    <TableCell className="text-zinc-500 text-sm">{tx.merchant_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">{formatPHP(tx.amount_centavos)}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} type="transaction" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
