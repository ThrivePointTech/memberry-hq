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

interface SubscriptionSimulateRenewalActionProps {
  customerId: string
  subscriptionId: string
}

export function SubscriptionSimulateRenewalAction({
  customerId,
  subscriptionId,
}: SubscriptionSimulateRenewalActionProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    setOpen(false)
    setError(null)
  }

  async function handleSimulate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/customers/${customerId}/subscriptions/${subscriptionId}/simulate-renewal`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Failed to simulate renewal.')
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Simulate Renewal
      </Button>

      <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulate a renewal for this subscription?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            Dev-only: fires an on-demand PayMongo charge against this subscription and
            auto-pays it with a test card. Only works if the subscription&apos;s plan was
            created as an on-demand plan — otherwise PayMongo will return an error.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSimulate} disabled={submitting}>
              {submitting ? 'Simulating…' : 'Simulate renewal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
