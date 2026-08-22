import type { Metadata } from 'next'
import AdminDashboardClient from './AdminDashboardClient'
import { fetchAdminOrganizations } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Control Center — TogetherNow',
}

export default async function AdminDashboardPage() {
  const dbOrganizations = await fetchAdminOrganizations()
  return <AdminDashboardClient initialDbOrganizations={dbOrganizations} />
}

