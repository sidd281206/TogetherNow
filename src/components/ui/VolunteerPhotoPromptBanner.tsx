'use client'

import React, { useState, useEffect } from 'react'
import { Camera, Sparkles, X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import VolunteerPhotoUploadModal from './VolunteerPhotoUploadModal'

interface VolunteerPhotoPromptBannerProps {
  userEmail?: string
  initialAvatarUrl?: string
  userName?: string
  onAvatarUpdated?: (url: string) => void
}

export default function VolunteerPhotoPromptBanner({
  userEmail,
  initialAvatarUrl,
  userName = 'Volunteer',
  onAvatarUpdated,
}: VolunteerPhotoPromptBannerProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl || '')
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkAvatar = (e?: any) => {
      if (e && e.type === 'togethernow_avatar_updated' && e.detail) {
        setAvatarUrl(e.detail)
        return
      }
      if (userEmail) {
        const stored = localStorage.getItem(`togethernow_user_avatar_${userEmail}`)
        if (stored) {
          setAvatarUrl(stored)
        }
      }
    }
    checkAvatar()

    window.addEventListener('togethernow_avatar_updated', checkAvatar)
    window.addEventListener('storage', checkAvatar)
    return () => {
      window.removeEventListener('togethernow_avatar_updated', checkAvatar)
      window.removeEventListener('storage', checkAvatar)
    }
  }, [userEmail])

  if (avatarUrl || dismissed) {
    return null
  }

  const firstName = userName.split(' ')[0]

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-5 sm:p-6 shadow-lg mb-6 transition-all animate-in fade-in">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Camera className="w-3.5 h-3.5" />
              <span>Identity Verification Notice</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
              Hi {firstName}! Please upload your profile photo 📸
            </h2>

            <p className="text-xs sm:text-sm text-orange-50/95 m-0 leading-relaxed font-medium">
              Organizations and Event Managers require your profile photo to verify your identity and mark your attendance at volunteer drives. Please upload your profile photo so you are recognized on the day of the event.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-orange-900 hover:bg-orange-50 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-none cursor-pointer group"
            >
              <Camera className="w-4 h-4 text-orange-600" />
              <span>Upload Profile Photo</span>
              <ArrowRight className="w-4 h-4 text-orange-700 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <VolunteerPhotoUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        currentAvatarUrl={avatarUrl}
        onUploadSuccess={(url) => {
          setAvatarUrl(url)
          if (onAvatarUpdated) onAvatarUpdated(url)
        }}
      />
    </>
  )
}
