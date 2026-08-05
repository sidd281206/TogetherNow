'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type OnboardingState = {
  errors?: {
    general?: string[]
    skills?: string[]
    interests?: string[]
    availability?: string[]
    website?: string[]
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
  const verificationDocumentUrl = formData.get('verificationDocumentUrl')?.toString().trim() ?? ''

  const errors: NonNullable<OnboardingState>['errors'] = {}

  if (!website) {
    errors.website = ['Website URL is required.']
  }
  if (!verificationDocumentUrl) {
    errors.verification = ['Verification details are required.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase.from('organizations').insert({
    id: user.id,
    website,
    verification_document_url: verificationDocumentUrl,
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

  redirect('/dashboard')
}
