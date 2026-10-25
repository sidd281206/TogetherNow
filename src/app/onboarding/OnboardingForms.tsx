'use client'

import { useState, useActionState } from 'react'
import { completeVolunteerProfileAction, completeOrganizationProfileAction, completeDonorProfileAction, type OnboardingState } from '@/app/actions/onboarding'
import { sendEmailOtpAction, verifyEmailOtpAction } from '@/app/actions/verification'
import { Check, Mail, KeyRound, Sparkles, ShieldCheck } from 'lucide-react'

const initialState: OnboardingState = null

interface VolunteerOnboardingFormProps {
  userEmail?: string
  initialData?: {
    fullName?: string
    phone?: string
    address?: string
    city?: string
    pincode?: string
    skills?: string[]
    interests?: string[]
    availability?: string
  } | null
}

export function VolunteerOnboardingForm({ userEmail = 'volunteer@togethernow.org', initialData }: VolunteerOnboardingFormProps) {
  const [state, action, pending] = useActionState(completeVolunteerProfileAction, initialState)

  // OTP States
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(initialData))
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpNotice, setOtpNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const defaultSkills = initialData?.skills && initialData.skills.length > 0
    ? initialData.skills.join(', ')
    : 'Photography, Social Media, Teamwork'

  const defaultInterests = initialData?.interests && initialData.interests.length > 0
    ? initialData.interests.join(', ')
    : 'Photography, Environment, Education'

  const handleSendOtp = async () => {
    setOtpSending(true)
    setOtpNotice(null)
    try {
      const res = await sendEmailOtpAction(userEmail)
      if (res.success) {
        setIsOtpSent(true)
        setOtpNotice({
          text: `A 6-digit verification code has been sent to ${userEmail}. Please check your inbox (and spam folder).`,
          type: 'success',
        })
      } else {
        setOtpNotice({ text: res.message || 'Failed to send OTP.', type: 'error' })
      }
    } catch (err: any) {
      setOtpNotice({ text: err?.message || 'Error sending OTP.', type: 'error' })
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return
    setOtpVerifying(true)
    setOtpNotice(null)
    try {
      const res = await verifyEmailOtpAction(userEmail, otp.trim())
      if (res.success) {
        setIsEmailVerified(true)
        setOtpNotice({ text: '✓ Email successfully verified with OTP!', type: 'success' })
      } else {
        setOtpNotice({ text: res.message || 'Invalid OTP code.', type: 'error' })
      }
    } catch (err: any) {
      setOtpNotice({ text: err?.message || 'Verification error.', type: 'error' })
    } finally {
      setOtpVerifying(false)
    }
  }

  return (
    <form action={action} className="auth-form" noValidate>
      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      {/* Hidden input for verified email */}
      <input type="hidden" name="isEmailVerified" value={isEmailVerified ? 'true' : 'false'} />

      {/* 1. Phone Number */}
      <div className="auth-field">
        <label htmlFor="phone" className="auth-label">Phone Number *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={initialData?.phone || ''}
          placeholder="e.g. +91 98201 44521"
          className={`auth-input ${state?.errors?.phone ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.phone && <p className="auth-field-error">{state.errors.phone[0]}</p>}
      </div>

      {/* 2. Address & City Details */}
      <div className="auth-field">
        <label htmlFor="address" className="auth-label">Street / Area Address *</label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={initialData?.address || ''}
          placeholder="e.g. Flat 402, Green Valley Apartments, Andheri West"
          className={`auth-input ${state?.errors?.address ? 'auth-input-error' : ''}`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="auth-field">
          <label htmlFor="city" className="auth-label">City *</label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={initialData?.city || 'Mumbai'}
            placeholder="e.g. Mumbai"
            className="auth-input"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="pincode" className="auth-label">Pincode / Postal Code</label>
          <input
            id="pincode"
            name="pincode"
            type="text"
            defaultValue={initialData?.pincode || '400053'}
            placeholder="e.g. 400053"
            className="auth-input"
          />
        </div>
      </div>
      {state?.errors?.address && <p className="auth-field-error">{state.errors.address[0]}</p>}

      {/* 3. Email OTP Verification Section */}
      <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#312e81', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
            Email Status
          </span>
          {isEmailVerified ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} /> Verified (100%)
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
              Verification Pending
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e0e7ff', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e1b4b', fontWeight: 600 }}>
            <Mail style={{ width: '14px', height: '14px', color: '#6366f1' }} />
            <span>{userEmail}</span>
          </div>

          {!isEmailVerified && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpSending}
              style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {otpSending ? 'Sending...' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          )}
        </div>

        {otpNotice && (
          <div style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: otpNotice.type === 'success' ? '#ecfdf5' : '#fff1f2', color: otpNotice.type === 'success' ? '#065f46' : '#9f1239', border: otpNotice.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3', marginBottom: '8px' }}>
            {otpNotice.text}
          </div>
        )}

        {!isEmailVerified && isOtpSent && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #c7d2fe', fontSize: '0.82rem', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || !otp.trim()}
              style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {otpVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}
      </div>

      {/* 4. Skills */}
      <div className="auth-field">
        <label htmlFor="skills" className="auth-label">Skills (comma-separated) *</label>
        <input
          id="skills"
          name="skills"
          type="text"
          defaultValue={defaultSkills}
          placeholder="e.g. Photography, Teaching, Coding, Medical, First Aid"
          className={`auth-input ${state?.errors?.skills ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.skills && <p className="auth-field-error">{state.errors.skills[0]}</p>}
      </div>

      {/* 5. Interests */}
      <div className="auth-field">
        <label htmlFor="interests" className="auth-label">Interests (comma-separated) *</label>
        <input
          id="interests"
          name="interests"
          type="text"
          defaultValue={defaultInterests}
          placeholder="e.g. Photography, Education, Healthcare, Environment"
          className={`auth-input ${state?.errors?.interests ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.interests && <p className="auth-field-error">{state.errors.interests[0]}</p>}
      </div>

      {/* 6. Availability */}
      <div className="auth-field">
        <label htmlFor="availability" className="auth-label">Availability *</label>
        <select 
          id="availability" 
          name="availability" 
          defaultValue={initialData?.availability || 'weekends'}
          className={`auth-input ${state?.errors?.availability ? 'auth-input-error' : ''}`}
        >
          <option value="weekends">Weekends</option>
          <option value="weekdays">Weekdays</option>
          <option value="evenings">Evenings</option>
          <option value="flexible">Flexible</option>
        </select>
        {state?.errors?.availability && <p className="auth-field-error">{state.errors.availability[0]}</p>}
      </div>

      <button type="submit" disabled={pending} className="auth-btn-primary">
        {pending ? 'Saving Changes...' : initialData ? 'Save Profile Changes' : 'Complete Profile & Unlock Events (100%)'}
      </button>
    </form>
  )
}

interface OrganizationOnboardingFormProps {
  initialData?: {
    website?: string
    phone?: string
    address?: string
    registrationNumber?: string
    verificationDocumentUrl?: string
    status?: string
  } | null
  userEmail?: string
  orgName?: string
  userId?: string
}

export function OrganizationOnboardingForm({
  initialData,
  userEmail = 'organization@togethernow.org',
  orgName = '',
  userId = '',
}: OrganizationOnboardingFormProps) {
  const [state, action, pending] = useActionState(completeOrganizationProfileAction, initialState)
  const [docMode, setDocMode] = useState<'file' | 'url'>(
    initialData?.verificationDocumentUrl?.startsWith('http') ? 'url' : 'file'
  )
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialData?.verificationDocumentUrl || '')
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFile(true)
    setUploadStatus('Uploading PDF document to secure storage...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orgName', orgName || 'organization')
      formData.append('userId', userId)

      const res = await fetch('/api/upload-verification', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.url) {
        setUploadedUrl(data.url)
        setUploadStatus(`✓ ${file.name} uploaded successfully!`)
      } else {
        setUploadStatus(`Upload notice: ${data.error || 'Will process on submit'}`)
      }
    } catch (err: any) {
      console.warn('Direct upload notice:', err)
      setUploadStatus(`File selected: ${file.name}`)
    } finally {
      setIsUploadingFile(false)
    }
  }

  return (
    <form action={action} encType="multipart/form-data" className="auth-form" noValidate>
      {initialData && (
        <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.82rem', marginBottom: '16px' }}>
          ℹ️ <strong>Editing Profile Details:</strong> Update your registration number, contact phone, website, or attach a new verification PDF document below.
        </div>
      )}

      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      {/* Hidden inputs */}
      <input type="hidden" name="verificationDocType" value={docMode} />
      <input type="hidden" name="uploadedDocUrl" value={uploadedUrl} />

      <div className="auth-field">
        <label htmlFor="phone" className="auth-label">Official Contact Phone Number (Optional)</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData?.phone ?? ''}
          placeholder="e.g. +91 98201 44521"
          className="auth-input"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="address" className="auth-label">Office / Headquarters Address (Optional)</label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={initialData?.address ?? ''}
          placeholder="e.g. Level 3, Synergy Tower, Marine Drive, Mumbai"
          className="auth-input"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="registrationNumber" className="auth-label">NGO / Trust Registration Number *</label>
        <input
          id="registrationNumber"
          name="registrationNumber"
          type="text"
          required
          defaultValue={initialData?.registrationNumber ?? ''}
          placeholder="e.g. NGO-84920-IND or 80G/12A Reg No."
          className={`auth-input ${state?.errors?.registrationNumber ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.registrationNumber && (
          <p className="auth-field-error">{state.errors.registrationNumber[0]}</p>
        )}
      </div>

      <div className="auth-field">
        <label htmlFor="website" className="auth-label">Organization Website *</label>
        <input
          id="website"
          name="website"
          type="url"
          required
          defaultValue={initialData?.website ?? ''}
          placeholder="https://example.org"
          className={`auth-input ${state?.errors?.website ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.website && <p className="auth-field-error">{state.errors.website[0]}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-label">Verification Document Attachment</label>
        
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
              onChange={handleFileChange}
              className={`auth-input ${state?.errors?.verification ? 'auth-input-error' : ''}`}
              style={{ padding: '8px' }}
            />
            {uploadStatus && (
              <p style={{ fontSize: '0.78rem', color: uploadStatus.startsWith('✓') ? '#047857' : '#0284c7', marginTop: '6px', fontWeight: 600 }}>
                {uploadStatus}
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

      <button type="submit" disabled={pending || isUploadingFile} className="auth-btn-primary">
        {pending ? 'Saving...' : isUploadingFile ? 'Uploading Document...' : initialData ? 'Submit Changes & Re-verify' : 'Submit for Verification'}
      </button>
    </form>
  )
}

// ─── Donor Onboarding Form ────────────────────────────────────────────────────

interface DonorOnboardingFormProps {
  userEmail?: string
  initialData?: {
    phone?: string
    address?: string
    city?: string
    pincode?: string
    panNumber?: string
  } | null
}

export function DonorOnboardingForm({
  userEmail = 'donor@togethernow.org',
  initialData,
}: DonorOnboardingFormProps) {
  const [state, action, pending] = useActionState(completeDonorProfileAction, null as OnboardingState)

  // OTP States — identical flow to VolunteerOnboardingForm
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(initialData))
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpNotice, setOtpNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSendOtp = async () => {
    setOtpSending(true)
    setOtpNotice(null)
    try {
      const res = await sendEmailOtpAction(userEmail)
      if (res.success) {
        setIsOtpSent(true)
        setOtpNotice({
          text: `A 6-digit verification code has been sent to ${userEmail}. Please check your inbox (and spam folder).`,
          type: 'success',
        })
      } else {
        setOtpNotice({ text: res.message || 'Failed to send OTP.', type: 'error' })
      }
    } catch (err: any) {
      setOtpNotice({ text: err?.message || 'Error sending OTP.', type: 'error' })
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return
    setOtpVerifying(true)
    setOtpNotice(null)
    try {
      const res = await verifyEmailOtpAction(userEmail, otp.trim())
      if (res.success) {
        setIsEmailVerified(true)
        setOtpNotice({ text: '✓ Email successfully verified with OTP!', type: 'success' })
      } else {
        setOtpNotice({ text: res.message || 'Invalid OTP code.', type: 'error' })
      }
    } catch (err: any) {
      setOtpNotice({ text: err?.message || 'Verification error.', type: 'error' })
    } finally {
      setOtpVerifying(false)
    }
  }

  return (
    <form action={action} className="auth-form" noValidate>
      {/* General error */}
      {state?.errors?.general && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.general[0]}
        </div>
      )}

      {/* OTP error */}
      {state?.errors?.otp && (
        <div className="auth-alert auth-alert-error" role="alert">
          {state.errors.otp[0]}
        </div>
      )}

      {/* Hidden: email verified state */}
      <input type="hidden" name="isEmailVerified" value={isEmailVerified ? 'true' : 'false'} />

      {/* Donor intro notice */}
      <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>💛</span>
        <span><strong>Welcome, Donor!</strong> Complete your profile to unlock donation campaigns from verified NGOs and track your giving impact.</span>
      </div>

      {/* 1. Phone Number */}
      <div className="auth-field">
        <label htmlFor="donor-phone" className="auth-label">Phone Number *</label>
        <input
          id="donor-phone"
          name="phone"
          type="tel"
          required
          defaultValue={initialData?.phone || ''}
          placeholder="e.g. +91 98201 44521"
          className={`auth-input ${state?.errors?.phone ? 'auth-input-error' : ''}`}
        />
        {state?.errors?.phone && <p className="auth-field-error">{state.errors.phone[0]}</p>}
      </div>

      {/* 2. Address */}
      <div className="auth-field">
        <label htmlFor="donor-address" className="auth-label">Street / Area Address *</label>
        <input
          id="donor-address"
          name="address"
          type="text"
          required
          defaultValue={initialData?.address || ''}
          placeholder="e.g. Flat 402, Green Valley Apartments, Andheri West"
          className={`auth-input ${state?.errors?.address ? 'auth-input-error' : ''}`}
        />
      </div>

      {/* 3. City + Pincode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="auth-field">
          <label htmlFor="donor-city" className="auth-label">City *</label>
          <input
            id="donor-city"
            name="city"
            type="text"
            required
            defaultValue={initialData?.city || 'Mumbai'}
            placeholder="e.g. Mumbai"
            className="auth-input"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="donor-pincode" className="auth-label">Pincode / Postal Code</label>
          <input
            id="donor-pincode"
            name="pincode"
            type="text"
            defaultValue={initialData?.pincode || ''}
            placeholder="e.g. 400053"
            className="auth-input"
          />
        </div>
      </div>
      {state?.errors?.address && <p className="auth-field-error">{state.errors.address[0]}</p>}

      {/* 4. PAN Number (optional) */}
      <div className="auth-field">
        <label htmlFor="donor-pan" className="auth-label">
          PAN Number <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.78rem' }}>(Optional — for 80G tax receipts)</span>
        </label>
        <input
          id="donor-pan"
          name="panNumber"
          type="text"
          defaultValue={initialData?.panNumber || ''}
          placeholder="e.g. ABCDE1234F"
          className="auth-input"
          style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
        />
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
          Your PAN is used only for generating donation tax receipts under Section 80G. Never shared publicly.
        </p>
        {state?.errors?.panNumber && <p className="auth-field-error">{state.errors.panNumber[0]}</p>}
      </div>

      {/* 5. Email OTP Verification — identical UI to volunteer form */}
      <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#78350f', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound style={{ width: '16px', height: '16px', color: '#d97706' }} />
            Email Verification
          </span>
          {isEmailVerified ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} /> Verified (100%)
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
              Verification Pending
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #fde68a', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#78350f', fontWeight: 600 }}>
            <Mail style={{ width: '14px', height: '14px', color: '#d97706' }} />
            <span>{userEmail}</span>
          </div>
          {!isEmailVerified && (
            <button
              id="donor-send-otp"
              type="button"
              onClick={handleSendOtp}
              disabled={otpSending}
              style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#d97706', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {otpSending ? 'Sending...' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          )}
        </div>

        {otpNotice && (
          <div style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: otpNotice.type === 'success' ? '#ecfdf5' : '#fff1f2', color: otpNotice.type === 'success' ? '#065f46' : '#9f1239', border: otpNotice.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3', marginBottom: '8px' }}>
            {otpNotice.text}
          </div>
        )}

        {!isEmailVerified && isOtpSent && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              id="donor-otp-input"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.82rem', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
            />
            <button
              id="donor-verify-otp"
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || !otp.trim()}
              style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {otpVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <button id="donor-submit" type="submit" disabled={pending} className="auth-btn-primary">
        {pending
          ? 'Saving Profile...'
          : initialData
          ? 'Save Profile Changes'
          : 'Complete Donor Profile & Start Giving 💛'}
      </button>
    </form>
  )
}
