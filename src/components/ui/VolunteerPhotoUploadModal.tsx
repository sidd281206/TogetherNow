'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, Check, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { uploadVolunteerAvatarAction } from '@/app/actions/volunteer-avatar'

interface VolunteerPhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatarUrl?: string
  userEmail?: string
  onUploadSuccess?: (avatarUrl: string) => void
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
]

export default function VolunteerPhotoUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  userEmail,
  onUploadSuccess,
}: VolunteerPhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null)
      setSuccessMsg(null)
      const stored = userEmail ? localStorage.getItem(`togethernow_user_avatar_${userEmail}`) : null
      if (stored && !currentAvatarUrl) {
        setPreviewUrl(stored)
      } else if (currentAvatarUrl) {
        setPreviewUrl(currentAvatarUrl)
      }
    }
  }, [isOpen, currentAvatarUrl, userEmail])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.')
      return
    }

    setErrorMsg(null)
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null)
    setPreviewUrl(url)
    setErrorMsg(null)
  }

  const handleSave = async () => {
    if (!previewUrl) {
      setErrorMsg('Please select or upload a photo first.')
      return
    }

    setIsUploading(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      } else {
        formData.append('avatarUrl', previewUrl)
      }

      const res = await uploadVolunteerAvatarAction(formData)

      const savedUrl = (res.success && res.avatarUrl) ? res.avatarUrl : previewUrl
      if (userEmail) {
        localStorage.setItem(`togethernow_user_avatar_${userEmail}`, savedUrl)
      }
      try {
        window.dispatchEvent(new CustomEvent('togethernow_avatar_updated', { detail: savedUrl }))
        window.dispatchEvent(new CustomEvent('togethernow_profile_completed', { 
          detail: { email: userEmail, avatarUrl: savedUrl } 
        }))
      } catch {}

      if (onUploadSuccess) {
        onUploadSuccess(savedUrl)
      }
      setSuccessMsg('Profile photo updated successfully!')
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err: any) {
      console.warn('Avatar upload fallback to local storage:', err)
      if (userEmail) {
        localStorage.setItem(`togethernow_user_avatar_${userEmail}`, previewUrl)
      }
      try {
        window.dispatchEvent(new CustomEvent('togethernow_avatar_updated', { detail: previewUrl }))
      } catch {}
      if (onUploadSuccess) {
        onUploadSuccess(previewUrl)
      }
      setSuccessMsg('Profile photo saved!')
      setTimeout(() => {
        onClose()
      }, 700)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0">
                Upload Profile Photo
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                Visible to organizations and event managers for verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6">
          {/* Avatar Preview Ring */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/30 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all border-2 border-white dark:border-gray-900 cursor-pointer"
                title="Choose image file"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline border-none bg-transparent cursor-pointer"
            >
              Choose from Computer or Device
            </button>
          </div>

          {/* Quick Preset Avatars */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Or pick an instant avatar:
            </label>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(url)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer p-0 bg-transparent ${
                    previewUrl === url
                      ? 'border-emerald-500 ring-2 ring-emerald-400/40'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-2"
          >
            {isUploading ? (
              <span>Saving Photo...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
