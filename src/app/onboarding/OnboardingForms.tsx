'use client'

import { useActionState } from 'react'
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

export function OrganizationOnboardingForm() {
  const [state, action, pending] = useActionState(completeOrganizationProfileAction, initialState)

  return (
    <form action={action} className="auth-form" noValidate>
      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="website" className="auth-label">Organization Website</label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://example.org"
          className={`auth-input ${state?.errors?.website ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.website && <p className="auth-field-error">{state.errors.website[0]}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="verificationDocumentUrl" className="auth-label">Verification Details</label>
        <input
          id="verificationDocumentUrl"
          name="verificationDocumentUrl"
          type="text"
          placeholder="Registration Number or Document URL"
          className={`auth-input ${state?.errors?.verification ? 'auth-input-error' : ''}`}
        />
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
          Please provide your NGO registration number or a link to your verification document.
        </p>
        {state?.errors?.verification && <p className="auth-field-error">{state.errors.verification[0]}</p>}
      </div>

      <button type="submit" disabled={pending} className="auth-btn-primary">
        {pending ? 'Saving...' : 'Submit for Verification'}
      </button>
    </form>
  )
}
