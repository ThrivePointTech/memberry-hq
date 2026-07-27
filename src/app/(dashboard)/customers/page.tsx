import { api } from '@/lib/api'
import { CustomersTable } from '@/components/customers-table'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  paymongo_customer_id: string | null
  created_at: string
}

export default async function CustomersPage() {
  const customers = await api.get<Customer[]>('/admin/customers')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>
      <CustomersTable customers={customers} />
    </div>
  )
}
