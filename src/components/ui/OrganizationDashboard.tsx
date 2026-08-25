'use client'

import React, { useState, useEffect } from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef, Opportunity, Applicant } from '@/components/ui/OpportunitiesFeed'
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  ShieldCheck, 
  XCircle, 
  ChevronRight, 
  Eye, 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  UserCheck, 
  Search, 
  Filter, 
  ExternalLink, 
  Navigation, 
  Check, 
  X, 
  Building2, 
  Mail, 
  Clock3, 
  Award,
  Plus,
  Ban,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit3
} from 'lucide-react'
import ResubmitApplicationButton from '@/components/ui/ResubmitApplicationButton'
import { updateApplicantStatusAction, cancelOpportunityAction, updateOpportunityContactAction } from '@/app/actions/opportunities'
import { pushNotification } from '@/lib/notifications'

interface OrganizationDashboardProps {
  opportunitiesRef?: React.RefObject<OpportunitiesFeedRef | null>
  userId?: string
  userEmail?: string
  orgStatus?: string
  organizationName?: string
}

const STORAGE_KEY = 'togethernow_posted_opportunities'
const APPLICANTS_STORAGE_KEY = 'togethernow_event_applicants_v1'

const DEFAULT_DRIVES: Opportunity[] = [
  {
    id: '1',
    title: 'Community Beach & Park Cleanup',
    organization: 'Ocean & Earth Care Alliance',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Environment',
    location: 'Coastal Park, Marine Drive',
    address: 'Gate 2 Promenade, Marine Drive Coastal Stretch, Mumbai 400020',
    managerName: 'Arjun Nambiar',
    managerPhone: '+91 98201 44521',
    isRemote: false,
    date: 'Sat, Aug 15, 2026',
    time: '08:00 AM - 12:00 PM',
    spotsLeft: 8,
    totalRequired: 20,
    alreadyRegistered: 12,
    skillsNeeded: ['Teamwork', 'Physical Activity', 'Eco Awareness'],
    description: 'Join us for a morning cleanup drive to protect local marine wildlife and keep our coastal parks pristine.',
  },
  {
    id: '2',
    title: 'Youth Coding & Robotics Workshop Mentor',
    organization: 'FutureTech Foundation',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Education',
    location: 'Downtown Public Library / Hybrid',
    address: '2nd Floor Innovation Hall, Downtown Public Library, Fort, Mumbai 400001',
    managerName: 'Pooja Kulkarni',
    managerPhone: '+91 98765 12345',
    isRemote: false,
    date: 'Sun, Aug 16, 2026',
    time: '10:00 AM - 02:00 PM',
    spotsLeft: 4,
    totalRequired: 10,
    alreadyRegistered: 6,
    skillsNeeded: ['Python / JS', 'Mentorship', 'Patience'],
    description: 'Help middle school students build their first interactive coding project. No prior teaching experience required!',
  },
  {
    id: '3',
    title: 'Virtual Community Meal Drive Coordinator',
    organization: 'Nourish Hope Network',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Community',
    location: 'Remote',
    address: 'Online / Zoom Operations Hub',
    managerName: 'Farhan Akhtar',
    managerPhone: '+91 98111 99887',
    isRemote: true,
    date: 'Sat, Aug 22, 2026',
    time: '02:00 PM - 06:00 PM',
    spotsLeft: 12,
    totalRequired: 15,
    alreadyRegistered: 3,
    skillsNeeded: ['Logistics', 'Communication', 'Social Media'],
    description: 'Coordinate surplus food donations from local restaurants and match them with food pantries in real time.',
  },
  {
    id: '4',
    title: 'Senior Citizen Digital Literacy Assistant',
    organization: 'Silver Connect',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Tech',
    location: 'Community Wellness Center',
    address: 'Room 104, Community Wellness Center, Shivaji Park, Dadar, Mumbai 400028',
    managerName: 'Meera Deshmukh',
    managerPhone: '+91 99887 22334',
    isRemote: false,
    date: 'Wed, Aug 19, 2026',
    time: '02:00 PM - 04:30 PM',
    spotsLeft: 6,
    totalRequired: 10,
    alreadyRegistered: 4,
    skillsNeeded: ['Smartphone Basics', 'Patience', 'Friendly Manner'],
    description: 'Teach seniors how to make video calls, navigate health apps, and stay safe online.',
  },
  {
    id: '5',
    title: 'Urban Tree Planting & Reforestation Drive',
    organization: 'Green Canopy Initiative',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Environment',
    location: 'Northside Botanical Park',
    address: 'Main Entrance Green House Nursery, Northside Botanical Park, Mumbai 400078',
    managerName: 'Vikram Sethi',
    managerPhone: '+91 98222 33445',
    isRemote: false,
    date: 'Sat, Aug 22, 2026',
    time: '07:30 AM - 11:30 AM',
    spotsLeft: 15,
    totalRequired: 30,
    alreadyRegistered: 15,
    skillsNeeded: ['Gardening', 'Outdoors', 'Teamwork'],
    description: 'Help plant over 200 native tree saplings to increase urban shade and fight local heat islands.',
  },
]

