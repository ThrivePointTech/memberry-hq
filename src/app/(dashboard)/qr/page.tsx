import { api } from '@/lib/api'
import { QrExportClient } from './qr-export-client'

interface Merchant {
  id: string
  name: string
  status: string
}

export default async function QrExportPage() {
  const merchants = await api.get<Merchant[]>('/admin/merchants')
  const active = merchants.filter((m) => m.status === 'active')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">QR Export</h1>
      <p className="text-sm text-zinc-500">
        Select a merchant to generate and download merchant and plan QR codes.
      </p>
      <QrExportClient merchants={active} />
    </div>
  )
}
