'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export type OnboardingState = {
  errors?: {
    general?: string[]
    skills?: string[]
    interests?: string[]
    availability?: string[]
    website?: string[]
    registrationNumber?: string[]
    verification?: string[]
  }
  message?: string
} | null

export async function completeVolunteerProfileAction(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const availability = formData.get('availability')?.toString().trim() ?? ''
  
  // Assuming skills and interests come in as comma-separated strings
  const skillsStr = formData.get('skills')?.toString().trim() ?? ''
  const interestsStr = formData.get('interests')?.toString().trim() ?? ''

  const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
  const interests = interestsStr.split(',').map((s) => s.trim()).filter(Boolean)

  const errors: NonNullable<OnboardingState>['errors'] = {}

  if (skills.length === 0) {
    errors.skills = ['Please select or enter at least one skill.']
  }
  if (interests.length === 0) {
    errors.interests = ['Please select or enter at least one interest.']
  }
  if (!availability) {
    errors.availability = ['Please provide your availability.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase.from('volunteer_profiles').insert({
    id: user.id,
    availability,
    skills,
    interests,
    total_hours: 0,
  })

  if (error) {
    console.error('Error inserting volunteer profile:', error)
    return {
      errors: {
        general: [error.message],
      },
    }
  }

  redirect('/dashboard')
}

export async function completeOrganizationProfileAction(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const website = formData.get('website')?.toString().trim() ?? ''
  const registrationNumber = formData.get('registrationNumber')?.toString().trim() ?? ''
  const verificationDocType = formData.get('verificationDocType')?.toString().trim() ?? 'file'
  const verificationDocumentUrl = formData.get('verificationDocumentUrl')?.toString().trim() ?? ''
  const verificationFile = formData.get('verificationFile') as File | null

  const errors: NonNullable<OnboardingState>['errors'] = {}

  if (!website) {
    errors.website = ['Organization website URL is required.']
  }
  if (!registrationNumber) {
    errors.registrationNumber = ['Registration number is required.']
  }

  let finalDocUrl = ''

  if (verificationDocType === 'file') {
    if (!verificationFile || verificationFile.size === 0) {
      // Fetch existing organization profile to preserve document URL if re-submitting
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('verification_document_url')
        .eq('id', user.id)
        .maybeSingle()

      if (existingOrg?.verification_document_url) {
        finalDocUrl = existingOrg.verification_document_url
      } else {
        errors.verification = ['Please upload a PDF verification document.']
      }
    } else {
      try {
        const fileExt = verificationFile.name.split('.').pop() ?? 'pdf'
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        
        // Convert File blob to Buffer for reliable server action binary upload
        const arrayBuffer = await verificationFile.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        // Use service role / admin client to bypass storage RLS upload restrictions
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const adminStorage = createAdminClient(supabaseUrl, serviceKey).storage

        const { error: uploadErr } = await adminStorage
          .from('verification-docs')
          .upload(filePath, fileBuffer, {
            contentType: verificationFile.type || 'application/pdf',
            upsert: true,
          })

        if (uploadErr) {
          console.error('Supabase storage upload error:', uploadErr.message)
          errors.verification = [`Storage Upload Failed: ${uploadErr.message}. Please check bucket permissions or try again.`]
        } else {
          const { data: urlData } = adminStorage
            .from('verification-docs')
            .getPublicUrl(filePath)

          finalDocUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/verification-docs/${filePath}`
        }
      } catch (err: any) {
        console.error('Storage upload exception:', err)
        errors.verification = [`File upload error: ${err?.message || 'Failed to process PDF'}`]
      }
    }
  } else {
    if (!verificationDocumentUrl) {
      errors.verification = ['Verification document URL link is required.']
    } else {
      finalDocUrl = verificationDocumentUrl
    }
  }

  if (Object.keys(errors).length > 0) return { errors }

  let { error } = await supabase.from('organizations').upsert({
    id: user.id,
    website,
    registration_number: registrationNumber,
    verification_document_url: finalDocUrl,
    status: 'pending',
  })

  // Fallback if remote Supabase schema does not have registration_number column yet
  if (error && (error.message.includes('registration_number') || error.code === 'PGRST204')) {
    console.warn('registration_number column not found in remote Supabase table, executing fallback upsert...')
    const fallbackDocUrl = `${finalDocUrl} (Reg No: ${registrationNumber})`
    const fallbackRes = await supabase.from('organizations').upsert({
      id: user.id,
      website,
      verification_document_url: fallbackDocUrl,
      status: 'pending',
    })
    error = fallbackRes.error
  }

  if (error) {
    console.error('Error inserting organization profile:', error)
    return {
      errors: {
        general: [error.message],
      },
    }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  revalidatePath('/onboarding')

  redirect('/dashboard')
}
