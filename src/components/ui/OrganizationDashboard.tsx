'use client'

import React from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef } from '@/components/ui/OpportunitiesFeed'
import { Calendar, Users, CheckCircle, Plus } from 'lucide-react'

interface OrganizationDashboardProps {
  opportunitiesRef?: React.RefObject<OpportunitiesFeedRef | null>
}

export default function OrganizationDashboard({ opportunitiesRef }: OrganizationDashboardProps) {
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

      {/* Opportunities Feed for Organization */}
      <OpportunitiesFeed ref={opportunitiesRef} userRole="organization" />
    </div>
  )
}
