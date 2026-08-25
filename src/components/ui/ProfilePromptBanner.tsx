'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X, ShieldCheck, Building2 } from 'lucide-react'
import ProfileCompletionModal from './ProfileCompletionModal'

interface ProfilePromptBannerProps {
  userName: string
  userEmail?: string
  profileStatus: {
    isNewUser: boolean
    completionPercentage: number
    role: string
    orgStatus?: string
    missingFields?: string[]
  }
}

export default function ProfilePromptBanner({
  userName,
  userEmail = 'volunteer@togethernow.org',
  profileStatus,
}: ProfilePromptBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(false)

  const { isNewUser, completionPercentage, role, orgStatus, missingFields = [] } = profileStatus
  const firstName = userName.split(' ')[0]

  // For organizations: Only show if unsubmitted / new user (before verification form is submitted)
  if (role === 'organization') {
    if (dismissed || orgStatus === 'pending' || orgStatus === 'approved' || orgStatus === 'rejected') {
      return null
    }

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white p-5 sm:p-6 shadow-lg mb-8 transition-all">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>New Organization Setup</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white m-0">
              Hi {firstName}! Complete your organization profile 🎉
            </h2>

            <p className="text-sm text-indigo-100/90 m-0 leading-relaxed">
              Submit your organization details, registration number, and verification document to unlock event posting access and connect with volunteers.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-decoration-none group"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Complete Organization Profile</span>
              <ArrowRight className="w-4 h-4 text-indigo-700 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // For Volunteers and Donors
  if (dismissed || localCompleted || completionPercentage >= 100) {
    return null
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shadow-lg mb-8 transition-all">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isNewUser ? 'Welcome to TogetherNow!' : 'Complete Your Profile & Verify'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white m-0">
              {isNewUser ? (
                <>Hi {firstName}! Let’s get your volunteer profile set up 🎉</>
              ) : (
                <>Your profile is {completionPercentage}% complete 👋</>
              )}
            </h2>

            <p className="text-sm text-emerald-50/90 m-0 leading-relaxed">
              {isNewUser ? (
                'Add your phone number, address, skills, and verify your email with OTP to unlock event applications.'
              ) : (
                <>
                  Almost there! Complete your phone, address, and Email OTP verification{' '}
                  {missingFields.length > 0 && (
                    <span className="font-semibold underline underline-offset-2">
                      ({missingFields.join(', ')})
                    </span>
                  )}{' '}
                  to reach 100% and apply for events.
                </>
              )}
            </p>

            {!isNewUser && (
              <div className="pt-2 max-w-md">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1">
                  <span>Profile Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-none cursor-pointer group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isNewUser ? 'Verify & Set Up Now' : 'Complete 100% Profile'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <ProfileCompletionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        userName={userName}
        userRole={role}
        onCompleteSuccess={() => {
          setLocalCompleted(true)
          setShowModal(false)
        }}
      />
    </>
  )
}
