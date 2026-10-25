'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DonationActionState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
} | null

// ─── Create Donation Request (Organization) ───────────────────────────────────

export async function createDonationRequestAction(
  _state: DonationActionState,
  formData: FormData
): Promise<DonationActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role ?? ''
  if (role !== 'organization') {
    return { errors: { general: ['Only verified organizations can raise funds.'] } }
  }

  // Verify org is approved
  const { data: orgProfile } = await supabase
    .from('organizations')
    .select('status')
    .eq('id', user.id)
    .maybeSingle()

  if (!orgProfile || orgProfile.status !== 'approved') {
    return { errors: { general: ['Your organization must be verified and approved before raising funds.'] } }
  }

  const title = formData.get('title')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const causeCategory = formData.get('causeCategory')?.toString().trim() ?? 'Community'
  const goalAmountStr = formData.get('goalAmount')?.toString().trim() ?? ''
  const deadlineStr = formData.get('deadline')?.toString().trim() ?? ''
  const imageUrl = formData.get('imageUrl')?.toString().trim() ?? ''
  const upiId = formData.get('upiId')?.toString().trim() ?? ''

  const errors: Record<string, string[]> = {}

  if (!title || title.length < 5) {
    errors.title = ['Campaign title must be at least 5 characters.']
  }
  if (!description || description.length < 30) {
    errors.description = ['Description must be at least 30 characters.']
  }
  const goalAmount = parseFloat(goalAmountStr)
  if (!goalAmountStr || isNaN(goalAmount) || goalAmount < 1000) {
    errors.goalAmount = ['Funding goal must be at least ₹1,000.']
  }
  if (!deadlineStr) {
    errors.deadline = ['Campaign deadline is required.']
  } else {
    const deadline = new Date(deadlineStr)
    const minDeadline = new Date()
    minDeadline.setDate(minDeadline.getDate() + 7)
    if (deadline < minDeadline) {
      errors.deadline = ['Deadline must be at least 7 days from today.']
    }
  }

  if (Object.keys(errors).length > 0) return { errors }

  // Fetch org name from profiles
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const orgName =
    profileRow?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    'Organization'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // Update org's upi_id if provided
  if (upiId) {
    try {
      await adminClient.from('organizations').update({ upi_id: upiId }).eq('id', user.id)
    } catch (e) {
      // ignore if column doesn't exist yet
    }
  }

  let { error } = await adminClient.from('donation_requests').insert({
    organization_id: user.id,
    organization_name: orgName,
    title,
    description,
    cause_category: causeCategory,
    goal_amount: goalAmount,
    deadline: deadlineStr || null,
    image_url: imageUrl || null,
    upi_id: upiId || null,
    status: 'active',
  })

  // If column upi_id does not exist, retry without it
  if (error && error.message?.toLowerCase().includes('column')) {
    const fallbackRes = await adminClient.from('donation_requests').insert({
      organization_id: user.id,
      organization_name: orgName,
      title,
      description,
      cause_category: causeCategory,
      goal_amount: goalAmount,
      deadline: deadlineStr || null,
      image_url: imageUrl || null,
      status: 'active',
    })
    error = fallbackRes.error
  }

  if (error) {
    console.error('Error creating donation request:', error)
    return { errors: { general: [error.message] } }
  }

  revalidatePath('/dashboard')
  return { message: 'Campaign created successfully! Donors can now see and contribute to your campaign. 🎉' }
}

// ─── Make Donation (Donor) ────────────────────────────────────────────────────

export async function makeDonationAction(
  _state: DonationActionState,
  formData: FormData
): Promise<DonationActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role ?? ''
  if (role !== 'donor') {
    return { errors: { general: ['Only registered donors can make donations.'] } }
  }

  const amountStr = formData.get('amount')?.toString().trim() ?? ''
  const donationRequestId = formData.get('donationRequestId')?.toString().trim() ?? ''
  const upiId = formData.get('upiId')?.toString().trim() ?? ''
  const upiReference = formData.get('upiReference')?.toString().trim() ?? ''

  const errors: Record<string, string[]> = {}

  const amount = parseFloat(amountStr)
  if (!amountStr || isNaN(amount) || amount < 10) {
    errors.amount = ['Minimum donation amount is ₹10.']
  }
  if (!donationRequestId) {
    errors.general = ['Invalid campaign selected.']
  }
  if (!upiReference || upiReference.trim().length < 6) {
    errors.upiReference = ['UPI Reference / UTR Number is mandatory to verify your payment.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  // Verify the donation request exists and is active
  const { data: request } = await supabase
    .from('donation_requests')
    .select('id, organization_id, organization_name, title, status')
    .eq('id', donationRequestId)
    .maybeSingle()

  if (!request) {
    return { errors: { general: ['Campaign not found.'] } }
  }
  if (request.status !== 'active') {
    return { errors: { general: ['This campaign is no longer accepting donations.'] } }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // Insert donation in 'pending' status until verified by organization
  let { error } = await adminClient.from('donations').insert({
    donor_id: user.id,
    organization_id: request.organization_id,
    donation_request_id: donationRequestId,
    amount,
    currency: 'INR',
    upi_id: upiId || null,
    upi_txn_ref: upiReference.trim(),
    status: 'pending',
  })

  // If columns don't exist yet, retry with base columns
  if (error && error.message?.toLowerCase().includes('column')) {
    const fallbackRes = await adminClient.from('donations').insert({
      donor_id: user.id,
      organization_id: request.organization_id,
      donation_request_id: donationRequestId,
      amount,
      currency: 'INR',
      status: 'pending',
    })
    error = fallbackRes.error
  }

  if (error) {
    console.error('Error recording donation:', error)
    return { errors: { general: [error.message] } }
  }

  revalidatePath('/dashboard')
  return { 
    success: true,
    message: `Payment submitted for verification! ⏳ Your payment of ₹${amount.toLocaleString('en-IN')} with UTR reference ${upiReference.trim()} has been forwarded to ${request.organization_name || 'the organization'}. Once verified against their bank statement, your donation receipt will be generated and available on your dashboard.`
  }
}

// ─── Verify Donation (Organization) ───────────────────────────────────────────

export async function verifyDonationAction(
  donationId: string,
  action: 'approve' | 'reject'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const role = user.user_metadata?.role ?? ''
  if (role !== 'organization') {
    return { success: false, error: 'Only organizations can verify donations.' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  const newStatus = action === 'approve' ? 'completed' : 'rejected'

  const { error } = await adminClient
    .from('donations')
    .update({
      status: newStatus,
    })
    .eq('id', donationId)
    .eq('organization_id', user.id)

  if (error) {
    console.error('Error verifying donation:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Close Campaign (Organization) ───────────────────────────────────────────

export async function closeCampaignAction(
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('donation_requests')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('organization_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
