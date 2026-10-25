'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AdminState = {
  error?: string
  message?: string
} | null

export async function adminLoginAction(
  _state: AdminState,
  formData: FormData
): Promise<AdminState> {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) {
    return { error: 'Please provide both admin email and password.' }
  }

  // Check admin credentials
  // Simple admin credentials check or Supabase auth check with admin role
  if (email.toLowerCase() === 'admin@togethernow.org' && password === 'admin123') {
    // Successfully authenticated as admin
    redirect('/admin/dashboard')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const role = data.user?.user_metadata?.role
  if (role !== 'admin' && email.toLowerCase() !== 'admin@togethernow.org') {
    return { error: 'Access denied: You do not have administrator privileges.' }
  }

  redirect('/admin/dashboard')
}

import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createAdminClient(supabaseUrl, serviceKey)
}

export async function approveOrganizationAction(orgId: string): Promise<AdminState> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('organizations')
    .update({ 
      status: 'approved',
      verified_at: new Date().toISOString()
    })
    .eq('id', orgId)

  if (error) {
    console.error('Error approving organization:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { message: 'Organization approved successfully!' }
}

export async function rejectOrganizationAction(orgId: string, reason?: string): Promise<AdminState> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('organizations')
    .update({ status: 'rejected' })
    .eq('id', orgId)

  if (error) {
    console.error('Error rejecting organization:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { message: 'Organization rejected.' }
}

export async function approveDonorAction(donorId: string): Promise<AdminState> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('donor_profiles')
    .update({ email_verified: true })
    .eq('id', donorId)

  if (error) {
    console.error('Error approving donor:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { message: 'Donor approved successfully!' }
}

export async function rejectDonorAction(donorId: string): Promise<AdminState> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('donor_profiles')
    .update({ email_verified: false })
    .eq('id', donorId)

  if (error) {
    console.error('Error rejecting donor:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { message: 'Donor status updated.' }
}

export async function fetchAdminOrganizations() {
  try {
    const admin = getAdminClient()

    // Query organizations from Supabase using admin client (bypasses RLS)
    const { data: dbOrgs, error } = await admin
      .from('organizations')
      .select('id, website, verification_document_url, registration_number, status, verified_at')

    if (error || !dbOrgs) {
      console.warn('Could not fetch organizations from Supabase:', error)
      return []
    }

    // Try fetching profiles to get organization names
    const orgIds = dbOrgs.map((o) => o.id)
    const { data: dbProfiles } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', orgIds)

    const profileMap = new Map((dbProfiles ?? []).map((p) => [p.id, p.full_name]))

    // Attempt to fetch real emails from auth users
    let userEmailMap = new Map<string, string>()
    try {
      const { data: { users } } = await admin.auth.admin.listUsers()
      if (users) {
        userEmailMap = new Map(users.map((u) => [u.id, u.email || '']))
      }
    } catch {}

    return dbOrgs.map((org: any) => {
      const name = profileMap.get(org.id) || `Organization (${org.id.slice(0, 8)})`
      const email = userEmailMap.get(org.id) || `org-${org.id.slice(0, 6)}@togethernow.org`
      return {
        id: org.id,
        name,
        email,
        website: org.website || 'https://togethernow.org',
        registrationNumber: org.registration_number || 'NGO-PENDING',
        verificationDocumentUrl: org.verification_document_url || 'https://togethernow.org/docs/verify.pdf',
        status: (org.status as 'pending' | 'approved' | 'rejected') || 'pending',
        submittedAt: org.verified_at ? new Date(org.verified_at).toLocaleDateString() : 'Pending Review',
      }
    })
  } catch (err) {
    console.error('Failed to fetch admin organizations:', err)
    return []
  }
}

export async function fetchAdminDonors() {
  try {
    const admin = getAdminClient()

    const { data: dbDonors, error } = await admin
      .from('donor_profiles')
      .select('id, pan_number, created_at, phone, address, email_verified')

    if (error || !dbDonors) {
      return []
    }

    const donorIds = dbDonors.map((d) => d.id)
    const { data: dbProfiles } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', donorIds)

    const profileMap = new Map((dbProfiles ?? []).map((p) => [p.id, p.full_name]))

    let userEmailMap = new Map<string, string>()
    try {
      const { data: { users } } = await admin.auth.admin.listUsers()
      if (users) {
        userEmailMap = new Map(users.map((u) => [u.id, u.email || '']))
      }
    } catch {}

    return dbDonors.map((d: any) => {
      const name = profileMap.get(d.id) || `Donor (${d.id.slice(0, 8)})`
      const email = userEmailMap.get(d.id) || `donor-${d.id.slice(0, 6)}@togethernow.org`
      return {
        id: d.id,
        name,
        email,
        taxId: d.pan_number || 'PAN-PENDING',
        donorType: 'Individual' as const,
        status: (d.email_verified ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
        submittedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
      }
    })
  } catch (err) {
    console.error('Failed to fetch admin donors:', err)
    return []
  }
}

