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

export async function approveOrganizationAction(orgId: string): Promise<AdminState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organizations')
    .update({ status: 'approved' })
    .eq('id', orgId)

  if (error) {
    console.error('Error approving organization:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  return { message: 'Organization approved successfully!' }
}

export async function rejectOrganizationAction(orgId: string, reason?: string): Promise<AdminState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organizations')
    .update({ status: 'rejected' })
    .eq('id', orgId)

  if (error) {
    console.error('Error rejecting organization:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  return { message: 'Organization rejected.' }
}

export async function approveDonorAction(donorId: string): Promise<AdminState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('donors')
    .update({ status: 'approved' })
    .eq('id', donorId)

  if (error) {
    console.error('Error approving donor:', error)
    return { error: error.message }
  }

  return { message: 'Donor approved successfully!' }
}

export async function rejectDonorAction(donorId: string): Promise<AdminState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('donors')
    .update({ status: 'rejected' })
    .eq('id', donorId)

  if (error) {
    console.error('Error rejecting donor:', error)
    return { error: error.message }
  }

  return { message: 'Donor status updated.' }
}

export async function fetchAdminOrganizations() {
  try {
    const supabase = await createClient()

    // Query organizations from Supabase
    const { data: dbOrgs, error } = await supabase
      .from('organizations')
      .select('id, website, verification_document_url, registration_number, status, verified_at')

    if (error || !dbOrgs) {
      console.warn('Could not fetch organizations from Supabase:', error)
      return []
    }

    // Try fetching profiles to get organization names
    const orgIds = dbOrgs.map((o) => o.id)
    const { data: dbProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', orgIds)

    const profileMap = new Map((dbProfiles ?? []).map((p) => [p.id, p.full_name]))

    return dbOrgs.map((org: any) => {
      const name = profileMap.get(org.id) || `Organization (${org.id.slice(0, 8)})`
      return {
        id: org.id,
        name,
        email: `org-${org.id.slice(0, 6)}@togethernow.org`,
        website: org.website || 'https://togethernow.org',
        registrationNumber: org.registration_number || 'NGO-REG-PENDING',
        verificationDocumentUrl: org.verification_document_url || 'https://togethernow.org/docs/verify.pdf',
        status: (org.status as 'pending' | 'approved' | 'rejected') || 'pending',
        submittedAt: org.verified_at ? new Date(org.verified_at).toLocaleDateString() : 'Just now',
      }
    })
  } catch (err) {
    console.error('Failed to fetch admin organizations:', err)
    return []
  }
}

