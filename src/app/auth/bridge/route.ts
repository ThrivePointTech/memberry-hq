import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { setToken } from '@/lib/auth'

// AuthJS's own session cookie is separate from memberry-hq's existing
// memberry_admin_token cookie that src/lib/auth.ts, src/proxy.ts, and
// src/lib/api.ts all depend on. This route is the post-sign-in redirect
// target: it reads the memberry-api-verifiable JWT minted in the AuthJS
// jwt/session callbacks and writes it into that existing cookie, so nothing
// downstream of login needs to change.
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.adminToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'sso_failed')
    return NextResponse.redirect(loginUrl)
  }

  await setToken(session.adminToken)

  const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
