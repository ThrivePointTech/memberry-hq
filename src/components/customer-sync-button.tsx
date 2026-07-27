'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface CustomerSyncButtonProps {
  customerId: string
}

export function CustomerSyncButton({ customerId }: CustomerSyncButtonProps) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${customerId}/sync-paymongo`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'PayMongo sync failed.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" onClick={handleSync} disabled={syncing}>
        {syncing ? 'Syncing…' : 'Sync to PayMongo'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
