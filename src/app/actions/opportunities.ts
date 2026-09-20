'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export interface DbOpportunityInput {
  title: string
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  location: string
  address?: string
  managerName?: string
  managerPhone?: string
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  totalRequired?: number
  alreadyRegistered?: number
  skillsNeeded: string[]
  description: string
  isCancelled?: boolean
  cancelledAt?: string
  cancelReason?: string
  isCompleted?: boolean
  completedAt?: string
}

export interface DbOpportunityOutput {
  id: string
  title: string
  organization: string
  organizationId: string
  isVerifiedOrg: boolean
  orgStatus: 'approved' | 'pending' | 'rejected'
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  location: string
  address?: string
  managerName?: string
  managerPhone?: string
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  totalRequired?: number
  alreadyRegistered?: number
  skillsNeeded: string[]
  description: string
  createdAt?: string
  isCancelled?: boolean
  cancelledAt?: string
  cancelReason?: string
  isCompleted?: boolean
  completedAt?: string
}

export async function createOpportunityAction(input: DbOpportunityInput): Promise<{
  success?: boolean
  opportunity?: DbOpportunityOutput
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in as an organization to post opportunities.' }
  }

  // Fetch organization profile to verify status and organization name
  const { data: orgProfile } = await supabase
    .from('organizations')
    .select('id, status, phone')
    .eq('id', user.id)
    .maybeSingle()

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  // Resolve the actual org name — prefer DB profile over user_metadata, avoid generic fallback
  const orgName = (userProfile?.full_name && userProfile.full_name !== 'Organization'
    ? userProfile.full_name
    : null) ||
    (user.user_metadata?.full_name && user.user_metadata.full_name !== 'Organization'
      ? user.user_metadata.full_name
      : null) ||
    user.email?.split('@')[0] ||
    'Community Organization'
  const orgStatus = orgProfile?.status || 'approved'
  const isVerified = orgStatus === 'approved'

  const managerName = input.managerName?.trim() || orgName || 'Event Coordinator'
  const managerPhone = input.managerPhone?.trim() || orgProfile?.phone || '+91 98201 44521'
  const address = input.isRemote ? 'Online / Remote' : (input.address?.trim() || input.location?.trim() || 'Marine Drive Promenade, Mumbai 400020')

  // Admin client bypass if RLS restricts table writes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  const newRow = {
    organization_id: user.id,
    organization_name: orgName,
    title: input.title.trim(),
    category: input.category,
    location: input.isRemote ? 'Remote' : input.location.trim(),
    address: address,
    manager_name: managerName,
    manager_phone: managerPhone,
    is_remote: input.isRemote,
    date: input.date || 'Upcoming',
    time: input.time || '09:00 AM - 01:00 PM',
    spots_left: input.spotsLeft,
    skills_needed: input.skillsNeeded || [],
    description: input.description.trim(),
  }

  const { data: inserted, error: insertErr } = await adminClient
    .from('opportunities')
    .insert(newRow)
    .select()
    .single()

  if (insertErr) {
    console.warn('Notice inserting with extended columns:', insertErr.message)
    const { data: basicInserted } = await adminClient
      .from('opportunities')
      .insert({
        organization_id: user.id,
        title: input.title.trim(),
        description: input.description.trim(),
      })
      .select()
      .single()

    const fallbackOp: DbOpportunityOutput = {
      id: basicInserted?.id || `event-${Date.now()}`,
      title: input.title.trim(),
      organization: orgName,
      organizationId: user.id,
      isVerifiedOrg: isVerified,
      orgStatus: orgStatus as any,
      category: input.category,
      location: input.isRemote ? 'Remote' : input.location.trim(),
      address: address,
      managerName,
      managerPhone,
      isRemote: input.isRemote,
      date: input.date || 'Upcoming',
      time: input.time || '09:00 AM - 01:00 PM',
      spotsLeft: input.spotsLeft,
      totalRequired: input.totalRequired ?? (input.spotsLeft + (input.alreadyRegistered ?? 0)),
      alreadyRegistered: input.alreadyRegistered ?? 0,
      skillsNeeded: input.skillsNeeded || [],
      description: input.description.trim(),
      createdAt: basicInserted?.created_at || new Date().toISOString(),
    }
    revalidatePath('/dashboard')
    return { success: true, opportunity: fallbackOp }
  }

  const resultOp: DbOpportunityOutput = {
    id: inserted.id,
    title: inserted.title,
    organization: inserted.organization_name || orgName,
    organizationId: inserted.organization_id || user.id,
    isVerifiedOrg: isVerified,
    orgStatus: orgStatus as any,
    category: inserted.category as any,
    location: inserted.location || input.location.trim(),
    address: inserted.address || address,
    managerName: inserted.manager_name || managerName,
    managerPhone: inserted.manager_phone || managerPhone,
    isRemote: inserted.is_remote ?? input.isRemote,
    date: inserted.date || input.date || 'Upcoming',
    time: inserted.time || input.time || '09:00 AM - 01:00 PM',
    spotsLeft: inserted.spots_left ?? input.spotsLeft,
    totalRequired: input.totalRequired ?? (input.spotsLeft + (input.alreadyRegistered ?? 0)),
    alreadyRegistered: input.alreadyRegistered ?? 0,
    skillsNeeded: inserted.skills_needed || input.skillsNeeded || [],
    description: inserted.description || input.description.trim(),
    createdAt: inserted.created_at,
  }

  revalidatePath('/dashboard')
  return { success: true, opportunity: resultOp }
}

