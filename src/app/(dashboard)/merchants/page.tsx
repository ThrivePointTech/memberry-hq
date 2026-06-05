import { api } from '@/lib/api'
import { MerchantsTable } from '@/components/merchants-table'

interface Merchant {
  id: string
  name: string
  status: 'active' | 'pending' | 'suspended'
  created_at: string
}

export default async function MerchantsPage() {
  const merchants = await api.get<Merchant[]>('/admin/merchants')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Merchants</h1>
      <MerchantsTable merchants={merchants} />
    </div>
  )
}
