'use client'

import React, { useState, useEffect } from 'react'
import OpportunitiesFeed, { OpportunitiesFeedRef, Applicant, Opportunity, INITIAL_OPPORTUNITIES } from '@/components/ui/OpportunitiesFeed'
import { fetchOpportunitiesAction, fetchUserApplicationsAction } from '@/app/actions/opportunities'
import { createClient } from '@/lib/supabase/client'
import { 
  Award, 
  Clock, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Bell, 
  Users, 
  MapPin, 
  Calendar, 
  Check, 
  Phone, 
  UserCheck, 
  Building2, 
  X, 
  Info,
  ChevronRight,
  ExternalLink,
  Navigation,
  Ban,
  Star
} from 'lucide-react'
import { getStoredNotifications, AppNotification } from '@/lib/notifications'
import OrganizationAboutModal from '@/components/ui/OrganizationAboutModal'
import OrganizationRatingModal from '@/components/ui/OrganizationRatingModal'
import { getOrgRatingSummary, hasVolunteerReviewedEvent } from '@/lib/ratings'

interface VolunteerDashboardProps {
  opportunitiesRef?: React.RefObject<OpportunitiesFeedRef | null>
  userId?: string
  userEmail?: string
  userName?: string
  profileStatus?: {
    isNewUser: boolean
    completionPercentage: number
    role: string
    missingFields?: string[]
  }
}

const APPLICANTS_STORAGE_KEY = 'togethernow_event_applicants_v1'
const OPPORTUNITIES_STORAGE_KEY = 'togethernow_posted_opportunities'