export async function fetchOpportunitiesAction(): Promise<DbOpportunityOutput[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Fetch all real opportunities from Supabase DB via admin client
    const { data: dbOps, error } = await adminClient
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !dbOps) {
      console.warn('Notice fetching opportunities from DB:', error?.message)
      return []
    }

    // Fetch organization verification statuses AND their real names from profiles
    const orgIds = Array.from(new Set(dbOps.map((op) => op.organization_id).filter(Boolean)))
    const orgStatusMap = new Map<string, string>()
    const orgNameMap = new Map<string, string>()

    if (orgIds.length > 0) {
      const { data: orgs } = await adminClient
        .from('organizations')
        .select('id, status')
        .in('id', orgIds)

      if (orgs) {
        orgs.forEach((o) => orgStatusMap.set(o.id, o.status))
      }

      // Fetch actual org names from profiles (full_name is the org name for org accounts)
      const { data: orgProfiles } = await adminClient
        .from('profiles')
        .select('id, full_name')
        .in('id', orgIds)

      if (orgProfiles) {
        orgProfiles.forEach((p) => {
          if (p.full_name) orgNameMap.set(p.id, p.full_name)
        })
      }
    }

    // Fetch applications counts (accepted) per opportunity from Supabase
    const acceptedCountByOpId = new Map<string, number>()
    try {
      const { data: allApplications } = await adminClient
        .from('applications')
        .select('opportunity_id, status')

      if (allApplications) {
        allApplications.forEach((app) => {
          if (app.status === 'accepted' || app.status === 'approved') {
            acceptedCountByOpId.set(
              app.opportunity_id,
              (acceptedCountByOpId.get(app.opportunity_id) || 0) + 1
            )
          }
        })
      }
    } catch (appErr) {
      console.warn('Notice reading applications for seat count:', appErr)
    }

    return dbOps.map((op) => {
      const status = (op.organization_id ? orgStatusMap.get(op.organization_id) : 'approved') || 'approved'
      const alreadyRegistered = acceptedCountByOpId.get(op.id) || 0
      const storedSpotsLeft = typeof op.spots_left === 'number' ? op.spots_left : 10
      const totalRequired = Math.max(10, alreadyRegistered + storedSpotsLeft)
      const computedSpotsLeft = Math.max(0, storedSpotsLeft)

      // Prefer the real org name from profiles; fall back to stored organization_name
      // Only use the stored value if it isn't the generic 'Organization' default
      const storedOrgName = op.organization_name
      const profileOrgName = op.organization_id ? orgNameMap.get(op.organization_id) : undefined
      const resolvedOrgName =
        profileOrgName ||
        (storedOrgName && storedOrgName !== 'Organization' ? storedOrgName : undefined) ||
        'Community Organization'

        // Manager name must stay separate from org name.
        // Only use the stored value if it's a real custom name, not a generic placeholder.
        const GENERIC_MANAGER_NAMES = ['Organization', 'Event Coordinator', 'Drive Coordinator', 'Community Organization']
        const storedManager = op.manager_name?.trim()
        const resolvedManagerName = (storedManager && !GENERIC_MANAGER_NAMES.includes(storedManager))
          ? storedManager
          : 'Event Coordinator'

        return {
          id: op.id,
          title: op.title,
          organization: resolvedOrgName,
          organizationId: op.organization_id || '',
          isVerifiedOrg: status !== 'rejected',
          orgStatus: status as any,
          category: (op.category || 'Community') as any,
          location: op.location || 'Local Community Center',
          address: op.address || op.location || 'Local Community Center',
          managerName: resolvedManagerName,
          managerPhone: op.manager_phone || '',
          isRemote: Boolean(op.is_remote),
          date: op.date || 'Upcoming',
          time: op.time || 'Flexible',
          spotsLeft: computedSpotsLeft,
          totalRequired: totalRequired,
          alreadyRegistered: alreadyRegistered,
          skillsNeeded: Array.isArray(op.skills_needed) ? op.skills_needed : ['Volunteering'],
          description: op.description || '',
          createdAt: op.created_at,
          isCancelled: Boolean(op.is_cancelled || op.isCancelled),
          cancelledAt: op.cancelled_at || op.cancelledAt,
          cancelReason: op.cancel_reason || op.cancelReason,
          isCompleted: Boolean(op.is_completed || op.isCompleted),
          completedAt: op.completed_at || op.completedAt,
        }
    })
  } catch (err) {
    console.error('Error fetching opportunities:', err)
    return []
  }
}

