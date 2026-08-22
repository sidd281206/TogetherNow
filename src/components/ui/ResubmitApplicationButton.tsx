'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

interface ResubmitApplicationButtonProps {
  userId?: string
  orgStatus?: string
}

export default function ResubmitApplicationButton({ userId, orgStatus }: ResubmitApplicationButtonProps) {
  const router = useRouter()

  const handleResubmitClick = () => {
    router.push('/onboarding')
  }

  return (
    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60 mt-3 flex justify-end">
      <button
        type="button"
        onClick={handleResubmitClick}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all border-none cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Re-submit Verification Details</span>
      </button>
    </div>
  )
}
