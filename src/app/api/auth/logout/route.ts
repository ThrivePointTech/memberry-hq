import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signOut } from '@/auth'

const COOKIE_NAME = 'memberry_admin_token'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  await signOut({ redirect: false })
  return NextResponse.json({ ok: true })
}