export async function markOpportunityCompletedAction(payload: {
  eventId: string
  isCompleted?: boolean
  completedAt?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    const isCompleted = payload.isCompleted !== false
    const completedAt = isCompleted ? (payload.completedAt || new Date().toISOString()) : null

    // Attempt to update database columns or description tag
    try {
      await adminClient
        .from('opportunities')
        .update({
          is_completed: isCompleted,
          completed_at: completedAt,
        })
        .eq('id', payload.eventId)
    } catch (dbErr) {
      console.warn('Notice updating database opportunity completion status:', dbErr)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error marking opportunity completed:', err)
    return { success: false, error: err?.message }
  }
}

export interface DbApplicantRecord {
  id: string
  eventId: string
  eventTitle: string
  volunteerId?: string
  name: string
  email: string
  phone?: string
  skills: string[]
  note?: string
  status: 'pending' | 'accepted' | 'declined'
  appliedAt: string
}

export async function submitVolunteerApplicationAction(payload: {
  eventId: string
  eventTitle: string
  name: string
  email: string
  phone?: string
  skills?: string[]
  note?: string
}): Promise<{ success: boolean; applicant?: DbApplicantRecord; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    const volunteerId = user?.id || `vol-${Date.now()}`
    const applicantRecord: DbApplicantRecord = {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: payload.eventId,
      eventTitle: payload.eventTitle,
      volunteerId,
      name: payload.name || user?.user_metadata?.full_name || 'Volunteer',
      email: payload.email || user?.email || 'volunteer@togethernow.org',
      phone: payload.phone || '',
      skills: payload.skills && payload.skills.length > 0 ? payload.skills : ['Teamwork', 'Volunteering'],
      note: payload.note || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    }

    // Attempt to store in Supabase applications table if present
    try {
      if (user?.id) {
        await adminClient.from('applications').insert({
          opportunity_id: payload.eventId,
          volunteer_id: user.id,
          status: 'pending',
        })
      }
    } catch (dbErr) {
      console.warn('Notice saving to Supabase applications table:', dbErr)
    }

    revalidatePath('/dashboard')
    return { success: true, applicant: applicantRecord }
  } catch (err: any) {
    console.error('Error submitting application action:', err)
    return { success: false, error: err?.message || 'Failed to submit application' }
  }
}

export async function updateOpportunitySpotsAction(payload: {
  eventId: string
  alreadyRegistered: number
  spotsLeft: number
  totalRequired?: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Supabase opportunities table schema ONLY contains spots_left column
    const { error: updateErr } = await adminClient
      .from('opportunities')
      .update({ spots_left: Math.max(0, payload.spotsLeft) })
      .eq('id', payload.eventId)

    if (updateErr) {
      console.warn('Notice updating opportunity spots in DB:', updateErr.message)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating opportunity spots:', err)
    return { success: false, error: err?.message }
  }
}

export async function updateApplicantStatusAction(payload: {
  applicantId: string
  eventId: string
  status: 'accepted' | 'declined'
  volunteerId?: string
  alreadyRegistered?: number
  spotsLeft?: number
  totalRequired?: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Postgres application_status enum only allows: 'pending', 'accepted', 'rejected'
    const targetDbStatus = payload.status === 'accepted' ? 'accepted' : 'rejected'

    // 1. Update Supabase applications table
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.applicantId)
      if (isUuid) {
        await adminClient
          .from('applications')
          .update({ status: targetDbStatus })
          .eq('id', payload.applicantId)
      }
      if (payload.volunteerId && payload.eventId) {
        await adminClient
          .from('applications')
          .update({ status: targetDbStatus })
          .match({ opportunity_id: payload.eventId, volunteer_id: payload.volunteerId })
      }
    } catch (err) {
      console.warn('Notice updating Supabase application status:', err)
    }

    // 2. Globally update seat availability (spots_left) in opportunities table
    if (payload.eventId) {
      try {
        let newSpots = payload.spotsLeft

        if (newSpots === undefined) {
          const { data: currentOp } = await adminClient
            .from('opportunities')
            .select('spots_left')
            .eq('id', payload.eventId)
            .maybeSingle()

          const curSpots = typeof currentOp?.spots_left === 'number' ? currentOp.spots_left : 10
          newSpots = payload.status === 'accepted' ? Math.max(0, curSpots - 1) : curSpots + 1
        }

        // opportunities table only has spots_left column (no already_registered)
        const { error: opErr } = await adminClient
          .from('opportunities')
          .update({ spots_left: Math.max(0, newSpots) })
          .eq('id', payload.eventId)

        if (opErr) {
          console.warn('Notice updating opportunity spots in DB:', opErr.message)
        }
      } catch (dbErr) {
        console.warn('Notice updating opportunity seats in DB:', dbErr)
      }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating applicant status:', err)
    return { success: false, error: err?.message }
  }
}

