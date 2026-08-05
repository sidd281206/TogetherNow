'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X, AlertCircle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react'

interface ProfilePromptBannerProps {
  userName: string
  profileStatus: {
    isNewUser: boolean
    completionPercentage: number
    role: string
    missingFields?: string[]
  }
}

export default function ProfilePromptBanner({
  userName,
  profileStatus,
}: ProfilePromptBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || profileStatus.completionPercentage >= 100) {
    return null
  }

  const { isNewUser, completionPercentage, role, missingFields = [] } = profileStatus
  const firstName = userName.split(' ')[0]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shadow-lg mb-8 transition-all">
      {/* Decorative subtle background shapes */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-1/3 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* Left Side Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            {isNewUser ? 'Welcome to TogetherNow!' : 'Complete Your Profile'}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white m-0">
            {isNewUser ? (
              <>Hi {firstName}! Let’s get your profile set up 🎉</>
            ) : (
              <>Your profile is {completionPercentage}% complete 👋</>
            )}
          </h2>

          <p className="text-sm text-emerald-50/90 m-0 leading-relaxed">
            {isNewUser ? (
              role === 'organization' ? (
                'Verify your organization details to start posting volunteering opportunities and connecting with passionate volunteers.'
              ) : (
                'Add your skills, interests, and availability to receive tailored volunteer opportunities and start earning impact badges.'
              )
            ) : (
              <>
                You are almost there! Complete the remaining details{' '}
                {missingFields.length > 0 && (
                  <span className="font-semibold underline underline-offset-2">
                    ({missingFields.join(', ')})
                  </span>
                )}{' '}
                to get 3x better opportunity recommendations.
              </>
            )}
          </p>

          {/* Progress Bar for Existing Users */}
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

        {/* Right Side Action Button */}
        <div className="flex-shrink-0 flex items-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-decoration-none group"
          >
            <span>{isNewUser ? 'Set Up Profile' : 'Finish Profile Now'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  )
}