function getGoogleMapsUrl(addressOrLocation: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrLocation)}`
}

export default function OrganizationDashboard({ opportunitiesRef, userId, userEmail, orgStatus, organizationName }: OrganizationDashboardProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(DEFAULT_DRIVES)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  
  // All Drives View Modal
  const [showAllDrivesModal, setShowAllDrivesModal] = useState(false)
  const [driveBucketTab, setDriveBucketTab] = useState<'active' | 'cancelled'>('active')
  const [driveSearchQuery, setDriveSearchQuery] = useState('')
  const [driveCategoryFilter, setDriveCategoryFilter] = useState('All')
  
  // Selected Drive Detailed Candidate & Venue Inspection Modal
  const [inspectingDrive, setInspectingDrive] = useState<Opportunity | null>(null)
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'accepted' | 'pending' | 'declined'>('all')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

  // Cancel Event Confirmation Modal inside Dashboard
  const [cancellingDrive, setCancellingDrive] = useState<Opportunity | null>(null)
  const [cancelReasonInput, setCancelReasonInput] = useState('')

  // Edit Event Contact & In-Charge Modal
  const [editingContactDrive, setEditingContactDrive] = useState<Opportunity | null>(null)
  const [editManagerName, setEditManagerName] = useState('')
  const [editManagerPhone, setEditManagerPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [isSavingContact, setIsSavingContact] = useState(false)

  const handleOpenEditContact = (drive: Opportunity) => {
    setEditingContactDrive(drive)
    setEditManagerName(drive.managerName || '')
    setEditManagerPhone(drive.managerPhone || '')
    setEditAddress(drive.address || drive.location || '')
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContactDrive) return

    setIsSavingContact(true)
    const updatedManagerName = editManagerName.trim() || organizationName || 'Event Coordinator'
    const updatedManagerPhone = editManagerPhone.trim()
    const updatedAddress = editAddress.trim() || editingContactDrive.address || editingContactDrive.location

    setOpportunities((prev) => {
      const updated = prev.map((op) => {
        if (op.id === editingContactDrive.id) {
          return {
            ...op,
            managerName: updatedManagerName,
            managerPhone: updatedManagerPhone,
            address: updatedAddress,
          }
        }
        return op
      })

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
      } catch {}

      return updated
    })

    if (inspectingDrive && inspectingDrive.id === editingContactDrive.id) {
      setInspectingDrive((prev) =>
        prev
          ? {
              ...prev,
              managerName: updatedManagerName,
              managerPhone: updatedManagerPhone,
              address: updatedAddress,
            }
          : null
      )
    }

    try {
      await updateOpportunityContactAction({
        eventId: editingContactDrive.id,
        managerName: updatedManagerName,
        managerPhone: updatedManagerPhone,
        address: updatedAddress,
      })
    } catch (err) {
      console.warn('Notice saving contact update to backend:', err)
    }

    setIsSavingContact(false)
    setEditingContactDrive(null)
  }

  const loadData = () => {
    try {
      const savedOps = localStorage.getItem(STORAGE_KEY)
      if (savedOps) {
        const parsed: Opportunity[] = JSON.parse(savedOps)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Opportunity>()
          parsed.forEach((op) => map.set(op.id, op))
          DEFAULT_DRIVES.forEach((d) => {
            if (!map.has(d.id)) map.set(d.id, d)
          })
          setOpportunities(Array.from(map.values()))
        }
      }

      const savedApps = localStorage.getItem(APPLICANTS_STORAGE_KEY)
      if (savedApps) {
        const parsedApps: Applicant[] = JSON.parse(savedApps)
        if (Array.isArray(parsedApps)) {
          setApplicants(parsedApps)
        }
      }
    } catch (e) {
      console.warn('Error loading organization dashboard data:', e)
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('togethernow_opportunities_updated', loadData)
    window.addEventListener('togethernow_new_notification', loadData)
    window.addEventListener('storage', loadData)
    return () => {
      window.removeEventListener('togethernow_opportunities_updated', loadData)
      window.removeEventListener('togethernow_new_notification', loadData)
      window.removeEventListener('storage', loadData)
    }
  }, [])

  const activeDrives = opportunities.filter((op) => !op.isCancelled)
  const cancelledDrives = opportunities.filter((op) => op.isCancelled)

  const totalDrives = activeDrives.length
  const totalVolunteersRegistered = activeDrives.reduce(
    (acc, op) => acc + (op.alreadyRegistered ?? 0),
    0
  )
  const totalCommunityHours = totalVolunteersRegistered * 4

  // Filter drives in the "All Drives" modal
  const currentBucketDrives = driveBucketTab === 'active' ? activeDrives : cancelledDrives

  const filteredDrives = currentBucketDrives.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(driveSearchQuery.toLowerCase()) ||
      op.organization.toLowerCase().includes(driveSearchQuery.toLowerCase()) ||
      (op.address && op.address.toLowerCase().includes(driveSearchQuery.toLowerCase())) ||
      (op.managerName && op.managerName.toLowerCase().includes(driveSearchQuery.toLowerCase()))
    
    const matchesCategory =
      driveCategoryFilter === 'All'
        ? true
        : driveCategoryFilter === 'Remote'
        ? op.isRemote
        : op.category === driveCategoryFilter

    return matchesSearch && matchesCategory
  })

  // Candidates for the currently inspected drive (strictly matching eventId)
  const driveCandidates = inspectingDrive
    ? applicants.filter((a) => a.eventId === inspectingDrive.id)
    : []

  const filteredDriveCandidates = driveCandidates.filter((cand) => {
    const matchesStatus =
      candidateFilter === 'all'
        ? true
        : cand.status === candidateFilter

    const matchesSearch =
      !candidateSearch.trim() ||
      cand.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      cand.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (cand.phone && cand.phone.toLowerCase().includes(candidateSearch.toLowerCase())) ||
      cand.skills.some((s) => s.toLowerCase().includes(candidateSearch.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  const acceptedCandidatesCount = driveCandidates.filter((c) => c.status === 'accepted').length
  const pendingCandidatesCount = driveCandidates.filter((c) => c.status === 'pending').length
  const declinedCandidatesCount = driveCandidates.filter((c) => c.status === 'declined').length

  const handleCandidateStatus = (candidateId: string, status: 'accepted' | 'declined') => {
    if (!inspectingDrive) return
    const ev = inspectingDrive

    let updatedCand: Applicant | undefined
    let prevStatus: string | undefined

    setApplicants((prev) => {
      const updated = prev.map((a) => {
        if (a.id === candidateId) {
          prevStatus = a.status
          updatedCand = { ...a, status }
          return updatedCand
        }
        return a
      })
      try {
        localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })

    setOpportunities((prev) => {
      const updated = prev.map((o) => {
        if (o.id === ev.id) {
          const currentReg = o.alreadyRegistered ?? 0
          const totalReq = o.totalRequired ?? (o.spotsLeft + currentReg)
          let newReg = currentReg
          if (status === 'accepted' && prevStatus !== 'accepted') {
            newReg = currentReg + 1
          } else if (status === 'declined' && prevStatus === 'accepted') {
            newReg = Math.max(0, currentReg - 1)
          }
          const newSpots = Math.max(0, totalReq - newReg)
          return { ...o, alreadyRegistered: newReg, spotsLeft: newSpots }
        }
        return o
      })
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
      } catch {}
      return updated
    })

    setInspectingDrive((prev) => {
      if (!prev) return prev
      const currentReg = prev.alreadyRegistered ?? 0
      const totalReq = prev.totalRequired ?? (prev.spotsLeft + currentReg)
      let newReg = currentReg
      if (status === 'accepted' && prevStatus !== 'accepted') {
        newReg = currentReg + 1
      } else if (status === 'declined' && prevStatus === 'accepted') {
        newReg = Math.max(0, currentReg - 1)
      }
      return { ...prev, alreadyRegistered: newReg, spotsLeft: Math.max(0, totalReq - newReg) }
    })

    if (status === 'accepted') {
      pushNotification({
        targetRole: 'volunteer',
        type: 'approval',
        eventId: ev.id,
        eventTitle: ev.title,
        applicantName: updatedCand?.name,
        title: '🎉 Application Approved!',
        message: `Congratulations! ${ev.organization} approved your spot for "${ev.title}". In-Charge: ${ev.managerName || 'Coordinator'} (${ev.managerPhone || 'on dashboard'}).`,
      })
    }

    updateApplicantStatusAction({
      applicantId: candidateId,
      eventId: ev.id,
      status,
      volunteerId: updatedCand?.volunteerId,
    }).catch((err) => console.warn('Notice saving applicant status:', err))
  }

  const toggleAttendance = (candidateId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }))
  }

  // Cancel Event
  const handleConfirmCancelDrive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingDrive) return

    const reason = cancelReasonInput.trim() || 'Schedule conflict / Organizer adjustment'
    const evId = cancellingDrive.id
    const evTitle = cancellingDrive.title

    setOpportunities((prev) => {
      const updated = prev.map((op) =>
        op.id === evId
          ? { ...op, isCancelled: true, cancelledAt: new Date().toISOString(), cancelReason: reason }
          : op
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
      } catch {}
      return updated
    })

    const enrolled = applicants.filter((a) => a.eventId === evId)
    enrolled.forEach((app) => {
      pushNotification({
        targetRole: 'volunteer',
        type: 'declined',
        eventId: evId,
        eventTitle: evTitle,
        title: '🚫 Event Cancelled',
        message: `Notice: "${evTitle}" has been cancelled by ${cancellingDrive.organization}. Reason: ${reason}`,
      })
    })

    pushNotification({
      targetRole: 'organization',
      type: 'declined',
      eventId: evId,
      eventTitle: evTitle,
      title: 'Event Moved to Cancelled Bucket',
      message: `"${evTitle}" has been moved to your Cancelled Events Bucket.`,
    })

    cancelOpportunityAction({ eventId: evId, reason }).catch((err) =>
      console.warn('Notice cancelling drive in DB:', err)
    )

    if (inspectingDrive?.id === evId) {
      setInspectingDrive((prev) =>
        prev ? { ...prev, isCancelled: true, cancelledAt: new Date().toISOString(), cancelReason: reason } : null
      )
    }

    setCancellingDrive(null)
    setCancelReasonInput('')
  }

  // Restore Event
  const handleRestoreDrive = (eventId: string) => {
    setOpportunities((prev) => {
      const updated = prev.map((op) =>
        op.id === eventId
          ? { ...op, isCancelled: false, cancelledAt: undefined, cancelReason: undefined }
          : op
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
      } catch {}
      return updated
    })

    pushNotification({
      targetRole: 'organization',
      type: 'approval',
      eventId,
      title: 'Event Restored',
      message: `Event has been restored from your Cancelled Events Bucket.`,
    })

    if (inspectingDrive?.id === eventId) {
      setInspectingDrive((prev) =>
        prev ? { ...prev, isCancelled: false, cancelledAt: undefined, cancelReason: undefined } : null
      )
    }
  }

  return (
    <div className="space-y-8">
      {/* Organization Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* TOTAL DRIVES CARD (WITH "SEE MORE" OPTION) */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                  {totalDrives} Drives
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Active Drives Created
                </div>
              </div>
            </div>

            {cancelledDrives.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                {cancelledDrives.length} in Bucket
              </span>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">View history & cancelled bucket</span>
            <button
              type="button"
              onClick={() => {
                setDriveBucketTab('active')
                setShowAllDrivesModal(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-950/80 text-emerald-700 hover:text-white dark:text-emerald-300 font-bold text-xs transition-all border border-emerald-200 dark:border-emerald-800/60 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>See More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* VOLUNTEERS REGISTERED CARD */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center font-bold text-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {totalVolunteersRegistered}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Volunteers Registered
            </div>
          </div>
        </div>

        {/* COMMUNITY IMPACT HOURS CARD */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {totalCommunityHours} hrs
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total Community Impact
            </div>
          </div>
        </div>
      </div>

      {/* Organization Verification Control Bar (Verified Orgs) */}
      {userId && orgStatus === 'approved' && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <span>Organization Status: Verified</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 m-0">
                Your organization is fully verified by platform administrators. Opportunity posting access is unlocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {userId && orgStatus === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Verification Application Rejected — Action Required</span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 m-0">
            Your verification document was rejected. Please review your NGO registration number and upload an updated PDF document to re-submit.
          </p>
          <ResubmitApplicationButton userId={userId} orgStatus={orgStatus} />
        </div>
      )}

      {/* Main Opportunities Feed for Organization */}
      <OpportunitiesFeed
        ref={opportunitiesRef}
        userRole="organization"
        organizationName={organizationName}
        userId={userId}
        userEmail={userEmail}
      />

      {/* ============================================================ */}
      {/* ALL DRIVES CREATED & CANCELLED EVENTS BUCKET MODAL */}
      {/* ============================================================ */}
      {showAllDrivesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col">
            
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white m-0">
                    Organization Drives Management
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 m-0">
                  Switch between Active Drives and Cancelled Events Bucket to inspect candidates, mark attendance, or restore drives.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAllDrivesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bucket Switcher Tabs */}
            <div className="flex items-center justify-between gap-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDriveBucketTab('active')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    driveBucketTab === 'active'
                      ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Active Drives ({activeDrives.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDriveBucketTab('cancelled')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    driveBucketTab === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancelled Events Bucket ({cancelledDrives.length})</span>
                </button>
              </div>

              <div className="relative shrink-0 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={driveSearchQuery}
                  onChange={(e) => setDriveSearchQuery(e.target.value)}
                  placeholder="Search title, manager..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Drives List Grid */}
            <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3.5 max-h-[54vh]">
              {filteredDrives.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  {driveBucketTab === 'active' ? (
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  ) : (
                    <Ban className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-60" />
                  )}
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 m-0">
                    {driveBucketTab === 'active' ? 'No active drives found' : 'Cancelled Events Bucket is empty'}
                  </p>
                  <p className="text-xs text-gray-400 m-0 mt-1">
                    {driveBucketTab === 'active'
                      ? 'Create a new opportunity or adjust your search filter.'
                      : 'Events you cancel will appear here and can be restored anytime.'}
                  </p>
                </div>
              ) : (
                filteredDrives.map((drive) => {
                  const evCandidates = applicants.filter((a) => a.eventId === drive.id)
                  const evAccepted = evCandidates.filter((a) => a.status === 'accepted').length
                  const evPending = evCandidates.filter((a) => a.status === 'pending').length
                  const totalReq = drive.totalRequired ?? (drive.spotsLeft + (drive.alreadyRegistered ?? 0))
                  const percentFilled = Math.min(100, Math.round(((drive.alreadyRegistered ?? 0) / Math.max(1, totalReq)) * 100))

                  return (
                    <div
                      key={drive.id}
                      onClick={() => setInspectingDrive(drive)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                        drive.isCancelled
                          ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-400'
                          : 'border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/70 hover:border-emerald-500 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {drive.category}
                          </span>
                          {drive.isCancelled && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" />
                              <span>Cancelled Event</span>
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {drive.date} • {drive.time}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0 group-hover:text-emerald-600 transition-colors">
                          {drive.title}
                        </h4>

                        {drive.isCancelled && drive.cancelReason && (
                          <div className="p-2 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span><strong>Reason:</strong> {drive.cancelReason}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">In-Charge: <strong>{drive.managerName || 'Coordinator'}</strong> ({drive.managerPhone || 'N/A'})</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{drive.address || drive.location}</span>
                          </div>
                        </div>

                        {!drive.isCancelled && (
                          <div className="pt-1 max-w-md">
                            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                {drive.alreadyRegistered ?? 0} / {totalReq} Registered
                              </span>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                {drive.spotsLeft} spots left
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700/60 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{evAccepted} Present / Approved</span>
                          </span>
                          {evPending > 0 && (
                            <span className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                              {evPending} New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditContact(drive)
                            }}
                            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-indigo-600 text-gray-700 hover:text-white dark:bg-gray-800 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-gray-700 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            title="Edit In-Charge and Venue Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Contact</span>
                          </button>

                          {drive.isCancelled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreDrive(drive.id)
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCancellingDrive(drive)
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Cancel Drive and move to Cancelled Bucket"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all border-none cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Candidates</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Active events are available to volunteers. Cancelled events are stored in the bucket and can be restored.
              </span>
              <button
                type="button"
                onClick={() => setShowAllDrivesModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs border-none cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CANDIDATES PRESENT & DETAILED DRIVE INSPECTION MODAL */}
      {/* ============================================================ */}
      {inspectingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col">
            
            {/* Top Bar */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {inspectingDrive.category}
                  </span>
                  {inspectingDrive.isCancelled && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                      <Ban className="w-2.5 h-2.5" />
                      <span>Cancelled Event Bucket</span>
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {inspectingDrive.date} • {inspectingDrive.time}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white m-0">
                  {inspectingDrive.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectingDrive(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectingDrive.isCancelled && (
              <div className="my-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">This event is in your Cancelled Events Bucket</span>
                  <p className="m-0 mt-0.5 text-[11px] text-rose-700 dark:text-rose-300">
                    Reason: {inspectingDrive.cancelReason || 'Schedule conflict'}
                  </p>
                </div>
              </div>
            )}

            {/* Coordinator & Venue Grid with Map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Person in Charge
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditContact(inspectingDrive)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5" /> Edit
                    </button>
                    {inspectingDrive.managerPhone && (
                      <a
                        href={`tel:${inspectingDrive.managerPhone}`}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 text-decoration-none"
                      >
                        <Phone className="w-2.5 h-2.5" /> Call
                      </a>
                    )}
                  </div>
                </div>
                <h5 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                  {inspectingDrive.managerName || inspectingDrive.organization}
                </h5>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Phone: <strong>{inspectingDrive.managerPhone || 'N/A'}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Venue Address
                  </span>
                  {!inspectingDrive.isRemote && (
                    <a
                      href={getGoogleMapsUrl(inspectingDrive.address || inspectingDrive.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center gap-1 text-decoration-none"
                    >
                      <Navigation className="w-2.5 h-2.5" /> Maps
                    </a>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white m-0 line-clamp-1">
                  {inspectingDrive.address || inspectingDrive.location}
                </p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {inspectingDrive.alreadyRegistered ?? 0} / {inspectingDrive.totalRequired ?? 20} Volunteers Registered
                </div>
              </div>
            </div>

            {/* Candidate Filter Tabs & Search */}
            <div className="py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-y border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: `All Candidates (${driveCandidates.length})` },
                  { key: 'accepted', label: `Present / Approved (${acceptedCandidatesCount})` },
                  { key: 'pending', label: `Pending (${pendingCandidatesCount})` },
                  { key: 'declined', label: `Declined (${declinedCandidatesCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCandidateFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                      candidateFilter === tab.key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search candidate..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Candidate List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-[46vh] pr-1">
              {filteredDriveCandidates.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                    No candidates found for this drive
                  </p>
                </div>
              ) : (
                filteredDriveCandidates.map((cand) => {
                  const isMarkedPresent = attendanceMap[cand.id] ?? (cand.status === 'accepted')

                  return (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        cand.status === 'accepted'
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50'
                          : cand.status === 'declined'
                          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-800/50'
                          : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-gray-900 dark:text-white m-0">
                            {cand.name}
                          </h5>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cand.status === 'accepted'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : cand.status === 'declined'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {cand.status === 'accepted' ? (
                              <>
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Approved
                              </>
                            ) : cand.status === 'declined' ? (
                              <>
                                <X className="w-2.5 h-2.5 stroke-[3]" /> Declined
                              </>
                            ) : (
                              <>
                                <Clock3 className="w-2.5 h-2.5" /> Pending Review
                              </>
                            )}
                          </span>

                          {cand.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => toggleAttendance(cand.id)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border-none cursor-pointer transition-all ${
                                isMarkedPresent
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                              title="Click to toggle attendance check"
                            >
                              {isMarkedPresent ? '✓ Marked Present' : 'Mark Present'}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-indigo-500" />
                            <a href={`mailto:${cand.email}`} className="text-gray-600 dark:text-gray-300 underline">
                              {cand.email}
                            </a>
                          </span>
                          {cand.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              <a href={`tel:${cand.phone}`} className="text-gray-600 dark:text-gray-300">
                                {cand.phone}
                              </a>
                            </span>
                          )}
                          <span>• Applied {cand.appliedAt}</span>
                        </div>

                        {cand.note && (
                          <p className="text-[11px] italic text-gray-600 dark:text-gray-300 m-0 bg-gray-50 dark:bg-gray-900/60 p-2 rounded-lg">
                            "{cand.note}"
                          </p>
                        )}
                      </div>

                      {/* Tick & Cross Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCandidateStatus(cand.id, 'accepted')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
                            cand.status === 'accepted'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Approve (✔)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCandidateStatus(cand.id, 'declined')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
                            cand.status === 'declined'
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Decline (✖)</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Inspection Modal Footer with Cancel Option */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                {inspectingDrive.isCancelled ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreDrive(inspectingDrive.id)}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Event from Bucket</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCancellingDrive(inspectingDrive)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Event & Move to Bucket</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingDrive(null)}
                  className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:underline border-none bg-transparent cursor-pointer"
                >
                  ← Back to Drives
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingDrive(null)}
                  className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs border-none cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DASHBOARD CANCEL DRIVE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {cancellingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                  Cancel Drive & Move to Bucket?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                  {cancellingDrive.title}
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <p className="m-0 font-semibold">
                This drive will be moved to your <strong>Cancelled Events Bucket</strong>.
              </p>
              <p className="m-0 text-[11px] text-rose-700 dark:text-rose-300">
                All enrolled candidates will be notified. You can restore this drive at any time from the Cancelled Bucket.
              </p>
            </div>

            <form onSubmit={handleConfirmCancelDrive} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="e.g. Inclement weather / Venue maintenance / Rescheduling"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setCancellingDrive(null)
                    setCancelReasonInput('')
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Contact Modal */}
      {editingContactDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white m-0">
                    Edit Event In-Charge & Venue
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 truncate max-w-[320px]">
                    {editingContactDrive.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingContactDrive(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Event In-Charge / Manager Name *
                </label>
                <input
                  type="text"
                  required
                  value={editManagerName}
                  onChange={(e) => setEditManagerName(e.target.value)}
                  placeholder="e.g. Siddharth Shinde"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={editManagerPhone}
                  onChange={(e) => setEditManagerPhone(e.target.value)}
                  placeholder="e.g. +91 98201 44521"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Venue Detailed Address / Location *
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. Gate 2, Marine Drive Promenade, Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingContactDrive(null)}
                  disabled={isSavingContact}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingContact ? 'Saving Changes...' : 'Save & Sync Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
