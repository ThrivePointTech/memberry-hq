import { api } from '@/lib/api'
import { formatPHP } from '@/lib/format'
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

interface MerchantBalance {
  merchant_id: string
  merchant_name: string
  payable_centavos: string
  payout_account: {
    method_type: string
    account_name: string
    account_number: string
    bank_code: string | null
  } | null
}

interface PayoutBatch {
  id: string
  status: string
  total_merchants: number
  total_amount_centavos: number
  created_at: string
}

export default async function PayoutsPage() {
  const [balances, batches] = await Promise.all([
    api.get<MerchantBalance[]>('/admin/payouts/balances'),
    api.get<PayoutBatch[]>('/admin/payouts/batches'),
  ])

  const totalPayable = balances.reduce(
    (sum, b) => sum + Number(b.payable_centavos),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payouts</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Total Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPHP(totalPayable)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Merchants with Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{balances.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merchant Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Payable Balance</TableHead>
                <TableHead>Payout Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Bank Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((b) => (
                <TableRow key={b.merchant_id}>
                  <TableCell>
                    <Link
                      href={`/merchants/${b.merchant_id}`}
                      className="font-medium hover:underline"
                    >
                      {b.merchant_name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPHP(b.payable_centavos)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {b.payout_account?.method_type ?? <span className="text-zinc-400">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {b.payout_account ? (
                      <div>
                        <p className="font-medium">{b.payout_account.account_name}</p>
                        <p className="text-zinc-400">{b.payout_account.account_number}</p>
                      </div>
                    ) : (
                      <span className="text-zinc-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {b.payout_account?.bank_code ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
              {balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                    No pending balances
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Payout Batches</h2>
        <Link href="/payouts/batches" className="text-sm text-zinc-500 hover:text-zinc-900">
          View all
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Merchants</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.slice(0, 5).map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Link
                      href={`/payouts/batches/${batch.id}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {batch.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">{batch.status}</TableCell>
                  <TableCell>{batch.total_merchants}</TableCell>
                  <TableCell>{formatPHP(batch.total_amount_centavos)}</TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(batch.created_at).toLocaleDateString('en-PH')}
                  </TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 py-6">
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
