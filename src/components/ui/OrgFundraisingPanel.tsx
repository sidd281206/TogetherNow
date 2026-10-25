'use client'

import React, { useState, useActionState, useEffect } from 'react'
import {
  Plus,
  X,
  Target,
  TrendingUp,
  Calendar,
  Heart,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Wallet,
  Archive,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  QrCode,
  Copy,
  Check,
  Edit2,
  XCircle,
  FileCheck,
  UserCheck,
  RefreshCw
} from 'lucide-react'
import { createDonationRequestAction, closeCampaignAction, verifyDonationAction } from '@/app/actions/donations'
import { getOrganizationUpiId, setOrganizationUpiId } from '@/lib/organizations'

interface Campaign {
  id: string
  title: string
  cause_category: string
  goal_amount: number
  raised_amount: number
  deadline: string | null
  status: string
  created_at: string
}

export interface IncomingDonation {
  id: string
  amount: number
  currency: string
  status: string
  donated_at: string
  donation_request_id?: string
  organization_id: string
  donor_id: string
  upi_id?: string | null
  upi_txn_ref?: string | null
  donor_profile?: {
    full_name?: string
    email?: string
  }
  donation_requests?: {
    id?: string
    title?: string
    cause_category?: string
  }
}

interface OrgFundraisingPanelProps {
  orgStatus?: string
  organizationName?: string
  myCampaigns: Campaign[]
  incomingDonations?: IncomingDonation[]
}

const CAUSE_CATEGORIES = [
  'Community',
  'Education',
  'Healthcare',
  'Environment',
  'Disaster Relief',
  'Animal Welfare',
]

