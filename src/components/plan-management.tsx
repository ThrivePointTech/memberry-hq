'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { QrTile } from '@/components/qr-tile'
import { formatPHP } from '@/lib/format'
import { Textarea } from '@/components/ui/textarea'

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  yearly: 'Yearly',
}

const ALLOWANCE_TYPE_LABELS: Record<string, string> = {
  weight_kg: 'Weight (kg)',
  count: 'Count',
  unlimited: 'Unlimited',
}

function encodePlanQr(merchantId: string, planId: string, planName: string): string {
  const payload = JSON.stringify({ merchant_id: merchantId, plan_id: planId, plan_name: planName })
  const bytes = new TextEncoder().encode(payload)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

interface Plan {
  id: string
  name: string
  price_centavos: number
  billing_cycle: string
  allowance_type: string
  allowance_amount: string | null
  description: string | null
  tags: string[] | null
  status: string
  paymongo_plan_id: string | null
}

interface PlanManagementProps {
  plans: Plan[]
  merchantId: string
}

interface PlanFormState {
  name: string
  price: string
  billing_cycle: string
  allowance_type: string
  allowance_amount: string
  description: string
  tags: string
}

const EMPTY_FORM: PlanFormState = {
  name: '',
  price: '',
  billing_cycle: 'monthly',
  allowance_type: 'weight_kg',
  allowance_amount: '',
  description: '',
  tags: '',
}

function planToForm(plan: Plan): PlanFormState {
  return {
    name: plan.name,
    price: (plan.price_centavos / 100).toFixed(2),
    billing_cycle: plan.billing_cycle,
    allowance_type: plan.allowance_type,
    allowance_amount: plan.allowance_amount ?? '',
    description: plan.description ?? '',
    tags: plan.tags ? plan.tags.join(', ') : '',
  }
}

export function PlanManagement({ plans, merchantId }: PlanManagementProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Plan | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Plan | null>(null)
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  function openCreate() {
    setForm(EMPTY_FORM)
    setError(null)
    setCreateOpen(true)
  }

  function openEdit(plan: Plan) {
    setForm(planToForm(plan))
    setError(null)
    setEditTarget(plan)
  }

  function closeDialogs() {
    setCreateOpen(false)
    setEditTarget(null)
    setArchiveTarget(null)
    setError(null)
  }

  function setField<K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const priceCentavos = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceCentavos) || priceCentavos <= 0) {
      setError('Enter a valid price.')
      setSubmitting(false)
      return
    }

    const body = {
      name: form.name.trim(),
      price_centavos: priceCentavos,
      allowance_type: form.allowance_type,
      allowance_amount: form.allowance_type !== 'unlimited' ? form.allowance_amount || null : null,
      description: form.description.trim() || null,
      tags: form.tags.trim()
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : null,
      ...(createOpen ? { merchant_id: merchantId, billing_cycle: form.billing_cycle } : {}),
    }

    const url = createOpen ? '/api/plans' : `/api/plans/${editTarget!.id}`
    const method = createOpen ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Something went wrong.')
        return
      }
      closeDialogs()
      router.refresh()
    } catch (error) {
      console.error('Error: ', error);
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/plans/${archiveTarget.id}/archive`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Something went wrong.')
        return
      }
      closeDialogs()
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSync(plan: Plan) {
    setSyncingId(plan.id)
    setSyncError(null)
    try {
      const res = await fetch(`/api/plans/${plan.id}/sync-paymongo`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncError(data?.message ?? 'PayMongo sync failed.')
        return
      }
      router.refresh()
    } catch {
      setSyncError('Network error. Please try again.')
    } finally {
      setSyncingId(null)
    }
  }

  const formOpen = createOpen || editTarget !== null
  const formTitle = createOpen ? 'Add Plan' : 'Edit Plan'
  const activePlans = plans.filter((p) => p.status !== 'archived')
  const archivedPlans = plans.filter((p) => p.status === 'archived')

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Plans</h2>
        <Button size="sm" onClick={openCreate}>Add Plan</Button>
      </div>

      {syncError && <p className="text-sm text-red-600">{syncError}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PayMongo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{formatPHP(plan.price_centavos)}</TableCell>
                  <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                  <TableCell className="capitalize">{plan.allowance_type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <StatusBadge status={plan.status} type="merchant" />
                  </TableCell>
                  <TableCell>
                    {plan.paymongo_plan_id ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Not synced
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      {!plan.paymongo_plan_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(plan)}
                          disabled={syncingId !== null}
                        >
                          {syncingId === plan.id ? 'Syncing…' : 'Sync'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setArchiveTarget(plan)}
                      >
                        Archive
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {activePlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-400 py-6">
                    No plans
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {archivedPlans.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-600 select-none list-none flex items-center gap-1.5">
            <span className="transition-transform group-open:rotate-90">›</span>
            Archived Plans ({archivedPlans.length})
          </summary>
          <Card className="mt-3">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Allowance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedPlans.map((plan) => (
                    <TableRow key={plan.id} className="opacity-60">
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{formatPHP(plan.price_centavos)}</TableCell>
                      <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                      <TableCell className="capitalize">{plan.allowance_type.replace('_', ' ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </details>
      )}

      {activePlans.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4">Plan QRs</h2>
          <div className="flex flex-wrap gap-4">
            {activePlans.map((plan) => (
              <QrTile
                key={plan.id}
                title={plan.name}
                subtitle="Plan QR"
                url={encodePlanQr(merchantId, plan.id, plan.name)}
                filename={`${plan.name.toLowerCase().replace(/\s+/g, '-')}-plan.png`}
                logoSrc="/assets/logo.png"
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeDialogs() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Monthly Wash Plan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price (₱)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                placeholder="499.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {createOpen && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Billing Cycle</label>
                  <Select value={form.billing_cycle} onValueChange={(v) => v && setField('billing_cycle', v)}>
                    <SelectTrigger>
                      <SelectValue>{BILLING_CYCLE_LABELS[form.billing_cycle]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Allowance Type</label>
                <Select value={form.allowance_type} onValueChange={(v) => v && setField('allowance_type', v)}>
                  <SelectTrigger>
                    <SelectValue>{ALLOWANCE_TYPE_LABELS[form.allowance_type]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_kg">Weight (kg)</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.allowance_type !== 'unlimited' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Allowance Amount {form.allowance_type === 'weight_kg' ? '(kg)' : '(items)'}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.allowance_amount}
                  onChange={(e) => setField('allowance_amount', e.target.value)}
                  placeholder={form.allowance_type === 'weight_kg' ? '20' : '10'}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Brief description of the plan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
                placeholder="e.g. Save ₱200, 10% Discount"
              />
              <p className="text-xs text-zinc-400">Separate multiple tags with a comma.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.price}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive confirm dialog */}
      <Dialog open={archiveTarget !== null} onOpenChange={(open) => { if (!open) closeDialogs() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {archiveTarget?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            This will deactivate the plan and free the merchant&apos;s active plan slot. Existing
            subscriptions will not be affected.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={handleArchive}
              disabled={submitting}
            >
              {submitting ? 'Archiving…' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
