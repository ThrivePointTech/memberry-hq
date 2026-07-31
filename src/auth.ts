import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { SignJWT } from 'jose'

const WORKSPACE_DOMAIN = 'getmemberry.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

declare module 'next-auth' {
  interface Session {
    adminToken?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    adminToken?: string
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

interface SsoLoginResponse {
  data: { id: string; email: string; role: string }
}

// Calls memberry-api's POST /admin/auth/sso-login: signs a short-lived
// provisioning JWT carrying the Google-verified identity, and gets back the
// upserted admin_users record. memberry-api re-checks the Workspace domain
// itself — this call is never trusted blindly.
async function provisionAdmin(email: string, name: string | null | undefined): Promise<SsoLoginResponse['data']> {
  const provisioningToken = await new SignJWT({ purpose: 'admin-sso-provision', email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getJwtSecret())

  const res = await fetch(`${API_URL}/admin/auth/sso-login`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${provisioningToken}` },
  })

  if (!res.ok) throw new Error('Failed to provision admin account')
  const { data } = (await res.json()) as SsoLoginResponse
  return data
}

// Mints the same shape of superadmin JWT memberry-api's own password login
// used to sign directly — memberry-api's SuperadminAuthGuard is unchanged,
// it only verifies the signature/claims, not who minted the token.
async function mintSuperadminToken(admin: SsoLoginResponse['data']): Promise<string> {
  return new SignJWT({ role: 'superadmin', email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtSecret())
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: { params: { hd: WORKSPACE_DOMAIN, prompt: 'select_account' } },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ profile }) {
      return profile?.hd === WORKSPACE_DOMAIN
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const admin = await provisionAdmin(profile.email, profile.name)
        token.adminToken = await mintSuperadminToken(admin)
      }
      return token
    },
    async session({ session, token }) {
      session.adminToken = token.adminToken
      return session
    },
  },
})
