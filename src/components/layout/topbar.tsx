'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  adminEmail: string
  adminName: string
}

export function Topbar({ adminEmail, adminName }: TopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-zinc-950 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{adminName}</p>
          <p className="text-xs text-zinc-500">{adminEmail}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  )
}
