'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Award, 
  Clock, 
  Heart, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  ImageIcon, 
  History, 
  Check, 
  Navigation,
  Info,
  Maximize2,
  Star,
  MessageSquare,
  ThumbsUp
} from 'lucide-react'
import { OrganizationProfileData, getOrganizationProfile } from '@/lib/organizations'
import { getOrgRatingSummary, getOrgReviews, OrgReview, OrgRatingSummary } from '@/lib/ratings'
import OrganizationRatingModal from '@/components/ui/OrganizationRatingModal'

interface OrganizationAboutModalProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  organizationId?: string
  initialTab?: 'about' | 'gallery' | 'pastEvents' | 'reviews' | 'contact'
  onExploreDrivesClick?: (orgName: string) => void
}

export default function OrganizationAboutModal({
  isOpen,
  onClose,
  organizationName,
  organizationId,
  initialTab = 'about',
  onExploreDrivesClick,
}: OrganizationAboutModalProps) {
  const [profile, setProfile] = useState<OrganizationProfileData | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'pastEvents' | 'reviews' | 'contact'>(initialTab)
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; caption?: string } | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [ratingSummary, setRatingSummary] = useState<OrgRatingSummary | null>(null)
  const [reviews, setReviews] = useState<OrgReview[]>([])

  const loadProfile = () => {
    if (!organizationName) return
    const data = getOrganizationProfile(organizationName, organizationId)
    setProfile(data)

    const sum = getOrgRatingSummary(organizationName)
    setRatingSummary(sum)
    const revs = getOrgReviews(organizationName)
    setReviews(revs)
  }

  useEffect(() => {
    if (isOpen && organizationName) {
      loadProfile()
      if (initialTab) setActiveTab(initialTab)
    }
  }, [isOpen, organizationName, organizationId, initialTab])

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail?.orgName === organizationName || e.detail?.userId === organizationId) {
        loadProfile()
      }
    }
    const handleReviewUpdate = (e: CustomEvent) => {
      if (e.detail?.orgName === organizationName) {
        loadProfile()
      }
    }

    window.addEventListener('togethernow_org_about_updated', handleUpdate as EventListener)
    window.addEventListener('togethernow_org_review_submitted', handleReviewUpdate as EventListener)
    return () => {
      window.removeEventListener('togethernow_org_about_updated', handleUpdate as EventListener)
      window.removeEventListener('togethernow_org_review_submitted', handleReviewUpdate as EventListener)
    }
  }, [organizationName, organizationId])

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Hero Banner */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 sm:p-7 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pr-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-inner shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight">
                  {profile.name}
                </h2>

                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-100 text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified NGO</span>
                  </span>
                )}

                {ratingSummary && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 hover:text-white hover:bg-amber-400/40 text-xs font-bold shadow-xs cursor-pointer transition-all border-none"
                    title="View Volunteer Ratings & Reviews"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{ratingSummary.averageRating} ({ratingSummary.totalReviews} reviews)</span>
                  </button>
                )}

                {profile.foundedYear && (
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-emerald-100 text-[11px] font-semibold">
                    Est. {profile.foundedYear}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium m-0 max-w-2xl leading-relaxed">
                {profile.tagline || 'Community Empowerment & Social Action'}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-emerald-200">
                {profile.registrationNumber && (
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded-md">
                    <span>Reg: {profile.registrationNumber}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{profile.location || 'Mumbai, Maharashtra'}</span>
                </span>
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white hover:underline text-decoration-none font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Official Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>About & Mission</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Reviews & Ratings ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Work & Photo Gallery ({profile.gallery?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pastEvents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pastEvents'
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Previous Work & Events ({profile.pastEvents?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact & In-Charge</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: ABOUT & MISSION */}
          {/* ============================================================ */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Trust & Verification Highlight Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                    Verified Community Organization
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 m-0 leading-relaxed">
                    This organization is government-registered (<strong>{profile.registrationNumber || 'Registration verified'}</strong>) and verified on TogetherNow. All posted drives are supervised by designated coordinators.
                  </p>
                </div>
              </div>

              {/* 4 Impact Statistics Grid */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Cumulative Impact Milestones</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                      {profile.stats?.volunteersCount ? profile.stats.volunteersCount.toLocaleString() : '1,200+'}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Volunteers Mobilized
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto mb-2 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                      {profile.stats?.drivesCompleted || 32}+
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Completed Drives
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 mx-auto mb-2 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                      {profile.stats?.hoursVolunteered ? `${(profile.stats.hoursVolunteered / 1000).toFixed(1)}k` : '8.5k'} hrs
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Volunteer Hours
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 mx-auto mb-2 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                      {profile.stats?.peopleImpacted ? profile.stats.peopleImpacted.toLocaleString() : '25,000+'}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Lives Impacted
                    </div>
                  </div>
                </div>
              </div>

              {/* Story / About Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                  About Our Organization
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed m-0">
                  {profile.about}
                </p>
              </div>

              {/* Mission & Vision Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Our Mission</span>
                  </div>
                  <p className="text-xs text-indigo-950/80 dark:text-indigo-200/90 leading-relaxed m-0">
                    {profile.mission}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Our Vision</span>
                  </div>
                  <p className="text-xs text-emerald-950/80 dark:text-emerald-200/90 leading-relaxed m-0">
                    {profile.vision}
                  </p>
                </div>
              </div>

              {/* Focus Cause Areas Tags */}
              {profile.causes && profile.causes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 m-0">
                    Core Focus & Causes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.causes.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/70 dark:border-emerald-800/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: REVIEWS & RATINGS (VISIBLE TO VOLUNTEERS/ORGS/DONORS) */}
          {/* ============================================================ */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Overall Ratings Overview Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-indigo-500/10 border border-amber-200/60 dark:border-amber-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center p-3.5 rounded-2xl bg-white dark:bg-gray-800 shadow-xs border border-amber-200 dark:border-amber-800/60 shrink-0">
                      <div className="text-3xl sm:text-4xl font-black text-amber-500 leading-none">
                        {ratingSummary?.averageRating || '4.9'}
                      </div>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                        {ratingSummary?.totalReviews || reviews.length} Reviews
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                          Top Rated Organization 🏆
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0">
                        Volunteer Sentiment & Trust Score
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 m-0 max-w-md leading-relaxed">
                        Public ratings evaluated directly by volunteers after attending ground drives with {profile.name}.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRateModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all border-none cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate this Organization</span>
                  </button>
                </div>

                {/* Sub-Ratings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/30 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold block text-[11px]">
                      Organization & Punctuality
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {ratingSummary?.subRatings.management || '4.9'} / 5.0
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Excellent</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold block text-[11px]">
                      Volunteer Support & Safety
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {ratingSummary?.subRatings.support || '4.8'} / 5.0
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Very High</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold block text-[11px]">
                      Ground Impact & Outcome
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {ratingSummary?.subRatings.impact || '5.0'} / 5.0
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Highest Impact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Verified Volunteer Reviews ({reviews.length})</span>
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">Sorted by Most Recent</span>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
                    <Star className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                      No volunteer reviews posted yet
                    </p>
                    <p className="text-[11px] text-gray-400 m-0">
                      Be the first volunteer to share feedback after completing a drive with {profile.name}!
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRateModal(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs border-none cursor-pointer"
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/70 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                              {rev.volunteerName ? rev.volunteerName.charAt(0).toUpperCase() : 'V'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                                  {rev.volunteerName}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified Volunteer
                                </span>
                              </div>
                              {rev.eventTitle && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">
                                  Drive: {rev.eventTitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/80 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= (rev.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-black text-amber-700 dark:text-amber-300 ml-1">
                                {rev.rating || 5}.0
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold">{rev.createdAt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-200 m-0 leading-relaxed">
                          "{rev.feedback}"
                        </p>

                        {rev.tags && rev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rev.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-[10px] font-semibold"
                              >
                                ✓ {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: PHOTO GALLERY OF GROUND WORK */}
          {/* ============================================================ */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0">
                    Ground Action & Field Gallery
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                    Real photographs from our past volunteer drives and community initiatives.
                  </p>
                </div>
              </div>

              {(!profile.gallery || profile.gallery.length === 0) ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                    No gallery images uploaded yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.gallery.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedPhoto(item)}
                      className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" /> View Photo
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-extrabold text-xs text-gray-900 dark:text-white m-0 truncate">
                            {item.title}
                          </h5>
                          {item.date && (
                            <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                              {item.date}
                            </span>
                          )}
                        </div>
                        {item.caption && (
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 m-0 line-clamp-2 leading-relaxed">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: PREVIOUS WORK & EVENTS */}
          {/* ============================================================ */}
          {activeTab === 'pastEvents' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0">
                    Previous Volunteer Drives & Accomplishments
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                    A track record of concluded drives, community impact, and volunteer participation.
                  </p>
                </div>
              </div>

              {(!profile.pastEvents || profile.pastEvents.length === 0) ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <History className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                    No previous events logged yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {profile.pastEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 shadow-xs flex flex-col sm:flex-row items-start gap-4 group"
                    >
                      {ev.imageUrl && (
                        <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {ev.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {ev.date}
                          </span>
                          {ev.attendeesCount > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {ev.attendeesCount} Volunteers
                            </span>
                          )}
                        </div>

                        <h5 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                          {ev.title}
                        </h5>

                        <p className="text-xs text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                          {ev.description}
                        </p>

                        {ev.impactSummary && (
                          <div className="pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span><strong>Impact:</strong> {ev.impactSummary}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: CONTACT & IN-CHARGE */}
          {/* ============================================================ */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0">
                  Official Contact & Coordinator In-Charge
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                  Reach out directly for partnership queries, volunteer support, or drive locations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Phone & Coordinator
                  </span>
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {profile.phone || 'Phone on file'}
                  </div>
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-decoration-none shadow-xs"
                    >
                      <Phone className="w-3 h-3" /> Call Coordinator
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Official Email
                  </span>
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                    {profile.email || 'contact@togethernow.org'}
                  </div>
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-decoration-none shadow-xs"
                    >
                      <Mail className="w-3 h-3" /> Send Email
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Registered Office & Headquarters Address
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-decoration-none"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white m-0">
                  {profile.address || profile.location}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Non-Profit Profile on TogetherNow</span>
          </div>

          <div className="flex items-center gap-2">
            {onExploreDrivesClick && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onExploreDrivesClick(profile.name)
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Explore Events by {profile.name.split(' ')[0]}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs border-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox / Expanded Photo View Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 space-y-3 p-4"
          >
            <div className="flex items-center justify-between text-white pb-2 border-b border-gray-800">
              <h4 className="font-extrabold text-sm m-0">{selectedPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {selectedPhoto.caption && (
              <p className="text-xs text-gray-300 m-0 leading-relaxed">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Rating Modal */}
      {showRateModal && (
        <OrganizationRatingModal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          organizationName={profile.name}
          onReviewSubmitted={() => {
            loadProfile()
            setActiveTab('reviews')
          }}
        />
      )}

    </div>
  )
}
