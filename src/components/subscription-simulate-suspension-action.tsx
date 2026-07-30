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

interface SubscriptionSimulateSuspensionActionProps {
  customerId: string
  subscriptionId: string
}

export function SubscriptionSimulateSuspensionAction({
  customerId,
  subscriptionId,
}: SubscriptionSimulateSuspensionActionProps) {
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
        `/api/customers/${customerId}/subscriptions/${subscriptionId}/simulate-suspension`,
        { method: 'POST' },
      )
      const body = await res.json()
      if (!res.ok) {
        setError(body?.message ?? 'Failed to simulate suspension.')
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
        Simulate Suspension
      </Button>

      <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulate a suspension for this subscription?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            Dev-only: flips this subscription to <code>past_due</code> directly in our
            database, without calling PayMongo. PayMongo has no suspend/pause endpoint, and
            once a subscription is activated there&apos;s no documented way to force its
            saved payment method to fail on renewal — so this simulates the local effect of
            a failed renewal. Use &quot;Simulate Renewal&quot; afterwards to exercise the real
            reactivation path (on-demand charge → webhook → active).
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSimulate} disabled={submitting}>
              {submitting ? 'Simulating…' : 'Simulate suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
