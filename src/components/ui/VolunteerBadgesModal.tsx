'use client'

import React, { useState } from 'react'
import {
  X,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Shield,
  Medal,
  Star,
  Users,
  Building2,
  Crown,
  HeartHandshake,
  Footprints
} from 'lucide-react'
import {
  ALL_BADGES,
  BADGE_CATEGORIES,
  BadgeCategory,
  getVolunteerBadges,
  getCurrentTierInfo,
  VolunteerBadgeWithProgress
} from '@/lib/badges'

interface VolunteerBadgesModalProps {
  isOpen: boolean
  onClose: () => void
  totalHours: number
  userName?: string
}

export default function VolunteerBadgesModal({
  isOpen,
  onClose,
  totalHours,
  userName = 'Volunteer',
}: VolunteerBadgesModalProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | BadgeCategory | 'Earned'>('All')

  if (!isOpen) return null

  const badges = getVolunteerBadges(totalHours)
  const earnedBadges = badges.filter((b) => b.earned)
  const tierInfo = getCurrentTierInfo(totalHours)

  const filteredBadges = badges.filter((b) => {
    if (activeCategoryTab === 'All') return true
    if (activeCategoryTab === 'Earned') return b.earned
    return b.category === activeCategoryTab
  })

  const renderBadgeIcon = (iconName: string, glyph: string, earned: boolean) => {
    const iconClass = `w-7 h-7 ${earned ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`

    switch (iconName) {
      case 'Footprints':
        return <Footprints className={iconClass} />
      case 'HeartHandshake':
        return <HeartHandshake className={iconClass} />
      case 'Award':
        return <Award className={iconClass} />
      case 'Users':
        return <Users className={iconClass} />
      case 'ShieldCheck':
        return <Shield className={iconClass} />
      case 'Building2':
        return <Building2 className={iconClass} />
      case 'Sparkles':
        return <Sparkles className={iconClass} />
      case 'Crown':
        return <Crown className={iconClass} />
      default:
        return <Medal className={iconClass} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0">
                  Volunteer Badges & Impact Tiers
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                  <span>{tierInfo.currentTierEmoji}</span>
                  <span>{tierInfo.currentTierLabel}</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                Milestones categorized by total hours contributed by {userName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Progress & Tier Summary Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white shadow-md border border-emerald-800/60 relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Overall Community Contribution</span>
              </span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black tracking-tight text-white m-0">
                  {totalHours}
                </h2>
                <span className="text-sm font-bold text-emerald-200">Hours Completed</span>
              </div>
              <p className="text-xs text-emerald-100/80 m-0">
                You have unlocked <strong>{earnedBadges.length} of {ALL_BADGES.length}</strong> hour-based milestone badges!
              </p>
            </div>

            {/* Next Milestone Progress Box */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 sm:w-72 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  <span>{tierInfo.nextTierLabel ? `Next: ${tierInfo.nextTierLabel}` : 'Max Tier Reached!'}</span>
                </span>
                {tierInfo.hoursToNextTier > 0 && (
                  <span className="text-amber-300 text-[11px] font-extrabold">
                    {tierInfo.hoursToNextTier} hrs to go
                  </span>
                )}
              </div>

              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${tierInfo.progressToNextTier}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-emerald-100/80">
                <span>Current: {tierInfo.currentTierLabel}</span>
                <span>{tierInfo.progressToNextTier}% Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Categories Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {[
            { key: 'All', label: 'All Badges', count: ALL_BADGES.length, emoji: '🏅' },
            { key: 'Starter', label: 'Starter Tier (1 - 10h)', count: 3, emoji: '🌱' },
            { key: 'Dedicated', label: 'Dedicated Tier (25 - 50h)', count: 2, emoji: '🌟' },
            { key: 'Leader', label: 'Leader Tier (100 - 250h)', count: 2, emoji: '🏆' },
            { key: 'Champion', label: 'Champion Tier (500+h)', count: 1, emoji: '👑' },
            { key: 'Earned', label: 'Earned Only', count: earnedBadges.length, emoji: '✓' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategoryTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategoryTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeCategoryTab === tab.key
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Categorized Badges Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[50vh]">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Award className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                No badges found for this filter
              </p>
              <p className="text-[11px] text-gray-400 m-0 mt-1">
                Participate in more volunteer events and clock in hours to unlock new badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBadges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                    b.earned
                      ? `bg-white dark:bg-gray-800/90 ${b.borderColor} shadow-xs hover:shadow-md`
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Badge Icon Emblem */}
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 relative transition-transform group-hover:scale-105 ${
                        b.earned
                          ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 text-white shadow-md ring-2 ring-emerald-300/60 dark:ring-emerald-500/40'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 ring-1 ring-gray-300 dark:ring-gray-600'
                      }`}
                    >
                      {renderBadgeIcon(b.iconName, b.glyph, b.earned)}
                      {b.earned && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-xs"
                          title="Badge Earned"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </div>

                    {/* Badge Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                            {b.name}
                          </h4>
                          <span className="text-base">{b.glyph}</span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            b.category === 'Starter'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : b.category === 'Dedicated'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                              : b.category === 'Leader'
                              ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                              : 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60'
                          }`}
                        >
                          {b.category} Tier
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Progress Bar & Requirement */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>Requirement: <strong>{b.hoursRequired} Hours</strong></span>
                      </span>

                      {b.earned ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unlocked & Earned</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{b.hoursRemaining} hrs remaining</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          b.earned
                            ? 'bg-emerald-500'
                            : b.progressPercent >= 50
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${b.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hours are credited automatically when event attendance is marked present.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs border-none cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
