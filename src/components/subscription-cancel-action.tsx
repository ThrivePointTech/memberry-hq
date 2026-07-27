'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const CANCELLABLE_STATUSES = new Set(['active', 'past_due', 'pending'])

interface SubscriptionCancelActionProps {
  customerId: string
  subscriptionId: string
  status: string
}

export function SubscriptionCancelAction({ customerId, subscriptionId, status }: SubscriptionCancelActionProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!CANCELLABLE_STATUSES.has(status)) return null

  function close() {
    setOpen(false)
    setError(null)
  }

  async function handleCancel() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${customerId}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Failed to cancel subscription.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        Cancel
      </Button>

      <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this subscription?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            This stops billing immediately and cannot be undone. Any remaining rollover
            allowance will follow the plan&apos;s rollover rules.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Keep subscription
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={handleCancel}
              disabled={submitting}
            >
              {submitting ? 'Cancelling…' : 'Cancel subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
