'use client'

import React, { useRef, useState } from 'react'
import DashboardNavbar from '@/components/ui/DashboardNavbar'
import ProfilePromptBanner from '@/components/ui/ProfilePromptBanner'
import VolunteerDashboard from '@/components/ui/VolunteerDashboard'
import OrganizationDashboard from '@/components/ui/OrganizationDashboard'
import DonorDashboard, { DonorDashboardRef } from '@/components/ui/DonorDashboard'
import OrgFundraisingPanel from '@/components/ui/OrgFundraisingPanel'
import OrgEmployeesPanel from '@/components/ui/OrgEmployeesPanel'
import { OpportunitiesFeedRef } from '@/components/ui/OpportunitiesFeed'
import { Check, CheckCircle2, User, SlidersHorizontal, Heart } from 'lucide-react'
import ResubmitApplicationButton from '@/components/ui/ResubmitApplicationButton'
import ProfileCompletionModal from '@/components/ui/ProfileCompletionModal'

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
    orgStatus?: string
  }
  volunteerPreferences?: {
    skills: string[]
    interests: string[]
    city: string
  }
  organizationName?: string
  donationRequests?: any[]
  donorStats?: { totalDonated: number; causesCount: number }
  myCampaigns?: any[]
  myDonations?: any[]
  incomingDonations?: any[]
  avatarUrl?: string
}

export default function DashboardClient({
  user,
  profileStatus,
  organizationName: orgNameFromDb,
  volunteerPreferences,
  donationRequests = [],
  donorStats = { totalDonated: 0, causesCount: 0 },
  myCampaigns = [],
  myDonations = [],
  incomingDonations = [],
  avatarUrl,
}: DashboardClientProps) {
  const opportunitiesRef = useRef<OpportunitiesFeedRef | null>(null)
  const donorRef = useRef<DonorDashboardRef | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Friend'
  const firstName = fullName.split(' ')[0]
  const role = profileStatus.role ?? 'volunteer'

  // For organizations: prefer the name fetched from DB (profiles.full_name)
  // over user_metadata to ensure the correct org name is always used
  const organizationName = orgNameFromDb || fullName

  const handleSearchClick = () => {
    if (role === 'donor') {
      donorRef.current?.focusSearch()
    } else {
      opportunitiesRef.current?.focusSearch()
    }
  }

  const handlePostOpportunityClick = () => {
    opportunitiesRef.current?.openCreateModal()
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50/60 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Header Navbar */}
      <DashboardNavbar
        user={user}
        profileStatus={profileStatus}
        avatarUrl={avatarUrl}
        onSearchClick={handleSearchClick}
        onPostOpportunityClick={handlePostOpportunityClick}
        onOpenProfileClick={() => setShowProfileModal(true)}
        volunteerPreferences={volunteerPreferences}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Welcome Card Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
                ) : (
                  firstName[0]?.toUpperCase()
                )}
              </div>
              {role === 'organization' && profileStatus.orgStatus === 'approved' && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-900"
                  title="Verified Organization Account"
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Welcome back 👋</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${ROLE_COLORS[role] ?? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  {ROLE_LABELS[role] ?? 'Volunteer'}
                  {role === 'organization' && profileStatus.orgStatus === 'approved' && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                  )}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight m-0">
                {fullName}
              </h1>
            </div>
          </div>

          {/* Quick Profile & Skills Edit button for Volunteers */}
          {role === 'volunteer' && (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all border border-gray-200/80 dark:border-gray-700 shadow-2xs cursor-pointer group"
              title="Click to change your city, phone number, interests, and skills"
            >
              <User className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>My Profile & Skills</span>
            </button>
          )}

          {/* Quick Profile Edit for Donors */}
          {role === 'donor' && (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-200 text-xs font-bold transition-all border border-amber-200/80 dark:border-amber-800 shadow-2xs cursor-pointer group"
              title="Edit your contact details, city, and donor profile"
            >
              <User className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Edit Profile</span>
            </button>
          )}

          {/* Quick Raise Funds Action for Organizations */}
          {role === 'organization' && (
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('raise-funds-btn')
                if (btn) {
                  btn.click()
                  btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else {
                  document.getElementById('org-fundraising-section')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all shadow-md hover:shadow-lg cursor-pointer border-none group"
              title="Launch a fundraising campaign for your cause"
            >
              <Heart className="w-4 h-4 text-rose-200 fill-rose-200 group-hover:scale-110 transition-transform" />
              <span>Raise Funds</span>
            </button>
          )}
        </div>

        {/* Dynamic Profile Prompt Banner (New Users vs Existing Incomplete Users) */}
        <ProfilePromptBanner
          userName={fullName}
          userEmail={user.email || ''}
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
            <ResubmitApplicationButton userId={user.id} orgStatus={profileStatus.orgStatus} />
          </div>
        )}

        {/* Organization Application Rejected Notice */}
        {role === 'organization' && profileStatus.orgStatus === 'rejected' && (
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Organization Account Status: Application Rejected</span>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300 m-0 leading-relaxed">
              Your previous organization verification application was not approved by platform administrators. Please double check your registration details or attached document and submit your application again for re-evaluation.
            </p>
            <ResubmitApplicationButton userId={user.id} orgStatus={profileStatus.orgStatus} />
          </div>
        )}

        {/* Dashboard Feed based on role */}
        {role === 'organization' ? (
          <>
            {/* Fundraising Campaigns & Raise Funds Option - Displayed prominently at top of Organization Dashboard */}
            <div id="org-fundraising-section">
              <OrgFundraisingPanel
                orgStatus={profileStatus.orgStatus}
                organizationName={organizationName}
                myCampaigns={myCampaigns}
                incomingDonations={incomingDonations}
              />
            </div>

            <OrgEmployeesPanel
              organizationId={user.id}
              organizationName={organizationName}
            />

            <OrganizationDashboard
              opportunitiesRef={opportunitiesRef}
              userId={user.id}
              userEmail={user.email || ''}
              orgStatus={profileStatus.orgStatus}
              organizationName={organizationName}
            />
          </>
        ) : role === 'donor' ? (
          <DonorDashboard
            ref={donorRef}
            userId={user.id}
            userEmail={user.email || ''}
            userName={fullName}
            donationRequests={donationRequests}
            donorStats={donorStats}
            myDonations={myDonations}
          />
        ) : (
          <VolunteerDashboard
            opportunitiesRef={opportunitiesRef}
            userId={user.id}
            userEmail={user.email || ''}
            userName={fullName}
            avatarUrl={avatarUrl}
            profileStatus={profileStatus}
            volunteerPreferences={volunteerPreferences}
          />
        )}

      </main>

      {/* Global Profile & Preferences Modal */}
      {showProfileModal && (role === 'volunteer' || role === 'donor') && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userEmail={user.email}
          userName={fullName}
          userRole={role}
          initialCity={volunteerPreferences?.city}
          initialSkills={volunteerPreferences?.skills}
          initialInterests={volunteerPreferences?.interests}
        />
      )}
    </div>
  )
}
