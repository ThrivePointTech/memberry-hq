import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
const COOKIE_NAME = 'memberry_admin_token'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.log('text: ', text);
    let message = 'Invalid credentials'
    try {
      message = JSON.parse(text)?.message ?? message
    } catch (error) {
      console.log('ERROR: ', error);
    }
    return NextResponse.json({ error: message }, { status: res.status })
  }

  const data = await res.json()

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, data.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
