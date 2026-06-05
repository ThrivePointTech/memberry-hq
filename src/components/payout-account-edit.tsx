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

const METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash',
  maya: 'Maya',
  bank: 'Bank Transfer',
}

interface PayoutAccount {
  method_type: string
  account_name: string
  account_number: string
  bank_code: string | null
}

interface PayoutAccountEditProps {
  merchantId: string
  currentAccount: PayoutAccount | null
}

interface FormState {
  method_type: 'bank' | 'gcash' | 'maya'
  account_name: string
  account_number: string
  bank_code: string
}

function accountToForm(account: PayoutAccount | null): FormState {
  if (!account) {
    return { method_type: 'gcash', account_name: '', account_number: '', bank_code: '' }
  }
  return {
    method_type: account.method_type as FormState['method_type'],
    account_name: account.account_name,
    account_number: account.account_number,
    bank_code: account.bank_code ?? '',
  }
}

export function PayoutAccountEdit({ merchantId, currentAccount }: PayoutAccountEditProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(() => accountToForm(currentAccount))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openDialog() {
    setForm(accountToForm(currentAccount))
    setError(null)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setError(null)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const body = {
      method_type: form.method_type,
      account_name: form.account_name.trim(),
      account_number: form.account_number.trim(),
      bank_code: form.method_type === 'bank' ? form.bank_code.trim() || null : null,
    }

    try {
      const res = await fetch(`/api/merchants/${merchantId}/payout-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Something went wrong.')
        return
      }
      close()
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = form.account_name.trim() && form.account_number.trim()

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payout Method</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Method</label>
              <Select
                value={form.method_type}
                onValueChange={(v) => v && setField('method_type', v as FormState['method_type'])}
              >
                <SelectTrigger>
                  <SelectValue>{METHOD_LABELS[form.method_type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="maya">Maya</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Name</label>
              <Input
                value={form.account_name}
                onChange={(e) => setField('account_name', e.target.value)}
                placeholder="Juan dela Cruz"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {form.method_type === 'bank' ? 'Account Number' : 'Mobile Number'}
              </label>
              <Input
                value={form.account_number}
                onChange={(e) => setField('account_number', e.target.value)}
                placeholder={form.method_type === 'bank' ? '1234567890' : '09XXXXXXXXX'}
              />
            </div>

            {form.method_type === 'bank' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Bank Code <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.bank_code}
                  onChange={(e) => setField('bank_code', e.target.value)}
                  placeholder="e.g. BDO, BPI, GCASH"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
