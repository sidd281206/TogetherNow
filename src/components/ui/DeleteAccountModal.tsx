'use client'

import React, { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'
import { deleteAccountAction } from '@/app/actions/auth'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
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
    setIsDeleting(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0">
              Delete Account
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium m-0">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Body Description */}
        <div className="space-y-3 mb-5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p className="m-0">
            Are you sure you want to delete your account ({userEmail || 'User'})?
          </p>
          <p className="m-0 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200/60 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 font-medium">
            ⚠️ Deleting your account will permanently purge your profile, registration details, events history, and saved data from TogetherNow.
          </p>
          <div>
            <label htmlFor="confirm-delete-input" className="block font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              Type <span className="font-mono text-rose-600 font-bold">DELETE</span> below to confirm:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        {/* Action Form */}
        <form action={deleteAccountAction} onSubmit={handleSubmit} className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!isConfirmed || isDeleting}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all border-none ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-md cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting Account...</span>
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
