'use client'

import React from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef } from '@/components/ui/OpportunitiesFeed'
import { Calendar, Users, CheckCircle, ShieldCheck, XCircle } from 'lucide-react'
import ResubmitApplicationButton from '@/components/ui/ResubmitApplicationButton'

interface OrganizationDashboardProps {
  opportunitiesRef?: React.RefObject<OpportunitiesFeedRef | null>
  userId?: string
  orgStatus?: string
}

export default function OrganizationDashboard({ opportunitiesRef, userId, orgStatus }: OrganizationDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Organization Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">5 Drives</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Opportunities</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center font-bold text-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">45</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Volunteers Registered</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">120 hrs</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Community Impact</div>
          </div>
        </div>
      </div>

      {/* Organization Verification Control Bar (Verified Orgs) */}
      {userId && orgStatus === 'approved' && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <span>Organization Status: Verified</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 m-0">
                Your organization is fully verified by platform administrators. Opportunity posting access is unlocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {userId && orgStatus === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Verification Application Rejected — Action Required</span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 m-0">
            Your verification document was rejected. Please review your NGO registration number and upload an updated PDF document to re-submit.
          </p>
          <ResubmitApplicationButton userId={userId} orgStatus={orgStatus} />
        </div>
      )}

      {/* Opportunities Feed for Organization */}
      <OpportunitiesFeed ref={opportunitiesRef} userRole="organization" />
    </div>
  )
}
