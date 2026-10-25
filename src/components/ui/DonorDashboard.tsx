'use client'

import React, { useState, useActionState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Heart, TrendingUp, Users, Target, Calendar, X, ChevronRight, Wallet, AlertCircle, CheckCircle2, Building2, Sparkles, Search, Filter, Camera, User } from 'lucide-react'
import { makeDonationAction } from '@/app/actions/donations'
import VolunteerPhotoUploadModal from './VolunteerPhotoUploadModal'
import ProfileCompletionModal from './ProfileCompletionModal'

interface DonationRequest {
  id: string
  organization_id: string
  organization_name: string
  title: string
  description: string
  cause_category: string
  goal_amount: number
  raised_amount: number
  currency: string
  deadline: string | null
  image_url: string | null
  status: string
  created_at: string
}

interface DonorStats {
  totalDonated: number
  causesCount: number
}

interface DonorDashboardProps {
  userId: string
  userEmail: string
  userName: string
  donationRequests: DonationRequest[]
  donorStats: DonorStats
}

export interface DonorDashboardRef {
  focusSearch: () => void
}

const CAUSE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Education:       { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  Healthcare:      { bg: '#fdf2f8', text: '#9d174d', dot: '#ec4899' },
  Environment:     { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  'Disaster Relief': { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  'Animal Welfare':  { bg: '#f5f3ff', text: '#5b21b6', dot: '#8b5cf6' },
  Community:       { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
}

const AMOUNT_PRESETS = [100, 500, 1000, 5000]

function getDaysLeft(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  const d = new Date(deadline)
  const now = new Date()
  const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Ended'
  if (days === 0) return 'Ends today'
  return `${days} day${days !== 1 ? 's' : ''} left`
}

function CampaignCard({
  campaign,
  onDonate,
}: {
  campaign: DonationRequest
  onDonate: (campaign: DonationRequest) => void
}) {
  const progress = Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
  const causeColor = CAUSE_COLORS[campaign.cause_category] ?? CAUSE_COLORS.Community
  const daysLeft = getDaysLeft(campaign.deadline)
  const isUrgent = daysLeft !== 'No deadline' && daysLeft !== 'Ended' && parseInt(daysLeft) <= 7

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      {/* Campaign image or gradient banner */}
      {campaign.image_url ? (
        <div style={{ height: '140px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={campaign.image_url}
            alt={campaign.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      ) : (

        <div style={{ height: '80px', background: `linear-gradient(135deg, ${causeColor.dot}30, ${causeColor.dot}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '2rem' }}>
            {campaign.cause_category === 'Education' ? '📚'
              : campaign.cause_category === 'Healthcare' ? '🏥'
              : campaign.cause_category === 'Environment' ? '🌿'
              : campaign.cause_category === 'Disaster Relief' ? '🆘'
              : campaign.cause_category === 'Animal Welfare' ? '🐾'
              : '🤝'}
          </span>
        </div>
      )}

      <div style={{ padding: '18px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Org name + verified badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 style={{ width: '13px', height: '13px', color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{campaign.organization_name}</span>
          <span style={{ marginLeft: '2px', fontSize: '0.65rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <CheckCircle2 style={{ width: '10px', height: '10px' }} /> Verified
          </span>
        </div>

        {/* Cause badge + urgency */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: causeColor.bg, color: causeColor.text }}>
            {campaign.cause_category}
          </span>
          {isUrgent && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#fff1f2', color: '#be123c' }}>
              🔥 Urgent
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
          {campaign.title}
        </h3>

        {/* Description */}
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              ₹{Number(campaign.raised_amount).toLocaleString('en-IN')} raised
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {progress}% of ₹{Number(campaign.goal_amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: '999px',
                background: progress >= 80
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #f59e0b, #10b981)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Deadline + Donate button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.73rem', color: isUrgent ? '#be123c' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            {daysLeft}
          </span>
          <button
            id={`donate-btn-${campaign.id}`}
            onClick={() => onDonate(campaign)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            <Heart style={{ width: '13px', height: '13px' }} />
            Donate Now
          </button>
        </div>
      </div>
    </div>
  )
}

function DonateModal({
  campaign,
  onClose,
}: {
  campaign: DonationRequest
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(makeDonationAction, null)
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (state?.message) {
      setSuccess(true)
    }
  }, [state])

  const handlePreset = (val: number) => setAmount(String(val))

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const progress = Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.22s ease' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '20px 20px 16px', position: 'relative' }}>
          <button
            id="donate-modal-close"
            onClick={onClose}
            style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Heart style={{ width: '20px', height: '20px', color: '#fff' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: 700 }}>Making a Donation</span>
          </div>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{campaign.title}</h3>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>{campaign.organization_name}</p>
        </div>

        {/* Progress recap */}
        <div style={{ padding: '14px 20px', backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>₹{Number(campaign.raised_amount).toLocaleString('en-IN')} raised</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{progress}% of ₹{Number(campaign.goal_amount).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', backgroundColor: '#fde68a', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #f59e0b, #10b981)' }} />
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💛</div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Thank you!</h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{state?.message}</p>
              <button
                id="donate-success-close"
                onClick={onClose}
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form action={action}>
              <input type="hidden" name="donationRequestId" value={campaign.id} />

              {state?.errors?.general && (
                <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fff1f2', color: '#be123c', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  {state.errors.general[0]}
                </div>
              )}

              {/* Amount presets */}
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Choose or enter an amount (₹)</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {AMOUNT_PRESETS.map(p => (
                  <button
                    key={p}
                    id={`preset-${p}`}
                    type="button"
                    onClick={() => handlePreset(p)}
                    style={{
                      flex: '1 1 80px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: amount === String(p) ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                      backgroundColor: amount === String(p) ? '#fffbeb' : '#f8fafc',
                      color: amount === String(p) ? '#92400e' : '#374151',
                      transition: 'all 0.15s',
                    }}
                  >
                    ₹{p.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <input
                  id="donate-amount"
                  name="amount"
                  type="number"
                  min={10}
                  step={1}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Or type a custom amount (min ₹10)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: state?.errors?.amount ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', fontSize: '0.88rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                />
                {state?.errors?.amount && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>{state.errors.amount[0]}</p>}
              </div>

              {/* Simulation notice */}
              <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <Wallet style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '1px' }} />
                <span>This is a simulation. No real payment is processed. In production, integrate Razorpay or Stripe here.</span>
              </div>

              <button
                id="donate-submit"
                type="submit"
                disabled={pending || !amount}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: (!amount || pending) ? '#e2e8f0' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: (!amount || pending) ? '#94a3b8' : '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: pending || !amount ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s',
                }}
              >
                <Heart style={{ width: '16px', height: '16px' }} />
                {pending ? 'Processing...' : `Donate ₹${amount ? Number(amount).toLocaleString('en-IN') : '—'}`}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}

const CATEGORIES = ['All', 'Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Animal Welfare', 'Community']

const DonorDashboard = forwardRef<DonorDashboardRef, DonorDashboardProps>(function DonorDashboard({
  userId,
  userEmail,
  userName,
  donationRequests,
  donorStats,
}, ref) {
  const [selectedCampaign, setSelectedCampaign] = useState<DonationRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const refreshAvatar = (e?: any) => {
      if (e?.detail) {
        setAvatarUrl(e.detail)
      } else if (userEmail) {
        const stored = localStorage.getItem(`togethernow_user_avatar_${userEmail}`)
        if (stored) setAvatarUrl(stored)
      }
    }
    refreshAvatar()
    window.addEventListener('togethernow_avatar_updated', refreshAvatar)
    window.addEventListener('storage', refreshAvatar)
    return () => {
      window.removeEventListener('togethernow_avatar_updated', refreshAvatar)
      window.removeEventListener('storage', refreshAvatar)
    }
  }, [userEmail])

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
  }))

  const filteredCampaigns = donationRequests.filter((campaign) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      campaign.title.toLowerCase().includes(q) ||
      campaign.organization_name.toLowerCase().includes(q) ||
      campaign.cause_category.toLowerCase().includes(q) ||
      campaign.description.toLowerCase().includes(q)

    const matchesCategory =
      selectedCategory === 'All' || campaign.cause_category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    searchInputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Donor Profile & Photo Action Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-3 ring-amber-400/50 shadow-md bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userName ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'D'}</span>
              )}
            </div>
            <button
              type="button"
              id="donor-avatar-btn"
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md border-2 border-white dark:border-gray-900 cursor-pointer transition-transform hover:scale-110"
              title="Update Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0">
                {userName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                <span>💛</span>
                <span>Verified Donor</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
              {userEmail} • Contributing directly to grassroots change
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            id="donor-update-photo-btn"
            onClick={() => setShowPhotoModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all border border-amber-200 dark:border-amber-800 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Update Photo</span>
          </button>

          <button
            type="button"
            id="donor-edit-profile-btn"
            onClick={() => setShowProfileModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-xs transition-all border-none cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: '16px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>Total Donated</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              ₹{donorStats.totalDonated.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#4338ca', fontWeight: 700 }}>Causes Supported</p>
            <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{donorStats.causesCount}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #d1fae5', borderRadius: '16px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#065f46', fontWeight: 700 }}>Active Campaigns</p>
            <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{donationRequests.length}</p>
          </div>
        </div>
      </div>

      {/* Campaign Search & Filter Controls */}
      <div id="donor-campaigns" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
            <input
              ref={searchInputRef}
              id="donor-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns by cause, title, or organization..."
              style={{
                width: '100%',
                padding: '11px 40px 11px 38px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.88rem',
                fontWeight: 500,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f59e0b'
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.backgroundColor = '#f8fafc'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                id="donor-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          <button
            type="submit"
            id="donor-search-submit"
            style={{
              padding: '11px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            <Search style={{ width: '14px', height: '14px' }} />
            <span>Search</span>
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Filter style={{ width: '12px', height: '12px' }} /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const count = cat === 'All'
              ? donationRequests.length
              : donationRequests.filter((r) => r.cause_category === cat).length

            return (
              <button
                key={cat}
                type="button"
                id={`donor-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  border: isSelected ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                  color: isSelected ? '#b45309' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? '#fde68a' : '#f1f5f9',
                  color: isSelected ? '#92400e' : '#64748b',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Campaign grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Active Fundraising Campaigns
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Support verified NGOs and organizations making a real difference.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', backgroundColor: '#fffbeb', padding: '4px 10px', borderRadius: '999px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles style={{ width: '12px', height: '12px' }} />
            {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'Campaign' : 'Campaigns'}
          </div>
        </div>

        {donationRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌱</div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: '#374151' }}>No active campaigns yet</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
              Organizations will post fundraising campaigns here. Check back soon!
            </p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ margin: '0 0 6px', fontWeight: 700, color: '#374151' }}>No matching campaigns found</h3>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.82rem' }}>
              Try adjusting your search terms or clearing selected category filters.
            </p>
            <button
              type="button"
              id="donor-reset-search-btn"
              onClick={handleClearFilters}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px' }}>
            {filteredCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={setSelectedCampaign}
              />
            ))}
          </div>
        )}
      </div>

      {/* Donate Modal */}
      {selectedCampaign && (
        <DonateModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Donor Profile Photo Upload Modal */}
      <VolunteerPhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        userEmail={userEmail}
        currentAvatarUrl={avatarUrl}
        onUploadSuccess={(url) => setAvatarUrl(url)}
      />

      {/* Donor Edit Profile Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userEmail={userEmail}
        userName={userName}
        userRole="donor"
      />
    </div>
  )
})

export default DonorDashboard
