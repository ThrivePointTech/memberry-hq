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
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null)

  function close() {
    setOpen(false)
    setError(null)
    setAuthorizationUrl(null)
  }

  async function handleSimulate() {
    setSubmitting(true)
    setError(null)
    setAuthorizationUrl(null)
    try {
      const res = await fetch(
        `/api/customers/${customerId}/subscriptions/${subscriptionId}/simulate-renewal`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      )
      const body = await res.json()
      if (!res.ok) {
        setError(body?.message ?? 'Failed to simulate renewal.')
        return
      }
      const authUrl = body?.data?.authorization_required as string | null | undefined
      if (authUrl) {
        // First-ever charge on this subscription — PayMongo test mode
        // requires a one-time manual Authorize click, no headless bypass.
        setAuthorizationUrl(authUrl)
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
            Dev-only: triggers a renewal charge against this subscription — an on-demand
            charge for on-demand plans, or PayMongo&apos;s test-cycle (next billing cycle)
            for scheduled plans. The very first charge on a subscription needs a
            one-time manual authorization (PayMongo test mode has no headless bypass for
            e-wallets); every renewal after that completes automatically.
          </p>
          {authorizationUrl && (
            <p className="text-sm text-zinc-600">
              One-time authorization needed:{' '}
              <a
                href={authorizationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                open and click Authorize
              </a>
              , then run Simulate Renewal again to confirm the payment went through.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              {authorizationUrl ? 'Close' : 'Cancel'}
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
