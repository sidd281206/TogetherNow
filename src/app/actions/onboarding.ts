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
    phone?: string[]
    address?: string[]
    otp?: string[]
    website?: string[]
    registrationNumber?: string[]
    verification?: string[]
    panNumber?: string[]
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

  const availability = formData.get('availability')?.toString().trim() ?? 'flexible'
  const skillsStr = formData.get('skills')?.toString().trim() ?? ''
  const interestsStr = formData.get('interests')?.toString().trim() ?? ''
  const phone = formData.get('phone')?.toString().trim() ?? ''
  const address = formData.get('address')?.toString().trim() ?? ''
  const city = formData.get('city')?.toString().trim() ?? ''
  const pincode = formData.get('pincode')?.toString().trim() ?? ''
  const isEmailVerifiedStr = formData.get('isEmailVerified')?.toString() ?? 'true'

  const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
  const interests = interestsStr.split(',').map((s) => s.trim()).filter(Boolean)

  const errors: NonNullable<OnboardingState>['errors'] = {}

  if (skills.length === 0) {
    errors.skills = ['Please enter at least one skill.']
  }
  if (interests.length === 0) {
    errors.interests = ['Please enter at least one interest.']
  }
  if (!phone) {
    errors.phone = ['Phone number is required.']
  }
  if (!address || !city) {
    errors.address = ['Address and city are required.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  const fullAddress = pincode ? `${address}, ${city} - ${pincode}` : `${address}, ${city}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // Update profiles
  try {
    await adminClient.from('profiles').upsert({
      id: user.id,
      phone,
      address: fullAddress,
      city,
      email_verified: isEmailVerifiedStr === 'true',
    })
  } catch (err) {
    console.warn('Notice updating profiles table:', err)
  }

  // Update volunteer_profiles
  const { error } = await supabase.from('volunteer_profiles').upsert({
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

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
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
  const phone = formData.get('phone')?.toString().trim() ?? ''
  const address = formData.get('address')?.toString().trim() ?? ''
  const city = formData.get('city')?.toString().trim() ?? ''
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

  const uploadedDocUrl = formData.get('uploadedDocUrl')?.toString().trim() ?? ''
  let finalDocUrl = ''

  if (uploadedDocUrl) {
    finalDocUrl = uploadedDocUrl
  } else if (verificationDocType === 'file') {
    if (!verificationFile || verificationFile.size === 0) {
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        const rawOrgName =
          profileData?.full_name ||
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          'organization'

        const orgFolderName =
          rawOrgName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || user.id

        const fileExt = verificationFile.name.split('.').pop() ?? 'pdf'
        const filePath = `documents/${orgFolderName}/${Date.now()}.${fileExt}`
        
        const arrayBuffer = await verificationFile.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const adminStorage = createAdminClient(supabaseUrl, serviceKey).storage

        try {
          await adminStorage.createBucket('verification-docs', { public: true })
        } catch (bErr) {
          // bucket may already exist
        }

        const { error: uploadErr } = await adminStorage
          .from('verification-docs')
          .upload(filePath, fileBuffer, {
            contentType: verificationFile.type || 'application/pdf',
            upsert: true,
          })

        if (uploadErr) {
          console.error('Supabase storage upload error:', uploadErr.message)
          // Fallback to storing the file path so the proxy route can still find it
          finalDocUrl = filePath
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

  const fullAddress = address && city ? `${address}, ${city}` : address || city || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // Save contact phone and address to profiles table where columns exist
  try {
    await adminClient.from('profiles').upsert({
      id: user.id,
      phone: phone || null,
      address: fullAddress || null,
    })
  } catch (err) {
    console.warn('Notice saving organization contact info to profiles:', err)
  }

  let { error } = await supabase.from('organizations').upsert({
    id: user.id,
    website,
    verification_document_url: finalDocUrl,
    status: 'pending',
  })

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

export async function completeDonorProfileAction(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const phone = formData.get('phone')?.toString().trim() ?? ''
  const address = formData.get('address')?.toString().trim() ?? ''
  const city = formData.get('city')?.toString().trim() ?? ''
  const pincode = formData.get('pincode')?.toString().trim() ?? ''
  const panNumber = formData.get('panNumber')?.toString().trim() ?? ''
  const isEmailVerifiedStr = formData.get('isEmailVerified')?.toString() ?? 'false'

  const errors: NonNullable<OnboardingState>['errors'] = {}

  if (!phone) {
    errors.phone = ['Phone number is required.']
  }
  if (!address || !city) {
    errors.address = ['Address and city are required.']
  }
  if (isEmailVerifiedStr !== 'true') {
    errors.otp = ['Please verify your email with OTP before saving your profile.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  const fullAddress = pincode ? `${address}, ${city} - ${pincode}` : `${address}, ${city}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // 1. Update auth user metadata
  try {
    await adminClient.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        phone,
        address: fullAddress,
        city,
        pincode,
        email_verified: true,
        isEmailVerified: true,
        profile_completed: true,
        completionPercentage: 100,
      },
    })
  } catch (err) {
    console.warn('Notice updating donor auth metadata:', err)
  }

  // 2. Update profiles table
  try {
    await adminClient.from('profiles').upsert({
      id: user.id,
      phone,
      address: fullAddress,
      city,
      email_verified: true,
    })
  } catch (err) {
    console.warn('Notice updating donor profiles table:', err)
  }

  // 3. Upsert donor_profiles table
  const { error } = await adminClient.from('donor_profiles').upsert({
    id: user.id,
    phone,
    address: fullAddress,
    city,
    pincode,
    pan_number: panNumber || null,
    email_verified: true,
  })

  if (error) {
    console.error('Error saving donor profile:', error)
    return { errors: { general: [error.message] } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  redirect('/dashboard')
}
