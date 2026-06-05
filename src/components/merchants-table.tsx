'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { MerchantStatusMenu } from '@/components/merchant-status-menu'

interface Merchant {
  id: string
  name: string
  status: 'active' | 'pending' | 'suspended'
  created_at: string
}

interface MerchantsTableProps {
  merchants: Merchant[]
}

export function MerchantsTable({ merchants }: MerchantsTableProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? merchants.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : merchants

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">
            All Merchants ({filtered.length}{filtered.length !== merchants.length ? ` of ${merchants.length}` : ''})
          </CardTitle>
          <Input
            className="max-w-xs"
            placeholder="Search merchants…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>
                  <Link href={`/merchants/${merchant.id}`} className="font-medium hover:underline">
                    {merchant.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={merchant.status} type="merchant" />
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {new Date(merchant.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <MerchantStatusMenu merchantId={merchant.id} currentStatus={merchant.status} />
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                  {query.trim() ? `No merchants matching "${query}"` : 'No merchants yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
