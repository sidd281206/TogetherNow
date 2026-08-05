import type { Metadata } from 'next'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata: Metadata = {
  title: 'Admin Control Center — TogetherNow',
}

export default async function AdminDashboardPage() {
  return <AdminDashboardClient />
}
