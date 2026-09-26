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
  let initialVolunteerData = null

  if (role === 'volunteer') {
    const { data: volProfile } = await supabase
      .from('volunteer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const parseList = (val: any): string[] => {
      if (Array.isArray(val)) return val.filter(Boolean).map(String)
      if (typeof val === 'string' && val.trim()) {
        return val.split(',').map((s) => s.trim()).filter(Boolean)
      }
      return []
    }

    if (volProfile || userProfile || user.user_metadata?.skills || user.user_metadata?.city) {
      initialVolunteerData = {
        fullName: userProfile?.full_name || user.user_metadata?.full_name || '',
        phone: userProfile?.phone || user.user_metadata?.phone || '',
        address: userProfile?.address || user.user_metadata?.address || '',
        city: (userProfile as any)?.city || user.user_metadata?.city || '',
        pincode: (userProfile as any)?.pincode || user.user_metadata?.pincode || '',
        skills: parseList(volProfile?.skills || user.user_metadata?.skills),
        interests: parseList(volProfile?.interests || user.user_metadata?.interests),
        availability: volProfile?.availability || user.user_metadata?.availability || 'weekends',
      }
    }
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
            {role === 'volunteer'
              ? (initialVolunteerData ? 'Edit My Volunteer Profile' : 'Complete Volunteer Profile')
              : initialOrgData
              ? 'Re-submit Organization Verification'
              : 'Verify Your Organization'}
          </h2>
          <p className="auth-form-subtitle">
            {role === 'volunteer' 
              ? 'Update your city, phone number, interests, and skills to personalize opportunity recommendations.'
              : initialOrgData
              ? 'Review or update your organization details, registration number, or verification document below.'
              : 'Verify your organization to start posting opportunities.'}
          </p>
        </div>
        
        {role === 'volunteer' ? (
          <VolunteerOnboardingForm
            userEmail={user.email || ''}
            initialData={initialVolunteerData}
          />
        ) : (
          <OrganizationOnboardingForm
            initialData={initialOrgData}
            userEmail={user.email || ''}
            orgName={user.user_metadata?.full_name || user.user_metadata?.name || ''}
            userId={user.id}
          />
        )}
      </div>
    </div>
  )
}
