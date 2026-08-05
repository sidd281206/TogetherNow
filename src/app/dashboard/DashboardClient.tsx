'use client'

import React, { useRef } from 'react'
import DashboardNavbar from '@/components/ui/DashboardNavbar'
import ProfilePromptBanner from '@/components/ui/ProfilePromptBanner'
import VolunteerDashboard from '@/components/ui/VolunteerDashboard'
import OrganizationDashboard from '@/components/ui/OrganizationDashboard'
import { OpportunitiesFeedRef } from '@/components/ui/OpportunitiesFeed'

const ROLE_LABELS: Record<string, string> = {
  volunteer:    'Volunteer',
  organization: 'Organization',
  donor:        'Donor',
  admin:        'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  volunteer:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  organization: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  donor:        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  admin:        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

interface DashboardClientProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      role?: string
    }
  }
  profileStatus: {
    isNewUser: boolean
    completionPercentage: number
    role: string
    missingFields: string[]
  }
}

export default function DashboardClient({ user, profileStatus }: DashboardClientProps) {
  const opportunitiesRef = useRef<OpportunitiesFeedRef | null>(null)

  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Friend'
  const firstName = fullName.split(' ')[0]
  const role = profileStatus.role ?? 'volunteer'

  const handleSearchClick = () => {
    opportunitiesRef.current?.focusSearch()
  }

  const handlePostOpportunityClick = () => {
    opportunitiesRef.current?.openCreateModal()
  }

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Header Navbar */}
      <DashboardNavbar
        user={user}
        profileStatus={profileStatus}
        onSearchClick={handleSearchClick}
        onPostOpportunityClick={handlePostOpportunityClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Welcome Card Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Welcome back 👋</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[role] ?? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  {ROLE_LABELS[role] ?? 'Volunteer'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight m-0">
                {fullName}
              </h1>
            </div>
          </div>
        </div>

        {/* Dynamic Profile Prompt Banner (New Users vs Existing Incomplete Users) */}
        <ProfilePromptBanner
          userName={fullName}
          profileStatus={profileStatus}
        />

        {/* Organization Pending Approval Notice */}
        {role === 'organization' && profileStatus.orgStatus === 'pending' && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Organization Account Status: Verification Pending</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 m-0 leading-relaxed">
              Your organization details and verification documents are currently under review by our platform administrators.
              Once approved in the Admin Control Center, full posting access will be unlocked.
            </p>
          </div>
        )}

        {/* Dashboard Feed based on role */}
        {role === 'organization' ? (
          <OrganizationDashboard opportunitiesRef={opportunitiesRef} />
        ) : (
          <VolunteerDashboard opportunitiesRef={opportunitiesRef} />
        )}

      </main>
    </div>
  )
}