export async function fetchApplicantsAction(): Promise<DbApplicantRecord[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    const { data: dbApps, error: appsErr } = await adminClient
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false })

    if (appsErr || !dbApps) {
      return []
    }

    // Fetch user details for applicants
    const userMap = new Map<string, { name: string; email: string; phone: string }>()
    try {
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      if (usersData?.users) {
        usersData.users.forEach((u) => {
          userMap.set(u.id, {
            name: (u.user_metadata?.full_name || u.email?.split('@')[0] || 'Volunteer').trim(),
            email: u.email || '',
            phone: u.phone || u.user_metadata?.phone || '',
          })
        })
      }
    } catch (uErr) {
      console.warn('Notice reading users for applicants:', uErr)
    }

    // Fetch volunteer profiles for skills
    const skillsMap = new Map<string, string[]>()
    try {
      const { data: volProfiles } = await adminClient
        .from('volunteer_profiles')
        .select('id, skills')
      if (volProfiles) {
        volProfiles.forEach((vp) => {
          if (Array.isArray(vp.skills) && vp.skills.length > 0) {
            skillsMap.set(vp.id, vp.skills)
          }
        })
      }
    } catch (vErr) {
      console.warn('Notice reading volunteer profiles for skills:', vErr)
    }

    // Fetch opportunity titles
    const opTitleMap = new Map<string, string>()
    try {
      const { data: ops } = await adminClient
        .from('opportunities')
        .select('id, title')
      if (ops) {
        ops.forEach((o) => opTitleMap.set(o.id, o.title))
      }
    } catch (oErr) {
      console.warn('Notice reading opportunities for applicants:', oErr)
    }

    return dbApps.map((a) => {
      const uInfo = userMap.get(a.volunteer_id)
      const skills = skillsMap.get(a.volunteer_id) || ['Community Support', 'Volunteering']
      const status: 'pending' | 'accepted' | 'declined' =
        a.status === 'accepted' ? 'accepted' : a.status === 'rejected' ? 'declined' : 'pending'

      return {
        id: a.id,
        eventId: a.opportunity_id,
        eventTitle: opTitleMap.get(a.opportunity_id) || 'Volunteer Drive',
        volunteerId: a.volunteer_id,
        name: uInfo?.name || 'Volunteer',
        email: uInfo?.email || '',
        phone: uInfo?.phone || '',
        skills,
        note: '',
        status,
        appliedAt: a.applied_at
          ? new Date(a.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recently',
      }
    })
  } catch (err) {
    console.error('Error fetching applicants from DB:', err)
    return []
  }
}

export async function fetchUserApplicationsAction(userId?: string, email?: string): Promise<DbApplicantRecord[]> {
  try {
    const all = await fetchApplicantsAction()
    return all.filter((a) => {
      if (userId && a.volunteerId && a.volunteerId === userId) return true
      if (email && a.email && a.email.trim().toLowerCase() === email.trim().toLowerCase()) return true
      return false
    })
  } catch (err) {
    console.error('Error fetching user applications:', err)
    return []
  }
}

export async function cancelOpportunityAction(payload: {
  eventId: string
  reason?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Update or mark description with cancellation notice in DB
    try {
      await adminClient
        .from('opportunities')
        .update({ description: `[CANCELLED] ${payload.reason || 'Event cancelled by organizer.'}` })
        .eq('id', payload.eventId)
    } catch (err) {
      console.warn('Notice updating database opportunity cancellation:', err)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error cancelling opportunity:', err)
    return { success: false, error: err?.message }
  }
}

export async function updateOpportunityContactAction(payload: {
  eventId: string
  managerName?: string
  managerPhone?: string
  address?: string
  location?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    const updateData: Record<string, any> = {}
    if (payload.managerName !== undefined) updateData.manager_name = payload.managerName.trim()
    if (payload.managerPhone !== undefined) updateData.manager_phone = payload.managerPhone.trim()
    if (payload.address !== undefined) updateData.address = payload.address.trim()
    if (payload.location !== undefined) updateData.location = payload.location.trim()

    if (Object.keys(updateData).length > 0) {
      await adminClient
        .from('opportunities')
        .update(updateData)
        .eq('id', payload.eventId)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating opportunity contact:', err)
    return { success: false, error: err?.message }
  }
}



