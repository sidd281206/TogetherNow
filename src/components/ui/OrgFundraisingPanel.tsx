'use client'

import React, { useState, useActionState, useEffect } from 'react'
import { Plus, X, Target, TrendingUp, Calendar, Heart, AlertCircle, CheckCircle2, ChevronRight, Wallet, Archive } from 'lucide-react'
import { createDonationRequestAction, closeCampaignAction } from '@/app/actions/donations'

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

interface OrgFundraisingPanelProps {
  orgStatus?: string
  organizationName?: string
  myCampaigns: Campaign[]
}

const CAUSE_CATEGORIES = [
  'Community',
  'Education',
  'Healthcare',
  'Environment',
  'Disaster Relief',
  'Animal Welfare',
]

function RaiseFundsModal({ organizationName, onClose }: { organizationName: string; onClose: () => void }) {
  const [state, action, pending] = useActionState(createDonationRequestAction, null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (state?.message) setSuccess(true)
  }, [state])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const minDeadline = new Date()
  minDeadline.setDate(minDeadline.getDate() + 7)
  const minDateStr = minDeadline.toISOString().split('T')[0]

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.22s ease' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '20px 20px 16px', position: 'relative', flexShrink: 0 }}>
          <button
            id="raise-funds-close"
            onClick={onClose}
            style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Target style={{ width: '20px', height: '20px', color: '#fff' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: 700 }}>Raise Funds for a Cause</span>
          </div>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>Create Fundraising Campaign</h3>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>{organizationName}</p>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Campaign Created!</h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{state?.message}</p>
              <button
                id="raise-funds-success-close"
                onClick={onClose}
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {state?.errors?.general && (
                <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fff1f2', color: '#be123c', fontSize: '0.8rem', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  {state.errors.general[0]}
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="campaign-title" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Campaign Title *
                </label>
                <input
                  id="campaign-title"
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Education Fund for Underprivileged Children"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: state?.errors?.title ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                {state?.errors?.title && <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#dc2626', fontWeight: 600 }}>{state.errors.title[0]}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="campaign-category" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Cause Category *
                </label>
                <select
                  id="campaign-category"
                  name="causeCategory"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  {CAUSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="campaign-desc" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Description * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(min 30 characters)</span>
                </label>
                <textarea
                  id="campaign-desc"
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe the cause, how the funds will be used, and the impact donors can expect..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: state?.errors?.description ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                {state?.errors?.description && <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#dc2626', fontWeight: 600 }}>{state.errors.description[0]}</p>}
              </div>

              {/* Goal + Deadline side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="campaign-goal" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
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
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: state?.errors?.goalAmount ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {state?.errors?.goalAmount && <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#dc2626', fontWeight: 600 }}>{state.errors.goalAmount[0]}</p>}
                </div>
                <div>
                  <label htmlFor="campaign-deadline" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Campaign Deadline *
                  </label>
                  <input
                    id="campaign-deadline"
                    name="deadline"
                    type="date"
                    required
                    min={minDateStr}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: state?.errors?.deadline ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {state?.errors?.deadline && <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#dc2626', fontWeight: 600 }}>{state.errors.deadline[0]}</p>}
                </div>
              </div>

              {/* Image URL (optional) */}
              <div>
                <label htmlFor="campaign-image" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Campaign Image URL <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
                </label>
                <input
                  id="campaign-image"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#94a3b8' }}>Paste a publicly accessible image URL to display on your campaign card.</p>
              </div>

              <button
                id="raise-funds-submit"
                type="submit"
                disabled={pending}
                style={{ padding: '12px', borderRadius: '12px', background: pending ? '#e2e8f0' : 'linear-gradient(135deg, #059669, #047857)', color: pending ? '#94a3b8' : '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: pending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}
              >
                <Target style={{ width: '16px', height: '16px' }} />
                {pending ? 'Creating Campaign...' : 'Launch Campaign'}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}

export default function OrgFundraisingPanel({
  orgStatus,
  organizationName = 'Your Organization',
  myCampaigns,
}: OrgFundraisingPanelProps) {
  const [showModal, setShowModal] = useState(false)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>(myCampaigns)

  const isApproved = orgStatus === 'approved'
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0)

  const handleCloseCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to close this campaign? It will no longer be visible to donors.')) return
    setClosingId(id)
    const res = await closeCampaignAction(id)
    if (res.success) {
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'closed' } : c))
    }
    setClosingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart style={{ width: '18px', height: '18px', color: '#dc2626' }} />
            My Fundraising Campaigns
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            {isApproved ? 'Raise funds from donors across the platform.' : 'Verify your organization to start raising funds.'}
          </p>
        </div>
        {isApproved ? (
          <button
            id="raise-funds-btn"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', fontSize: '0.82rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            Raise Funds
          </button>
        ) : (
          <div
            title="Your organization must be verified before raising funds."
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, cursor: 'not-allowed', border: '1px dashed #cbd5e1' }}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            Raise Funds (Verification Required)
          </div>
        )}
      </div>

      {/* Total raised stat */}
      {campaigns.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px', backgroundColor: '#fff', border: '1px solid #d1fae5', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#065f46', fontWeight: 700 }}>Total Raised</p>
              <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>₹{totalRaised.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div style={{ flex: '1 1 160px', backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#92400e', fontWeight: 700 }}>Total Campaigns</p>
              <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{campaigns.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns list */}
      {campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <h3 style={{ margin: '0 0 6px', fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>No campaigns yet</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
            {isApproved ? 'Click "Raise Funds" to launch your first fundraising campaign.' : 'Complete organization verification to start raising funds.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {campaigns.map(campaign => {
            const progress = Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
            const isActive = campaign.status === 'active'
            return (
              <div
                key={campaign.id}
                style={{ backgroundColor: '#fff', borderRadius: '14px', border: `1px solid ${isActive ? '#e2e8f0' : '#f1f5f9'}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: isActive ? 1 : 0.65 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{campaign.title}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px',
                        backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                        color: isActive ? '#166534' : '#64748b',
                      }}>
                        {campaign.status === 'active' ? '● Active' : campaign.status === 'closed' ? 'Closed' : 'Completed'}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{campaign.cause_category}</p>
                  </div>
                  {isActive && (
                    <button
                      id={`close-campaign-${campaign.id}`}
                      onClick={() => handleCloseCampaign(campaign.id)}
                      disabled={closingId === campaign.id}
                      title="Close this campaign"
                      style={{ flexShrink: 0, padding: '5px 10px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#be123c', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #fecdd3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Archive style={{ width: '12px', height: '12px' }} />
                      {closingId === campaign.id ? '...' : 'Close'}
                    </button>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>₹{Number(campaign.raised_amount).toLocaleString('en-IN')} raised</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{progress}% of ₹{Number(campaign.goal_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '999px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #f59e0b, #10b981)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {campaign.deadline && (
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '11px', height: '11px' }} />
                    Deadline: {new Date(campaign.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            )
          })}
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
