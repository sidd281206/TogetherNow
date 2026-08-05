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

  let orgStatus: 'pending' | 'approved' | 'rejected' = 'approved'

  // Check profile in database
  if (role === 'volunteer') {
    const { data: volProfile } = await supabase
      .from('volunteer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!volProfile) {
      isNewUser = true
      completionPercentage = 25
      missingFields.push('skills', 'interests', 'availability')
    } else {
      let score = 50
      if (volProfile.skills && volProfile.skills.length > 0) score += 20
      else missingFields.push('skills')

      if (volProfile.interests && volProfile.interests.length > 0) score += 15
      else missingFields.push('interests')

      if (volProfile.availability) score += 15
      else missingFields.push('availability')

      completionPercentage = score
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
      missingFields.push('website', 'verification document')
      orgStatus = 'pending'
    } else {
      orgStatus = (orgProfile.status as 'pending' | 'approved' | 'rejected') ?? 'pending'
      let score = 50
      if (orgProfile.website) score += 25
      else missingFields.push('website')

      if (orgProfile.verification_document_url) score += 25
      else missingFields.push('verification document')

      completionPercentage = score
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
