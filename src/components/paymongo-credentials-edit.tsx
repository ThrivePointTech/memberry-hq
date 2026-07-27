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

interface PaymongoCredentialsEditProps {
  merchantId: string
}

interface FormState {
  secret_key: string
  public_key: string
}

const BLANK_FORM: FormState = { secret_key: '', public_key: '' }

export function PaymongoCredentialsEdit({ merchantId }: PaymongoCredentialsEditProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openDialog() {
    setForm(BLANK_FORM)
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
    const secretKey = form.secret_key.trim()
    const publicKey = form.public_key.trim()

    if (!secretKey.startsWith('sk_') || !publicKey.startsWith('pk_')) {
      setError('Secret key must start with sk_ and public key must start with pk_')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/merchants/${merchantId}/paymongo-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_key: secretKey, public_key: publicKey }),
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

  const canSubmit = form.secret_key.trim() && form.public_key.trim()

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit PayMongo Credentials</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Secret Key</label>
              <Input
                type="password"
                value={form.secret_key}
                onChange={(e) => setField('secret_key', e.target.value)}
                placeholder="sk_live_..."
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Public Key</label>
              <Input
                type="password"
                value={form.public_key}
                onChange={(e) => setField('public_key', e.target.value)}
                placeholder="pk_live_..."
                autoComplete="off"
              />
            </div>

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
