import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
const COOKIE_NAME = 'memberry_admin_token'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ subId: string }> },
) {
  const { subId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}/admin/subscriptions/${subId}/simulate-suspension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
