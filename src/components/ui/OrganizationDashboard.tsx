'use client'

import React, { useState, useEffect } from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef, Opportunity, Applicant } from '@/components/ui/OpportunitiesFeed'
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  CheckCircle2,
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
  Edit3,
  Star,
  Lock,
  Download,
  Printer,
  Copy
} from 'lucide-react'
import ResubmitApplicationButton from '@/components/ui/ResubmitApplicationButton'
import { 
  updateApplicantStatusAction, 
  cancelOpportunityAction, 
  updateOpportunityContactAction, 
  markOpportunityCompletedAction,
  fetchOpportunitiesAction,
  fetchApplicantsAction,
  toggleApplicationsAction,
} from '@/app/actions/opportunities'
import { createClient } from '@/lib/supabase/client'
import { pushNotification } from '@/lib/notifications'
import OrganizationAboutModal from '@/components/ui/OrganizationAboutModal'
import OrganizationAboutEditorModal from '@/components/ui/OrganizationAboutEditorModal'
import { getOrgRatingSummary } from '@/lib/ratings'

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
  const [driveBucketTab, setDriveBucketTab] = useState<'active' | 'completed' | 'cancelled'>('active')
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
  const [confirmCompleteDrive, setConfirmCompleteDrive] = useState<Opportunity | null>(null)
  const [confirmCloseAppsDrive, setConfirmCloseAppsDrive] = useState<Opportunity | null>(null)

  // Edit Event Contact & In-Charge Modal
  const [editingContactDrive, setEditingContactDrive] = useState<Opportunity | null>(null)
  const [editManagerName, setEditManagerName] = useState('')
  const [editManagerPhone, setEditManagerPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [isSavingContact, setIsSavingContact] = useState(false)

  // Organization About Us Editor & Volunteer Preview Modal
  const [showAboutEditorModal, setShowAboutEditorModal] = useState(false)
  const [previewingAboutOrgName, setPreviewingAboutOrgName] = useState<string | null>(null)
  const [aboutInitialTab, setAboutInitialTab] = useState<'about' | 'gallery' | 'pastEvents' | 'reviews' | 'contact'>('about')

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

    let updatedOps: Opportunity[] | null = null
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
      updatedOps = updated
      return updated
    })

    if (updatedOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
        }, 0)
      } catch {}
    }

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

  const syncWithDb = async () => {
    try {
      // 1. Fetch live DB opportunities with accurate seat availability
      const dbOps = await fetchOpportunitiesAction()
      if (dbOps && dbOps.length > 0) {
        setOpportunities((prev) => {
          const map = new Map<string, Opportunity>()
          prev.forEach((op) => map.set(op.id, op))
          dbOps.forEach((dbOp) => {
            const existing = map.get(dbOp.id)
            if (existing) {
              const isClosed = Boolean(dbOp.isApplicationsClosed || existing.isApplicationsClosed)
              map.set(dbOp.id, {
                ...existing,
                ...dbOp,
                isApplicationsClosed: isClosed,
                applicationsClosedAt: dbOp.applicationsClosedAt || existing.applicationsClosedAt,
                isCompleted: Boolean(dbOp.isCompleted || existing.isCompleted),
                completedAt: dbOp.completedAt || existing.completedAt,
                isCancelled: Boolean(dbOp.isCancelled || existing.isCancelled),
                cancelledAt: dbOp.cancelledAt || existing.cancelledAt,
                date: (dbOp.date && dbOp.date !== 'Upcoming') ? dbOp.date : (existing.date || dbOp.date || 'Upcoming'),
                time: (dbOp.time && dbOp.time !== 'Flexible' && dbOp.time !== 'To be scheduled') ? dbOp.time : (existing.time || dbOp.time || '09:00 AM - 01:00 PM'),
                address: (dbOp.address && dbOp.address !== 'Local Community Center' && dbOp.address !== 'Remote') ? dbOp.address : (existing.address || dbOp.address || existing.location),
                location: dbOp.location || existing.location || 'Local Community Center',
                managerName: (dbOp.managerName && dbOp.managerName !== 'Event Coordinator' && dbOp.managerName !== 'Coordinator') ? dbOp.managerName : (existing.managerName || dbOp.managerName),
                managerPhone: dbOp.managerPhone ? dbOp.managerPhone : (existing.managerPhone || ''),
              })
            } else {
              map.set(dbOp.id, dbOp as Opportunity)
            }
          })
          const merged = Array.from(map.values())
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }

      // 2. Fetch live DB applicants
      const dbApplicants = await fetchApplicantsAction()
      if (dbApplicants && dbApplicants.length > 0) {
        setApplicants((prev) => {
          const map = new Map<string, Applicant>()
          prev.forEach((a) => map.set(a.id, a))
          dbApplicants.forEach((dbA) => {
            map.set(dbA.id, dbA)
          })
          const merged = Array.from(map.values())
          try {
            localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }
    } catch (err) {
      console.warn('Notice syncing organization dashboard with DB:', err)
    }
  }

  // Keep inspectingDrive synchronized if opportunities update in background
  useEffect(() => {
    if (inspectingDrive) {
      const live = opportunities.find((o) => o.id === inspectingDrive.id)
      if (live && (live.spotsLeft !== inspectingDrive.spotsLeft || live.alreadyRegistered !== inspectingDrive.alreadyRegistered)) {
        setInspectingDrive((prev) =>
          prev
            ? {
                ...prev,
                spotsLeft: live.spotsLeft,
                alreadyRegistered: live.alreadyRegistered,
                totalRequired: live.totalRequired,
              }
            : null
        )
      }
    }
  }, [opportunities, inspectingDrive])

  useEffect(() => {
    loadData()
    syncWithDb()

    const handleUpdate = (e: any) => {
      setTimeout(() => {
        if (e?.detail && Array.isArray(e.detail)) {
          setOpportunities(e.detail)
        } else {
          loadData()
          syncWithDb()
        }
      }, 0)
    }

    const handleFocusSync = () => {
      loadData()
      syncWithDb()
    }

    window.addEventListener('togethernow_opportunities_updated', handleUpdate)
    window.addEventListener('togethernow_new_notification', handleFocusSync)
    window.addEventListener('storage', handleFocusSync)
    window.addEventListener('focus', handleFocusSync)

    // Supabase realtime channel to receive live updates when seats or applicants change globally
    const supabase = createClient()
    const channel = supabase
      .channel('org-dashboard-global-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        syncWithDb()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        syncWithDb()
      })
      .subscribe()

    const pollTimer = setInterval(() => {
      syncWithDb()
    }, 5000)

    return () => {
      window.removeEventListener('togethernow_opportunities_updated', handleUpdate)
      window.removeEventListener('togethernow_new_notification', handleFocusSync)
      window.removeEventListener('storage', handleFocusSync)
      window.removeEventListener('focus', handleFocusSync)
      supabase.removeChannel(channel)
      clearInterval(pollTimer)
    }
  }, [])

  const activeDrives = opportunities.filter((op) => !op.isCancelled && !op.isCompleted)
  const completedDrives = opportunities.filter((op) => !op.isCancelled && op.isCompleted)
  const cancelledDrives = opportunities.filter((op) => op.isCancelled)

  const totalDrives = opportunities.filter((op) => !op.isCancelled).length
  const totalVolunteersRegistered = opportunities
    .filter((op) => !op.isCancelled)
    .reduce((acc, op) => acc + (op.alreadyRegistered ?? 0), 0)
  const totalCommunityHours = totalVolunteersRegistered * 4

  // Filter drives in the "All Drives" modal
  const currentBucketDrives = 
    driveBucketTab === 'active'
      ? activeDrives
      : driveBucketTab === 'completed'
      ? completedDrives
      : cancelledDrives

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

    // Read current state synchronously BEFORE any setState calls
    const currentCandidate = applicants.find((a) => a.id === candidateId)

    // Idempotency guard: do nothing if already at target status
    if (currentCandidate?.status === status) return

    // Capture previous status and build updated candidate synchronously
    const prevStatus = currentCandidate?.status
    const updatedCand: Applicant = { ...currentCandidate!, status }

    // Compute spot delta once from synchronously-read prevStatus
    const shouldIncrement = status === 'accepted' && prevStatus !== 'accepted'
    const shouldDecrement = status === 'declined' && prevStatus === 'accepted'

    // 1. Update applicants (pure updater)
    setApplicants((prev) => {
      const updated = prev.map((a) => (a.id === candidateId ? { ...a, status } : a))
      try {
        localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))

        // Also update volunteer's user-scoped key(s) so their dashboard immediately reflects the change
        const vId = updatedCand.volunteerId
        const vEmail = updatedCand.email
        const keysToUpdate = new Set<string>()
        if (vId) keysToUpdate.add(`togethernow_event_applicants_v1_${vId}`)
        if (vEmail) keysToUpdate.add(`togethernow_event_applicants_v1_${vEmail}`)

        keysToUpdate.forEach((key) => {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const apps: Applicant[] = JSON.parse(raw)
              const synced = apps.map((a) => (a.id === candidateId ? { ...a, status } : a))
              localStorage.setItem(key, JSON.stringify(synced))
            }
          } catch {}
        })
      } catch {}
      return updated
    })

    // 2. Update opportunities spots (pure updater — dispatch deferred)
    let updatedSpotsOps: Opportunity[] | null = null
    setOpportunities((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== ev.id) return o
        const currentReg = o.alreadyRegistered ?? 0
        const totalReq = o.totalRequired ?? (o.spotsLeft + currentReg)
        const newReg = shouldIncrement
          ? currentReg + 1
          : shouldDecrement
          ? Math.max(0, currentReg - 1)
          : currentReg
        return { ...o, alreadyRegistered: newReg, spotsLeft: Math.max(0, totalReq - newReg) }
      })
      updatedSpotsOps = updated
      return updated
    })

    if (updatedSpotsOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSpotsOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedSpotsOps }))
        }, 0)
      } catch {}
    }

    // 3. Update inspecting drive spots (pure updater)
    setInspectingDrive((prev) => {
      if (!prev) return prev
      const currentReg = prev.alreadyRegistered ?? 0
      const totalReq = prev.totalRequired ?? (prev.spotsLeft + currentReg)
      const newReg = shouldIncrement
        ? currentReg + 1
        : shouldDecrement
        ? Math.max(0, currentReg - 1)
        : currentReg
      return { ...prev, alreadyRegistered: newReg, spotsLeft: Math.max(0, totalReq - newReg) }
    })

    // 4. Notification (runs synchronously after state is queued)
    if (status === 'accepted') {
      pushNotification({
        targetRole: 'volunteer',
        type: 'approval',
        eventId: ev.id,
        eventTitle: ev.title,
        applicantName: updatedCand.name,
        targetUserId: updatedCand.volunteerId,
        targetEmail: updatedCand.email,
        title: '🎉 Application Approved!',
        message: `Congratulations! ${ev.organization} approved your spot for "${ev.title}". In-Charge: ${ev.managerName || 'Coordinator'} (${ev.managerPhone || 'on dashboard'}).`,
      })
    }

    const currentReg = ev.alreadyRegistered ?? 0
    const totalReq = ev.totalRequired ?? (ev.spotsLeft + currentReg)
    const newReg = shouldIncrement
      ? currentReg + 1
      : shouldDecrement
      ? Math.max(0, currentReg - 1)
      : currentReg
    const newSpots = Math.max(0, totalReq - newReg)

    updateApplicantStatusAction({
      applicantId: candidateId,
      eventId: ev.id,
      status,
      volunteerId: updatedCand.volunteerId,
      alreadyRegistered: newReg,
      spotsLeft: newSpots,
      totalRequired: totalReq,
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

    let updatedOps: Opportunity[] | null = null
    setOpportunities((prev) => {
      const updated = prev.map((op) =>
        op.id === evId
          ? { ...op, isCancelled: true, cancelledAt: new Date().toISOString(), cancelReason: reason }
          : op
      )
      updatedOps = updated
      return updated
    })

    if (updatedOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
        }, 0)
      } catch {}
    }

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
    let updatedOps: Opportunity[] | null = null
    setOpportunities((prev) => {
      const updated = prev.map((op) =>
        op.id === eventId
          ? { ...op, isCancelled: false, cancelledAt: undefined, cancelReason: undefined }
          : op
      )
      updatedOps = updated
      return updated
    })

    if (updatedOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
        }, 0)
      } catch {}
    }

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

  // Permanently Mark Event Completed (No reopening allowed once confirmed)
  const executeCompleteDrive = (drive: Opportunity) => {
    const completedTime = new Date().toISOString()

    let updatedOps: Opportunity[] | null = null
    setOpportunities((prev) => {
      const updated = prev.map((op) =>
        op.id === drive.id
          ? { ...op, isCompleted: true, completedAt: completedTime }
          : op
      )
      updatedOps = updated
      return updated
    })

    if (updatedOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
        }, 0)
      } catch {}
    }

    const enrolled = applicants.filter((a) => a.eventId === drive.id && a.status === 'accepted')
    enrolled.forEach((app) => {
      pushNotification({
        targetRole: 'volunteer',
        type: 'approval',
        eventId: drive.id,
        eventTitle: drive.title,
        title: '🎉 Event Completed!',
        message: `"${drive.title}" has been marked as Completed by ${drive.organization}. Thank you for making an impact!`,
      })
    })

    pushNotification({
      targetRole: 'organization',
      type: 'approval',
      eventId: drive.id,
      eventTitle: drive.title,
      title: 'Event Marked as Completed',
      message: `"${drive.title}" has been permanently marked as Completed.`,
    })

    markOpportunityCompletedAction({
      eventId: drive.id,
      isCompleted: true,
      completedAt: completedTime,
    }).catch((err) => console.warn('Notice updating event completion in DB:', err))

    if (inspectingDrive?.id === drive.id) {
      setInspectingDrive((prev) =>
        prev ? { ...prev, isCompleted: true, completedAt: completedTime } : null
      )
    }

    setConfirmCompleteDrive(null)
  }

  // Stop / Re-open Accepting Applications
  const handleToggleApplications = async (eventId: string, isClosed: boolean) => {
    const closedTime = isClosed ? new Date().toISOString() : undefined

    let updatedOps: Opportunity[] | null = null
    setOpportunities((prev) => {
      const updated = prev.map((o) =>
        o.id === eventId
          ? {
              ...o,
              isApplicationsClosed: isClosed,
              applicationsClosedAt: closedTime,
            }
          : o
      )
      updatedOps = updated
      return updated
    })

    if (updatedOps) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOps))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
        }, 0)
      } catch {}
    }

    setInspectingDrive((prev) => {
      if (!prev || prev.id !== eventId) return prev
      return {
        ...prev,
        isApplicationsClosed: isClosed,
        applicationsClosedAt: closedTime,
      }
    })

    if (isClosed) {
      setCandidateFilter('accepted')
    }

    try {
      await toggleApplicationsAction({
        eventId,
        isClosed,
        applicationsClosedAt: closedTime,
      })
    } catch (err) {
      console.warn('Notice updating database toggleApplicationsAction:', err)
    }

    pushNotification({
      targetRole: 'organization',
      type: 'approval',
      eventId,
      title: isClosed ? '🔒 Applications Closed' : '🔓 Applications Re-opened',
      message: isClosed
        ? 'Applications for this event have been stopped. The final volunteer roster is now locked.'
        : 'Applications have been re-opened for this event.',
    })
  }

  // Export Finalized Volunteers to CSV
  const handleExportCsv = (eventTitle: string, finalizedVolunteers: Applicant[]) => {
    if (finalizedVolunteers.length === 0) {
      alert('No approved volunteers to export yet. Approve applicants to build your finalized roster.')
      return
    }
    const headers = ['#', 'Volunteer Name', 'Phone Number', 'Email Address', 'Verified Skills', 'Applied Date', 'Attendance Status']
    const rows = finalizedVolunteers.map((v, idx) => [
      idx + 1,
      `"${(v.name || 'Volunteer').replace(/"/g, '""')}"`,
      `"${(v.phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(v.email || 'N/A').replace(/"/g, '""')}"`,
      `"${(v.skills?.join(', ') || 'N/A').replace(/"/g, '""')}"`,
      `"${(v.appliedAt || 'N/A').replace(/"/g, '""')}"`,
      `"${attendanceMap[v.id] ? 'Present' : 'Confirmed'}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Final_Volunteer_List.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Print Finalized Volunteer Attendance Sheet
  const handlePrintRoster = (drive: Opportunity, finalizedVolunteers: Applicant[]) => {
    if (finalizedVolunteers.length === 0) {
      alert('No approved volunteers to print yet.')
      return
    }
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Final Volunteer List - ${drive.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #111; line-height: 1.4; }
            h1 { margin: 0 0 6px 0; font-size: 22px; }
            .meta { font-size: 13px; color: #555; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e4e4e7; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d4d4d8; padding: 10px 12px; text-align: left; }
            th { background: #f4f4f5; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            tr:nth-child(even) { background: #fafafa; }
            .check-col { width: 90px; text-align: center; }
            .sig-col { width: 140px; }
            @media print {
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <h1>${drive.title}</h1>
          <div class="meta">
            <strong>Organization:</strong> ${drive.organization} &nbsp;|&nbsp;
            <strong>Date:</strong> ${drive.date || 'Upcoming'} &nbsp;|&nbsp;
            <strong>Time:</strong> ${drive.time || 'Flexible'} &nbsp;|&nbsp;
            <strong>Location:</strong> ${drive.address || drive.location} &nbsp;|&nbsp;
            <strong>Total Finalized Volunteers:</strong> ${finalizedVolunteers.length}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Volunteer Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Skills</th>
                <th class="check-col">Present [✓]</th>
                <th class="sig-col">Volunteer Signature</th>
              </tr>
            </thead>
            <tbody>
              ${finalizedVolunteers.map((v, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${v.name}</strong></td>
                  <td>${v.phone || 'N/A'}</td>
                  <td>${v.email || 'N/A'}</td>
                  <td>${v.skills?.join(', ') || '-'}</td>
                  <td class="check-col">[ &nbsp;&nbsp; ]</td>
                  <td class="sig-col"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  // Copy Volunteer Contacts to Clipboard
  const handleCopyContacts = (finalizedVolunteers: Applicant[]) => {
    if (finalizedVolunteers.length === 0) {
      alert('No finalized volunteers yet.')
      return
    }
    const phones = finalizedVolunteers.map(v => v.phone).filter(Boolean).join(', ')
    const emails = finalizedVolunteers.map(v => v.email).filter(Boolean).join(', ')
    const textToCopy = `FINAL VOLUNTEER CONTACT LIST:\nPhones: ${phones}\nEmails: ${emails}`
    navigator.clipboard.writeText(textToCopy)
    alert(`Copied ${finalizedVolunteers.length} finalized volunteer contacts to clipboard!`)
  }

  return (
    <div suppressHydrationWarning className="space-y-8">
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
                  Total Drives Created
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {completedDrives.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{completedDrives.length} Done</span>
                </span>
              )}
              {cancelledDrives.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                  {cancelledDrives.length} Bucket
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">View active, completed & bucket</span>
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

      {/* Organization Public About Us & Work Showcase Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-md border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-xl shrink-0">
            <Building2 className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white m-0">
                {organizationName || 'Your Organization'} — About Us & Public Profile
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                Public Facing
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewingAboutOrgName(organizationName || 'Ocean & Earth Care Alliance')
                  setAboutInitialTab('reviews')
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 hover:text-white hover:bg-amber-400/40 text-xs font-bold transition-all cursor-pointer border-none"
                title="View Volunteer Reviews"
              >
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>
                  {getOrgRatingSummary(organizationName || 'Ocean & Earth Care Alliance').averageRating} / 5.0 (
                  {getOrgRatingSummary(organizationName || 'Ocean & Earth Care Alliance').totalReviews} reviews)
                </span>
              </button>
            </div>
            <p className="text-xs text-emerald-100/80 m-0 max-w-2xl leading-relaxed">
              Maintain your mission, impact milestones, ground work photos, and volunteer reviews. Volunteers see this when they click <strong>"Know More"</strong> next to your organization name.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setPreviewingAboutOrgName(organizationName || 'Ocean & Earth Care Alliance')
              setAboutInitialTab('reviews')
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs border border-amber-400/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Volunteer Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewingAboutOrgName(organizationName || 'Ocean & Earth Care Alliance')
              setAboutInitialTab('about')
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview as Volunteer</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAboutEditorModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs border-none transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit About Us & Gallery</span>
          </button>
        </div>
      </div>

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
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-5xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col">
            
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex-wrap">
                <button
                  type="button"
                  onClick={() => setDriveBucketTab('active')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
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
                  onClick={() => setDriveBucketTab('completed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    driveBucketTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed ({completedDrives.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDriveBucketTab('cancelled')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    driveBucketTab === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancelled ({cancelledDrives.length})</span>
                </button>
              </div>

              <div className="relative shrink-0 sm:w-56">
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 pr-1 space-y-3.5 max-h-[60vh]">
              {filteredDrives.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  {driveBucketTab === 'active' ? (
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  ) : driveBucketTab === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  ) : (
                    <Ban className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-60" />
                  )}
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 m-0">
                    {driveBucketTab === 'active'
                      ? 'No active drives found'
                      : driveBucketTab === 'completed'
                      ? 'No completed events yet'
                      : 'Cancelled Events Bucket is empty'}
                  </p>
                  <p className="text-xs text-gray-400 m-0 mt-1">
                    {driveBucketTab === 'active'
                      ? 'Create a new opportunity or adjust your search filter.'
                      : driveBucketTab === 'completed'
                      ? 'Mark your concluded drives as completed to track organizational impact.'
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
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3.5 group ${
                        drive.isCancelled
                          ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-400'
                          : drive.isCompleted
                          ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/15 dark:bg-emerald-950/15 hover:border-emerald-400 shadow-xs'
                          : 'border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/70 hover:border-emerald-500 shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* TOP SECTION: Drive details on left, capacity/registered stats on right */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        {/* Left Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              {drive.category}
                            </span>
                            {drive.isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Completed Event</span>
                              </span>
                            )}
                            {drive.isApplicationsClosed && !drive.isCancelled && !drive.isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Applications Closed</span>
                              </span>
                            )}
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

                          <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 tracking-tight group-hover:text-emerald-600 transition-colors">
                            {drive.title}
                          </h4>

                          {drive.isCancelled && drive.cancelReason && (
                            <div className="p-2 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-1.5 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span><strong>Reason:</strong> {drive.cancelReason}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>In-Charge: <strong>{drive.managerName || 'Coordinator'}</strong> ({drive.managerPhone || 'N/A'})</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{drive.address || drive.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Capacity / Stats Block */}
                        {!drive.isCancelled && (
                          <div className="w-full sm:w-64 shrink-0 flex flex-col gap-1.5 sm:items-end justify-center">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{evAccepted} Confirmed</span>
                              </span>
                              {evPending > 0 && (
                                <span className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                                  {evPending} New
                                </span>
                              )}
                            </div>

                            <div className="w-full">
                              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {drive.alreadyRegistered ?? 0} / {totalReq} Registered
                                </span>
                                <span className={`font-extrabold ${drive.spotsLeft === 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {drive.spotsLeft === 0 ? '0 spots left (Full)' : `${drive.spotsLeft} spot${drive.spotsLeft !== 1 ? 's' : ''} left`}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${percentFilled >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${percentFilled}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* BOTTOM ACTION BAR: Separate row for buttons so nothing is squished */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        {/* Left Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Mark Completed Button */}
                          {drive.isCompleted ? (
                            <span className="px-3 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed ✓</span>
                            </span>
                          ) : !drive.isCancelled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmCompleteDrive(drive)
                              }}
                              className="px-3 py-1.5 rounded-xl font-bold text-xs border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Mark Drive as Completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Completed</span>
                            </button>
                          ) : null}

                          {/* Stop Applications / Final Roster Button */}
                          {!drive.isCancelled && !drive.isCompleted && (
                            drive.isApplicationsClosed ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setInspectingDrive(drive)
                                  setCandidateFilter('accepted')
                                }}
                                className="px-3 py-1.5 rounded-xl font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                title="Applications permanently closed - View finalized volunteer roster"
                              >
                                <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Final Roster ({evAccepted})</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmCloseAppsDrive(drive)
                                }}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                title="Permanently stop accepting applications and finalize volunteer team"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Stop Applications</span>
                              </button>
                            )
                          )}

                          {/* Edit Contact Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditContact(drive)
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-indigo-600 text-gray-700 hover:text-white dark:bg-gray-800 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            title="Edit In-Charge and Venue Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Contact</span>
                          </button>

                          {/* Cancel / Restore Button */}
                          {drive.isCancelled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreDrive(drive.id)
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
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
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Cancel Drive and move to Cancelled Bucket"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>

                        {/* Right: Inspect Candidates Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setInspectingDrive(drive)
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all border-none cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Candidates ({evCandidates.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {inspectingDrive.category}
                  </span>
                  {inspectingDrive.isCompleted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Completed Event</span>
                    </span>
                  )}
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

              <div className="flex items-center gap-2 flex-wrap">
                {!inspectingDrive.isCompleted && !inspectingDrive.isCancelled && (
                  inspectingDrive.isApplicationsClosed ? (
                    <span
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-2xs"
                      title="Applications permanently closed - Roster finalized"
                    >
                      <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Applications Closed • Roster Locked</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmCloseAppsDrive(inspectingDrive)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                      title="Permanently stop accepting applications and finalize volunteer team"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Stop Accepting Applications</span>
                    </button>
                  )
                )}

                {!inspectingDrive.isCompleted && !inspectingDrive.isCancelled && (
                  <button
                    type="button"
                    onClick={() => setConfirmCompleteDrive(inspectingDrive)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingDrive(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {inspectingDrive.isCompleted && (
              <div className="my-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">This event has been marked as Completed</span>
                </div>
                {inspectingDrive.completedAt && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    Concluded on {new Date(inspectingDrive.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}

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

            {/* Applications Closed & Final Roster Banner with Export / Print actions */}
            {inspectingDrive.isApplicationsClosed && !inspectingDrive.isCancelled && (
              <div className="my-2.5 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-xs text-indigo-950 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-sm">
                      <span>Applications Closed • Final Roster Finalized</span>
                    </div>
                    <p className="m-0 mt-0.5 text-[11px] text-indigo-700 dark:text-indigo-300">
                      New applications are frozen. Below is the final verified team of {acceptedCandidatesCount} volunteer(s).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExportCsv(inspectingDrive.title, driveCandidates.filter((c) => c.status === 'accepted'))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Export finalized volunteers as CSV for Excel / Google Sheets"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintRoster(inspectingDrive, driveCandidates.filter((c) => c.status === 'accepted'))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Print attendance check-in sheet for event day"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Roster</span>
                  </button>
                </div>
              </div>
            )}

            {/* Event Schedule Quick Pills */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600 dark:text-gray-300 py-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Date: {inspectingDrive.date || 'Upcoming'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Time: {inspectingDrive.time || '09:00 AM - 01:00 PM'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Capacity: {inspectingDrive.alreadyRegistered ?? 0} / {inspectingDrive.totalRequired ?? 20} Volunteers</span>
              </div>
            </div>

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
                  {(inspectingDrive.managerName && inspectingDrive.managerName !== inspectingDrive.organization)
                    ? inspectingDrive.managerName
                    : 'Event Coordinator'}
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
                  ...(inspectingDrive.isApplicationsClosed
                    ? [{ key: 'accepted', label: `⭐ Finalized Roster (${acceptedCandidatesCount})` }]
                    : []),
                  { key: 'all', label: `All Candidates (${driveCandidates.length})` },
                  ...(!inspectingDrive.isApplicationsClosed
                    ? [{ key: 'accepted', label: `Present / Approved (${acceptedCandidatesCount})` }]
                    : []),
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

                      {/* Tick & Cross Actions — only shown in All/Pending/Declined review tabs, hidden in Final Roster */}
                      {candidateFilter !== 'accepted' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={cand.status === 'accepted'}
                            onClick={() => handleCandidateStatus(cand.id, 'accepted')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none flex items-center gap-1 ${
                              cand.status === 'accepted'
                                ? 'bg-emerald-600 text-white shadow-md opacity-75 cursor-not-allowed'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{cand.status === 'accepted' ? 'Approved ✔' : 'Approve'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={cand.status === 'declined'}
                            onClick={() => handleCandidateStatus(cand.id, 'declined')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none flex items-center gap-1 ${
                              cand.status === 'declined'
                                ? 'bg-rose-600 text-white shadow-md opacity-75 cursor-not-allowed'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950 dark:text-rose-300 cursor-pointer'
                            }`}
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{cand.status === 'declined' ? 'Declined ✖' : 'Decline'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Inspection Modal Footer with Complete & Cancel Options */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mark as Completed Button */}
                {inspectingDrive.isCompleted ? (
                  <span className="px-4 py-2 rounded-xl font-extrabold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ Completed (Concluded)</span>
                  </span>
                ) : !inspectingDrive.isCancelled ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCompleteDrive(inspectingDrive)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                ) : null}

                {inspectingDrive.isCancelled ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreDrive(inspectingDrive.id)}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore from Bucket</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCancellingDrive(inspectingDrive)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Event</span>
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

      {/* Organization About Us Editor Modal */}
      <OrganizationAboutEditorModal
        isOpen={showAboutEditorModal}
        onClose={() => setShowAboutEditorModal(false)}
        organizationName={organizationName || 'Your Organization'}
        organizationId={userId}
      />

      {/* Volunteer Facing Preview Modal */}
      {previewingAboutOrgName && (
        <OrganizationAboutModal
          isOpen={Boolean(previewingAboutOrgName)}
          onClose={() => setPreviewingAboutOrgName(null)}
          organizationName={previewingAboutOrgName}
          organizationId={userId}
          initialTab={aboutInitialTab}
        />
      )}

      {/* Confirm Permanent Event Completion Modal */}
      {confirmCompleteDrive && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shrink-0">
                🎉
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white m-0">
                  Mark Event as Completed?
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {confirmCompleteDrive.organization}
                </span>
              </div>
            </div>

            {/* Permanent Action Warning Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Permanent Action — Cannot Be Reopened</span>
              </div>
              <p className="m-0 text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                Once confirmed as completed, this event will conclude permanently. Verified volunteer hours will be credited to all present attendees and public volunteer reviews will open.
              </p>
            </div>

            {/* Event Summary Card */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                {confirmCompleteDrive.title}
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px] flex-wrap">
                <span>📅 {confirmCompleteDrive.date}</span>
                <span>📍 {confirmCompleteDrive.location}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  👥 {applicants.filter((a) => a.eventId === confirmCompleteDrive.id && a.status === 'accepted').length} Accepted Volunteers
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmCompleteDrive(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => executeCompleteDrive(confirmCompleteDrive)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Yes, Confirm Completion</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Stop Accepting Applications & Lock Final Roster Modal */}
      {confirmCloseAppsDrive && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white m-0">
                  Permanently Stop Applications?
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {confirmCloseAppsDrive.title}
                </span>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                <span>Permanent Action: Finalizing Volunteer Roster</span>
              </div>
              <p className="m-0 text-[11px] text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed">
                Stopping applications will permanently close this drive to any new registrations. Your confirmed volunteer roster will be locked so you can print attendance check-in sheets and export verified contacts.
              </p>
            </div>

            {/* Current Counts Summary */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Approved Volunteers (Final Team):</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {applicants.filter((a) => a.eventId === confirmCloseAppsDrive.id && a.status === 'accepted').length} Confirmed
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pending Applications:</span>
                <strong className="text-amber-600 dark:text-amber-400">
                  {applicants.filter((a) => a.eventId === confirmCloseAppsDrive.id && a.status === 'pending').length} Pending
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmCloseAppsDrive(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const drive = confirmCloseAppsDrive
                  setConfirmCloseAppsDrive(null)
                  handleToggleApplications(drive.id, true)
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Yes, Permanently Stop Applications</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
