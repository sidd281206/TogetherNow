'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  LogOut,
  Sparkles,
  FileText,
  Mail,
  Globe,
  RotateCcw
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { approveOrganizationAction, rejectOrganizationAction, approveDonorAction, rejectDonorAction } from '@/app/actions/admin'

export interface PendingOrg {
  id: string
  name: string
  email: string
  website: string
  registrationNumber?: string
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
    registrationNumber: 'NGO-84920-IND',
    verificationDocumentUrl: 'https://togethernow.org/docs/verify-greencanopy.pdf',
    status: 'pending',
    submittedAt: 'Today, 14:30',
  },
  {
    id: 'org-102',
    name: 'Nourish Hope Relief Network',
    email: 'info@nourishhope.org',
    website: 'https://nourishhope.org',
    registrationNumber: '80G/12A-77382',
    verificationDocumentUrl: 'https://togethernow.org/docs/verify-nourishhope.pdf',
    status: 'pending',
    submittedAt: 'Yesterday, 09:15',
  },
  {
    id: 'org-103',
    name: 'Ocean & Earth Care Alliance',
    email: 'admin@oceanearthcare.org',
    website: 'https://oceanearthcare.org',
    registrationNumber: 'NGO-10928-GLO',
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

interface AdminDashboardClientProps {
  initialDbOrganizations?: PendingOrg[]
  initialDbDonors?: PendingDonor[]
}

export default function AdminDashboardClient({ 
  initialDbOrganizations = [],
  initialDbDonors = [] 
}: AdminDashboardClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [orgs, setOrgs] = useState<PendingOrg[]>(() => {
    if (initialDbOrganizations.length === 0) return INITIAL_ORGS
    const existingIds = new Set(initialDbOrganizations.map((o) => o.id))
    const fallbackFiltered = INITIAL_ORGS.filter((o) => !existingIds.has(o.id))
    return [...initialDbOrganizations, ...fallbackFiltered]
  })

  const [donors, setDonors] = useState<PendingDonor[]>(() => {
    if (initialDbDonors.length === 0) return INITIAL_DONORS
    const existingIds = new Set(initialDbDonors.map((d) => d.id))
    const fallbackFiltered = INITIAL_DONORS.filter((d) => !existingIds.has(d.id))
    return [...initialDbDonors, ...fallbackFiltered]
  })

  // Sync state if server revalidates props
  useEffect(() => {
    if (initialDbOrganizations && initialDbOrganizations.length > 0) {
      const existingIds = new Set(initialDbOrganizations.map((o) => o.id))
      const fallbackFiltered = INITIAL_ORGS.filter((o) => !existingIds.has(o.id))
      setOrgs([...initialDbOrganizations, ...fallbackFiltered])
    }
  }, [initialDbOrganizations])

  useEffect(() => {
    if (initialDbDonors && initialDbDonors.length > 0) {
      const existingIds = new Set(initialDbDonors.map((d) => d.id))
      const fallbackFiltered = INITIAL_DONORS.filter((d) => !existingIds.has(d.id))
      setDonors([...initialDbDonors, ...fallbackFiltered])
    }
  }, [initialDbDonors])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  const [activeTab, setActiveTab] = useState<'pending-orgs' | 'pending-donors' | 'approved-all'>('pending-orgs')
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Approve Organization
  const handleApproveOrg = async (id: string, name: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'approved' } : o)))
    await approveOrganizationAction(id)
    setActionNotice(`Approved organization: "${name}" successfully. Opportunity creation access is now enabled.`)
    setTimeout(() => setActionNotice(null), 4500)
  }

  // Reject Organization
  const handleRejectOrg = async (id: string, name: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)))
    await rejectOrganizationAction(id)
    setActionNotice(`Rejected organization verification: "${name}".`)
    setTimeout(() => setActionNotice(null), 4500)
  }

  // Approve Donor
  const handleApproveDonor = async (id: string, name: string) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)))
    await approveDonorAction(id)
    setActionNotice(`Approved donor account: "${name}".`)
    setTimeout(() => setActionNotice(null), 4500)
  }

  // Reject Donor
  const handleRejectDonor = async (id: string, name: string) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d)))
    await rejectDonorAction(id)
    setActionNotice(`Rejected donor account: "${name}".`)
    setTimeout(() => setActionNotice(null), 4500)
  }

  const pendingOrgsList = orgs.filter((o) => o.status === 'pending')
  const pendingDonorsList = donors.filter((d) => d.status === 'pending')
  const approvedOrgsList = orgs.filter((o) => o.status === 'approved')
  const approvedDonorsList = donors.filter((d) => d.status === 'approved')

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex flex-col pb-16">
      
      {/* ── Top Header / Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight">
                  TogetherNow
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-black border border-emerald-200 dark:border-emerald-800">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                Platform Security &amp; Verification Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh verification requests from database"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-colors text-decoration-none"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span>Exit Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-extrabold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Verification Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Administrator Control Center 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 m-0 leading-relaxed font-medium">
              Review submitted accreditation documents, approve organizations to unlock opportunity creation, and verify accredited donor accounts across TogetherNow.
            </p>
          </div>
        </div>

        {/* Action Notice Alert Banner */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 border-none bg-transparent cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Metrics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pending Orgs</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingOrgsList.length}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pending Donors</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingDonorsList.length}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Approved Orgs</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedOrgsList.length}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Approved Donors</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedDonorsList.length}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('pending-orgs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === 'pending-orgs'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Pending Organizations ({pendingOrgsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending-donors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === 'pending-donors'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Pending Donors ({pendingDonorsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approved-all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === 'approved-all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
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
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 m-0">No pending organizations</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">All submitted organization verification requests have been processed.</p>
                </div>
              ) : (
                pendingOrgsList.map((org) => (
                  <div
                    key={org.id}
                    className="bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:bg-white dark:hover:bg-gray-800/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-black text-gray-900 dark:text-white m-0">{org.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          PENDING VERIFICATION
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pt-1">
                        <div>Registration Number: <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{org.registrationNumber || 'NGO-PENDING'}</span></div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>Contact Email: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{org.email}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span>Website: </span>
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            {org.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Document: </span>
                          <a
                            href={`/api/document?url=${encodeURIComponent(org.verificationDocumentUrl)}&orgId=${org.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold"
                          >
                            <span>View Attached Verification PDF / Document</span> <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRejectOrg(org.id, org.name)}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveOrg(org.id, org.name)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-1.5"
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
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 m-0">No pending donors</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">All donor accounts are reviewed and verified.</p>
                </div>
              ) : (
                pendingDonorsList.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:bg-white dark:hover:bg-gray-800/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-black text-gray-900 dark:text-white m-0">{donor.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          {donor.donorType.toUpperCase()} DONOR
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>Contact Email: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{donor.email}</span></span>
                        </div>
                        <div>Tax Identification ID: <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{donor.taxId}</span></div>
                        <div className="text-gray-400">Submitted: {donor.submittedAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRejectDonor(donor.id, donor.name)}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveDonor(donor.id, donor.name)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-1.5"
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
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved Organizations ({approvedOrgsList.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedOrgsList.map((org) => (
                    <div key={org.id} className="bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.email}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white m-0 mb-3 flex items-center gap-2 pt-2">
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  <span>Approved Donors ({approvedDonorsList.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedDonorsList.map((donor) => (
                    <div key={donor.id} className="bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">{donor.name}</div>
                        <div className="text-xs text-gray-500">{donor.email} • {donor.taxId}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Verified Donor
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  )
}
