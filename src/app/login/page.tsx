'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'Only getmemberry.com Google Workspace accounts can sign in.',
  sso_failed: 'Sign-in failed. Please try again.',
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect')
  const errorParam = searchParams.get('error')
  const error = errorParam ? (ERROR_MESSAGES[errorParam] ?? 'Sign-in failed. Please try again.') : null

  async function handleSignIn() {
    setLoading(true)
    const bridgeUrl = redirect ? `/auth/bridge?redirect=${encodeURIComponent(redirect)}` : '/auth/bridge'
    await signIn('google', { callbackUrl: bridgeUrl })
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Memberry Internal</h1>
        <p className="text-sm text-zinc-500">Sign in with your Memberry Google Workspace account</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      <Button type="button" className="w-full" disabled={loading} onClick={handleSignIn}>
        {loading ? 'Redirecting…' : 'Sign in with Google'}
      </Button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
