import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
const COOKIE_NAME = 'memberry_admin_token'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const merchantId = request.nextUrl.searchParams.get('merchant_id')

  const url = merchantId
    ? `${API_URL}/plans?merchant_id=${merchantId}`
    : `${API_URL}/plans`

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const body = await request.json()

  let res: Response
  try {
    res = await fetch(`${API_URL}/admin/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch {
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 })
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return NextResponse.json({ message: 'Invalid response from API' }, { status: 502 })
  }

  return NextResponse.json(data, { status: res.status })
}
