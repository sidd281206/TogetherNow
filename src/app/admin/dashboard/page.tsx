import type { Metadata } from 'next'
import AdminDashboardClient from './AdminDashboardClient'
import { fetchAdminOrganizations, fetchAdminDonors } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Control Center — TogetherNow',
}

export default async function AdminDashboardPage() {
  const [dbOrganizations, dbDonors] = await Promise.all([
    fetchAdminOrganizations(),
    fetchAdminDonors(),
  ])
  return (
    <AdminDashboardClient 
      initialDbOrganizations={dbOrganizations}
      initialDbDonors={dbDonors}
    />
  )
}

