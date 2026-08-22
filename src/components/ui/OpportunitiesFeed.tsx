'use client'

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2, 
  Users, 
  Bookmark, 
  CheckCircle2, 
  Plus, 
  X, 
  Sparkles, 
  Filter,
  Check,
  UserCheck,
  UserX,
  Clock3,
  AlertCircle
} from 'lucide-react'
import { createOpportunityAction, fetchOpportunitiesAction } from '@/app/actions/opportunities'
import { pushNotification } from '@/lib/notifications'

export interface Opportunity {
  id: string
  title: string
  organization: string
  organizationId?: string
  orgRole?: string
  isVerifiedOrg?: boolean
  orgStatus?: 'approved' | 'pending' | 'rejected'
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  location: string
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  totalRequired?: number
  alreadyRegistered?: number
  skillsNeeded: string[]
  description: string
  bookmarked?: boolean
  applied?: boolean
}

export interface Applicant {
  id: string
  eventId?: string
  eventTitle?: string
  name: string
  email: string
  skills: string[]
  status: 'pending' | 'accepted' | 'declined'
  appliedAt: string
}

function formatTime12H(time24: string): string {
  if (!time24) return ''
  const parts = time24.split(':')
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1] || '00'
  if (isNaN(hours)) return time24
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'Upcoming'
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (year && month && day) {
      const d = new Date(year, month - 1, day)
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return dateStr
  } catch {
    return dateStr
  }
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Community Beach & Park Cleanup',
    organization: 'Ocean & Earth Care Alliance',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Environment',
    location: 'Coastal Park, Marine Drive',
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

export interface OpportunitiesFeedRef {
  focusSearch: () => void
  openCreateModal: () => void
}

interface OpportunitiesFeedProps {
  userRole?: string
}

const CATEGORIES = ['All', 'Environment', 'Education', 'Health', 'Community', 'Tech', 'Remote']
const APPLICANTS_STORAGE_KEY = 'togethernow_event_applicants_v1'

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-1',
    eventId: '1',
    eventTitle: 'Community Beach & Park Cleanup',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    skills: ['Teamwork', 'Communication', 'Eco Awareness'],
    status: 'pending',
    appliedAt: '2 hours ago',
  },
  {
    id: 'app-2',
    eventId: '2',
    eventTitle: 'Youth Coding & Robotics Workshop Mentor',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.org',
    skills: ['Python', 'Robotics', 'Mentorship'],
    status: 'accepted',
    appliedAt: '1 day ago',
  },
  {
    id: 'app-3',
    eventId: '1',
    eventTitle: 'Community Beach & Park Cleanup',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    skills: ['Logistics', 'First Aid'],
    status: 'pending',
    appliedAt: '3 hours ago',
  },
]

