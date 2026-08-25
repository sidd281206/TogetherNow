'use client'

import React, { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader2, Building2, Users, HeartHandshake, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { deleteAccountAction } from '@/app/actions/auth'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
  userRole?: string
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  userRole = 'volunteer',
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE'

  const handleSubmit = async (e: React.FormEvent) => {
    if (!isConfirmed) {
      e.preventDefault()
      return
    }

    // Clear all client-side cached data in localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('togethernow_event_applicants_v1')
        localStorage.removeItem('togethernow_notifications_v1')
        localStorage.removeItem('togethernow_posted_opportunities')
        
        // Remove all email-keyed items
        if (userEmail) {
          localStorage.removeItem(`togethernow_profile_complete_${userEmail}`)
          localStorage.removeItem(`togethernow_verified_email_${userEmail}`)
          localStorage.removeItem(`togethernow_user_phone_${userEmail}`)
          localStorage.removeItem(`togethernow_user_address_${userEmail}`)
        }

        // Wipe all togethernow_ keys from localStorage
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('togethernow_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
      }
    } catch (err) {
      console.warn('Notice clearing local storage on account deletion:', err)
    }
  }

  const roleTitle =
    userRole === 'organization'
      ? 'Organization'
      : userRole === 'donor'
      ? 'Donor'
      : 'Volunteer'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0">
                Delete {roleTitle} Account
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Permanent
              </span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium m-0 mt-0.5">
              Warning: All data in the database will be permanently wiped.
            </p>
          </div>
        </div>

        {/* Body Description & Role Specific Breakdown */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p className="m-0">
            You are about to permanently delete the account for <strong className="text-gray-900 dark:text-white">{userName || userEmail || 'your profile'}</strong> ({userEmail}).
          </p>

          {/* Role-Specific Data Purge Notice */}
          <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 space-y-2">
            <h4 className="font-extrabold text-xs text-rose-950 dark:text-rose-200 m-0 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Data removed from database immediately upon deletion:</span>
            </h4>
            
            {userRole === 'organization' ? (
              <ul className="m-0 pl-4 space-y-1 text-rose-900 dark:text-rose-300">
                <li>🏢 <strong>Organization Profile:</strong> Mission, contact info, registration details, and verification badge.</li>
                <li>📄 <strong>Verification Files:</strong> All uploaded registration PDFs/documents deleted from cloud storage.</li>
                <li>📅 <strong>Created Events & Drives:</strong> All posted opportunities removed from public feed.</li>
                <li>👥 <strong>Volunteer Applications:</strong> All applicant records, responses, and candidate logs.</li>
                <li>🔑 <strong>Authentication:</strong> Account login credentials and security tokens purged.</li>
              </ul>
            ) : userRole === 'donor' ? (
              <ul className="m-0 pl-4 space-y-1 text-rose-900 dark:text-rose-300">
                <li>💳 <strong>Donor Profile:</strong> Organization affiliations and preferences.</li>
                <li>🤝 <strong>Donation Records:</strong> Transaction logs and donation history.</li>
                <li>🔔 <strong>Notifications:</strong> Impact updates and notification preferences.</li>
                <li>🔑 <strong>Authentication:</strong> Account login credentials and security tokens purged.</li>
              </ul>
            ) : (
              <ul className="m-0 pl-4 space-y-1 text-rose-900 dark:text-rose-300">
                <li>👤 <strong>Volunteer Profile:</strong> Skills, bio, contact information, and availability.</li>
                <li>📨 <strong>Event Applications:</strong> All submitted drive applications and pending/approved statuses.</li>
                <li>⏱️ <strong>Impact History:</strong> Completed volunteering hours, attendances, and milestone badges.</li>
                <li>🔔 <strong>Notifications:</strong> Organizer approval notices and alerts.</li>
                <li>🔑 <strong>Authentication:</strong> Account login credentials and security tokens purged.</li>
              </ul>
            )}
          </div>

          <div className="pt-1">
            <label htmlFor="confirm-delete-input" className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              To proceed with permanent deletion, type <span className="font-mono text-rose-600 font-extrabold">DELETE</span> below:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              disabled={isDeleting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Form Footer */}
        <form action={deleteAccountAction} onSubmit={handleSubmit} className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!isConfirmed || isDeleting}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all border-none ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-md cursor-pointer ring-2 ring-rose-500/50'
                : 'bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Purging Data & Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Account</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
