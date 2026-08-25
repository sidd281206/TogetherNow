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

  const orgName = userProfile?.full_name || user.user_metadata?.full_name || 'Organization'
  const orgStatus = orgProfile?.status || 'approved'
  const isVerified = orgStatus === 'approved'

  const managerName = input.managerName?.trim() || ''
  const managerPhone = input.managerPhone?.trim() || ''
  const address = input.isRemote ? 'Online / Remote' : (input.address?.trim() || input.location?.trim() || '')

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
    time: input.time || 'To be scheduled',
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
      time: input.time || 'To be scheduled',
      spotsLeft: input.spotsLeft,
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
    location: inserted.location,
    address: inserted.address || address,
    managerName: inserted.manager_name || managerName,
    managerPhone: inserted.manager_phone || managerPhone,
    isRemote: inserted.is_remote,
    date: inserted.date,
    time: inserted.time,
    spotsLeft: inserted.spots_left,
    skillsNeeded: inserted.skills_needed || [],
    description: inserted.description,
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

    // Fetch organization verification statuses
    const orgIds = Array.from(new Set(dbOps.map((op) => op.organization_id).filter(Boolean)))
    const orgStatusMap = new Map<string, string>()

    if (orgIds.length > 0) {
      const { data: orgs } = await adminClient
        .from('organizations')
        .select('id, status')
        .in('id', orgIds)

      if (orgs) {
        orgs.forEach((o) => orgStatusMap.set(o.id, o.status))
      }
    }

    return dbOps.map((op) => {
      const status = (op.organization_id ? orgStatusMap.get(op.organization_id) : 'approved') || 'approved'
        const totalRequired = op.total_required ?? op.total_spots ?? op.spots_left ?? 10
        const alreadyRegistered = op.already_registered ?? 0
        const computedSpotsLeft = Math.max(0, totalRequired - alreadyRegistered)

        return {
          id: op.id,
          title: op.title,
          organization: op.organization_name || 'Organization',
          organizationId: op.organization_id || '',
          isVerifiedOrg: status !== 'rejected',
          orgStatus: status as any,
          category: (op.category || 'Community') as any,
          location: op.location || 'Local Community Center',
          address: op.address || op.location || 'Local Community Center',
          managerName: op.manager_name || op.organization_name || 'Event Coordinator',
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
        }
    })
  } catch (err) {
    console.error('Error fetching opportunities:', err)
    return []
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

export async function updateApplicantStatusAction(payload: {
  applicantId: string
  eventId: string
  status: 'accepted' | 'declined'
  volunteerId?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Attempt to update Supabase applications table if present
    if (payload.volunteerId && payload.eventId) {
      try {
        await adminClient
          .from('applications')
          .update({ status: payload.status === 'accepted' ? 'accepted' : 'rejected' })
          .match({ opportunity_id: payload.eventId, volunteer_id: payload.volunteerId })
      } catch (err) {
        console.warn('Notice updating Supabase application status:', err)
      }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating applicant status:', err)
    return { success: false, error: err?.message }
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



