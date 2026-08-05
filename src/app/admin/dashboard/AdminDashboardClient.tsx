'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  Users, 
  Search,
  Check,
  X,
  LogOut
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { approveOrganizationAction, rejectOrganizationAction, approveDonorAction, rejectDonorAction } from '@/app/actions/admin'

export interface PendingOrg {
  id: string
  name: string
  email: string
  website: string
  verificationDocumentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export interface PendingDonor {
  id: string
  name: string
  email: string
  taxId: string
  donorType: 'Corporate' | 'Individual' | 'Foundation'
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

const INITIAL_ORGS: PendingOrg[] = [
  {
    id: 'org-101',
    name: 'Green Canopy Foundation',
    email: 'contact@greencanopy.org',
    website: 'https://greencanopy.org',
    verificationDocumentUrl: 'https://togethernow.org/docs/verify-greencanopy.pdf',
    status: 'pending',
    submittedAt: 'Today, 14:30',
  },
  {
    id: 'org-102',
    name: 'Nourish Hope Relief Network',
    email: 'info@nourishhope.org',
    website: 'https://nourishhope.org',
    verificationDocumentUrl: 'https://togethernow.org/docs/verify-nourishhope.pdf',
    status: 'pending',
    submittedAt: 'Yesterday, 09:15',
  },
  {
    id: 'org-103',
    name: 'Ocean & Earth Care Alliance',
    email: 'admin@oceanearthcare.org',
    website: 'https://oceanearthcare.org',
    verificationDocumentUrl: 'https://togethernow.org/docs/verify-oceanearth.pdf',
    status: 'approved',
    submittedAt: '3 days ago',
  },
]

const INITIAL_DONORS: PendingDonor[] = [
  {
    id: 'dn-201',
    name: 'Apex Global Tech Philanthropy',
    email: 'grants@apexglobal.com',
    taxId: 'EIN-849204920',
    donorType: 'Corporate',
    status: 'pending',
    submittedAt: 'Today, 11:20',
  },
  {
    id: 'dn-202',
    name: 'Eleanor Vance Family Trust',
    email: 'evance@trust.org',
    taxId: 'EIN-910293019',
    donorType: 'Foundation',
    status: 'approved',
    submittedAt: '5 days ago',
  },
]

export default function AdminDashboardClient() {
  const [orgs, setOrgs] = useState<PendingOrg[]>(INITIAL_ORGS)
  const [donors, setDonors] = useState<PendingDonor[]>(INITIAL_DONORS)
  const [activeTab, setActiveTab] = useState<'pending-orgs' | 'pending-donors' | 'approved-all'>('pending-orgs')
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Approve Organization
  const handleApproveOrg = async (id: string, name: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'approved' } : o)))
    await approveOrganizationAction(id)
    setActionNotice(`Approved organization: "${name}" successfully.`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Reject Organization
  const handleRejectOrg = async (id: string, name: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)))
    await rejectOrganizationAction(id)
    setActionNotice(`Rejected organization: "${name}".`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Approve Donor
  const handleApproveDonor = async (id: string, name: string) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)))
    await approveDonorAction(id)
    setActionNotice(`Approved donor account: "${name}".`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Reject Donor
  const handleRejectDonor = async (id: string, name: string) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d)))
    await rejectDonorAction(id)
    setActionNotice(`Rejected donor account: "${name}".`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  const pendingOrgsList = orgs.filter((o) => o.status === 'pending')
  const pendingDonorsList = donors.filter((d) => d.status === 'pending')
  const approvedOrgsList = orgs.filter((o) => o.status === 'approved')
  const approvedDonorsList = donors.filter((d) => d.status === 'approved')

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div>
            <div className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              TogetherNow <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ADMIN PORTAL</span>
            </div>
            <div className="text-[11px] text-slate-400">Platform Security & Verification Control Center</div>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-decoration-none"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Action Notice Alert Banner */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-emerald-400 hover:text-white border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Metrics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Orgs</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{pendingOrgsList.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Donors</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{pendingDonorsList.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Approved Orgs</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{approvedOrgsList.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Approved Donors</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{approvedDonorsList.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('pending-orgs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending-orgs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pending Organizations ({pendingOrgsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending-donors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending-donors'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Pending Donors ({pendingDonorsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approved-all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeTab === 'approved-all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved Accounts ({approvedOrgsList.length + approvedDonorsList.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Organizations */}
        {activeTab === 'pending-orgs' && (
          <div className="space-y-4">
            {pendingOrgsList.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white m-0">No pending organizations</h4>
                <p className="text-xs text-slate-400 m-0">All submitted organization verification requests have been processed.</p>
              </div>
            ) : (
              pendingOrgsList.map((org) => (
                <div
                  key={org.id}
                  className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white m-0">{org.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        PENDING VERIFICATION
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Contact Email: <span className="text-slate-200 font-mono">{org.email}</span></div>
                      <div>
                        Website:{' '}
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-decoration-none"
                        >
                          {org.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div>
                        Verification Document:{' '}
                        <a
                          href={org.verificationDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-decoration-none"
                        >
                          View Document PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRejectOrg(org.id, org.name)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors border border-slate-700 hover:border-rose-800 cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveOrg(org.id, org.name)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Organization</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Pending Donors */}
        {activeTab === 'pending-donors' && (
          <div className="space-y-4">
            {pendingDonorsList.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white m-0">No pending donors</h4>
                <p className="text-xs text-slate-400 m-0">All donor accounts are reviewed and verified.</p>
              </div>
            ) : (
              pendingDonorsList.map((donor) => (
                <div
                  key={donor.id}
                  className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white m-0">{donor.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {donor.donorType.toUpperCase()} DONOR
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Contact Email: <span className="text-slate-200 font-mono">{donor.email}</span></div>
                      <div>Tax Identification ID: <span className="text-slate-200 font-mono">{donor.taxId}</span></div>
                      <div>Submitted: {donor.submittedAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRejectDonor(donor.id, donor.name)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors border border-slate-700 hover:border-rose-800 cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveDonor(donor.id, donor.name)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Donor</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Approved Accounts List */}
        {activeTab === 'approved-all' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-300 m-0">Approved Organizations ({approvedOrgsList.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedOrgsList.map((org) => (
                <div key={org.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{org.name}</div>
                    <div className="text-xs text-slate-400">{org.email}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-bold text-slate-300 m-0 pt-4">Approved Donors ({approvedDonorsList.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedDonorsList.map((donor) => (
                <div key={donor.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{donor.name}</div>
                    <div className="text-xs text-slate-400">{donor.email} • {donor.taxId}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Donor
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
