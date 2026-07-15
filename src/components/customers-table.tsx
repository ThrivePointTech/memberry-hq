'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  paymongo_customer_id: string | null
  created_at: string
}

interface CustomersTableProps {
  customers: Customer[]
}

export function PaymongoSyncBadge({ synced }: { synced: boolean }) {
  return (
    <Badge
      className={
        synced
          ? 'border-0 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'border-0 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }
    >
      {synced ? 'Synced' : 'Not synced'}
    </Badge>
  )
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? customers.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          (c.phone ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        )
      })
    : customers

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">
            All Customers ({filtered.length}{filtered.length !== customers.length ? ` of ${customers.length}` : ''})
          </CardTitle>
          <Input
            className="max-w-xs"
            placeholder="Search customers…"
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
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>PayMongo</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">{customer.phone ?? '—'}</TableCell>
                <TableCell className="text-zinc-500 text-sm">{customer.email ?? '—'}</TableCell>
                <TableCell>
                  <PaymongoSyncBadge synced={customer.paymongo_customer_id !== null} />
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {new Date(customer.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                  {query.trim() ? `No customers matching "${query}"` : 'No customers yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
