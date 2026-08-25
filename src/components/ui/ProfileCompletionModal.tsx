'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Phone, 
  MapPin, 
  Mail, 
  KeyRound, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Send,
  Lock
} from 'lucide-react'
import { sendEmailOtpAction, verifyEmailOtpAction, saveCompleteUserProfileAction } from '@/app/actions/verification'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
  userRole?: string
  initialPhone?: string
  initialAddress?: string
  initialCity?: string
  onCompleteSuccess?: () => void
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  userEmail = 'volunteer@togethernow.org',
  userName = 'Volunteer',
  userRole = 'volunteer',
  initialPhone = '',
  initialAddress = '',
  initialCity = '',
  onCompleteSuccess,
}: ProfileCompletionModalProps) {
  const [phone, setPhone] = useState(initialPhone)
  const [address, setAddress] = useState(initialAddress)
  const [city, setCity] = useState(initialCity || 'Mumbai')
  const [pincode, setPincode] = useState('400001')
  const [skills, setSkills] = useState('Community Support, Teamwork, Communication')
  const [interests, setInterests] = useState('Environment, Education, Health')
  const [availability, setAvailability] = useState('weekends')

  // OTP Verification State
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    // Check if previously verified in localStorage
    try {
      const stored = localStorage.getItem(`togethernow_verified_email_${userEmail}`)
      if (stored === 'true') {
        setIsEmailVerified(true)
      }
    } catch {}
  }, [userEmail])

  // Calculate live completion progress
  const hasPhone = phone.trim().length >= 8
  const hasAddress = address.trim().length >= 3
  const hasCity = city.trim().length >= 2
  const hasSkills = skills.trim().length > 0

  let completion = 0
  if (hasSkills) completion += 25
  if (hasPhone) completion += 25
  if (hasAddress && hasCity) completion += 25
  if (isEmailVerified) completion += 25

  const is100Percent = completion >= 100

  const handleSendOtp = async () => {
    if (!userEmail) return
    setOtpSending(true)
    setOtpMessage(null)

    try {
      const res = await sendEmailOtpAction(userEmail)
      if (res.success) {
        setIsOtpSent(true)
        if (res.simulatedOtp) {
          setSimulatedCode(res.simulatedOtp)
        }
        setOtpMessage({
          text: `A 6-digit OTP code has been dispatched to ${userEmail}. (Test Code: ${res.simulatedOtp || '123456'})`,
          type: 'success',
        })
      } else {
        setOtpMessage({ text: res.message || 'Failed to send OTP.', type: 'error' })
      }
    } catch (err: any) {
      setOtpMessage({ text: err?.message || 'Error dispatching OTP.', type: 'error' })
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpMessage({ text: 'Please enter the 6-digit OTP code.', type: 'error' })
      return
    }

    setOtpVerifying(true)
    setOtpMessage(null)

    try {
      const res = await verifyEmailOtpAction(userEmail, otp.trim())
      if (res.success) {
        setIsEmailVerified(true)
        setOtpMessage({ text: '✓ Email OTP successfully verified!', type: 'success' })
        try {
          localStorage.setItem(`togethernow_verified_email_${userEmail}`, 'true')
        } catch {}
      } else {
        setOtpMessage({ text: res.message || 'Invalid OTP code.', type: 'error' })
      }
    } catch (err: any) {
      setOtpMessage({ text: err?.message || 'OTP validation failed.', type: 'error' })
    } finally {
      setOtpVerifying(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!hasPhone) {
      setErrorMsg('Please enter a valid contact phone number.')
      return
    }
    if (!hasAddress || !hasCity) {
      setErrorMsg('Please enter your complete address and city.')
      return
    }
    if (!isEmailVerified) {
      setErrorMsg('Email OTP verification is required to reach 100% profile completion.')
      return
    }

    setSaving(true)
    try {
      const parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean)
      const parsedInterests = interests.split(',').map((s) => s.trim()).filter(Boolean)

      const res = await saveCompleteUserProfileAction({
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        skills: parsedSkills,
        interests: parsedInterests,
        availability,
        isEmailVerified: true,
      })

      if (res.success) {
        setSuccessMsg('🎉 Profile 100% Completed & Verified!')
        try {
          localStorage.setItem(`togethernow_profile_complete_${userEmail}`, 'true')
          localStorage.setItem(`togethernow_user_phone_${userEmail}`, phone.trim())
          localStorage.setItem(`togethernow_user_address_${userEmail}`, `${address.trim()}, ${city.trim()}`)
          window.dispatchEvent(new CustomEvent('togethernow_profile_completed', {
            detail: { email: userEmail, phone: phone.trim(), address: `${address.trim()}, ${city.trim()}` }
          }))
        } catch {}

        setTimeout(() => {
          onCompleteSuccess?.()
          onClose()
        }, 1200)
      } else {
        setErrorMsg(res.error || 'Failed to save profile details.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || userRole === 'organization') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Volunteer & Donor Profile Verification</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                is100Percent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {completion}% Complete
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0">
              Complete & Verify Volunteer Profile
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
              To apply for events and drives, your profile must be <strong>100% complete</strong> with your phone number, address, and Email OTP verification.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-300">Profile Readiness</span>
            <span className={is100Percent ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {completion}% (4 of {is100Percent ? 4 : Math.round(completion / 25)} Requirements Met)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                is100Percent ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* STEP 1: PHONE NUMBER */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Contact Phone Number *</span>
              </label>
              {hasPhone && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3 stroke-[3]" /> Provided
                </span>
              )}
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98201 44521"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* STEP 2: ADDRESS DETAILS */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Address & City Details *</span>
              </label>
              {hasAddress && hasCity && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3 stroke-[3]" /> Provided
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street / Flat / Locality Address (e.g. 14 Marine Drive Promenade)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Mumbai)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode (e.g. 400001)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* STEP 3: EMAIL OTP VERIFICATION */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Email OTP Verification *</span>
              </label>

              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                  <Check className="w-3 h-3 stroke-[3]" /> Email Verified (100%)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  Verification Pending
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{userEmail}</span>
              </div>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs border-none cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {otpSending ? 'Sending...' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              )}
            </div>

            {otpMessage && (
              <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 ${
                otpMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60'
              }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{otpMessage.text}</span>
              </div>
            )}

            {!isEmailVerified && isOtpSent && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || !otp.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs border-none cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{otpVerifying ? 'Verifying...' : 'Verify OTP'}</span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 4: SKILLS & PREFERENCES */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 space-y-2">
            <label className="text-xs font-extrabold text-gray-900 dark:text-white block">
              4. Volunteering Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Teaching, Teamwork, First Aid"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Bottom Submit Action */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {is100Percent
                ? '✓ All requirements completed! Ready to save.'
                : 'Complete all 4 items to achieve 100%.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !is100Percent}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                  is100Percent
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-75'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save & Reach 100%'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  )
}
