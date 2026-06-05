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

interface PayoutBatch {
  id: string
  status: string
  total_merchants: number
  total_amount_centavos: number
  notes: string | null
  created_at: string
  exported_at: string | null
  completed_at: string | null
}

export default async function BatchesPage() {
  const batches = await api.get<PayoutBatch[]>('/admin/payouts/batches')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/payouts" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold">Payout Batches</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Batches ({batches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Merchants</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Link
                      href={`/payouts/batches/${batch.id}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {batch.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={batch.status} type="merchant" />
                  </TableCell>
                  <TableCell>{batch.total_merchants}</TableCell>
                  <TableCell className="font-medium">{formatPHP(batch.total_amount_centavos)}</TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(batch.created_at).toLocaleDateString('en-PH')}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {batch.notes ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-400 py-8">
                    No batches yet
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
