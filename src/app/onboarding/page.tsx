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
  let initialOrgData = null

  if (role === 'volunteer') {
    const { data: volProfile } = await supabase
      .from('volunteer_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (volProfile) redirect('/dashboard')
  } else if (role === 'organization') {
    const { data: orgProfile } = await supabase
      .from('organizations')
      .select('id, website, registration_number, verification_document_url, status')
      .eq('id', user.id)
      .maybeSingle()

    if (orgProfile) {
      // If organization is already verified, do not allow re-submitting profile
      if (orgProfile.status === 'approved') {
        redirect('/dashboard')
      }

      initialOrgData = {
        website: orgProfile.website || '',
        registrationNumber: (orgProfile as any).registration_number || '',
        verificationDocumentUrl: orgProfile.verification_document_url || '',
        status: orgProfile.status,
      }
    }
  } else {
    redirect('/dashboard')
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div className="auth-form-card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="auth-form-header">
          <h2 className="auth-form-title">
            {initialOrgData ? 'Re-submit Organization Verification' : 'Verify Your Organization'}
          </h2>
          <p className="auth-form-subtitle">
            {role === 'volunteer' 
              ? 'Tell us about your skills and interests to find the best opportunities.'
              : initialOrgData
              ? 'Review or update your organization details, registration number, or verification document below.'
              : 'Verify your organization to start posting opportunities.'}
          </p>
        </div>
        
        {role === 'volunteer' ? (
          <VolunteerOnboardingForm />
        ) : (
          <OrganizationOnboardingForm initialData={initialOrgData} />
        )}
      </div>
    </div>
  )
}
