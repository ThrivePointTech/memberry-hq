'use client'

import { useState } from 'react'
import { QrTile } from '@/components/qr-tile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Merchant {
  id: string
  name: string
}

interface Plan {
  id: string
  merchant_id: string
  name: string
  status: string
  qr_version: number
}

interface QrExportClientProps {
  merchants: Merchant[]
}

function encodePlanQr(merchantId: string, planId: string, planName: string): string {
  const payload = JSON.stringify({ merchant_id: merchantId, plan_id: planId, plan_name: planName })
  const bytes = new TextEncoder().encode(payload)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

export function QrExportClient({ merchants }: QrExportClientProps) {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  const selectedMerchant = merchants.find((m) => m.id === selectedMerchantId)

  async function handleMerchantSelect(merchantId: string | null) {
    if (!merchantId) return
    setSelectedMerchantId(merchantId)
    setPlans([])
    setLoadingPlans(true)
    try {
      const res = await fetch(`/api/plans?merchant_id=${merchantId}`)
      const data = await res.json()
      setPlans(data.data ?? [])
    } catch {
      console.error('Failed to load plans')
    } finally {
      setLoadingPlans(false)
    }
  }

  const activePlans = plans.filter((p) => p.status === 'active')

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <Select onValueChange={handleMerchantSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a merchant…">
              {(value: string | null) =>
                value
                  ? (merchants.find((m) => m.id === value)?.name ?? value)
                  : 'Select a merchant…'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {merchants.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMerchant && (
        <div className="space-y-4">
          <h2 className="text-base font-medium">{selectedMerchant.name}</h2>

          <div className="flex flex-wrap gap-4">
            <QrTile
              title={selectedMerchant.name}
              subtitle="Store QR"
              url={`https://getmemberry.com/shop/${selectedMerchant.id}`}
              filename={`${selectedMerchant.name.toLowerCase().replace(/\s+/g, '-')}-store.png`}
              logoSrc="/assets/logo.png"
            />

            {loadingPlans && (
              <div className="flex items-center justify-center w-48 h-48 text-sm text-zinc-400">
                Loading plans…
              </div>
            )}

            {activePlans.map((plan) => (
              <QrTile
                key={plan.id}
                title={plan.name}
                subtitle="Plan QR"
                url={encodePlanQr(selectedMerchant.id, plan.id, plan.name)}
                filename={`${plan.name.toLowerCase().replace(/\s+/g, '-')}-plan.png`}
                logoSrc="/assets/logo.png"
              />
            ))}

            {!loadingPlans && selectedMerchantId && activePlans.length === 0 && (
              <p className="text-sm text-zinc-400 self-center">No active plans</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
