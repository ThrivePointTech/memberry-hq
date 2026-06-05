'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type MerchantStatus = 'active' | 'pending' | 'suspended'

interface MerchantStatusMenuProps {
  merchantId: string
  currentStatus: MerchantStatus
}

const transitions: Record<MerchantStatus, { label: string; next: MerchantStatus; icon: typeof CheckCircle }[]> = {
  pending: [
    { label: 'Approve', next: 'active', icon: CheckCircle },
    { label: 'Suspend', next: 'suspended', icon: XCircle },
  ],
  active: [
    { label: 'Suspend', next: 'suspended', icon: XCircle },
  ],
  suspended: [
    { label: 'Reactivate', next: 'active', icon: CheckCircle },
    { label: 'Set Pending', next: 'pending', icon: Clock },
  ],
}

export function MerchantStatusMenu({ merchantId, currentStatus }: MerchantStatusMenuProps) {
  const router = useRouter()
  const actions = transitions[currentStatus] ?? []

  async function updateStatus(status: MerchantStatus) {
    await fetch(`/api/merchants/${merchantId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ label, next, icon: Icon }) => (
          <DropdownMenuItem key={next} onClick={() => updateStatus(next)}>
            <Icon size={14} className="mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