function getGoogleMapsUrl(addressOrLocation: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrLocation)}`
}

export default function VolunteerDashboard({ opportunitiesRef, userId, userEmail, userName, profileStatus }: VolunteerDashboardProps) {
  // Scope ALL localStorage keys by userId so data is never shared between accounts
  const userScopeId = userId || userEmail || 'guest'
  const APPLICANTS_KEY = `togethernow_event_applicants_v1_${userScopeId}`
  const OPPORTUNITIES_KEY = `togethernow_posted_opportunities`  // opportunities are global (org posts them)
  const NOTIFICATIONS_KEY = `togethernow_notifications_v1_${userScopeId}`
  const [userApplications, setUserApplications] = useState<Applicant[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null)
  const [selectedOrgForAbout, setSelectedOrgForAbout] = useState<string | null>(null)
  const [ratingEvent, setRatingEvent] = useState<{ op: Opportunity; app: Applicant } | null>(null)
  const [reviewedEventsMap, setReviewedEventsMap] = useState<Record<string, boolean>>({})

  const refreshData = () => {
    try {
      let apps: Applicant[] = []

      // 1. Read from user-scoped storage key
      const localApps = localStorage.getItem(APPLICANTS_KEY)
      if (localApps) {
        try {
          const parsed = JSON.parse(localApps)
          if (Array.isArray(parsed)) {
            apps = parsed
          }
        } catch {}
      }

      // 2. Also check global storage key for this specific volunteer's applications
      // (in case an org approved/declined an applicant in the global storage or another tab updated it)
      const globalAppsRaw = localStorage.getItem(APPLICANTS_STORAGE_KEY)
      if (globalAppsRaw) {
        try {
          const parsedGlobal: Applicant[] = JSON.parse(globalAppsRaw)
          if (Array.isArray(parsedGlobal)) {
            const myGlobalApps = parsedGlobal.filter((a) => {
              if (userId && a.volunteerId && a.volunteerId === userId) return true
              if (userEmail && a.email && a.email.trim().toLowerCase() === userEmail.trim().toLowerCase()) return true
              return false
            })
            const mergedMap = new Map<string, Applicant>()
            apps.forEach((a) => mergedMap.set(a.id, a))
            myGlobalApps.forEach((a) => mergedMap.set(a.id, a))
            apps = Array.from(mergedMap.values())
          }
        } catch {}
      }

      // 3. Strictly filter so ONLY this volunteer's applications are ever displayed
      const myApps = apps.filter((a) => {
        if (userId && a.volunteerId && a.volunteerId === userId) return true
        if (userEmail && a.email && a.email.trim().toLowerCase() === userEmail.trim().toLowerCase()) return true
        return false
      })
      setUserApplications(myApps)
      try {
        localStorage.setItem(APPLICANTS_KEY, JSON.stringify(myApps))
      } catch {}

      const localOps = localStorage.getItem(OPPORTUNITIES_KEY)
      if (localOps) {
        const parsedOps: Opportunity[] = JSON.parse(localOps)
        if (Array.isArray(parsedOps) && parsedOps.length > 0) {
          setOpportunities(parsedOps)
        }
      }

      // Read notifications strictly for this volunteer
      const notifs = getStoredNotifications('volunteer', NOTIFICATIONS_KEY, { userId, userEmail })
      const globalNotifs = getStoredNotifications('volunteer', undefined, { userId, userEmail })
      const notifMap = new Map<string, AppNotification>()
      notifs.forEach((n) => notifMap.set(n.id, n))
      globalNotifs.forEach((n) => {
        if (n.targetUserId || n.targetEmail) {
          const match = (userId && n.targetUserId === userId) || (userEmail && n.targetEmail?.toLowerCase() === userEmail.toLowerCase())
          if (match) notifMap.set(n.id, n)
        } else if (n.targetRole === 'volunteer' && n.type === 'general') {
          notifMap.set(n.id, n)
        }
      })
      setNotifications(Array.from(notifMap.values()))
    } catch (e) {
      console.warn('Error reading dashboard state:', e)
    }
  }

  const syncWithDb = async () => {
    try {
      // 1. Fetch live opportunities so seat counts (spotsLeft, alreadyRegistered) are strictly synchronized
      const dbOps = await fetchOpportunitiesAction()
      if (dbOps && dbOps.length > 0) {
        setOpportunities((prev) => {
          const map = new Map<string, Opportunity>()
          prev.forEach((op) => map.set(op.id, op))
          dbOps.forEach((dbOp) => {
            const existing = map.get(dbOp.id)
            if (existing) {
              map.set(dbOp.id, {
                ...existing,
                ...dbOp,
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
            localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }

      // 2. Fetch live applications strictly for this volunteer from Supabase DB
      const dbUserApps = await fetchUserApplicationsAction(userId, userEmail)
      if (dbUserApps && dbUserApps.length > 0) {
        setUserApplications((prev) => {
          const map = new Map<string, Applicant>()
          // Preserve local applications
          prev.forEach((a) => map.set(a.id, a))
          // Overlay DB applications (DB status takes authority)
          dbUserApps.forEach((a) => {
            map.set(a.id, a as Applicant)
          })
          const merged = Array.from(map.values())
          try {
            localStorage.setItem(APPLICANTS_KEY, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }
    } catch (err) {
      console.warn('Notice syncing volunteer dashboard with DB:', err)
    }
  }

  useEffect(() => {
    refreshData()
    syncWithDb()

    const handleFocusSync = () => {
      refreshData()
      syncWithDb()
    }

    window.addEventListener('togethernow_new_notification', handleFocusSync)
    window.addEventListener('togethernow_opportunities_updated', handleFocusSync)
    window.addEventListener('storage', handleFocusSync)
    window.addEventListener('focus', handleFocusSync)

    // Realtime Supabase postgres listener for live seat updates & application approvals
    const supabase = createClient()
    const channel = supabase
      .channel(`vol-dashboard-sync-${userScopeId}`)
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
      window.removeEventListener('togethernow_new_notification', handleFocusSync)
      window.removeEventListener('togethernow_opportunities_updated', handleFocusSync)
      window.removeEventListener('storage', handleFocusSync)
      window.removeEventListener('focus', handleFocusSync)
      supabase.removeChannel(channel)
      clearInterval(pollTimer)
    }
  }, [userScopeId])

  const approvedDrives = userApplications.filter((a) => a.status === 'accepted')
  const pendingDrives = userApplications.filter((a) => a.status === 'pending')
  const totalHours = approvedDrives.length * 4
  const badgeCount = approvedDrives.length > 0 ? Math.min(5, approvedDrives.length) : 0

  const latestApprovalNotification = notifications.find((n) =>
    n.type === 'approval' && (
      (userId && n.targetUserId === userId) ||
      (userEmail && n.targetEmail?.toLowerCase() === userEmail.toLowerCase()) ||
      (!n.targetUserId && !n.targetEmail && userApplications.some((a) => a.eventId === n.eventId && a.status === 'accepted'))
    )
  )

  return (
    <div className="space-y-8">
      {/* Latest Approval Notification Banner (if recent approval occurred) */}
      {latestApprovalNotification && latestApprovalNotification.unread && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 border border-emerald-400/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base m-0 tracking-tight">
                  {latestApprovalNotification.title}
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Spot Confirmed
                </span>
              </div>
              <p className="text-xs text-emerald-100 m-0 mt-0.5 leading-relaxed font-medium">
                {latestApprovalNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Impact Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {totalHours} hrs
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Volunteered Hours</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {badgeCount} Badge{badgeCount !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Impact Milestones</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center font-bold text-xl shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {approvedDrives.length} Drive{approvedDrives.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approved & Attending</div>
          </div>
        </div>
      </div>

      {/* Volunteer Applied Events & Live Spots Status Tracker */}
      {userApplications.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                  Your Event Applications & Live Remaining Spots
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                  Click any event card to view the Person in Charge coordinator, venue address, and live maps directions.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
              {userApplications.length} Applied Drive{userApplications.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {userApplications.map((app) => {
              const matchedOp = opportunities.find((o) => o.id === app.eventId) || INITIAL_OPPORTUNITIES.find((o) => o.id === app.eventId || o.title.toLowerCase() === app.eventTitle?.toLowerCase())
              const totalRequired = matchedOp?.totalRequired ?? (matchedOp?.spotsLeft ? matchedOp.spotsLeft + (matchedOp.alreadyRegistered ?? 0) : 20)
              const alreadyRegistered = matchedOp?.alreadyRegistered ?? (app.status === 'accepted' ? 1 : 0)
              const spotsLeft = matchedOp ? matchedOp.spotsLeft : Math.max(0, totalRequired - alreadyRegistered)
              const percentFilled = Math.min(100, Math.round((alreadyRegistered / Math.max(1, totalRequired)) * 100))
              const orgName = (matchedOp?.organization && matchedOp.organization !== 'Organization')
                ? matchedOp.organization
                : 'Community Non-Profit Organization'
              // Manager name is independent of org name — never echo the org name here
              const GENERIC_MANAGER = ['Organization', 'Event Coordinator', 'Drive Coordinator', 'Community Organization', 'Community Non-Profit Organization']
              const managerName = (matchedOp?.managerName && !GENERIC_MANAGER.includes(matchedOp.managerName))
                ? matchedOp.managerName
                : 'Event Coordinator'
              const managerPhone = matchedOp?.managerPhone || '+91 98201 44521'
              const address = matchedOp?.address || matchedOp?.location || 'Marine Drive Coastal Stretch, Mumbai 400020'
              const isRemote = Boolean(matchedOp?.isRemote)

              return (
                <div
                  key={app.id}
                  onClick={() => matchedOp && setViewingOpportunity(matchedOp)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between cursor-pointer hover:shadow-md ${
                    app.status === 'accepted'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/70 shadow-xs hover:border-emerald-500'
                      : app.status === 'declined'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/60'
                      : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Event Title & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        {matchedOp?.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {matchedOp.category}
                          </span>
                        )}
                        <h5 className="font-extrabold text-sm text-gray-900 dark:text-white m-0 line-clamp-1">
                          {app.eventTitle || matchedOp?.title || 'Volunteer Event'}
                        </h5>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                          <span>By <strong>{orgName}</strong></span>
                          <span>• Applied {app.appliedAt}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 shadow-xs ${
                          matchedOp?.isCancelled
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                            : matchedOp?.isCompleted
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/50 shadow-md'
                            : app.status === 'accepted'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/40'
                            : app.status === 'declined'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200'
                        }`}
                      >
                        {matchedOp?.isCancelled ? (
                          <>
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Event Cancelled 🚫</span>
                          </>
                        ) : matchedOp?.isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-300 stroke-[3]" />
                            <span>Completed 🎉</span>
                          </>
                        ) : app.status === 'accepted' ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Approved (✔)</span>
                          </>
                        ) : app.status === 'declined' ? (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-300" />
                            <span>Declined (✖)</span>
                          </>
                        ) : (
                          <>
                            <Clock3 className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                            <span>Under Review ⏳</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Organization, Person In Charge & Venue Address Details Box */}
                    <div className="bg-white/95 dark:bg-gray-800/95 p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/70 space-y-2.5 text-xs shadow-xs">
                      
                      {/* 1. Organization Name Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Organization:</span>
                          <span className="font-extrabold text-gray-900 dark:text-white truncate">{orgName}</span>
                          <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                            Verified
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrgForAbout(orgName)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-700 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800/60 transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Know More about this organization, their mission, work & photos"
                        >
                          <Info className="w-3 h-3" />
                          <span>Know More</span>
                        </button>
                      </div>

                      {/* 2. Event Manager / In-Charge & Phone Number Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-center gap-1.5 truncate">
                          <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Event Manager:</span>
                          <span className="font-extrabold text-gray-900 dark:text-white truncate">{managerName}</span>
                        </div>

                        {managerPhone ? (
                          <a
                            href={`tel:${managerPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-700 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800/60 transition-all text-decoration-none shrink-0 shadow-2xs"
                            title={`Call Event Manager (${managerName})`}
                          >
                            <Phone className="w-3 h-3" />
                            <span>{managerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Phone on file</span>
                        )}
                      </div>

                      {/* 3. Venue Address & Open on Maps Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-start gap-1.5 text-[11px] text-gray-700 dark:text-gray-300 truncate">
                          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <span className="text-gray-500 dark:text-gray-400 text-[11px] font-medium mr-1">Address:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{address}</span>
                          </div>
                        </div>

                        {!isRemote && (
                          <a
                            href={getGoogleMapsUrl(address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-700 transition-all text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/60 shrink-0 text-decoration-none shadow-2xs"
                            title="Open in Google Maps"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Open Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                    </div>

                    {/* Live Remaining Spots Capacity Box */}
                    <div className="bg-white/70 dark:bg-gray-800/70 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>{alreadyRegistered} / {totalRequired} Registered</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            matchedOp?.isCancelled
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : spotsLeft === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : spotsLeft <= 3
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {matchedOp?.isCancelled ? 'Cancelled' : spotsLeft === 0 ? '0 spots left (Full)' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            matchedOp?.isCancelled
                              ? 'bg-rose-500'
                              : spotsLeft === 0
                              ? 'bg-rose-500'
                              : spotsLeft <= 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Status Message */}
                  <div className="pt-1">
                    {matchedOp?.isCancelled ? (
                      <div className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold bg-rose-100/70 dark:bg-rose-950/70 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5">
                        <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>This event was cancelled by the organization ({matchedOp.cancelReason || 'Schedule adjustment'}).</span>
                      </div>
                    ) : app.status === 'accepted' ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between bg-emerald-100/70 dark:bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Spot confirmed! Contact <strong>{managerName}</strong> • Click for map</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>

                        {/* Rate Organization Action Button */}
                        <div className="pt-1">
                          {(app.eventId && reviewedEventsMap[app.eventId]) || (app.eventId && hasVolunteerReviewedEvent(userEmail || '', app.eventId)) ? (
                            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200/80 dark:border-amber-900/60">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>⭐ Rating & Review Submitted</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setRatingEvent({
                                  op: matchedOp || {
                                    id: app.eventId || 'event-id',
                                    title: app.eventTitle || 'Volunteer Event',
                                    organization: 'Organizing Foundation',
                                    category: 'Community',
                                    location: 'Mumbai',
                                    isRemote: false,
                                    date: 'Recent',
                                    time: 'Day',
                                    spotsLeft: 0,
                                    skillsNeeded: [],
                                    description: '',
                                  },
                                  app,
                                })
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              <span>⭐ Rate & Review {matchedOp?.organization || 'Organization'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : app.status === 'declined' ? (
                      <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium bg-rose-100/50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200/50 dark:border-rose-800/40">
                        Application not accepted for this drive. Explore other open events below!
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium bg-amber-100/50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Under review. {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} open. Click for details</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EVENT & PERSON IN CHARGE DETAILS MODAL WITH MAPS */}
      {/* ============================================================ */}
      {viewingOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {viewingOpportunity.category}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0">
                  {viewingOpportunity.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-white">{viewingOpportunity.organization}</span>
                  </div>
                  {viewingOpportunity.organization && (
                    <button
                      type="button"
                      onClick={() => setSelectedOrgForAbout(viewingOpportunity.organization)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-700 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800/60 transition-all cursor-pointer shadow-2xs"
                    >
                      <Info className="w-3 h-3" />
                      <span>Know More</span>
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOpportunity(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Manager / In-Charge Box */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Person in Charge / Event Manager
                    </span>
                    <h5 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                      {(viewingOpportunity.managerName && viewingOpportunity.managerName !== viewingOpportunity.organization)
                        ? viewingOpportunity.managerName
                        : 'Event Coordinator'}
                    </h5>
                  </div>
                </div>

                {viewingOpportunity.managerPhone && (
                  <a
                    href={`tel:${viewingOpportunity.managerPhone}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm text-decoration-none transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Manager</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Mobile:</strong> {viewingOpportunity.managerPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Org:</strong> {viewingOpportunity.organization}</span>
                </div>
              </div>
            </div>

            {/* Detailed Venue Address & Map Action Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Event Venue & Address
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white m-0 mt-0.5 leading-relaxed">
                      {viewingOpportunity.address || viewingOpportunity.location}
                    </p>
                  </div>
                </div>

                {!viewingOpportunity.isRemote && (
                  <a
                    href={getGoogleMapsUrl(viewingOpportunity.address || viewingOpportunity.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm text-decoration-none transition-all shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open on Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Embedded Google Map Preview */}
              {!viewingOpportunity.isRemote && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative bg-gray-200 dark:bg-gray-800">
                  <iframe
                    title="Venue Location Map"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      viewingOpportunity.address || viewingOpportunity.location
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{viewingOpportunity.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{viewingOpportunity.time}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <h6 className="font-bold text-gray-900 dark:text-white m-0">Event Overview</h6>
              <p className="text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                {viewingOpportunity.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              {!viewingOpportunity.isRemote ? (
                <a
                  href={getGoogleMapsUrl(viewingOpportunity.address || viewingOpportunity.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Live Turn-by-Turn Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Virtual / Remote Event</span>
              )}

              <button
                type="button"
                onClick={() => setViewingOpportunity(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-xs border-none cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Opportunities & Events Feed */}
      <OpportunitiesFeed
        ref={opportunitiesRef}
        userRole="volunteer"
        userId={userId}
        userEmail={userEmail}
        userProfileStatus={profileStatus}
      />

      {/* Organization About Us & Trust Modal (Know More) */}
      {selectedOrgForAbout && (
        <OrganizationAboutModal
          isOpen={Boolean(selectedOrgForAbout)}
          onClose={() => setSelectedOrgForAbout(null)}
          organizationName={selectedOrgForAbout}
        />
      )}

      {/* Volunteer Rating Modal */}
      {ratingEvent && (
        <OrganizationRatingModal
          isOpen={Boolean(ratingEvent)}
          onClose={() => setRatingEvent(null)}
          organizationName={ratingEvent.op.organization || 'Community Organization'}
          eventId={ratingEvent.app.eventId}
          eventTitle={ratingEvent.op.title || ratingEvent.app.eventTitle}
          volunteerName={userName || 'Volunteer'}
          volunteerEmail={userEmail || 'volunteer@togethernow.org'}
          onReviewSubmitted={() => {
            if (ratingEvent && ratingEvent.app.eventId) {
              setReviewedEventsMap((prev) => ({ ...prev, [ratingEvent.app.eventId!]: true }))
            }
          }}
        />
      )}
    </div>
  )
}
