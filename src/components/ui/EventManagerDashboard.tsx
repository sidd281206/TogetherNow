'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserCheck, 
  Check, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Copy, 
  LogOut, 
  Building2, 
  Phone, 
  Mail, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Eye,
  Camera,
  Navigation,
  Lock,
  Unlock,
  Ban,
  RotateCcw,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'
import { EventManagerSession } from '@/lib/event-manager-session'
import { logoutEventManagerAction, markVolunteerAttendanceAction } from '@/app/actions/event-manager'
import { 
  updateApplicantStatusAction,
  toggleApplicationsAction,
  markOpportunityCompletedAction,
  cancelOpportunityAction
} from '@/app/actions/opportunities'
import { getHighestBadge } from '@/lib/badges'
import { Applicant, Opportunity, INITIAL_OPPORTUNITIES } from '@/components/ui/OpportunitiesFeed'

interface EventManagerDashboardProps {
  session: EventManagerSession
  initialActiveEvents?: any[]
  initialPastEvents?: any[]
  initialApplicants?: Applicant[]
}

const APPLICANTS_STORAGE_KEY = 'togethernow_event_applicants_v1'
const OPPORTUNITIES_STORAGE_KEY = 'togethernow_posted_opportunities'

function getGoogleMapsUrl(addressOrLocation: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrLocation)}`
}

function getVolunteerAvatarUrl(cand: { avatarUrl?: string; email?: string; volunteerId?: string }): string | null {
  if (cand.avatarUrl && cand.avatarUrl.trim().length > 0) return cand.avatarUrl
  if (typeof window !== 'undefined') {
    if (cand.email) {
      const stored = localStorage.getItem(`togethernow_user_avatar_${cand.email}`)
      if (stored && stored.trim().length > 0) return stored
    }
    if (cand.volunteerId) {
      const stored = localStorage.getItem(`togethernow_user_avatar_${cand.volunteerId}`)
      if (stored && stored.trim().length > 0) return stored
    }
  }
  return null
}

function formatAttendanceTime(isoOrStr?: string): string {
  if (!isoOrStr) return ''
  try {
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return isoOrStr
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoOrStr
  }
}

export default function EventManagerDashboard({
  session,
  initialActiveEvents = [],
  initialPastEvents = [],
  initialApplicants = [],
}: EventManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')
  const [activeEvents, setActiveEvents] = useState<Opportunity[]>(initialActiveEvents)
  const [pastEvents, setPastEvents] = useState<Opportunity[]>(initialPastEvents)
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants)

  // Currently managed event
  const [managingEvent, setManagingEvent] = useState<Opportunity | null>(null)
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'pending' | 'accepted' | 'present' | 'declined'>('all')
  const [candidateSearch, setCandidateSearch] = useState('')
  
  // Attendance state map: { [applicantId]: boolean }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

  // Event Lifecycle Action Modals & States
  const [confirmCloseAppsEvent, setConfirmCloseAppsEvent] = useState<Opportunity | null>(null)
  const [confirmCompleteEvent, setConfirmCompleteEvent] = useState<Opportunity | null>(null)
  const [cancellingEvent, setCancellingEvent] = useState<Opportunity | null>(null)
  const [cancelReasonInput, setCancelReasonInput] = useState('')

  // Reusable sync loader for opportunities and applicants
  const syncManagerData = () => {
    try {
      // 1. Read opportunities from local storage
      const savedOpsRaw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY)
      let allOps: Opportunity[] = []
      if (savedOpsRaw) {
        allOps = JSON.parse(savedOpsRaw)
      } else {
        allOps = INITIAL_OPPORTUNITIES
      }

      // Filter events assigned to this manager's employeeId
      const cleanCode = session.employeeId.toUpperCase()
      const assigned = allOps.filter((op) => {
        if (Array.isArray(op.assignedEmployeeIds) && op.assignedEmployeeIds.some((c) => c.toUpperCase() === cleanCode)) {
          return true
        }
        // Match by phone
        if (session.phone && op.managerPhone && op.managerPhone.replace(/\D/g, '').endsWith(session.phone.replace(/\D/g, '').slice(-10))) {
          return true
        }
        // Demo fallback for EM101 & EM102
        if (cleanCode === 'EM101' && (op.id === '1' || op.title.includes('Beach'))) return true
        if (cleanCode === 'EM102' && (op.id === '2' || op.title.includes('Coding'))) return true
        return false
      })

      const nowActive: Opportunity[] = []
      const nowPast: Opportunity[] = []

      // If no explicit matches, show sample relevant events for good UX
      const eventsToShow = assigned.length > 0 ? assigned : allOps.slice(0, 3)

      eventsToShow.forEach((op) => {
        if (op.isCompleted || op.isCancelled) {
          nowPast.push(op)
        } else {
          nowActive.push(op)
        }
      })

      setActiveEvents(nowActive)
      setPastEvents(nowPast)

      // Refresh managingEvent reference if currently open
      setManagingEvent((prev) => {
        if (!prev) return null
        const fresh = allOps.find((o) => o.id === prev.id)
        return fresh || prev
      })

      // 2. Read applicants from local storage
      const savedAppsRaw = localStorage.getItem(APPLICANTS_STORAGE_KEY)
      if (savedAppsRaw) {
        const parsedApps: Applicant[] = JSON.parse(savedAppsRaw)
        setApplicants(parsedApps)

        // Initialize attendance map
        const attObj: Record<string, boolean> = {}
        parsedApps.forEach((a) => {
          if (a.attendance === 'present') {
            attObj[a.id] = true
          }
        })
        setAttendanceMap(attObj)
      }
    } catch (err) {
      console.warn('Notice syncing manager events:', err)
    }
  }

  // Load and reconcile state on mount and listen to real-time events
  useEffect(() => {
    syncManagerData()

    const handleSync = () => {
      syncManagerData()
    }

    window.addEventListener('togethernow_opportunities_updated', handleSync)
    window.addEventListener('togethernow_applicants_updated', handleSync)
    window.addEventListener('togethernow_avatar_updated', handleSync)
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)

    return () => {
      window.removeEventListener('togethernow_opportunities_updated', handleSync)
      window.removeEventListener('togethernow_applicants_updated', handleSync)
      window.removeEventListener('togethernow_avatar_updated', handleSync)
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [session.employeeId, session.phone])

  // Candidates for the event being managed
  const currentEventCandidates = managingEvent
    ? applicants.filter((a) => a.eventId === managingEvent.id)
    : []

  const filteredCandidates = currentEventCandidates.filter((cand) => {
    const isPresent = Boolean(attendanceMap[cand.id] || cand.attendance === 'present')

    if (candidateFilter === 'pending' && cand.status !== 'pending') return false
    if (candidateFilter === 'accepted' && cand.status !== 'accepted') return false
    if (candidateFilter === 'declined' && cand.status !== 'declined') return false
    if (candidateFilter === 'present' && (!isPresent || cand.status !== 'accepted')) return false

    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase()
      const matchName = cand.name.toLowerCase().includes(q)
      const matchEmail = cand.email.toLowerCase().includes(q)
      const matchPhone = cand.phone && cand.phone.includes(q)
      const matchSkill = cand.skills.some((s) => s.toLowerCase().includes(q))
      if (!matchName && !matchEmail && !matchPhone && !matchSkill) return false
    }

    return true
  })

  // Status counters for managing event
  const pendingCount = currentEventCandidates.filter((c) => c.status === 'pending').length
  const acceptedCount = currentEventCandidates.filter((c) => c.status === 'accepted').length
  const presentCount = currentEventCandidates.filter(
    (c) => c.status === 'accepted' && (attendanceMap[c.id] || c.attendance === 'present')
  ).length

  // Handle Candidate Accept / Decline
  const handleCandidateStatus = async (candidateId: string, status: 'accepted' | 'declined') => {
    if (!managingEvent) return

    const updated = applicants.map((a) =>
      a.id === candidateId ? { ...a, status } : a
    )
    setApplicants(updated)

    try {
      localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('togethernow_applicants_updated', { detail: updated }))
    } catch {}

    try {
      await updateApplicantStatusAction({
        applicantId: candidateId,
        status,
        eventId: managingEvent.id,
      })
    } catch (err) {
      console.warn('Notice updating applicant status in DB:', err)
    }
  }

  // Handle Mark Attendance Toggle
  const handleToggleAttendance = async (cand: Applicant) => {
    if (!managingEvent) return
    const current = Boolean(attendanceMap[cand.id] || cand.attendance === 'present')
    const nextStatus: 'present' | 'absent' = current ? 'absent' : 'present'
    const timestamp = nextStatus === 'present' ? new Date().toISOString() : undefined
    const markedBy = nextStatus === 'present' ? `${session.name} (${session.employeeId})` : undefined

    setAttendanceMap((prev) => ({
      ...prev,
      [cand.id]: nextStatus === 'present',
    }))

    const updated = applicants.map((a) =>
      a.id === cand.id ? { 
        ...a, 
        attendance: nextStatus,
        attendanceMarkedAt: timestamp,
        attendanceMarkedBy: markedBy,
      } : a
    )
    setApplicants(updated)

    try {
      localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('togethernow_applicants_updated', { detail: updated }))
    } catch {}

    try {
      await markVolunteerAttendanceAction({
        eventId: managingEvent.id,
        volunteerId: cand.volunteerId || cand.id,
        applicantId: cand.id,
        status: nextStatus,
        markedBy: `${session.name} (${session.employeeId})`,
        markedAt: timestamp,
      })
    } catch (err) {
      console.warn('Notice marking attendance in DB:', err)
    }
  }

  // ── Event Lifecycle Actions (Stop Applications, Mark Completed, Cancel Event) ──
  
  // 1. Toggle Applications (Stop / Reopen)
  const handleToggleApplications = async (op: Opportunity, shouldClose: boolean) => {
    const closedTime = shouldClose ? new Date().toISOString() : undefined

    let updatedOps: Opportunity[] = []
    try {
      const raw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY)
      const allOps: Opportunity[] = raw ? JSON.parse(raw) : INITIAL_OPPORTUNITIES
      updatedOps = allOps.map((o) =>
        o.id === op.id
          ? {
              ...o,
              isApplicationsClosed: shouldClose,
              applicationsClosedAt: closedTime,
            }
          : o
      )
      localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(updatedOps))
      window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
    } catch {}

    setActiveEvents((prev) =>
      prev.map((o) =>
        o.id === op.id
          ? { ...o, isApplicationsClosed: shouldClose, applicationsClosedAt: closedTime }
          : o
      )
    )
    setPastEvents((prev) =>
      prev.map((o) =>
        o.id === op.id
          ? { ...o, isApplicationsClosed: shouldClose, applicationsClosedAt: closedTime }
          : o
      )
    )

    if (managingEvent && managingEvent.id === op.id) {
      setManagingEvent((prev) =>
        prev
          ? { ...prev, isApplicationsClosed: shouldClose, applicationsClosedAt: closedTime }
          : null
      )
      if (shouldClose) {
        setCandidateFilter('accepted')
      }
    }

    try {
      await toggleApplicationsAction({
        eventId: op.id,
        isClosed: shouldClose,
        applicationsClosedAt: closedTime,
      })
    } catch (err) {
      console.warn('Notice syncing toggleApplicationsAction to DB:', err)
    }
  }

  // 2. Permanently Mark Event as Completed
  const handleExecuteComplete = async (op: Opportunity) => {
    const completedTime = new Date().toISOString()

    let updatedOps: Opportunity[] = []
    try {
      const raw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY)
      const allOps: Opportunity[] = raw ? JSON.parse(raw) : INITIAL_OPPORTUNITIES
      updatedOps = allOps.map((o) =>
        o.id === op.id
          ? {
              ...o,
              isCompleted: true,
              completedAt: completedTime,
            }
          : o
      )
      localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(updatedOps))
      window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
    } catch {}

    const completedOp: Opportunity = { ...op, isCompleted: true, completedAt: completedTime }

    setActiveEvents((prev) => prev.filter((o) => o.id !== op.id))
    setPastEvents((prev) => [completedOp, ...prev.filter((o) => o.id !== op.id)])

    if (managingEvent && managingEvent.id === op.id) {
      setManagingEvent(completedOp)
    }

    try {
      await markOpportunityCompletedAction({
        eventId: op.id,
        isCompleted: true,
        completedAt: completedTime,
      })
    } catch (err) {
      console.warn('Notice syncing markOpportunityCompletedAction to DB:', err)
    }
  }

  // 3. Cancel Event
  const handleExecuteCancel = async (op: Opportunity, reason: string) => {
    const cancelledTime = new Date().toISOString()

    let updatedOps: Opportunity[] = []
    try {
      const raw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY)
      const allOps: Opportunity[] = raw ? JSON.parse(raw) : INITIAL_OPPORTUNITIES
      updatedOps = allOps.map((o) =>
        o.id === op.id
          ? {
              ...o,
              isCancelled: true,
              cancelledAt: cancelledTime,
              cancelReason: reason,
            }
          : o
      )
      localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(updatedOps))
      window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
    } catch {}

    const cancelledOp: Opportunity = { ...op, isCancelled: true, cancelledAt: cancelledTime, cancelReason: reason }

    setActiveEvents((prev) => prev.filter((o) => o.id !== op.id))
    setPastEvents((prev) => [cancelledOp, ...prev.filter((o) => o.id !== op.id)])

    if (managingEvent && managingEvent.id === op.id) {
      setManagingEvent(cancelledOp)
    }

    try {
      await cancelOpportunityAction({
        eventId: op.id,
        reason,
      })
    } catch (err) {
      console.warn('Notice syncing cancelOpportunityAction to DB:', err)
    }
  }

  // 4. Restore Event
  const handleRestoreEvent = async (eventId: string) => {
    let updatedOps: Opportunity[] = []
    let restoredOp: Opportunity | null = null
    try {
      const raw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY)
      const allOps: Opportunity[] = raw ? JSON.parse(raw) : INITIAL_OPPORTUNITIES
      updatedOps = allOps.map((o) => {
        if (o.id === eventId) {
          restoredOp = { ...o, isCancelled: false, cancelledAt: undefined, cancelReason: undefined }
          return restoredOp
        }
        return o
      })
      localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(updatedOps))
      window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedOps }))
    } catch {}

    if (restoredOp) {
      setPastEvents((prev) => prev.filter((o) => o.id !== eventId))
      setActiveEvents((prev) => [restoredOp!, ...prev.filter((o) => o.id !== eventId)])
      if (managingEvent && managingEvent.id === eventId) {
        setManagingEvent(restoredOp)
      }
    }
  }

  // Export CSV of Finalized Volunteers
  const handleExportCsv = (eventTitle: string, finalizedList: Applicant[]) => {
    if (finalizedList.length === 0) {
      alert('No accepted volunteers to export yet.')
      return
    }

    const headers = ['Volunteer Name', 'Email', 'Phone', 'Skills', 'Attendance Status', 'Attendance Timestamp', 'Applied Date']
    const rows = finalizedList.map((v) => {
      const isPres = Boolean(attendanceMap[v.id] || v.attendance === 'present')
      return [
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.email}"`,
        `"${v.phone || ''}"`,
        `"${v.skills.join(', ')}"`,
        `"${isPres ? 'PRESENT' : 'ABSENT / UNMARKED'}"`,
        `"${isPres && v.attendanceMarkedAt ? formatAttendanceTime(v.attendanceMarkedAt) : '-'}"`,
        `"${v.appliedAt}"`,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_volunteers_attendance.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Roster
  const handlePrintRoster = (op: Opportunity, finalizedList: Applicant[]) => {
    if (finalizedList.length === 0) {
      alert('No accepted volunteers to print.')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Volunteer Attendance Check-in Sheet - ${op.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111827; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .meta { font-size: 13px; color: #4b5563; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: 700; }
          .present { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${op.title}</div>
          <div class="meta">
            Organization: <strong>${op.organization}</strong> | 
            Event Manager: <strong>${session.name} (${session.employeeId})</strong><br />
            Date: <strong>${op.date}</strong> | Time: <strong>${op.time}</strong> | Venue: <strong>${op.address || op.location}</strong>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Volunteer Name</th>
              <th>Contact Phone</th>
              <th>Email</th>
              <th>Attendance Status & Time</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            ${finalizedList
              .map(
                (v, idx) => {
                  const isPres = Boolean(attendanceMap[v.id] || v.attendance === 'present')
                  return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${v.name}</strong></td>
                  <td>${v.phone || 'N/A'}</td>
                  <td>${v.email}</td>
                  <td class="${isPres ? 'present' : ''}">
                    ${isPres ? `✓ PRESENT ${v.attendanceMarkedAt ? `(${formatAttendanceTime(v.attendanceMarkedAt)})` : ''}` : 'UNMARKED'}
                  </td>
                  <td>__________________</td>
                </tr>
              `
                }
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  // Copy Contacts
  const handleCopyContacts = (finalizedList: Applicant[]) => {
    const phones = finalizedList.map((v) => v.phone).filter(Boolean).join(', ')
    if (!phones) {
      alert('No phone numbers found for finalized volunteers.')
      return
    }
    navigator.clipboard.writeText(phones)
    alert(`Copied ${finalizedList.length} volunteer phone numbers to clipboard!`)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-16">
      
      {/* ── Top Header / Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                  {session.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 text-xs font-mono font-black border border-indigo-200 dark:border-indigo-800">
                  {session.employeeId}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                {session.roleTitle || 'Event Manager'} • {session.organizationName || 'TogetherNow'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <form action={logoutEventManagerAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-colors border-none cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-indigo-100 text-xs font-extrabold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Event Operations Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Welcome back, {session.name.split(' ')[0]}! 📋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 m-0 leading-relaxed">
              You are signed in under Employee Code <strong>{session.employeeId}</strong>. Review your assigned drives below, manage volunteer applicants, and mark live attendance at the venue.
            </p>
          </div>
        </div>

        {/* ── Overview Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                {activeEvents.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active / Upcoming Drives</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                {applicants.filter((a) => a.status === 'accepted').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confirmed Volunteers</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                {Object.values(attendanceMap).filter(Boolean).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Volunteers Checked In</div>
            </div>
          </div>
        </div>

        {/* ── Events Section with Tabs ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white m-0">
                Events Assigned to You
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                Drives where your Employee ID ({session.employeeId}) is registered as Event Manager
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Active &amp; Upcoming ({activeEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${
                  activeTab === 'past'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Past &amp; Completed ({pastEvents.length})
              </button>
            </div>
          </div>

          {/* Event Cards Grid */}
          {((activeTab === 'active' ? activeEvents : pastEvents).length === 0) ? (
            <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 m-0">
                No {activeTab === 'active' ? 'Active' : 'Past'} Events Assigned
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                When your organization assigns your Employee Code <strong>{session.employeeId}</strong> to an event, it will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(activeTab === 'active' ? activeEvents : pastEvents).map((op) => {
                const evApplicants = applicants.filter((a) => a.eventId === op.id)
                const evConfirmed = evApplicants.filter((a) => a.status === 'accepted').length
                const evPresent = evApplicants.filter(
                  (a) => a.status === 'accepted' && (attendanceMap[a.id] || a.attendance === 'present')
                ).length

                // Other event managers assigned to this event
                const otherManagers = Array.isArray(op.assignedEmployeeIds)
                  ? op.assignedEmployeeIds.filter((c) => c.toUpperCase() !== session.employeeId.toUpperCase())
                  : []

                return (
                  <div
                    key={op.id}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/90 transition-all shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
                          {op.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500 font-bold">
                            {evPresent} / {evConfirmed} Checked In
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-extrabold text-gray-900 dark:text-white m-0 leading-snug">
                        {op.title}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{op.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{op.time}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{op.address || op.location}</span>
                        </div>
                      </div>

                      {/* Assigned Managers Tag list */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-gray-500">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Managers:</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-mono font-bold text-[10px]">
                          {session.employeeId} (You)
                        </span>
                        {otherManagers.map((code) => {
                          const matched = (op.eventManagers as any[])?.find?.(
                            (m: any) => m.employeeId?.toUpperCase() === code.toUpperCase()
                          )
                          return (
                            <span
                              key={code}
                              className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono font-bold text-[10px]"
                              title={matched?.name ? `${matched.name} (${matched.phone || ''})` : undefined}
                            >
                              {matched?.name ? `${matched.name} (${code})` : code}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-500">
                        <strong>{evApplicants.length}</strong> Total Candidates
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setManagingEvent(op)
                          setCandidateFilter('all')
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Manage Volunteers &amp; Attendance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ============================================================ */}
      {/* VOLUNTEER REVIEW & ATTENDANCE MANAGEMENT MODAL */}
      {/* ============================================================ */}
      {managingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col">
            
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                    {managingEvent.category}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    In-Charge: <strong>{managingEvent.managerName || session.name}</strong> ({managingEvent.managerPhone || session.phone || '9768202546'}) • Review applicants with <strong>Tick (✓)</strong> or <strong>Cross (✖)</strong>.
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white m-0 tracking-tight">
                  {managingEvent.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setManagingEvent(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Event Info Card matching reference UI */}
            <div className="my-3 p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-200 font-semibold">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Date: <strong>{managingEvent.date}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Time: <strong>{managingEvent.time}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>In-Charge: <strong>{managingEvent.managerName || session.name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Venue: <strong>{managingEvent.address || managingEvent.location}</strong></span>
                </div>
              </div>

              <a
                href={getGoogleMapsUrl(managingEvent.address || managingEvent.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors no-underline"
              >
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                <span>Open on Maps</span>
                <ExternalLink className="w-3 h-3 text-indigo-500" />
              </a>
            </div>

            {/* Event Status Warnings if Completed or Cancelled */}
            {managingEvent.isCompleted && (
              <div className="mb-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">This event has been marked as Completed</span>
                </div>
                {managingEvent.completedAt && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    Concluded on {new Date(managingEvent.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}

            {managingEvent.isCancelled && (
              <div className="mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">This event has been Cancelled.</span>
                  {managingEvent.cancelReason && (
                    <span className="ml-1 text-rose-700 dark:text-rose-300">
                      Reason: &quot;{managingEvent.cancelReason}&quot;
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Attendance & Stats Highlights Bar */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 my-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                    Live Attendance: {presentCount} of {acceptedCount} Confirmed Volunteers Present
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 m-0">
                    Click <strong>&quot;Mark as Present&quot;</strong> in front of each volunteer&apos;s name to clock them in.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleExportCsv(managingEvent.title, currentEventCandidates.filter((c) => c.status === 'accepted'))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-indigo-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintRoster(managingEvent, currentEventCandidates.filter((c) => c.status === 'accepted'))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-indigo-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Roster</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: 'all', label: `All Candidates (${currentEventCandidates.length})` },
                  { key: 'accepted', label: `Confirmed (${acceptedCount})` },
                  { key: 'present', label: `Present (${presentCount})` },
                  { key: 'pending', label: `Pending (${pendingCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCandidateFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                      candidateFilter === tab.key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search name, skill, phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Candidates List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                    No candidates found for this filter
                  </p>
                </div>
              ) : (
                filteredCandidates.map((cand) => {
                  const isMarkedPresent = Boolean(attendanceMap[cand.id] || cand.attendance === 'present')
                  const avatarSrc = getVolunteerAvatarUrl(cand)
                  const initials = cand.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()

                  // Calculate candidate's overall volunteer hours and highest earned badge
                  const candApps = applicants.filter(
                    (a) => (a.volunteerId && a.volunteerId === cand.volunteerId) || (a.email && cand.email && a.email.toLowerCase() === cand.email.toLowerCase())
                  )
                  const candHours = Math.max(candApps.filter((a) => a.status === 'accepted').length * 4, cand.status === 'accepted' ? 4 : 1)
                  const candBadge = getHighestBadge(candHours)

                  return (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isMarkedPresent
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-700/60 shadow-xs'
                          : cand.status === 'accepted'
                          ? 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-xs'
                          : cand.status === 'declined'
                          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/60 opacity-70'
                          : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/60'
                      }`}
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Volunteer Photo Icon */}
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-400/30 dark:ring-indigo-500/40 shadow-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt={cand.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          {isMarkedPresent && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-xs"
                              title="Marked Present"
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-extrabold text-sm text-gray-900 dark:text-white m-0 truncate">
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

                            {/* Volunteer Categorized Milestone Badge */}
                            {candBadge && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                                title={`${candBadge.category} Tier • ${candBadge.name} (${candHours} Total Volunteered Hours)`}
                              >
                                <span>{candBadge.glyph}</span>
                                <span>{candBadge.name}</span>
                                <span className="text-[9px] opacity-75 font-semibold">({candHours}h)</span>
                              </span>
                            )}

                            {isMarkedPresent && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                                  ✓ Present
                                </span>
                                {cand.attendanceMarkedAt && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                                    <Clock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span>Checked in {formatAttendanceTime(cand.attendanceMarkedAt)}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-indigo-500" />
                              <a href={`mailto:${cand.email}`} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 underline">
                                {cand.email}
                              </a>
                            </span>
                            {cand.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <a href={`tel:${cand.phone}`} className="text-gray-600 dark:text-gray-300 hover:text-emerald-600">
                                  {cand.phone}
                                </a>
                              </span>
                            )}
                          </div>

                          {cand.skills && cand.skills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {cand.skills.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (Attendance & Approvals) */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Attendance Button for Accepted Volunteers */}
                        {cand.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(cand)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5 ${
                              isMarkedPresent
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isMarkedPresent ? 'Marked Present (Click to Undo)' : 'Mark as Present'}</span>
                          </button>
                        )}

                        {/* Accept / Decline controls for pending applicants */}
                        {cand.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCandidateStatus(cand.id, 'accepted')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Accept volunteer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCandidateStatus(cand.id, 'declined')}
                              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center gap-1"
                              title="Decline volunteer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {cand.status === 'declined' && (
                          <button
                            type="button"
                            onClick={() => handleCandidateStatus(cand.id, 'accepted')}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold border-none cursor-pointer"
                          >
                            Reconsider &amp; Accept
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer with Stop Applications, Mark as Completed, Cancel Event & Done */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* 1. Stop / Reopen Applications */}
                {!managingEvent.isCompleted && !managingEvent.isCancelled && (
                  managingEvent.isApplicationsClosed ? (
                    <button
                      type="button"
                      onClick={() => handleToggleApplications(managingEvent, false)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Reopen Applications for volunteers"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Reopen Applications</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmCloseAppsEvent(managingEvent)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Permanently stop applications and lock finalized roster"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Stop Applications</span>
                    </button>
                  )
                )}

                {/* 2. Mark as Completed */}
                {managingEvent.isCompleted ? (
                  <span className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ Completed</span>
                  </span>
                ) : !managingEvent.isCancelled ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCompleteEvent(managingEvent)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Mark this event drive as completed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                ) : null}

                {/* 3. Cancel Event */}
                {managingEvent.isCancelled ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreEvent(managingEvent.id)}
                    className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Restore event from cancelled state"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Event</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCancellingEvent(managingEvent)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Cancel event and notify volunteers"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Event</span>
                  </button>
                )}
              </div>

              {/* Right Side: Done button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManagingEvent(null)}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs border-none cursor-pointer shadow-sm transition-all"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. STOP APPLICATIONS CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {confirmCloseAppsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                  Permanently Stop Applications?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                  {confirmCloseAppsEvent.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed m-0">
              This will stop accepting any new volunteer registrations for this event. 
              The current list of accepted volunteers will be locked as the finalized team roster.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmCloseAppsEvent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const ev = confirmCloseAppsEvent
                  setConfirmCloseAppsEvent(null)
                  handleToggleApplications(ev, true)
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Yes, Stop Applications</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MARK AS COMPLETED CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {confirmCompleteEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                  Mark Drive as Completed?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                  {confirmCompleteEvent.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed m-0">
              Are you sure you want to conclude this event? It will be archived under Past &amp; Completed drives and attendance records will be saved.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmCompleteEvent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const ev = confirmCompleteEvent
                  setConfirmCompleteEvent(null)
                  handleExecuteComplete(ev)
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Yes, Mark as Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CANCEL EVENT CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {cancellingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                  Cancel Drive &amp; Move to Bucket?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                  {cancellingEvent.title}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Reason for Cancellation (optional):
              </label>
              <textarea
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="e.g. Inclement weather, venue issue, rescheduled..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setCancellingEvent(null)
                  setCancelReasonInput('')
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={() => {
                  const ev = cancellingEvent
                  const reason = cancelReasonInput.trim() || 'Cancelled by Event Manager'
                  setCancellingEvent(null)
                  setCancelReasonInput('')
                  handleExecuteCancel(ev, reason)
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
