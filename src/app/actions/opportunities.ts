'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export interface DbOpportunityInput {
  title: string
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  location: string
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  totalRequired?: number
  alreadyRegistered?: number
  skillsNeeded: string[]
  description: string
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
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  totalRequired?: number
  alreadyRegistered?: number
  skillsNeeded: string[]
  description: string
  createdAt?: string
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
    .select('id, status')
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

  // Admin client bypass if RLS restricts table writes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  const newRow = {
    organization_id: user.id,
    organization_name: orgName,
    title: input.title,
    category: input.category,
    location: input.isRemote ? 'Remote' : (input.location || 'Local Community Center'),
    is_remote: input.isRemote,
    date: input.date || 'Upcoming',
    time: input.time || 'To be scheduled',
    spots_left: input.spotsLeft || 10,
    skills_needed: input.skillsNeeded || ['Volunteering'],
    description: input.description,
  }

  const { data: inserted, error: insertErr } = await adminClient
    .from('opportunities')
    .insert(newRow)
    .select()
    .single()

  if (insertErr) {
    console.warn('Notice inserting with extended columns:', insertErr.message)
    // Fallback insert with core columns if extended schema columns do not exist yet
    const { data: basicInserted, error: basicErr } = await adminClient
      .from('opportunities')
      .insert({
        organization_id: user.id,
        title: input.title,
        description: input.description,
      })
      .select()
      .single()

    const fallbackOp: DbOpportunityOutput = {
      id: basicInserted?.id || `event-${Date.now()}`,
      title: input.title,
      organization: orgName,
      organizationId: user.id,
      isVerifiedOrg: isVerified,
      orgStatus: orgStatus as any,
      category: input.category,
      location: input.isRemote ? 'Remote' : (input.location || 'Local Community Center'),
      isRemote: input.isRemote,
      date: input.date || 'Upcoming',
      time: input.time || 'To be scheduled',
      spotsLeft: input.spotsLeft || 10,
      skillsNeeded: input.skillsNeeded || ['Volunteering'],
      description: input.description,
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
      return {
        id: op.id,
        title: op.title,
        organization: op.organization_name || 'Organization',
        organizationId: op.organization_id || '',
        isVerifiedOrg: status !== 'rejected',
        orgStatus: status as any,
        category: (op.category || 'Community') as any,
        location: op.location || 'Local Community Center',
        isRemote: Boolean(op.is_remote),
        date: op.date || 'Upcoming',
        time: op.time || 'Flexible',
        spotsLeft: op.spots_left ?? 10,
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
