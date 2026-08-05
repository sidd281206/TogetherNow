import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VolunteerOnboardingForm, OrganizationOnboardingForm } from './OnboardingForms'

export const metadata = {
  title: 'Complete Your Profile — TogetherNow',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role: string = user.user_metadata?.role ?? 'volunteer'

  // Check if they already completed onboarding
  if (role === 'volunteer') {
    const { data: volProfile } = await supabase
      .from('volunteer_profiles')
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (volProfile) redirect('/dashboard')
  } else if (role === 'organization') {
    const { data: orgProfile } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (orgProfile) redirect('/dashboard')
  } else {
    // Admin or Donor - redirect to dashboard for now
    redirect('/dashboard')
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div className="auth-form-card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="auth-form-header">
          <h2 className="auth-form-title">Complete your profile</h2>
          <p className="auth-form-subtitle">
            {role === 'volunteer' 
              ? 'Tell us about your skills and interests to find the best opportunities.'
              : 'Verify your organization to start posting opportunities.'}
          </p>
        </div>
        
        {role === 'volunteer' ? (
          <VolunteerOnboardingForm />
        ) : (
          <OrganizationOnboardingForm />
        )}
      </div>
    </div>
  )
}
