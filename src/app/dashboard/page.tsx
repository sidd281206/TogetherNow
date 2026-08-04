import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'
import type { Metadata } from 'next'
import VolunteerDashboard from '@/components/ui/VolunteerDashboard'
import OrganizationDashboard from '@/components/ui/OrganizationDashboard'
import { Logo } from '@/components/ui/Logo'

export const metadata: Metadata = {
  title: 'Dashboard — TogetherNow',
}

const ROLE_LABELS: Record<string, string> = {
  volunteer:    'Volunteer',
  organization: 'Organization',
  donor:        'Donor',
  admin:        'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  volunteer:    'badge-volunteer',
  organization: 'badge-org',
  donor:        'badge-donor',
  admin:        'badge-admin',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Extra safety: middleware should catch this, but double-check here
  if (!user) redirect('/auth/login')

  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Friend'
  const role: string = user.user_metadata?.role ?? 'volunteer'
  const firstName = fullName.split(' ')[0]

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <Logo className="logo-svg" />
          <span className="dashboard-logo-text">TogetherNow</span>
        </div>
        <form action={logoutAction}>
          <button type="submit" id="logout-btn" className="dashboard-logout-btn">
            Sign out
          </button>
        </form>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome-card">
          <div className="dashboard-avatar" aria-hidden="true">
            {firstName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="dashboard-greeting">Welcome back 👋</p>
            <h1 className="dashboard-name">{firstName}</h1>
            <span className={`dashboard-badge ${ROLE_COLORS[role] ?? 'badge-volunteer'}`}>
              {ROLE_LABELS[role] ?? 'Volunteer'}
            </span>
          </div>
        </div>

        {role === 'organization' ? (
          <OrganizationDashboard />
        ) : (
          <VolunteerDashboard />
        )}
      </main>
    </div>
  )
}