function RaiseFundsModal({
  organizationName,
  onClose,
}: {
  organizationName: string
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(createDonationRequestAction, null)
  const [success, setSuccess] = useState(false)
  const [upiId, setUpiId] = useState(() => getOrganizationUpiId(organizationName))

  useEffect(() => {
    if (state?.message) {
      setSuccess(true)
      if (upiId.trim()) {
        setOrganizationUpiId(organizationName, upiId.trim())
      }
    }
  }, [state, upiId, organizationName])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const minDeadline = new Date()
  minDeadline.setDate(minDeadline.getDate() + 7)
  const minDateStr = minDeadline.toISOString().split('T')[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white relative shrink-0">
          <button
            id="raise-funds-close"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </span>
            <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider">
              Launch Fundraising Campaign
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white m-0">
            Create Campaign for a Cause
          </h3>
          <p className="text-xs text-emerald-100/90 m-0 mt-1">
            {organizationName} • Verified Campaign
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white m-0">
                  Campaign Published!
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  {state?.message || 'Your campaign is now live on the donor feed!'}
                </p>
              </div>
              <button
                id="raise-funds-success-close"
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all border-none cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              {state?.errors?.general && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{state.errors.general[0]}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="campaign-title"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Campaign Title *
                </label>
                <input
                  id="campaign-title"
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Education Fund for Underprivileged Children"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                    state?.errors?.title
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {state?.errors?.title && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{state.errors.title[0]}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="campaign-category"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Cause Category *
                </label>
                <select
                  id="campaign-category"
                  name="causeCategory"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CAUSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="campaign-desc"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Description * <span className="font-normal text-gray-400">(min 30 characters)</span>
                </label>
                <textarea
                  id="campaign-desc"
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe the cause, how the funds will be used, and the impact donors can expect..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                    state?.errors?.description
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {state?.errors?.description && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    {state.errors.description[0]}
                  </p>
                )}
              </div>

              {/* Goal + Deadline side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="campaign-goal"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Funding Goal (₹) *
                  </label>
                  <input
                    id="campaign-goal"
                    name="goalAmount"
                    type="number"
                    required
                    min={1000}
                    step={100}
                    placeholder="e.g. 50000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                      state?.errors?.goalAmount
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {state?.errors?.goalAmount && (
                    <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                      {state.errors.goalAmount[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="campaign-deadline"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Campaign Deadline *
                  </label>
                  <input
                    id="campaign-deadline"
                    name="deadline"
                    type="date"
                    required
                    min={minDateStr}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                      state?.errors?.deadline
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {state?.errors?.deadline && (
                    <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                      {state.errors.deadline[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Image URL (optional) */}
              <div>
                <label
                  htmlFor="campaign-image"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Campaign Image URL <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  id="campaign-image"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Organization UPI ID */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="campaign-upi"
                    className="block text-xs font-bold text-gray-800 dark:text-gray-200"
                  >
                    Organization UPI ID for Payments *
                  </label>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> Dynamic QR Ready
                  </span>
                </div>
                <input
                  id="campaign-upi"
                  name="upiId"
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.trim())}
                  placeholder="e.g. oceanearth@okaxis or care@icici"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0">
                  Donors will scan a dynamically generated QR code that routes payments directly to this UPI address.
                </p>
              </div>

              {/* Submit */}
              <button
                id="raise-funds-submit"
                type="submit"
                disabled={pending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="w-4 h-4" />
                <span>{pending ? 'Publishing Campaign...' : 'Launch Campaign'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrgFundraisingPanel({
  orgStatus,
  organizationName = 'Your Organization',
  myCampaigns = [],
  incomingDonations = [],
}: OrgFundraisingPanelProps) {
  const [showModal, setShowModal] = useState(false)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>(myCampaigns)
  const [donationsList, setDonationsList] = useState<IncomingDonation[]>(incomingDonations)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'verifications' | 'verified_history'>('campaigns')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null)
  const [orgUpiId, setOrgUpiId] = useState(() => getOrganizationUpiId(organizationName))
  const [isEditingUpi, setIsEditingUpi] = useState(false)
  const [editUpiVal, setEditUpiVal] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)

  useEffect(() => {
    setCampaigns(myCampaigns)
  }, [myCampaigns])

  useEffect(() => {
    setDonationsList(incomingDonations)
  }, [incomingDonations])

  useEffect(() => {
    const handleUpiUpdated = (e: any) => {
      if (e.detail?.upiId) {
        setOrgUpiId(e.detail.upiId)
      }
    }
    window.addEventListener('togethernow_org_upi_updated', handleUpiUpdated)
    return () => window.removeEventListener('togethernow_org_upi_updated', handleUpiUpdated)
  }, [])

  const handleCopyUpi = () => {
    if (!orgUpiId) return
    navigator.clipboard.writeText(orgUpiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr)
    setCopiedUtrId(id)
    setTimeout(() => setCopiedUtrId(null), 2000)
  }

  const handleSaveUpi = () => {
    if (!editUpiVal.trim()) return
    const val = editUpiVal.trim()
    setOrgUpiId(val)
    setOrganizationUpiId(organizationName, val)
    setIsEditingUpi(false)
  }

  const isApproved = orgStatus === 'approved'
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount || 0), 0)
  const totalGoal = campaigns.reduce((sum, c) => sum + Number(c.goal_amount || 0), 0)
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')

  const pendingDonations = donationsList.filter((d) => d.status === 'pending')
  const verifiedDonations = donationsList.filter((d) => d.status === 'completed')

  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Are you sure you want to reject this payment record? The donor will be notified of invalid payment verification.')) {
      return
    }
    setVerifyingId(id)
    const res = await verifyDonationAction(id, action)
    if (res.success) {
      setDonationsList((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: action === 'approve' ? 'completed' : 'rejected' } : d))
      )
    }
    setVerifyingId(null)
  }

  const handleCloseCampaign = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to close this campaign? It will no longer be visible to donors.'
      )
    )
      return
    setClosingId(id)
    const res = await closeCampaignAction(id)
    if (res.success) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'closed' } : c))
      )
    }
    setClosingId(null)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
      {/* Top Header Row with Title and Raise Funds CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0">
                Fundraising &amp; Donor Campaigns
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-extrabold border border-rose-200 dark:border-rose-900/60">
                {activeCampaigns.length} Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
              {isApproved
                ? 'Create fundraising campaigns to secure donations directly from community donors.'
                : 'Account verification required before launching public donation campaigns.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isApproved ? (
            <button
              id="raise-funds-btn"
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all border-none cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Raise Funds</span>
            </button>
          ) : (
            <div
              title="Your organization must be approved by admin before raising funds."
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold border border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Funds (Verification Required)</span>
            </div>
          )}
        </div>
      </div>

      {/* Organization UPI ID Quick Settings Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/70 to-emerald-50/80 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-gray-900 dark:text-white">
                Direct UPI &amp; Dynamic QR Donations
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap">
              <span className="text-gray-500 dark:text-gray-400">Recipient UPI ID:</span>
              <code className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs">
                {orgUpiId}
              </code>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-none bg-transparent cursor-pointer p-1"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isEditingUpi ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editUpiVal}
                onChange={(e) => setEditUpiVal(e.target.value.trim())}
                placeholder="e.g. org@upi"
                className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveUpi}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none cursor-pointer transition-colors shadow-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUpi(false)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditUpiVal(orgUpiId)
                setIsEditingUpi(true)
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Update UPI ID</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Verifications Attention Banner */}
      {pendingDonations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-900 dark:text-amber-200 m-0">
                Action Required: {pendingDonations.length} Donation Payment{pendingDonations.length > 1 ? 's' : ''} Awaiting Your Verification
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 m-0 mt-0.5">
                Donors have submitted their UPI UTR reference numbers. Verify credit in your bank app and approve to unlock their tax receipt.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs border-none cursor-pointer shrink-0 transition-colors shadow-xs"
          >
            Review {pendingDonations.length} Pending
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Total Raised
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              ₹{totalRaised.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Funding Target
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              ₹{totalGoal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
              Active Campaigns
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {activeCampaigns.length} ({campaigns.length} total)
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('verifications')}
          className={`p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${
            pendingDonations.length > 0 
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs' 
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs ${
            pendingDonations.length > 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gray-400'
          }`}>
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${pendingDonations.length > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-gray-500'}`}>
              Pending Verifications
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
              <span>{pendingDonations.length}</span>
              {pendingDonations.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold uppercase animate-pulse">
                  Review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Campaigns ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'verifications'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Verify UTR Payments</span>
          {pendingDonations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {pendingDonations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verified_history')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-2 ${
            activeTab === 'verified_history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified History ({verifiedDonations.length})</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS LISTING */}
      {activeTab === 'campaigns' && (
        <>
          {campaigns.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center text-xl shadow-2xs">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                  No fundraising campaigns yet
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-1 max-w-md mx-auto">
                  {isApproved
                    ? 'Launch your first campaign today to receive contributions from donors interested in your cause.'
                    : 'Complete organization verification to start raising funds for your initiatives.'}
                </p>
              </div>
              {isApproved && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors border-none cursor-pointer"
                >
                  Launch First Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {campaigns.map((campaign) => {
                const raised = Number(campaign.raised_amount || 0)
                const goal = Number(campaign.goal_amount || 1)
                const progress = Math.min(100, Math.round((raised / goal) * 100))
                const isActive = campaign.status === 'active'

                return (
                  <div
                    key={campaign.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700'
                        : 'bg-gray-50/70 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white m-0 truncate">
                            {campaign.title}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {isActive ? '● Active' : 'Closed'}
                          </span>
                        </div>
                        <span className="inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {campaign.cause_category}
                        </span>
                      </div>

                      {isActive && (
                        <button
                          id={`close-campaign-${campaign.id}`}
                          type="button"
                          onClick={() => handleCloseCampaign(campaign.id)}
                          disabled={closingId === campaign.id}
                          title="Close this campaign"
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Archive className="w-3 h-3" />
                          <span>{closingId === campaign.id ? '...' : 'Close'}</span>
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-900 dark:text-white font-black">
                          ₹{raised.toLocaleString('en-IN')} raised
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                          {progress}% of ₹{goal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline */}
                    {campaign.deadline && (
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          Deadline:{' '}
                          {new Date(campaign.deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: PENDING PAYMENT VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="space-y-3.5">
          {pendingDonations.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center text-xl shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                All Caught Up!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0 max-w-sm mx-auto">
                No pending donation payment submissions right now. When donors transfer funds via UPI and enter their mandatory UTR number, you will verify and unlock their tax receipts here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDonations.map((donation) => {
                const isProcessing = verifyingId === donation.id
                const donorName = donation.donor_profile?.full_name || 'Community Donor'
                const donorEmail = donation.donor_profile?.email || ''
                const campaignTitle = donation.donation_requests?.title || 'Fundraising Initiative'

                return (
                  <div
                    key={donation.id}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Awaiting Bank Verification
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(donation.donated_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{Number(donation.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          contributed for <strong>{campaignTitle}</strong>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 font-bold">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          {donorName} {donorEmail && <span className="text-gray-400 font-normal">({donorEmail})</span>}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">Mandatory UTR:</span>
                          <code className="px-2.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-950 font-mono font-black text-amber-900 dark:text-amber-200 text-xs">
                            {donation.upi_txn_ref || 'N/A'}
                          </code>
                          {donation.upi_txn_ref && (
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(donation.upi_txn_ref!, donation.id)}
                              className="text-gray-400 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                              title="Copy UTR to verify in banking app"
                            >
                              {copiedUtrId === donation.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleVerify(donation.id, 'reject')}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 dark:bg-gray-700 dark:hover:bg-rose-950/60 text-gray-600 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 font-bold text-xs transition-colors border-none cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleVerify(donation.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-lg border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Verifying...' : 'Verify & Approve Payment'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFIED RECEIPTS & HISTORY */}
      {activeTab === 'verified_history' && (
        <div className="space-y-3">
          {verifiedDonations.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                No verified donation receipts yet. When you verify donor payments, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {verifiedDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                        ₹{Number(donation.amount).toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified &amp; Credited
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 m-0 text-[11px]">
                      From <strong>{donation.donor_profile?.full_name || 'Donor'}</strong> • UTR: {donation.upi_txn_ref || 'N/A'} • {new Date(donation.donated_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    Receipt #{donation.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raise Funds Modal */}
      {showModal && (
        <RaiseFundsModal
          organizationName={organizationName}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