const OpportunitiesFeed = forwardRef<OpportunitiesFeedRef, OpportunitiesFeedProps>(
  ({ userRole = 'volunteer' }, ref) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [applySuccessModal, setApplySuccessModal] = useState<string | null>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)

    // Form state for creating new opportunity with calendar date & clock time pickers
    const [newTitle, setNewTitle] = useState('')
    const [newCategory, setNewCategory] = useState<Opportunity['category']>('Community')
    const [newLocation, setNewLocation] = useState('')
    const [newIsRemote, setNewIsRemote] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [newStartTime, setNewStartTime] = useState('09:00')
    const [newEndTime, setNewEndTime] = useState('13:00')
    const [newTotalRequired, setNewTotalRequired] = useState(15)
    const [newAlreadyRegistered, setNewAlreadyRegistered] = useState(0)
    const [newSkills, setNewSkills] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const STORAGE_KEY = 'togethernow_posted_opportunities'

    const [managingEvent, setManagingEvent] = useState<Opportunity | null>(null)
    const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS)

    // Load persisted opportunities & applicants on mount
    useEffect(() => {
      // 1. Immediately read from localStorage
      try {
        const localSaved = localStorage.getItem(STORAGE_KEY)
        if (localSaved) {
          const parsed: Opportunity[] = JSON.parse(localSaved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOpportunities((prev) => {
              const idMap = new Map<string, Opportunity>()
              parsed.forEach((op) => idMap.set(op.id, op))
              prev.forEach((op) => {
                if (!idMap.has(op.id)) idMap.set(op.id, op)
              })
              return Array.from(idMap.values())
            })
          }
        }

        const localApps = localStorage.getItem(APPLICANTS_STORAGE_KEY)
        if (localApps) {
          const parsedApps: Applicant[] = JSON.parse(localApps)
          if (Array.isArray(parsedApps) && parsedApps.length > 0) {
            setApplicants(parsedApps)
          }
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e)
      }

      // 2. Fetch from Supabase DB and merge
      async function loadDbOps() {
        try {
          const dbOps = await fetchOpportunitiesAction()
          if (dbOps && dbOps.length > 0) {
            setOpportunities((prev) => {
              const idMap = new Map<string, Opportunity>()
              dbOps.forEach((op) => idMap.set(op.id, op))
              prev.forEach((op) => {
                if (!idMap.has(op.id)) idMap.set(op.id, op)
              })
              return Array.from(idMap.values())
            })

            try {
              const localSaved = localStorage.getItem(STORAGE_KEY)
              const existing: Opportunity[] = localSaved ? JSON.parse(localSaved) : []
              const combined = [...dbOps, ...existing]
              const unique = Array.from(new Map(combined.map((o) => [o.id, o])).values())
              localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
            } catch {}
          }
        } catch (err) {
          console.warn('Error fetching opportunities from DB:', err)
        }
      }
      loadDbOps()
    }, [])

    const handleApplicantStatus = (applicantId: string, status: 'accepted' | 'declined', event?: Opportunity) => {
      let targetApp: Applicant | undefined
      setApplicants((prev) => {
        const updated = prev.map((a) => {
          if (a.id === applicantId) {
            targetApp = a
            return { ...a, status }
          }
          return a
        })
        try {
          localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })

      const ev = event || managingEvent
      if (ev) {
        // If accepted, update capacity numbers
        if (status === 'accepted') {
          setOpportunities((prev) => {
            const updated = prev.map((o) => {
              if (o.id === ev.id) {
                const currentReg = o.alreadyRegistered ?? 0
                const totalReq = o.totalRequired ?? (o.spotsLeft + currentReg)
                const newReg = currentReg + 1
                return {
                  ...o,
                  alreadyRegistered: newReg,
                  spotsLeft: Math.max(0, totalReq - newReg),
                }
              }
              return o
            })
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            } catch {}
            return updated
          })
        }

        // Push Notifications for Volunteer and Organizer
        if (status === 'accepted') {
          pushNotification({
            targetRole: 'volunteer',
            eventId: ev.id,
            title: '🎉 Application Accepted!',
            message: `Congratulations! ${ev.organization} accepted your application for "${ev.title}". Check your dashboard for event details.`,
          })
          pushNotification({
            targetRole: 'organization',
            eventId: ev.id,
            title: 'Volunteer Application Approved',
            message: `You approved ${targetApp?.name || 'the volunteer'} for "${ev.title}". Volunteer capacity updated.`,
          })
        } else {
          pushNotification({
            targetRole: 'volunteer',
            eventId: ev.id,
            title: 'Application Status Update',
            message: `Your application for "${ev.title}" was declined by ${ev.organization}. Thank you for your interest.`,
          })
          pushNotification({
            targetRole: 'organization',
            eventId: ev.id,
            title: 'Volunteer Application Declined',
            message: `You declined ${targetApp?.name || 'the volunteer'} for "${ev.title}".`,
          })
        }
      }
    }

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        searchInputRef.current?.focus()
      },
      openCreateModal: () => {
        setShowCreateModal(true)
      },
    }))

    // Toggle Bookmark
    const toggleBookmark = (id: string) => {
      setOpportunities((prev) => {
        const updated = prev.map((op) => (op.id === id ? { ...op, bookmarked: !op.bookmarked } : op))
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    // Handle Application
    const handleApply = (op: Opportunity) => {
      // 1. Mark as applied in state & storage
      setOpportunities((prev) => {
        const updated = prev.map((o) =>
          o.id === op.id
            ? { ...o, applied: true }
            : o
        )
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })

      // 2. Add an application request record
      const newApp: Applicant = {
        id: `app-${Date.now()}`,
        eventId: op.id,
        eventTitle: op.title,
        name: 'You (Volunteer)',
        email: 'volunteer.applicant@togethernow.org',
        skills: op.skillsNeeded.slice(0, 2).concat(['Teamwork']),
        status: 'pending',
        appliedAt: 'Just now',
      }

      setApplicants((prev) => {
        const updated = [newApp, ...prev]
        try {
          localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })

      // 3. Notify Volunteer & Notify Organization
      pushNotification({
        targetRole: 'volunteer',
        eventId: op.id,
        title: 'Application Submitted 📨',
        message: `Your request to join "${op.title}" has been sent to ${op.organization} and is pending review.`,
      })

      pushNotification({
        targetRole: 'organization',
        eventId: op.id,
        title: 'New Volunteer Application 👥',
        message: `A new volunteer applied for "${op.title}". Click Manage & View Applicants to accept or reject.`,
      })

      setApplySuccessModal(op.title)
    }

    // Handle Create Opportunity Submit
    const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newTitle.trim() || !newDescription.trim()) return

      const skillsNeeded = newSkills
        ? newSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Volunteering']

      const formattedDate = newDate ? formatDateDisplay(newDate) : 'Upcoming'
      const formattedTime = newStartTime && newEndTime
        ? `${formatTime12H(newStartTime)} - ${formatTime12H(newEndTime)}`
        : newStartTime
        ? formatTime12H(newStartTime)
        : 'Flexible Schedule'

      const totalReq = Math.max(1, Number(newTotalRequired) || 1)
      const alreadyReg = Math.max(0, Number(newAlreadyRegistered) || 0)
      const computedSpotsLeft = Math.max(0, totalReq - alreadyReg)

      const newOpPayload: Opportunity = {
        id: `event-${Date.now()}`,
        title: newTitle,
        organization: 'Your Organization',
        isVerifiedOrg: true,
        orgStatus: 'approved',
        category: newCategory,
        location: newIsRemote ? 'Remote' : (newLocation || 'Local Community Center'),
        isRemote: newIsRemote,
        date: formattedDate,
        time: formattedTime,
        spotsLeft: computedSpotsLeft,
        totalRequired: totalReq,
        alreadyRegistered: alreadyReg,
        skillsNeeded,
        description: newDescription,
      }

      // 1. Immediately save to localStorage to ensure 100% persistence on page refresh
      try {
        const localSaved = localStorage.getItem(STORAGE_KEY)
        const currentSaved: Opportunity[] = localSaved ? JSON.parse(localSaved) : []
        const updated = [newOpPayload, ...currentSaved.filter((o) => o.id !== newOpPayload.id)]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('Error saving opportunity to localStorage:', err)
      }

      // 2. Update React state immediately
      setOpportunities((prev) => [newOpPayload, ...prev.filter((o) => o.id !== newOpPayload.id)])

      // 3. Persist to Supabase Database
      try {
        const res = await createOpportunityAction({
          title: newTitle,
          category: newCategory,
          location: newLocation,
          isRemote: newIsRemote,
          date: formattedDate,
          time: formattedTime,
          spotsLeft: computedSpotsLeft,
          totalRequired: totalReq,
          alreadyRegistered: alreadyReg,
          skillsNeeded,
          description: newDescription,
        })

        if (res.opportunity) {
          const dbAssigned = res.opportunity
          setOpportunities((prev) => [
            dbAssigned,
            ...prev.filter((o) => o.id !== newOpPayload.id && o.id !== dbAssigned.id),
          ])

          try {
            const localSaved = localStorage.getItem(STORAGE_KEY)
            const currentSaved: Opportunity[] = localSaved ? JSON.parse(localSaved) : []
            const updated = [
              dbAssigned,
              ...currentSaved.filter((o) => o.id !== newOpPayload.id && o.id !== dbAssigned.id),
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {}
        }
      } catch (err) {
        console.warn('Notice calling createOpportunityAction:', err)
      }

      setShowCreateModal(false)

      // Reset form
      setNewTitle('')
      setNewDescription('')
      setNewLocation('')
      setNewSkills('')
      setNewDate('')
      setNewStartTime('09:00')
      setNewEndTime('13:00')
      setNewTotalRequired(15)
      setNewAlreadyRegistered(0)
    }

    // Filtering logic
    const filteredOpportunities = opportunities.filter((op) => {
      // In volunteer portal, show all upcoming events posted ONLY by verified organizations
      if (userRole === 'volunteer') {
        if (op.isVerifiedOrg === false) return false
        if (op.orgStatus && op.orgStatus !== 'approved') return false
      }

      const matchesSearch =
        op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.skillsNeeded.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Remote'
          ? op.isRemote
          : op.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    return (
      <section id="opportunities-feed" className="space-y-6 pt-2">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight m-0 flex items-center gap-2">
              <span>Explore Opportunities & Events</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {filteredOpportunities.length} Available
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
              {userRole === 'organization'
                ? 'Manage your events, post new opportunities, and connect with volunteers.'
                : 'Discover upcoming events and volunteer drives hosted exclusively by verified organizations.'}
            </p>
          </div>

          {userRole === 'organization' && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opportunity</span>
            </button>
          )}
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, organization, or required skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 pr-1 pl-0.5">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border-none cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Opportunity Cards Grid */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white m-0">No matching opportunities found</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Try searching with different keywords or clearing your category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline border-none bg-transparent cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((op) => (
              <div
                key={op.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Bookmark Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                      {op.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(op.id)}
                      aria-label="Bookmark opportunity"
                      className={`p-1.5 rounded-full transition-colors border-none cursor-pointer ${
                        op.bookmarked
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${op.bookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <h4 className="text-base font-bold text-gray-900 dark:text-white m-0 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {op.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{op.organization}</span>
                    {op.isVerifiedOrg !== false && op.orgStatus !== 'pending' && op.orgStatus !== 'rejected' && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 shrink-0"
                        title="Verified Organization Event"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-600 dark:text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                    {op.description}
                  </p>

                  {/* Event Details Meta */}
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{op.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{op.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{op.time}</span>
                    </div>

                    {/* Volunteer Capacity & Progress Bar */}
                    <div className="pt-1.5 border-t border-gray-200/60 dark:border-gray-700/60">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>
                            {op.alreadyRegistered ?? 0} / {op.totalRequired ?? (op.spotsLeft + (op.alreadyRegistered ?? 0))} Registered
                          </span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {op.spotsLeft} spot{op.spotsLeft !== 1 ? 's' : ''} left
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round(((op.alreadyRegistered ?? 0) / Math.max(1, (op.totalRequired ?? (op.spotsLeft + (op.alreadyRegistered ?? 0))))) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {op.skillsNeeded.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  {userRole === 'organization' ? (
                    <button
                      type="button"
                      onClick={() => setManagingEvent(op)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage & View Applicants</span>
                    </button>
                  ) : op.applied ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Application Submitted!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(op)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manage Event & Applicants Modal for Organizations */}
        {managingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {managingEvent.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      {managingEvent.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                    {managingEvent.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Stats Summary */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-medium">Volunteers Needed</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    {managingEvent.totalRequired ?? (managingEvent.spotsLeft + (managingEvent.alreadyRegistered ?? 0))}
                  </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Approved / Registered</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                    {managingEvent.alreadyRegistered ?? 0}
                  </span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-center">
                  <span className="block text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">Spots Left</span>
                  <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">
                    {managingEvent.spotsLeft}
                  </span>
                </div>
              </div>

              {/* Applicants List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white m-0 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Volunteer Applications ({applicants.filter((a) => !a.eventId || a.eventId === managingEvent.id).length})</span>
                  </h4>
                </div>

                {applicants.filter((a) => !a.eventId || a.eventId === managingEvent.id).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                      No applications submitted for this event yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applicants
                      .filter((a) => !a.eventId || a.eventId === managingEvent.id)
                      .map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900 dark:text-white">{app.name}</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  app.status === 'accepted'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : app.status === 'declined'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}
                              >
                                {app.status === 'accepted' ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Accepted
                                  </>
                                ) : app.status === 'declined' ? (
                                  <>
                                    <X className="w-2.5 h-2.5 stroke-[3]" /> Declined
                                  </>
                                ) : (
                                  <>
                                    <Clock3 className="w-2.5 h-2.5 stroke-[2.5]" /> Pending Review
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0">
                              {app.email} • Applied {app.appliedAt}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {app.skills.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700 text-[10px] font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                            {app.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApplicantStatus(app.id, 'accepted', managingEvent)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all border-none cursor-pointer flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplicantStatus(app.id, 'declined', managingEvent)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 font-bold text-xs transition-all border-none cursor-pointer flex items-center gap-1"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                                {app.status === 'accepted' ? '✓ Approved' : '✗ Declined'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Close Modal Button */}
              <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManagingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-xs border-none cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Application Success Modal */}
        {applySuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white m-0">You're Applied! 🎉</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 mb-6">
                Your application for <strong className="text-gray-900 dark:text-white">{applySuccessModal}</strong> has been submitted to the organization for review. You will receive a notification once approved!
              </p>
              <button
                type="button"
                onClick={() => setApplySuccessModal(null)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer"
              >
                Back to Opportunities
              </button>
            </div>
          </div>
        )}

        {/* Post New Opportunity Modal for Organizations */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Post New Event / Opportunity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Event Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Community Beach & Park Cleanup"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category & Remote Switch */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Opportunity['category'])}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="Community">Community</option>
                      <option value="Tech">Tech</option>
                      <option value="Crisis Support">Crisis Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Event Format
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIsRemote}
                          onChange={(e) => setNewIsRemote(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Virtual / Online Event</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Venue / Location {newIsRemote ? '(Virtual)' : '*'}</span>
                  </label>
                  <input
                    type="text"
                    required={!newIsRemote}
                    value={newIsRemote ? 'Online / Remote' : newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    disabled={newIsRemote}
                    placeholder={newIsRemote ? 'Online / Remote' : 'e.g. Coastal Park, Marine Drive'}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                  />
                </div>

                {/* Calendar Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Event Date (Calendar) *</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Clock Timings (Start Time & End Time) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Start Time (Clock) *</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>End Time (Clock) *</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Number of People Required & Already Registered */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Volunteers Needed *</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newTotalRequired}
                        onChange={(e) => setNewTotalRequired(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Already Registered</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newAlreadyRegistered}
                        onChange={(e) => setNewAlreadyRegistered(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-800 dark:text-emerald-300 font-medium">
                    <span>Computed Open Positions:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200">
                      {Math.max(0, newTotalRequired - newAlreadyRegistered)} spots left
                    </span>
                  </div>
                </div>

                {/* Skills Needed */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Skills Needed (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="e.g. Teamwork, Communication, Physical Activity"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Event Description & Objectives *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the volunteering goals, requirements, and responsibilities..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Opportunity</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </section>
    )
  }
)

OpportunitiesFeed.displayName = 'OpportunitiesFeed'

export default OpportunitiesFeed
