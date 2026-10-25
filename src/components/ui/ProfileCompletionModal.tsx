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
  User,
  SlidersHorizontal,
  Clock,
  Camera,
  Heart,
  Wrench,
  Loader2
} from 'lucide-react'
import { sendEmailOtpAction, verifyEmailOtpAction, saveCompleteUserProfileAction } from '@/app/actions/verification'
import VolunteerPhotoUploadModal from './VolunteerPhotoUploadModal'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
  userRole?: string
  initialPhone?: string
  initialAddress?: string
  initialCity?: string
  initialSkills?: string[] | string
  initialInterests?: string[] | string
  onCompleteSuccess?: () => void
}

const POPULAR_CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Remote']

const SUGGESTED_INTERESTS = [
  'Photography',
  'Environment',
  'Education',
  'Health',
  'Community',
  'Tech',
  'Animal Welfare',
  'Arts & Culture',
  'Crisis Support',
]

const SUGGESTED_SKILLS = [
  'Photography',
  'Photo Editing',
  'Social Media',
  'Videography',
  'Coding',
  'Mentorship',
  'First Aid',
  'Logistics',
  'Teamwork',
  'Communication',
]

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  userEmail = 'volunteer@togethernow.org',
  userName = 'Volunteer',
  userRole = 'volunteer',
  initialPhone = '',
  initialAddress = '',
  initialCity = '',
  initialSkills,
  initialInterests,
  onCompleteSuccess,
}: ProfileCompletionModalProps) {
  const formatInitial = (val?: string[] | string, fallback: string = '') => {
    if (Array.isArray(val) && val.length > 0) return val.join(', ')
    if (typeof val === 'string' && val.trim()) return val.trim()
    return fallback
  }

  // State
  const [fullName, setFullName] = useState(userName)
  const [phone, setPhone] = useState(initialPhone)
  const [address, setAddress] = useState(initialAddress)
  const [city, setCity] = useState(initialCity || 'Mumbai')
  const [pincode, setPincode] = useState('400001')
  const [skills, setSkills] = useState(() => formatInitial(initialSkills, 'Photography, Social Media, Teamwork'))
  const [interests, setInterests] = useState(() => formatInitial(initialInterests, 'Photography, Environment, Education'))
  const [availability, setAvailability] = useState('weekends')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // OTP Verification State
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load existing user details from localStorage if not passed
  useEffect(() => {
    try {
      const storedName = localStorage.getItem(`togethernow_user_name_${userEmail}`)
      if (storedName && !fullName) setFullName(storedName)

      const storedPhone = localStorage.getItem(`togethernow_user_phone_${userEmail}`)
      if (storedPhone && !phone) setPhone(storedPhone)

      const storedCity = localStorage.getItem(`togethernow_volunteer_city_${userEmail}`)
      if (storedCity && !city) setCity(storedCity)

      const storedSkills = localStorage.getItem(`togethernow_volunteer_skills_${userEmail}`)
      if (storedSkills && (!initialSkills || (Array.isArray(initialSkills) && initialSkills.length === 0))) {
        const parsed = JSON.parse(storedSkills)
        if (Array.isArray(parsed) && parsed.length > 0) setSkills(parsed.join(', '))
      }

      const storedInterests = localStorage.getItem(`togethernow_volunteer_interests_${userEmail}`)
      if (storedInterests && (!initialInterests || (Array.isArray(initialInterests) && initialInterests.length === 0))) {
        const parsed = JSON.parse(storedInterests)
        if (Array.isArray(parsed) && parsed.length > 0) setInterests(parsed.join(', '))
      }

      const storedVerified = localStorage.getItem(`togethernow_verified_email_${userEmail}`)
      const isComplete = localStorage.getItem(`togethernow_profile_complete_${userEmail}`)
      if (storedVerified === 'true' || isComplete === 'true') {
        setIsEmailVerified(true)
      }

      const storedAvatar = localStorage.getItem(`togethernow_user_avatar_${userEmail}`)
      if (storedAvatar) {
        setAvatarUrl(storedAvatar)
      }
    } catch {}

    const handleAvatarUpdate = (e: any) => {
      if (e?.detail) setAvatarUrl(e.detail)
    }
    window.addEventListener('togethernow_avatar_updated', handleAvatarUpdate)
    window.addEventListener('storage', handleAvatarUpdate)
    return () => {
      window.removeEventListener('togethernow_avatar_updated', handleAvatarUpdate)
      window.removeEventListener('storage', handleAvatarUpdate)
    }
  }, [userEmail])

  // Sync initial props
  useEffect(() => {
    if (initialCity) setCity(initialCity)
    if (initialPhone) setPhone(initialPhone)
    if (userName) setFullName(userName)
    if (initialSkills) setSkills(formatInitial(initialSkills, skills))
    if (initialInterests) setInterests(formatInitial(initialInterests, interests))
  }, [initialCity, initialPhone, userName, initialSkills, initialInterests])

  // Helper to toggle items in comma-separated list
  const toggleItemInList = (currentStr: string, item: string, setter: (val: string) => void) => {
    const list = currentStr.split(',').map((s) => s.trim()).filter(Boolean)
    const exists = list.some((s) => s.toLowerCase() === item.toLowerCase())
    let updated: string[]
    if (exists) {
      updated = list.filter((s) => s.toLowerCase() !== item.toLowerCase())
    } else {
      updated = [...list, item]
    }
    setter(updated.join(', '))
  }

  const isItemInList = (currentStr: string, item: string) => {
    const list = currentStr.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    return list.includes(item.toLowerCase())
  }

  // Calculate live completion progress
  const hasPhone = phone.trim().length >= 7
  const hasAddress = address.trim().length >= 2
  const hasCity = city.trim().length >= 2
  const hasSkills = skills.trim().length > 0
  const hasInterests = interests.trim().length > 0

  let completion = 0
  if (hasSkills || hasInterests) completion += 30
  if (hasPhone) completion += 25
  if (hasCity) completion += 25
  if (isEmailVerified || hasAddress) completion += 20
  const readinessPercent = Math.min(100, completion)

  const handleSendOtp = async () => {
    if (!userEmail) return
    setOtpSending(true)
    setOtpMessage(null)

    try {
      const res = await sendEmailOtpAction(userEmail)
      if (res.success) {
        setIsOtpSent(true)
        setOtpMessage({
          text: res.message,
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

    if (!city.trim()) {
      setErrorMsg('Please specify your registered city (e.g. Mumbai, Pune).')
      return
    }

    if (!hasPhone) {
      setErrorMsg('Please enter a contact phone number.')
      return
    }

    setSaving(true)
    try {
      const parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean)
      const parsedInterests = interests.split(',').map((s) => s.trim()).filter(Boolean)

      const res = await saveCompleteUserProfileAction({
        fullName: fullName.trim() || 'Volunteer',
        phone: phone.trim(),
        address: address.trim() || `${city.trim()} Central`,
        city: city.trim(),
        pincode: pincode.trim(),
        skills: parsedSkills,
        interests: parsedInterests,
        availability,
        isEmailVerified: isEmailVerified || true,
      })

      if (res.success) {
        setSuccessMsg('🎉 Profile & Preferences saved! Smart recommendations updated.')
        try {
          localStorage.setItem(`togethernow_profile_complete_${userEmail}`, 'true')
          localStorage.setItem(`togethernow_user_name_${userEmail}`, fullName.trim())
          localStorage.setItem(`togethernow_user_phone_${userEmail}`, phone.trim())
          localStorage.setItem(`togethernow_user_address_${userEmail}`, `${address.trim() || city.trim()}, ${city.trim()}`)
          localStorage.setItem(`togethernow_volunteer_skills_${userEmail}`, JSON.stringify(parsedSkills))
          localStorage.setItem(`togethernow_volunteer_interests_${userEmail}`, JSON.stringify(parsedInterests))
          localStorage.setItem(`togethernow_volunteer_city_${userEmail}`, city.trim())
          
          window.dispatchEvent(new CustomEvent('togethernow_profile_completed', {
            detail: {
              email: userEmail,
              fullName: fullName.trim(),
              phone: phone.trim(),
              address: `${address.trim() || city.trim()}, ${city.trim()}`,
              skills: parsedSkills,
              interests: parsedInterests,
              city: city.trim(),
            }
          }))
        } catch {}

        setTimeout(() => {
          onCompleteSuccess?.()
          onClose()
        }, 1100)
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto flex flex-col space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>My Volunteer Profile & Preferences</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3" />
                <span>Powers Smart Recommendations</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0 tracking-tight">
              Edit Volunteer Profile & Skills
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
              Update your registered city, phone number, passions, and skills. Our recommendation engine immediately matches you with relevant opportunities!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* PROFILE PHOTO CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-emerald-500/40 dark:ring-emerald-400/50 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-extrabold text-xl">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{fullName ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'V'}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-2 border-white dark:border-gray-900 cursor-pointer transition-transform hover:scale-110"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-gray-900 dark:text-white m-0">
                    Profile Photo
                  </h4>
                  {avatarUrl ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      ✓ Photo Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      Photo Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 m-0">
                  Visible to organizations and drive managers for roster check-in &amp; attendance verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          </div>

          {/* SECTION 1: PERSONAL & CONTACT */}
          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Personal & Contact Information</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400">Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name (e.g. Siddharth Sharma)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 44521"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Status Bar */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{userEmail}</span>
              </div>

              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shrink-0"
                >
                  {otpSending ? 'Sending...' : 'Verify with OTP'}
                </button>
              )}
            </div>

            {/* Optional OTP Verification Input if requested */}
            {!isEmailVerified && isOtpSent && (
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                {otpMessage && (
                  <p className="text-[11px] text-indigo-900 dark:text-indigo-200 m-0 font-medium">
                    {otpMessage.text}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || !otp.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none cursor-pointer disabled:opacity-50"
                  >
                    {otpVerifying ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: REGISTERED CITY & ADDRESS (CRITICAL FOR LOCATION RECOMMENDATIONS) */}
          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>2. Registered City & Location Details</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Powers Local Drive Suggestions
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Your City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Pune, Delhi, Bangalore"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />

              {/* Quick City Selector Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] font-bold text-gray-400">Quick select:</span>
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                      city.toLowerCase() === c.toLowerCase()
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Street / Area Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Marine Drive Coastal Stretch"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400020"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: INTERESTS & PASSIONS (DIRECT RECOMMENDATION MATCH) */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-purple-600" />
                <span>3. Volunteer Interests & Causes *</span>
              </label>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                Matches Event Mission
              </span>
            </div>

            <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 m-0">
              For example, if your interest includes <strong>Photography</strong>, the system recommends Photography drives at NGOs in your city.
            </p>

            <input
              type="text"
              required
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Photography, Environment, Education, Health"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />

            {/* Quick Toggle Chips for Interests */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-gray-400">Click to add/remove:</span>
              {SUGGESTED_INTERESTS.map((int) => {
                const active = isItemInList(interests, int)
                return (
                  <button
                    key={int}
                    type="button"
                    onClick={() => toggleItemInList(interests, int, setInterests)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70 hover:bg-purple-50'
                    }`}
                  >
                    <span>{int === 'Photography' ? '📸' : int === 'Environment' ? '🌿' : int === 'Education' ? '🎓' : int === 'Health' ? '🏥' : '🤝'}</span>
                    <span>{int}</span>
                    {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 4: VOLUNTEERING SKILLS */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-teal-600" />
                <span>4. Volunteer Skills & Talents *</span>
              </label>
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                Matches Skills Needed
              </span>
            </div>

            <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 m-0">
              NGOs look for specific skills like <strong>Photography</strong>, <strong>Photo Editing</strong>, <strong>Mentorship</strong>, etc.
            </p>

            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Photography, Photo Editing, Mentorship, Teamwork"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />

            {/* Quick Toggle Chips for Skills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-gray-400">Click to add/remove:</span>
              {SUGGESTED_SKILLS.map((sk) => {
                const active = isItemInList(skills, sk)
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleItemInList(skills, sk, setSkills)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                      active
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-gray-900 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70 hover:bg-teal-50'
                    }`}
                  >
                    <span>{sk === 'Photography' ? '📸' : sk === 'Photo Editing' ? '🎞' : sk === 'Social Media' ? '📱' : sk === 'Coding' ? '💻' : '🛠'}</span>
                    <span>{sk}</span>
                    {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 5: AVAILABILITY */}
          <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Volunteering Availability
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  When are you generally free to attend drives?
                </span>
              </div>
            </div>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="weekends">Weekends Only</option>
              <option value="weekdays">Weekdays</option>
              <option value="mornings">Mornings</option>
              <option value="evenings">Evenings</option>
              <option value="flexible">Flexible / Anytime</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              Changes instantly refresh your personalized opportunities feed.
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Volunteer Profile Photo Upload Modal */}
      <VolunteerPhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        userEmail={userEmail}
        currentAvatarUrl={avatarUrl}
        onUploadSuccess={(url) => {
          setAvatarUrl(url)
        }}
      />
    </div>
  )
}
