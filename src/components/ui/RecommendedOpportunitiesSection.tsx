'use client'

import React from 'react'
import { Sparkles, MapPin, Calendar, Clock, Building2, CheckCircle2, ChevronRight, SlidersHorizontal, ArrowUpRight, HeartHandshake, Lock } from 'lucide-react'
import { Opportunity } from '@/components/ui/OpportunitiesFeed'
import { VolunteerPreferences, getRecommendedOpportunities, ScoredOpportunity } from '@/lib/recommendations'

interface RecommendedOpportunitiesSectionProps {
  opportunities: Opportunity[]
  preferences: VolunteerPreferences
  onSelectOpportunity: (op: Opportunity) => void
  onEditPreferences?: () => void
  onViewAllClick?: () => void
}

export default function RecommendedOpportunitiesSection({
  opportunities,
  preferences,
  onSelectOpportunity,
  onEditPreferences,
  onViewAllClick,
}: RecommendedOpportunitiesSectionProps) {
  const recommendedOps = React.useMemo(() => {
    return getRecommendedOpportunities(opportunities, preferences)
  }, [opportunities, preferences])

  const hasPreferences = Boolean(
    (preferences.skills && preferences.skills.length > 0) ||
    (preferences.interests && preferences.interests.length > 0) ||
    preferences.city
  )

  if (!hasPreferences) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 rounded-3xl p-6 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 tracking-tight">
                  Unlock Smart Opportunity Recommendations 🎯
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  New Feature
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 m-0 mt-1 leading-relaxed">
                Save your skills (e.g. Photography, Coding), passions, and registered city during verification. Our platform will automatically match you with the best nearby NGO drives!
              </p>
            </div>
          </div>

          {onEditPreferences && (
            <button
              type="button"
              onClick={onEditPreferences}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border-none shrink-0"
            >
              <span>Add Skills & City</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-5 sm:p-7 border border-emerald-100 dark:border-emerald-950 shadow-xs space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 border-b border-gray-100 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended For You</span>
            </div>
            {preferences.city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>City: {preferences.city}</span>
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {recommendedOps.length} Smart Match{recommendedOps.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white m-0 tracking-tight">
            Tailored Volunteer Opportunities
          </h3>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
            Matched based on your verified interests{' '}
            <strong className="text-gray-700 dark:text-gray-200">
              {preferences.interests.length > 0 ? preferences.interests.slice(0, 3).join(', ') : 'passions'}
            </strong>
            {preferences.skills.length > 0 && (
              <>
                , skills{' '}
                <strong className="text-gray-700 dark:text-gray-200">
                  {preferences.skills.slice(0, 3).join(', ')}
                </strong>
              </>
            )}
            {preferences.city && (
              <>
                , and registered location in{' '}
                <strong className="text-gray-700 dark:text-gray-200">{preferences.city}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          {onEditPreferences && (
            <button
              type="button"
              onClick={onEditPreferences}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer border-none shadow-2xs"
              title="Update your skills, interests, or city"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span>Edit Preferences</span>
            </button>
          )}

          {onViewAllClick && recommendedOps.length > 0 && (
            <button
              type="button"
              onClick={onViewAllClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs"
            >
              <span>View In Feed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Recommended Opportunities List */}
      {recommendedOps.length === 0 ? (
        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white m-0">No direct matches currently</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto m-0">
            We couldn't find events matching your exact combination of skills ({preferences.skills.join(', ')}), interests, or city ({preferences.city}). Browse all available drives below or broaden your interests!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedOps.slice(0, 3).map((op: ScoredOpportunity) => {
            const totalRequired = op.totalRequired ?? (op.spotsLeft + (op.alreadyRegistered ?? 0))
            const percentFilled = Math.min(100, Math.round(((op.alreadyRegistered ?? 0) / Math.max(1, totalRequired)) * 100))

            return (
              <div
                key={op.id}
                onClick={() => onSelectOpportunity(op)}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-5 border border-emerald-200/80 dark:border-emerald-800/70 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Bar: Match Score & Category */}
                  <div className="flex items-center justify-between gap-2">
                    {op.isApplicationsClosed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800 shadow-xs">
                        <Lock className="w-3 h-3" />
                        <span>Roster Finalized</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black shadow-xs ring-1 ring-emerald-400/40">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>{op.matchPercentage}% Match</span>
                      </span>
                    )}

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {op.category}
                    </span>
                  </div>

                  {/* Match Reason Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {op.matchReasons.slice(0, 2).map((reason, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          reason.type === 'interest'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
                            : reason.type === 'skill'
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                        }`}
                      >
                        {reason.label}
                      </span>
                    ))}
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {op.title}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium truncate">{op.organization}</span>
                      {op.isVerifiedOrg && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{op.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{op.date} • {op.time}</span>
                    </div>
                  </div>

                  {/* Explanation snippet */}
                  {op.recommendationExplanation && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 italic bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl leading-relaxed">
                      💡 {op.recommendationExplanation}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Spots & Apply CTA */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      <strong>{op.spotsLeft}</strong> spot{op.spotsLeft !== 1 ? 's' : ''} left
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {percentFilled}% Filled
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>

                  {op.isApplicationsClosed ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectOpportunity(op)
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-gray-200/80 dark:border-gray-700 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Applications Closed</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectOpportunity(op)
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all border-none cursor-pointer group-hover:shadow-md"
                    >
                      <span>View & Apply</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
