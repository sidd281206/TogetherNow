'use client'

import React from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef } from '@/components/ui/OpportunitiesFeed'
import { Award, Clock, HeartHandshake, Sparkles } from 'lucide-react'

interface VolunteerDashboardProps {
  opportunitiesRef?: React.RefObject<OpportunitiesFeedRef | null>
}

export default function VolunteerDashboard({ opportunitiesRef }: VolunteerDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Quick Impact Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">0 hrs</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Volunteered Hours</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">0 Badges</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Impact Milestones</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center font-bold text-xl shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">0 Drives</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Events Attended</div>
          </div>
        </div>
      </div>

      {/* Main Opportunities & Events Feed */}
      <OpportunitiesFeed ref={opportunitiesRef} userRole="volunteer" />
    </div>
  )
}
