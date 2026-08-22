'use client'

import { useState, useActionState } from 'react'
import { completeVolunteerProfileAction, completeOrganizationProfileAction, type OnboardingState } from '@/app/actions/onboarding'

const initialState: OnboardingState = null

export function VolunteerOnboardingForm() {
  const [state, action, pending] = useActionState(completeVolunteerProfileAction, initialState)

  return (
    <form action={action} className="auth-form" noValidate>
      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="skills" className="auth-label">Skills (comma-separated)</label>
        <input
          id="skills"
          name="skills"
          type="text"
          placeholder="e.g. Teaching, Coding, Medical"
          className={`auth-input ${state?.errors?.skills ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.skills && <p className="auth-field-error">{state.errors.skills[0]}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="interests" className="auth-label">Interests (comma-separated)</label>
        <input
          id="interests"
          name="interests"
          type="text"
          placeholder="e.g. Education, Healthcare, Environment"
          className={`auth-input ${state?.errors?.interests ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.interests && <p className="auth-field-error">{state.errors.interests[0]}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="availability" className="auth-label">Availability</label>
        <select 
          id="availability" 
          name="availability" 
          className={`auth-input ${state?.errors?.availability ? 'auth-input-error' : ''}`}
        >
          <option value="">Select availability</option>
          <option value="weekends">Weekends</option>
          <option value="weekdays">Weekdays</option>
          <option value="evenings">Evenings</option>
          <option value="flexible">Flexible</option>
        </select>
        {state?.errors?.availability && <p className="auth-field-error">{state.errors.availability[0]}</p>}
      </div>

      <button type="submit" disabled={pending} className="auth-btn-primary">
        {pending ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  )
}

interface OrganizationOnboardingFormProps {
  initialData?: {
    website?: string
    registrationNumber?: string
    verificationDocumentUrl?: string
    status?: string
  } | null
}

export function OrganizationOnboardingForm({ initialData }: OrganizationOnboardingFormProps) {
  const [state, action, pending] = useActionState(completeOrganizationProfileAction, initialState)
  const [docMode, setDocMode] = useState<'file' | 'url'>(
    initialData?.verificationDocumentUrl?.startsWith('http') ? 'url' : 'file'
  )

  return (
    <form action={action} className="auth-form" noValidate>
      {initialData && (
        <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.82rem', marginBottom: '16px' }}>
          ℹ️ <strong>Editing Profile Details:</strong> Update your registration number, website, or attach a new verification PDF document below.
        </div>
      )}

      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      {/* Hidden input for doc mode */}
      <input type="hidden" name="verificationDocType" value={docMode} />

      <div className="auth-field">
        <label htmlFor="registrationNumber" className="auth-label">Registration Number</label>
        <input
          id="registrationNumber"
          name="registrationNumber"
          type="text"
          defaultValue={initialData?.registrationNumber ?? ''}
          placeholder="e.g. NGO-84920-IND or 80G/12A Reg No."
          className={`auth-input ${state?.errors?.registrationNumber ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.registrationNumber && (
          <p className="auth-field-error">{state.errors.registrationNumber[0]}</p>
        )}
      </div>

      <div className="auth-field">
        <label htmlFor="website" className="auth-label">Organization Website</label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={initialData?.website ?? ''}
          placeholder="https://example.org"
          className={`auth-input ${state?.errors?.website ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.website && <p className="auth-field-error">{state.errors.website[0]}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-label">Verification Document Attachment</label>
        
        {/* Toggle option buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setDocMode('file')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: docMode === 'file' ? '2px solid #10b981' : '1px solid #cbd5e1',
              backgroundColor: docMode === 'file' ? '#ecfdf5' : '#f8fafc',
              color: docMode === 'file' ? '#047857' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            📄 Attach PDF File
          </button>
          <button
            type="button"
            onClick={() => setDocMode('url')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: docMode === 'url' ? '2px solid #10b981' : '1px solid #cbd5e1',
              backgroundColor: docMode === 'url' ? '#ecfdf5' : '#f8fafc',
              color: docMode === 'url' ? '#047857' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            🔗 Document Link (URL)
          </button>
        </div>

        {docMode === 'file' ? (
          <div>
            <input
              id="verificationFile"
              name="verificationFile"
              type="file"
              accept=".pdf"
              className={`auth-input ${state?.errors?.verification ? 'auth-input-error' : ''}`}
              style={{ padding: '8px' }}
            />
            {initialData?.verificationDocumentUrl && (
              <p style={{ fontSize: '0.78rem', color: '#047857', marginTop: '6px', fontWeight: 500 }}>
                Existing Document: {initialData.verificationDocumentUrl.startsWith('http') ? 'Uploaded PDF File' : initialData.verificationDocumentUrl}. (Uploading a new file above will replace it).
              </p>
            )}
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              Upload your official NGO registration certificate or tax exempt document in PDF format.
            </p>
          </div>
        ) : (
          <div>
            <input
              id="verificationDocumentUrl"
              name="verificationDocumentUrl"
              type="url"
              defaultValue={initialData?.verificationDocumentUrl?.startsWith('http') ? initialData.verificationDocumentUrl : ''}
              placeholder="https://drive.google.com/... or https://example.org/verify.pdf"
              className={`auth-input ${state?.errors?.verification ? 'auth-input-error' : ''}`}
            />
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
              Paste a public cloud link or website URL pointing to your verification document.
            </p>
          </div>
        )}

        {state?.errors?.verification && <p className="auth-field-error">{state.errors.verification[0]}</p>}
      </div>

      <button type="submit" disabled={pending} className="auth-btn-primary">
        {pending ? 'Saving...' : initialData ? 'Submit Changes & Re-verify' : 'Submit for Verification'}
      </button>
    </form>
  )
}
