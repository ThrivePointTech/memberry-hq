import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Topbar } from '@/components/layout/topbar'

interface AdminMe {
  id: string
  email: string
  name: string
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let admin: AdminMe

  try {
    admin = await api.get<AdminMe>('/admin/auth/me')
  } catch {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar adminEmail={admin!.email} adminName={admin!.name} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
