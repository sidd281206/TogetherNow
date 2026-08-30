'use client'

import React, { useState } from 'react'
import { 
  Star, 
  Sparkles, 
  X, 
  Building2, 
  Check, 
  HeartHandshake, 
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react'
import { submitOrgReview } from '@/lib/ratings'

interface OrganizationRatingModalProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  eventId?: string
  eventTitle?: string
  volunteerName?: string
  volunteerEmail?: string
  onReviewSubmitted?: () => void
}

const AVAILABLE_TAGS = [
  'Well Organized',
  'Great Coordinators',
  'Safety First',
  'High Impact',
  'Great Equipment',
  'Friendly Team',
  'Educational & Fun',
  'Clear Instructions',
]

const RATING_LABELS: Record<number, string> = {
  1: 'Poor — Needs Major Improvement',
  2: 'Fair — Acceptable Experience',
  3: 'Good — Well Organized Drive',
  4: 'Very Good — Highly Recommended',
  5: 'Excellent — Outstanding Experience! 🌟',
}

export default function OrganizationRatingModal({
  isOpen,
  onClose,
  organizationName,
  eventId,
  eventTitle,
  volunteerName = 'Volunteer',
  volunteerEmail = 'volunteer@togethernow.org',
  onReviewSubmitted,
}: OrganizationRatingModalProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)

  const [managementRating, setManagementRating] = useState(5)
  const [supportRating, setSupportRating] = useState(5)
  const [impactRating, setImpactRating] = useState(5)

  const [selectedTags, setSelectedTags] = useState<string[]>(['Well Organized', 'High Impact'])
  const [feedback, setFeedback] = useState('')
  const [reviewerName, setReviewerName] = useState(volunteerName || 'Community Volunteer')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmitting(true)

    submitOrgReview({
      orgName: organizationName,
      eventId,
      eventTitle: eventTitle || 'Volunteer Drive',
      volunteerName: isAnonymous ? 'Verified Volunteer' : reviewerName.trim() || 'Volunteer',
      volunteerEmail: isAnonymous ? undefined : volunteerEmail,
      rating,
      managementRating,
      supportRating,
      impactRating,
      feedback: feedback.trim(),
      tags: selectedTags,
    })

    setIsSubmitting(false)
    setIsSuccess(true)

    if (onReviewSubmitted) onReviewSubmitted()

    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              ⭐
            </div>
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Post-Event Volunteer Rating
              </span>
              <h3 className="text-lg font-black text-white m-0">
                Rate {organizationName}
              </h3>
              {eventTitle && (
                <p className="text-xs text-emerald-100/90 m-0 truncate max-w-xs">
                  Event: {eventTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {isSuccess ? (
            <div className="text-center py-10 space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white m-0">
                Thank You for Your Review!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto m-0 leading-relaxed">
                Your rating has been recorded and is now publicly visible to volunteers, organizations, and donors to build community trust.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Overall Star Rating */}
              <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overall Volunteer Experience *
                </label>

                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeScore = hoverRating || rating
                    const isFilled = star <= activeScore

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-125 border-none bg-transparent cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 h-4">
                  {RATING_LABELS[hoverRating || rating]}
                </div>
              </div>

              {/* Sub-Criteria Ratings */}
              <div className="space-y-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/40">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 block">
                  Detailed Experience Breakdown
                </span>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Event Organization & Punctuality
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setManagementRating(s)}
                          className="border-none bg-transparent cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              s <= managementRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Volunteer Support & Safety
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSupportRating(s)}
                          className="border-none bg-transparent cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              s <= supportRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Ground Impact & Meaningfulness
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setImpactRating(s)}
                          className="border-none bg-transparent cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              s <= impactRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag Highlights */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Highlight Key Positives
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Written Review & Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share details of your experience with the coordinators, activities, and overall drive..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Reviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={isAnonymous ? 'Verified Volunteer (Anonymous)' : reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Post as Anonymous Volunteer</span>
                  </label>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!feedback.trim() || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Rating & Review</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  )
}
