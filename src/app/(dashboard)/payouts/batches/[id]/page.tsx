import { api } from '@/lib/api'
import { formatPHP } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'
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
import { BatchCsvButton } from './batch-csv-button'

interface BatchItem {
  id: string
  merchant_id: string
  amount_centavos: number
  account_name: string
  account_number: string
  bank_code: string | null
  method_type: string
  status: string
}

interface PayoutBatch {
  id: string
  status: string
  total_merchants: number
  total_amount_centavos: number
  notes: string | null
  created_at: string
  items: BatchItem[]
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const batch = await api.get<PayoutBatch>(`/admin/payouts/batches/${id}`)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/payouts/batches" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold">Batch {batch.id.slice(0, 8)}…</h1>
        <StatusBadge status={batch.status} type="merchant" />
        <div className="ml-auto">
          <BatchCsvButton batchId={id} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPHP(batch.total_amount_centavos)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{batch.total_merchants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {new Date(batch.created_at).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {batch.notes && (
        <p className="text-sm text-zinc-500 bg-zinc-50 rounded-md px-4 py-3 dark:bg-zinc-800">
          {batch.notes}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batch Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Bank Code</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/merchants/${item.merchant_id}`} className="hover:underline">
                      {item.merchant_id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{formatPHP(item.amount_centavos)}</TableCell>
                  <TableCell className="capitalize">{item.method_type}</TableCell>
                  <TableCell>{item.account_name}</TableCell>
                  <TableCell className="font-mono text-xs">{item.account_number}</TableCell>
                  <TableCell className="text-zinc-500">{item.bank_code ?? '—'}</TableCell>
                  <TableCell className="capitalize text-sm">{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
