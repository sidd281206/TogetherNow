'use server'

import { redirect } from 'next/navigation'
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
