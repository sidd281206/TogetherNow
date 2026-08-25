import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Home & Opportunities — TogetherNow',
}

export const ROLE_LABELS: Record<string, string> = {
  volunteer:    'Volunteer',
  organization: 'Organization',
  donor:        'Donor',
  admin:        'Admin',
}

export const ROLE_COLORS: Record<string, string> = {
  volunteer:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  organization: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  donor:        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  admin:        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const role: string = user.user_metadata?.role ?? 'volunteer'

  let isNewUser = false
  let completionPercentage = 100
  const missingFields: string[] = []

  let orgStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected' = 'approved'

  // Check profile in database and user metadata
  if (role === 'volunteer' || role === 'donor') {
    const userMeta = user.user_metadata || {}

    const { data: volProfile } = await supabase
      .from('volunteer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (userMeta.profile_completed || userMeta.completionPercentage === 100) {
      completionPercentage = 100
      isNewUser = false
    } else {
      const hasSkills = Boolean((volProfile?.skills && volProfile.skills.length > 0) || userMeta.skills)
      const hasInterests = Boolean((volProfile?.interests && volProfile.interests.length > 0) || userMeta.interests)
      const hasPhone = Boolean((volProfile as any)?.phone || (userProfile as any)?.phone || userMeta.phone)
      const hasAddress = Boolean((volProfile as any)?.address || (userProfile as any)?.address || (userProfile as any)?.city || userMeta.address || userMeta.city)
      const isEmailVerified = Boolean((volProfile as any)?.email_verified || (userProfile as any)?.email_verified || user.email_confirmed_at || userMeta.email_verified || userMeta.isEmailVerified)

      let score = 0
      if (hasSkills || hasInterests) score += 25
      else missingFields.push('skills')

      if (hasPhone) score += 25
      else missingFields.push('phone number')

      if (hasAddress) score += 25
      else missingFields.push('address details')

      if (isEmailVerified) score += 25
      else missingFields.push('email OTP verification')

      if (!volProfile && !hasPhone && !userMeta.phone) {
        isNewUser = true
      }

      completionPercentage = Math.min(100, score)
    }
  } else if (role === 'organization') {
    const { data: orgProfile } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!orgProfile) {
      isNewUser = true
      completionPercentage = 25
      missingFields.push('registration number', 'website', 'verification document')
      orgStatus = 'unsubmitted'
    } else {
      orgStatus = (orgProfile.status as 'pending' | 'approved' | 'rejected') ?? 'pending'
      
      if (orgStatus === 'approved') {
        completionPercentage = 100
      } else {
        let score = 50
        if (orgProfile.website) score += 25
        else missingFields.push('website')

        if (orgProfile.verification_document_url) score += 25
        else missingFields.push('verification document')

        completionPercentage = Math.min(100, score)
      }
    }
  }

  const profileStatus = {
    isNewUser,
    completionPercentage,
    role,
    orgStatus,
    missingFields,
  }

  return <DashboardClient user={user} profileStatus={profileStatus} />
}
