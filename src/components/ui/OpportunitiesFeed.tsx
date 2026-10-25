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
  AlertCircle,
  Phone,
  Mail,
  FileText,
  XCircle,
  ChevronRight,
  Send,
  MessageSquare,
  Info,
  ExternalLink,
  Navigation,
  Ban,
  AlertTriangle,
  RotateCcw,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Star,
  Download,
  Printer,
  Copy
} from 'lucide-react'
import { 
  createOpportunityAction, 
  fetchOpportunitiesAction, 
  submitVolunteerApplicationAction, 
  updateApplicantStatusAction,
  cancelOpportunityAction,
  markOpportunityCompletedAction,
  toggleApplicationsAction
} from '@/app/actions/opportunities'
import { pushNotification } from '@/lib/notifications'
import ProfileCompletionModal from './ProfileCompletionModal'
import OrganizationAboutModal from '@/components/ui/OrganizationAboutModal'
import { getOrgRatingSummary } from '@/lib/ratings'
import { createClient } from '@/lib/supabase/client'
import { VolunteerPreferences, scoreOpportunity, ScoredOpportunity } from '@/lib/recommendations'

export interface EventManagerDetails {
  name: string
  phone: string
  employeeId: string
}

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
  address?: string
  managerName?: string
  managerPhone?: string
  eventManagers?: EventManagerDetails[]
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
  isCancelled?: boolean
  cancelledAt?: string
  cancelReason?: string
  isCompleted?: boolean
  completedAt?: string
  isApplicationsClosed?: boolean
  applicationsClosedAt?: string
  assignedEmployeeIds?: string[]
}

export interface Applicant {
  id: string
  eventId?: string
  eventTitle?: string
  volunteerId?: string
  name: string
  email: string
  phone?: string
  skills: string[]
  note?: string
  status: 'pending' | 'accepted' | 'declined'
  appliedAt: string
  avatarUrl?: string
  attendance?: 'present' | 'absent' | 'unmarked'
}

function getGoogleMapsUrl(addressOrLocation: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrLocation)}`
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

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
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
  {
    id: '6',
    title: 'Wildlife & Community Drive Event Photographer',
    organization: 'Prithvi Conservation & Wildlife Trust',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Environment',
    location: 'Sanjay Gandhi National Park & Bandra Coastal Track, Mumbai',
    address: 'Nature Information Center, SGNP Gate, Borivali East, Mumbai 400066',
    managerName: 'Rohan Kothari',
    managerPhone: '+91 98331 55678',
    isRemote: false,
    date: 'Sat, Aug 29, 2026',
    time: '07:00 AM - 11:30 AM',
    spotsLeft: 5,
    totalRequired: 8,
    alreadyRegistered: 3,
    skillsNeeded: ['Photography', 'Photo Editing', 'Visual Storytelling'],
    description: 'Capture high-impact photos and visual stories of our wildlife rescue initiatives, bird sanctuary trails, and volunteer cleanups across Mumbai for national awareness campaigns.',
  },
  {
    id: '7',
    title: 'Community Storytelling & Photography Volunteer',
    organization: 'Asha Creative Arts Foundation',
    isVerifiedOrg: true,
    orgStatus: 'approved',
    category: 'Community',
    location: 'Dharavi Community Arts Center, Mumbai',
    address: '90 Feet Road, Near Kala Kunj, Dharavi, Mumbai 400017',
    managerName: 'Sneha Joshi',
    managerPhone: '+91 98205 11223',
    isRemote: false,
    date: 'Sun, Sep 06, 2026',
    time: '10:30 AM - 02:30 PM',
    spotsLeft: 6,
    totalRequired: 10,
    alreadyRegistered: 4,
    skillsNeeded: ['Photography', 'Mentorship', 'Creative Arts'],
    description: 'Lead hands-on photography mentoring with aspiring youth and document grassroots community empowerment stories for public exhibitions.',
  },
]

export interface OpportunitiesFeedRef {
  focusSearch: () => void
  openCreateModal: () => void
  filterToRecommended?: () => void
}

interface OpportunitiesFeedProps {
  userRole?: string
  organizationName?: string
  userId?: string
  userEmail?: string
  userName?: string
  userProfileStatus?: {
    isNewUser: boolean
    completionPercentage: number
    role: string
    missingFields?: string[]
  }
  volunteerPreferences?: VolunteerPreferences
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
    phone: '+91 98201 44521',
    skills: ['Teamwork', 'Communication', 'Eco Awareness'],
    note: 'I participated in 3 beach cleanups last year and love ocean conservation initiatives!',
    status: 'pending',
    appliedAt: '2 hours ago',
  },
  {
    id: 'app-2',
    eventId: '2',
    eventTitle: 'Youth Coding & Robotics Workshop Mentor',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.org',
    phone: '+91 98765 43210',
    skills: ['Python', 'Robotics', 'Mentorship'],
    note: 'CS sophomore enthusiastic about teaching STEM skills to youngsters.',
    status: 'accepted',
    appliedAt: '1 day ago',
  },
  {
    id: 'app-3',
    eventId: '1',
    eventTitle: 'Community Beach & Park Cleanup',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 91234 56789',
    skills: ['Logistics', 'First Aid', 'Teamwork'],
    note: 'Certified First Aid responder available with safety equipment and team coordination.',
    status: 'pending',
    appliedAt: '3 hours ago',
  },
  {
    id: 'app-4',
    eventId: '3',
    eventTitle: 'Virtual Community Meal Drive Coordinator',
    name: 'Aarav Mehta',
    email: 'aarav.m@example.com',
    phone: '+91 98111 22334',
    skills: ['Logistics', 'Communication'],
    note: 'Experienced in food pantry logistics and eager to support remote food matching.',
    status: 'pending',
    appliedAt: '5 hours ago',
  },
  {
    id: 'app-5',
    eventId: '4',
    eventTitle: 'Senior Citizen Digital Literacy Assistant',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 99887 76655',
    skills: ['Smartphone Basics', 'Patience', 'Communication'],
    note: 'I regularly teach basic smartphone tools at our neighborhood senior club.',
    status: 'accepted',
    appliedAt: '1 day ago',
  },
  {
    id: 'app-6',
    eventId: '5',
    eventTitle: 'Urban Tree Planting & Reforestation Drive',
    name: 'Rahul Deshmukh',
    email: 'rahul.d@example.com',
    phone: '+91 98333 44556',
    skills: ['Gardening', 'Outdoors', 'Teamwork'],
    note: 'Eager to plant trees and support our local urban greening drive!',
    status: 'pending',
    appliedAt: '4 hours ago',
  }
]

const OpportunitiesFeed = forwardRef<OpportunitiesFeedRef, OpportunitiesFeedProps>(
  ({ userRole = 'volunteer', organizationName, userId, userEmail = 'volunteer@togethernow.org', userName, userProfileStatus, volunteerPreferences }, ref) => {
    const isCurrentUserApplicant = (a: Applicant) => {
      if (userId && a.volunteerId && a.volunteerId === userId) return true
      if (userEmail && a.email && a.email.trim().toLowerCase() === userEmail.trim().toLowerCase()) return true
      if (userEmail && a.volunteerId && a.volunteerId.trim().toLowerCase() === userEmail.trim().toLowerCase()) return true
      return false
    }

    const [preferences, setPreferences] = useState<VolunteerPreferences>(() => {
      if (volunteerPreferences && (volunteerPreferences.skills.length > 0 || volunteerPreferences.interests.length > 0 || volunteerPreferences.city)) {
        return volunteerPreferences
      }
      try {
        const userScope = userId || userEmail
        const s = localStorage.getItem(`togethernow_volunteer_skills_${userScope}`) || localStorage.getItem(`togethernow_volunteer_skills_${userEmail}`)
        const i = localStorage.getItem(`togethernow_volunteer_interests_${userScope}`) || localStorage.getItem(`togethernow_volunteer_interests_${userEmail}`)
        const c = localStorage.getItem(`togethernow_volunteer_city_${userScope}`) || localStorage.getItem(`togethernow_volunteer_city_${userEmail}`)
        return {
          skills: s ? JSON.parse(s) : [],
          interests: i ? JSON.parse(i) : [],
          city: c || '',
        }
      } catch {
        return { skills: [], interests: [], city: '' }
      }
    })

    useEffect(() => {
      if (volunteerPreferences) {
        setPreferences(volunteerPreferences)
      }
    }, [volunteerPreferences])

    useEffect(() => {
      const handleProfileUpdate = (e: any) => {
        if (e?.detail) {
          setPreferences((prev) => ({
            skills: e.detail.skills || prev.skills,
            interests: e.detail.interests || prev.interests,
            city: e.detail.city || prev.city,
          }))
        }
      }
      window.addEventListener('togethernow_profile_completed', handleProfileUpdate)
      return () => window.removeEventListener('togethernow_profile_completed', handleProfileUpdate)
    }, [])

    const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [applySuccessModal, setApplySuccessModal] = useState<string | null>(null)
    const [viewingEventModal, setViewingEventModal] = useState<Opportunity | null>(null)
    
    // Cancellation Modal State
    const [cancellingEvent, setCancellingEvent] = useState<Opportunity | null>(null)
    const [cancelReasonInput, setCancelReasonInput] = useState('')
    const [confirmCompleteEvent, setConfirmCompleteEvent] = useState<Opportunity | null>(null)

    // Organization About Us & Trust Modal State (Know More)
    const [selectedOrgForAbout, setSelectedOrgForAbout] = useState<string | null>(null)
    const [aboutInitialTab, setAboutInitialTab] = useState<'about' | 'gallery' | 'pastEvents' | 'reviews' | 'contact'>('about')

    // Profile 100% Verification Gating Modal State
    const [showProfileCompleteModal, setShowProfileCompleteModal] = useState(false)
    const [pendingApplyOp, setPendingApplyOp] = useState<Opportunity | null>(null)
    const [profileIncompleteNoticeModal, setProfileIncompleteNoticeModal] = useState<{ op: Opportunity; missing: string[] } | null>(null)

    // Applying Modal State (for Volunteers)
    const [applyingEvent, setApplyingEvent] = useState<Opportunity | null>(null)
    const [volunteerApplyName, setVolunteerApplyName] = useState('')
    const [volunteerApplyEmail, setVolunteerApplyEmail] = useState('')
    const [volunteerApplyPhone, setVolunteerApplyPhone] = useState('')
    const [volunteerApplyNote, setVolunteerApplyNote] = useState('')
    const [volunteerApplySkills, setVolunteerApplySkills] = useState('')

    const searchInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus()
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      },
      openCreateModal: () => {
        setShowCreateModal(true)
      },
      filterToRecommended: () => {
        setSelectedCategory('🎯 Recommended')
        const el = document.getElementById('opportunities-feed')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      },
    }))

    // Form state for creating new opportunity
    const [newTitle, setNewTitle] = useState('')
    const [newCategory, setNewCategory] = useState<Opportunity['category']>('Community')
    const [newLocation, setNewLocation] = useState('')
    const [newAddress, setNewAddress] = useState('')
    const [eventManagers, setEventManagers] = useState<EventManagerDetails[]>([
      { name: '', phone: '', employeeId: 'EM101' },
    ])

    const handleManagerCountChange = (count: number) => {
      const targetCount = Math.max(1, Math.min(8, count))
      setEventManagers((prev) => {
        if (prev.length === targetCount) return prev
        if (prev.length < targetCount) {
          const added: EventManagerDetails[] = []
          for (let i = prev.length; i < targetCount; i++) {
            added.push({
              name: '',
              phone: '',
              employeeId: `EM10${i + 1}`,
            })
          }
          return [...prev, ...added]
        } else {
          return prev.slice(0, targetCount)
        }
      })
    }

    const handleAddManager = () => {
      if (eventManagers.length >= 8) return
      setEventManagers((prev) => [
        ...prev,
        { name: '', phone: '', employeeId: `EM10${prev.length + 1}` },
      ])
    }

    const handleRemoveManager = (index: number) => {
      if (eventManagers.length <= 1) return
      setEventManagers((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpdateManager = (index: number, field: keyof EventManagerDetails, value: string) => {
      setEventManagers((prev) => {
        const copy = [...prev]
        copy[index] = { ...copy[index], [field]: value }
        return copy
      })
    }
    const [newIsRemote, setNewIsRemote] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [newStartTime, setNewStartTime] = useState('09:00')
    const [newEndTime, setNewEndTime] = useState('13:00')
    const [newTotalRequired, setNewTotalRequired] = useState(15)
    const [newAlreadyRegistered, setNewAlreadyRegistered] = useState(0)
    const [newSkills, setNewSkills] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const STORAGE_KEY = 'togethernow_posted_opportunities'

    // Organization Managing Event & Applicants State
    const [managingEvent, setManagingEvent] = useState<Opportunity | null>(null)
    const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS)
    const [applicantStatusFilter, setApplicantStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')
    const [applicantSearch, setApplicantSearch] = useState('')
    const [actionFeedbackToast, setActionFeedbackToast] = useState<{ message: string; type: 'approve' | 'decline' | 'cancel' } | null>(null)

    // Load persisted opportunities & applicants on mount
    useEffect(() => {
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

      async function loadDbOps() {
        try {
          const dbOps = await fetchOpportunitiesAction()
          if (dbOps && dbOps.length > 0) {
            let mergedOps: Opportunity[] | null = null
            setOpportunities((prev) => {
              const idMap = new Map<string, Opportunity>()
              prev.forEach((op) => idMap.set(op.id, op))

              dbOps.forEach((dbOp) => {
                const existing = idMap.get(dbOp.id)
                if (existing) {
                  const isClosed = Boolean(dbOp.isApplicationsClosed || existing.isApplicationsClosed)
                  idMap.set(dbOp.id, {
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
                  idMap.set(dbOp.id, dbOp as Opportunity)
                }
              })
              const merged = Array.from(idMap.values())
              mergedOps = merged
              return merged
            })

            if (mergedOps) {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedOps))
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: mergedOps }))
                }, 0)
              } catch {}
            }
          }
        } catch (err) {
          console.warn('Error fetching opportunities from DB:', err)
        }
      }
      loadDbOps()

      const handleStorageUpdate = (e?: any) => {
        setTimeout(() => {
          try {
            if (e?.detail && Array.isArray(e.detail)) {
              setOpportunities(e.detail)
            } else {
              const localSaved = localStorage.getItem(STORAGE_KEY)
              if (localSaved) {
                const parsedOps: Opportunity[] = JSON.parse(localSaved)
                if (Array.isArray(parsedOps) && parsedOps.length > 0) {
                  setOpportunities(parsedOps)
                }
              }
            }

            const localApps = localStorage.getItem(APPLICANTS_STORAGE_KEY)
            if (localApps) {
              const parsedApps: Applicant[] = JSON.parse(localApps)
              if (Array.isArray(parsedApps)) setApplicants(parsedApps)
            }
          } catch {}
        }, 0)
      }

      const handleFocusSync = () => {
        handleStorageUpdate()
        loadDbOps()
      }

      window.addEventListener('togethernow_new_notification', handleStorageUpdate)
      window.addEventListener('togethernow_opportunities_updated', handleStorageUpdate)
      window.addEventListener('storage', handleStorageUpdate)
      window.addEventListener('focus', handleFocusSync)

      // Realtime Supabase postgres listener for live seat availability across all devices & users
      const supabase = createClient()
      const channel = supabase
        .channel('opportunities-global-seats-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'opportunities' },
          () => {
            loadDbOps()
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applications' },
          () => {
            loadDbOps()
          }
        )
        .subscribe()

      // Periodic poll every 30s as a safety net for missed realtime events
      const pollTimer = setInterval(() => {
        loadDbOps()
      }, 30000)

      return () => {
        window.removeEventListener('togethernow_new_notification', handleStorageUpdate)
        window.removeEventListener('togethernow_opportunities_updated', handleStorageUpdate)
        window.removeEventListener('storage', handleStorageUpdate)
        window.removeEventListener('focus', handleFocusSync)
        supabase.removeChannel(channel)
        clearInterval(pollTimer)
      }
    }, [])

    // Handle Organization Tick (Approve) & Cross (Decline) Actions
    const handleApplicantStatus = (applicantId: string, status: 'accepted' | 'declined', event?: Opportunity) => {
      // Read current state synchronously BEFORE any setState calls
      const currentApplicant = applicants.find((a) => a.id === applicantId)

      // Idempotency guard: do nothing if already at target status
      if (currentApplicant?.status === status) return

      // Capture previous status synchronously — this MUST happen before any setState
      const previousStatus = currentApplicant?.status
      const targetApp: Applicant = { ...currentApplicant!, status }

      // 1. Update applicants state (pure updater — no side effects)
      setApplicants((prev) => {
        const updated = prev.map((a) => (a.id === applicantId ? { ...a, status } : a))
        try {
          // Write to global org-facing key
          localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))

          // Also propagate the status change to the volunteer's user-scoped key(s)
          // so their dashboard reflects approval/decline without cross-user contamination
          const vId = targetApp.volunteerId
          const vEmail = targetApp.email
          const keysToUpdate = new Set<string>()
          if (vId) keysToUpdate.add(`togethernow_event_applicants_v1_${vId}`)
          if (vEmail) keysToUpdate.add(`togethernow_event_applicants_v1_${vEmail}`)

          keysToUpdate.forEach((userAppsKey) => {
            try {
              const existingRaw = localStorage.getItem(userAppsKey)
              if (existingRaw) {
                const existingApps: Applicant[] = JSON.parse(existingRaw)
                const updatedUserApps = existingApps.map((a) =>
                  a.id === applicantId ? { ...a, status } : a
                )
                localStorage.setItem(userAppsKey, JSON.stringify(updatedUserApps))
              }
            } catch {}
          })
        } catch {}
        return updated
      })

      const ev = event || managingEvent
      if (ev) {
        // Compute the spot delta once, based on synchronously-read previousStatus
        const shouldIncrement = status === 'accepted' && previousStatus !== 'accepted'
        const shouldDecrement = status === 'declined' && previousStatus === 'accepted'
        const currentReg = ev.alreadyRegistered ?? 0
        const totalReq = ev.totalRequired ?? (ev.spotsLeft + currentReg)
        const newReg = shouldIncrement
          ? currentReg + 1
          : shouldDecrement
          ? Math.max(0, currentReg - 1)
          : currentReg
        const newSpots = Math.max(0, totalReq - newReg)

        // 2. Update opportunities spots (pure updater — dispatch event OUTSIDE)
        let updatedList: Opportunity[] | null = null
        setOpportunities((prev) => {
          const updated = prev.map((o) => {
            if (o.id !== ev.id) return o
            return {
              ...o,
              alreadyRegistered: newReg,
              spotsLeft: newSpots,
            }
          })
          updatedList = updated
          return updated
        })

        if (updatedList) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updatedList }))
            }, 0)
          } catch {}
        }

        // 3. Update managing event spots (pure updater)
        setManagingEvent((prevEv) => {
          if (!prevEv || prevEv.id !== ev.id) return prevEv
          return {
            ...prevEv,
            alreadyRegistered: newReg,
            spotsLeft: newSpots,
          }
        })

        // 4. Toast & notifications (run synchronously after state is queued)
        if (status === 'accepted') {
          setActionFeedbackToast({
            message: `✔ ${targetApp.name || 'Volunteer'} approved! Spot reserved & notification sent to volunteer dashboard.`,
            type: 'approve',
          })
          setTimeout(() => setActionFeedbackToast(null), 4000)

          pushNotification({
            targetRole: 'volunteer',
            type: 'approval',
            eventId: ev.id,
            eventTitle: ev.title,
            applicantName: targetApp.name,
            targetUserId: targetApp.volunteerId,
            targetEmail: targetApp.email,
            title: '🎉 Application Approved!',
            message: `Congratulations! ${ev.organization} has approved your application for "${ev.title}". Contact In-Charge ${ev.managerName || 'Coordinator'} (${ev.managerPhone || 'on dashboard'}).`,
          })
        } else {
          setActionFeedbackToast({
            message: `✖ ${targetApp.name || 'Volunteer'} application declined. Spot updated & notification sent.`,
            type: 'decline',
          })
          setTimeout(() => setActionFeedbackToast(null), 4000)

          pushNotification({
            targetRole: 'volunteer',
            type: 'declined',
            eventId: ev.id,
            eventTitle: ev.title,
            applicantName: targetApp.name,
            targetUserId: targetApp.volunteerId,
            targetEmail: targetApp.email,
            title: 'Application Status Update',
            message: `Your application for "${ev.title}" was declined by ${ev.organization}. Thank you for your enthusiasm!`,
          })
        }

        updateApplicantStatusAction({
          applicantId,
          eventId: ev.id,
          status,
          volunteerId: targetApp.volunteerId,
          alreadyRegistered: newReg,
          spotsLeft: newSpots,
          totalRequired: totalReq,
        }).catch((err) => console.warn('Notice updating applicant in DB:', err))
      }
    }

    // Handle Cancel Event
    const handleCancelEvent = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!cancellingEvent) return

      const reason = cancelReasonInput.trim() || 'Schedule adjustment by organizer'
      const cancelledTime = new Date().toISOString()
      const evId = cancellingEvent.id
      const evTitle = cancellingEvent.title

      // Update state
      let updatedOps: Opportunity[] | null = null
      setOpportunities((prev) => {
        const updated = prev.map((op) =>
          op.id === evId
            ? { ...op, isCancelled: true, cancelledAt: cancelledTime, cancelReason: reason }
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

      // Notify enrolled / applied volunteers
      const enrolled = applicants.filter((a) => a.eventId === evId)
      enrolled.forEach((app) => {
        pushNotification({
          targetRole: 'volunteer',
          type: 'declined',
          eventId: evId,
          eventTitle: evTitle,
          title: '🚫 Event Cancelled',
          message: `Notice: "${evTitle}" has been cancelled by ${cancellingEvent.organization}. Reason: ${reason}`,
        })
      })

      pushNotification({
        targetRole: 'organization',
        type: 'declined',
        eventId: evId,
        eventTitle: evTitle,
        title: 'Event Moved to Cancelled Bucket',
        message: `"${evTitle}" has been cancelled and moved to your Cancelled Events bucket.`,
      })

      cancelOpportunityAction({ eventId: evId, reason }).catch((err) =>
        console.warn('Notice cancelling opportunity in DB:', err)
      )

      setActionFeedbackToast({
        message: `🚫 "${evTitle}" cancelled and moved to Cancelled Bucket. Volunteers notified.`,
        type: 'cancel',
      })
      setTimeout(() => setActionFeedbackToast(null), 4000)

      setCancellingEvent(null)
      setCancelReasonInput('')
      if (managingEvent?.id === evId) {
        setManagingEvent(null)
      }
    }

    // Handle Restore Event
    const handleRestoreEvent = (eventId: string) => {
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
        message: `The event has been restored from your Cancelled Events bucket.`,
      })

      if (managingEvent?.id === eventId) {
        setManagingEvent((prev) => prev ? { ...prev, isCancelled: false, cancelledAt: undefined, cancelReason: undefined } : null)
      }
    }

    // Permanently Mark Event Completed (No reopening allowed once confirmed)
    const executeCompleteEvent = (event: Opportunity) => {
      const completedTime = new Date().toISOString()

      let updatedOps: Opportunity[] | null = null
      setOpportunities((prev) => {
        const updated = prev.map((op) =>
          op.id === event.id
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

      // Notify accepted candidates
      const enrolled = applicants.filter((a) => a.eventId === event.id && a.status === 'accepted')
      enrolled.forEach((app) => {
        pushNotification({
          targetRole: 'volunteer',
          type: 'approval',
          eventId: event.id,
          eventTitle: event.title,
          title: '🎉 Event Completed!',
          message: `"${event.title}" has been marked as Completed by ${event.organization}. Thank you for making an impact!`,
        })
      })

      pushNotification({
        targetRole: 'organization',
        type: 'approval',
        eventId: event.id,
        eventTitle: event.title,
        title: 'Event Marked as Completed',
        message: `"${event.title}" is now permanently marked as Completed.`,
      })

      setActionFeedbackToast({
        message: `🎉 "${event.title}" marked as Completed! Enrolled volunteers notified.`,
        type: 'approve',
      })
      setTimeout(() => setActionFeedbackToast(null), 4000)

      markOpportunityCompletedAction({
        eventId: event.id,
        isCompleted: true,
        completedAt: completedTime,
      }).catch((err) => console.warn('Notice updating event completion in DB:', err))

      if (managingEvent?.id === event.id) {
        setManagingEvent((prev) =>
          prev ? { ...prev, isCompleted: true, completedAt: completedTime } : null
        )
      }

      setConfirmCompleteEvent(null)
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

      if (managingEvent?.id === eventId) {
        setManagingEvent((prev) =>
          prev
            ? {
                ...prev,
                isApplicationsClosed: isClosed,
                applicationsClosedAt: closedTime,
              }
            : null
        )
      }

      if (isClosed) {
        setApplicantStatusFilter('accepted')
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
          ? 'Applications for this event have been closed and the final volunteer roster is locked.'
          : 'Applications have been re-opened for this event.',
      })
    }

    // Export Finalized Volunteers to CSV
    const handleExportCsv = (eventTitle: string, finalizedVolunteers: Applicant[]) => {
      if (finalizedVolunteers.length === 0) {
        alert('No finalized volunteers to export yet. Approve candidates to build your roster.')
        return
      }
      const headers = ['#', 'Volunteer Name', 'Phone Number', 'Email Address', 'Verified Skills', 'Applied Date', 'Roster Status']
      const rows = finalizedVolunteers.map((v, idx) => [
        idx + 1,
        `"${(v.name || 'Volunteer').replace(/"/g, '""')}"`,
        `"${(v.phone || 'N/A').replace(/"/g, '""')}"`,
        `"${(v.email || 'N/A').replace(/"/g, '""')}"`,
        `"${(v.skills?.join(', ') || 'N/A').replace(/"/g, '""')}"`,
        `"${(v.appliedAt || 'N/A').replace(/"/g, '""')}"`,
        `"Finalized / Confirmed"`
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
    const handlePrintRoster = (op: Opportunity, finalizedVolunteers: Applicant[]) => {
      if (finalizedVolunteers.length === 0) {
        alert('No finalized volunteers to print yet.')
        return
      }
      const printWindow = window.open('', '_blank')
      if (!printWindow) return
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Final Volunteer List - ${op.title}</title>
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
            <h1>${op.title}</h1>
            <div class="meta">
              <strong>Organization:</strong> ${op.organization} &nbsp;|&nbsp;
              <strong>Date:</strong> ${op.date || 'Upcoming'} &nbsp;|&nbsp;
              <strong>Time:</strong> ${op.time || 'Flexible'} &nbsp;|&nbsp;
              <strong>Location:</strong> ${op.address || op.location} &nbsp;|&nbsp;
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
      alert(`Copied ${finalizedVolunteers.length} volunteer contacts to clipboard!`)
    }

    const handleOpenCreateModal = () => {
      // Set sensible defaults if empty
      if (!newDate) {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        setNewDate(nextWeek.toISOString().split('T')[0])
      }
      if (!newStartTime) setNewStartTime('09:00')
      if (!newEndTime) setNewEndTime('13:00')
      if (!eventManagers || eventManagers.length === 0) {
        let savedPhone = '+91 98201 44521'
        try {
          const sp = localStorage.getItem(`togethernow_user_phone_${userEmail}`)
          if (sp) savedPhone = sp
        } catch {}
        setEventManagers([
          {
            name: organizationName || 'Drive Coordinator',
            phone: savedPhone,
            employeeId: 'EM101',
          },
        ])
      } else if (eventManagers.length === 1 && !eventManagers[0].name) {
        let savedPhone = '+91 98201 44521'
        try {
          const sp = localStorage.getItem(`togethernow_user_phone_${userEmail}`)
          if (sp) savedPhone = sp
        } catch {}
        setEventManagers([
          {
            name: organizationName || 'Drive Coordinator',
            phone: eventManagers[0].phone || savedPhone,
            employeeId: eventManagers[0].employeeId || 'EM101',
          },
        ])
      }
      if (!newLocation && !newIsRemote) {
        setNewLocation('Marine Drive Promenade, Mumbai')
      }
      if (!newAddress && !newIsRemote) {
        setNewAddress('Gate 2 Promenade, Marine Drive Coastal Stretch, Mumbai 400020')
      }
      setShowCreateModal(true)
    }


    const toggleBookmark = (id: string) => {
      setOpportunities((prev) => {
        const updated = prev.map((op) => (op.id === id ? { ...op, bookmarked: !op.bookmarked } : op))
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    const handleOpenApplyModal = (op: Opportunity) => {
      // Check if profile is 100% completed with phone, address, and Email OTP verification
      const isLocallyCompleted = typeof window !== 'undefined' && localStorage.getItem(`togethernow_profile_complete_${userEmail}`) === 'true'
      const isStatusComplete = (userProfileStatus?.completionPercentage ?? 0) >= 100

      if (!isLocallyCompleted && !isStatusComplete && (userRole === 'volunteer' || userRole === 'donor')) {
        const missing = userProfileStatus?.missingFields && userProfileStatus.missingFields.length > 0
          ? userProfileStatus.missingFields
          : ['Contact Phone Number', 'Address & City Details', 'Email OTP Verification']
        setProfileIncompleteNoticeModal({ op, missing })
        return
      }

      setApplyingEvent(op)

      // 1. Email Autofill
      setVolunteerApplyEmail(userEmail || 'volunteer@togethernow.org')

      // 2. Full Name Autofill from user profile
      let resolvedName = (userName || '').trim()
      try {
        if (!resolvedName && typeof window !== 'undefined') {
          const stored =
            (userEmail && localStorage.getItem(`togethernow_user_name_${userEmail}`)) ||
            (userId && localStorage.getItem(`togethernow_user_name_${userId}`)) ||
            (userEmail && localStorage.getItem(`togethernow_volunteer_name_${userEmail}`)) ||
            (userEmail && localStorage.getItem(`togethernow_profile_name_${userEmail}`))
          if (stored) resolvedName = stored.trim()
        }
      } catch {}
      if (!resolvedName && userEmail && userEmail.includes('@') && !userEmail.startsWith('volunteer@')) {
        const emailPrefix = userEmail.split('@')[0]
        resolvedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      }
      setVolunteerApplyName(resolvedName)

      // 3. Contact Phone Number Autofill from profile
      let resolvedPhone = ''
      try {
        if (typeof window !== 'undefined') {
          const savedPhone =
            (userEmail && localStorage.getItem(`togethernow_user_phone_${userEmail}`)) ||
            (userId && localStorage.getItem(`togethernow_user_phone_${userId}`)) ||
            (userEmail && localStorage.getItem(`togethernow_phone_${userEmail}`))
          if (savedPhone) resolvedPhone = savedPhone.trim()
        }
      } catch {}
      setVolunteerApplyPhone(resolvedPhone)

      // 4. Relevant Skills Autofill from user profile
      let profileSkills: string[] = []
      if (preferences?.skills && preferences.skills.length > 0) {
        profileSkills = preferences.skills
      } else if (volunteerPreferences?.skills && volunteerPreferences.skills.length > 0) {
        profileSkills = volunteerPreferences.skills
      } else {
        try {
          if (typeof window !== 'undefined') {
            const raw =
              (userEmail && localStorage.getItem(`togethernow_volunteer_skills_${userEmail}`)) ||
              (userId && localStorage.getItem(`togethernow_volunteer_skills_${userId}`))
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) profileSkills = parsed
            }
          }
        } catch {}
      }

      if (profileSkills.length > 0) {
        // Prioritize profile skills matching event requirements, followed by other profile skills
        const opSkillsLower = new Set(op.skillsNeeded.map((s) => s.toLowerCase()))
        const matching = profileSkills.filter((s) => opSkillsLower.has(s.toLowerCase()))
        const nonMatching = profileSkills.filter((s) => !opSkillsLower.has(s.toLowerCase()))
        const mergedSkills = [...matching, ...nonMatching]
        setVolunteerApplySkills(mergedSkills.join(', '))
      } else {
        setVolunteerApplySkills(op.skillsNeeded.slice(0, 2).join(', '))
      }

      // 5. Why do you want to join (Personalized Note from profile interests)
      let profileInterests: string[] = []
      if (preferences?.interests && preferences.interests.length > 0) {
        profileInterests = preferences.interests
      } else {
        try {
          if (typeof window !== 'undefined') {
            const raw = (userEmail && localStorage.getItem(`togethernow_volunteer_interests_${userEmail}`)) || ''
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed)) profileInterests = parsed
            }
          }
        } catch {}
      }

      if (profileInterests.length > 0) {
        setVolunteerApplyNote(`Excited to contribute to "${op.title}"! My interests include ${profileInterests.slice(0, 2).join(' & ')}, and I'd love to support ${op.organization}.`)
      } else {
        setVolunteerApplyNote(`Excited to participate in "${op.title}" and support ${op.organization}!`)
      }
    }

    const handleSubmitVolunteerApplication = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!applyingEvent) return

      const applicantName = volunteerApplyName.trim() || 'Volunteer Member'
      const applicantEmail = volunteerApplyEmail.trim() || 'volunteer@togethernow.org'
      const applicantPhone = volunteerApplyPhone.trim() || '+91 98000 00000'
      const applicantNote = volunteerApplyNote.trim() || 'I am excited to support this drive and contribute to our community!'
      const parsedSkills = volunteerApplySkills
        ? volunteerApplySkills.split(',').map((s) => s.trim()).filter(Boolean)
        : applyingEvent.skillsNeeded.slice(0, 2)

      const newApp: Applicant = {
        id: `app-${Date.now()}`,
        eventId: applyingEvent.id,
        eventTitle: applyingEvent.title,
        volunteerId: userId || userEmail || undefined,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        skills: parsedSkills,
        note: applicantNote,
        status: 'pending',
        appliedAt: 'Just now',
      }

      // Do NOT mutate o.applied = true on the global shared opportunities!
      // Applied state is user-scoped and derived from matching applications.

      setApplicants((prev) => {
        const updated = [newApp, ...prev]
        try {
          // Write to global key (org reads from here to see all applicants)
          localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updated))

          // Also write to user-scoped key(s)
          const keysToSave = new Set<string>()
          if (userId) keysToSave.add(`togethernow_event_applicants_v1_${userId}`)
          if (userEmail) keysToSave.add(`togethernow_event_applicants_v1_${userEmail}`)
          if (applicantEmail) keysToSave.add(`togethernow_event_applicants_v1_${applicantEmail}`)

          keysToSave.forEach((userAppsKey) => {
            try {
              const existingUserApps = localStorage.getItem(userAppsKey)
              const userApps: Applicant[] = existingUserApps ? JSON.parse(existingUserApps) : []
              if (!userApps.find((a) => a.id === newApp.id)) {
                localStorage.setItem(userAppsKey, JSON.stringify([newApp, ...userApps]))
              }
            } catch {}
          })
        } catch {}
        return updated
      })

      pushNotification({
        targetRole: 'volunteer',
        type: 'application',
        eventId: applyingEvent.id,
        eventTitle: applyingEvent.title,
        targetUserId: userId,
        targetEmail: applicantEmail || userEmail,
        title: 'Application Submitted 📨',
        message: `Your request to join "${applyingEvent.title}" has been sent to ${applyingEvent.organization} and is pending review.`,
      })

      pushNotification({
        targetRole: 'organization',
        type: 'application',
        eventId: applyingEvent.id,
        eventTitle: applyingEvent.title,
        applicantName: applicantName,
        title: 'New Volunteer Application 👥',
        message: `${applicantName} applied for "${applyingEvent.title}". Click Manage & View Applicants to review and approve.`,
      })

      submitVolunteerApplicationAction({
        eventId: applyingEvent.id,
        eventTitle: applyingEvent.title,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        skills: parsedSkills,
        note: applicantNote,
      }).catch((err) => console.warn('Notice saving application to DB:', err))

      const submittedTitle = applyingEvent.title
      setApplyingEvent(null)
      setApplySuccessModal(submittedTitle)
    }

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
        : '09:00 AM - 01:00 PM'

      const totalReq = Math.max(1, Number(newTotalRequired) || 1)
      const alreadyReg = Math.max(0, Number(newAlreadyRegistered) || 0)
      const computedSpotsLeft = Math.max(0, totalReq - alreadyReg)

      const orgName = (organizationName?.trim() && organizationName.trim() !== 'Organization')
        ? organizationName.trim()
        : 'Community Organization'

      const assignedEmployeeIds = eventManagers
        .map((m) => m.employeeId.trim().toUpperCase())
        .filter(Boolean)
      if (assignedEmployeeIds.length === 0) assignedEmployeeIds.push('EM101')

      const validManagers: EventManagerDetails[] = eventManagers.map((m, idx) => ({
        name: m.name.trim() || `${orgName} Coordinator ${idx + 1}`,
        phone: m.phone.trim() || '+91 98201 44521',
        employeeId: m.employeeId.trim().toUpperCase() || `EM10${idx + 1}`,
      }))

      const managerNames = validManagers.map((m) => m.name).filter(Boolean)
      const managerName = managerNames.join(', ') || orgName || 'Drive Coordinator'
      const managerPhones = validManagers.map((m) => m.phone).filter(Boolean)
      const managerPhone = managerPhones.join(', ') || '+91 98201 44521'
      const location = newIsRemote ? 'Remote' : (newLocation.trim() || newAddress.trim() || 'Marine Drive, Mumbai')
      const fullAddress = newIsRemote ? 'Online / Remote' : (newAddress.trim() || newLocation.trim() || 'Gate 2 Promenade, Marine Drive Coastal Stretch, Mumbai 400020')

      const newOpPayload: Opportunity = {
        id: `event-${Date.now()}`,
        title: newTitle.trim(),
        organization: orgName,
        organizationId: userId || '',
        isVerifiedOrg: true,
        orgStatus: 'approved',
        category: newCategory,
        location,
        address: fullAddress,
        managerName,
        managerPhone,
        eventManagers: validManagers,
        assignedEmployeeIds,
        isRemote: newIsRemote,
        date: formattedDate,
        time: formattedTime,
        spotsLeft: computedSpotsLeft,
        totalRequired: totalReq,
        alreadyRegistered: alreadyReg,
        skillsNeeded,
        description: newDescription.trim(),
      }

      try {
        const localSaved = localStorage.getItem(STORAGE_KEY)
        const currentSaved: Opportunity[] = localSaved ? JSON.parse(localSaved) : []
        const updated = [newOpPayload, ...currentSaved.filter((o) => o.id !== newOpPayload.id)]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
      } catch (err) {
        console.warn('Error saving opportunity to localStorage:', err)
      }

      setOpportunities((prev) => [newOpPayload, ...prev.filter((o) => o.id !== newOpPayload.id)])

      try {
        const res = await createOpportunityAction({
          title: newTitle.trim(),
          category: newCategory,
          location,
          address: fullAddress,
          managerName,
          managerPhone,
          eventManagers: validManagers,
          assignedEmployeeIds,
          isRemote: newIsRemote,
          date: formattedDate,
          time: formattedTime,
          spotsLeft: computedSpotsLeft,
          totalRequired: totalReq,
          alreadyRegistered: alreadyReg,
          skillsNeeded,
          description: newDescription.trim(),
        })

        if (res.opportunity) {
          const dbAssigned: Opportunity = {
            ...newOpPayload,
            ...res.opportunity,
            managerName: res.opportunity.managerName || newOpPayload.managerName,
            managerPhone: res.opportunity.managerPhone || newOpPayload.managerPhone,
            eventManagers: res.opportunity.eventManagers || validManagers,
            address: res.opportunity.address || newOpPayload.address,
            location: res.opportunity.location || newOpPayload.location,
            date: res.opportunity.date || newOpPayload.date,
            time: res.opportunity.time || newOpPayload.time,
            totalRequired: res.opportunity.totalRequired ?? newOpPayload.totalRequired,
            alreadyRegistered: res.opportunity.alreadyRegistered ?? newOpPayload.alreadyRegistered,
            spotsLeft: res.opportunity.spotsLeft ?? newOpPayload.spotsLeft,
          }
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
            window.dispatchEvent(new CustomEvent('togethernow_opportunities_updated', { detail: updated }))
          } catch {}
        }
      } catch (err) {
        console.warn('Notice calling createOpportunityAction:', err)
      }

      setShowCreateModal(false)

      setNewTitle('')
      setNewDescription('')
      setNewLocation('')
      setNewAddress('')
      setEventManagers([{ name: '', phone: '', employeeId: 'EM101' }])
      setNewSkills('')
      setNewDate('')
      setNewStartTime('09:00')
      setNewEndTime('13:00')
      setNewTotalRequired(15)
      setNewAlreadyRegistered(0)
    }

    // Filtering logic
    const filteredOpportunities = opportunities.filter((op) => {
      if (userRole === 'volunteer') {
        if (op.isVerifiedOrg === false) return false
        if (op.orgStatus && op.orgStatus !== 'approved') return false
      }

      const matchesSearch =
        op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.managerName && op.managerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (op.address && op.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        op.skillsNeeded.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Remote'
          ? op.isRemote
          : selectedCategory === '🎯 Recommended'
          ? scoreOpportunity(op, preferences).isRecommended
          : op.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    const displayOpportunities = selectedCategory === '🎯 Recommended'
      ? [...filteredOpportunities].sort((a, b) => {
          const scoreA = scoreOpportunity(a, preferences).matchScore
          const scoreB = scoreOpportunity(b, preferences).matchScore
          return scoreB - scoreA
        })
      : filteredOpportunities

    const categoriesList = userRole === 'volunteer'
      ? ['All', '🎯 Recommended', 'Environment', 'Education', 'Health', 'Community', 'Tech', 'Remote']
      : ['All', 'Environment', 'Education', 'Health', 'Community', 'Tech', 'Remote']

    // Filter applicants strictly for the selected event in the Organization Modal
    const currentEventApplicants = managingEvent
      ? applicants.filter((a) => a.eventId === managingEvent.id)
      : []

    const filteredModalApplicants = currentEventApplicants.filter((app) => {
      const matchesStatus =
        applicantStatusFilter === 'all'
          ? true
          : app.status === applicantStatusFilter

      const matchesQuery =
        !applicantSearch.trim() ||
        app.name.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        (app.phone && app.phone.toLowerCase().includes(applicantSearch.toLowerCase())) ||
        (app.note && app.note.toLowerCase().includes(applicantSearch.toLowerCase())) ||
        app.skills.some((s) => s.toLowerCase().includes(applicantSearch.toLowerCase()))

      return matchesStatus && matchesQuery
    })

    const pendingCount = currentEventApplicants.filter((a) => a.status === 'pending').length
    const acceptedCount = currentEventApplicants.filter((a) => a.status === 'accepted').length
    const declinedCount = currentEventApplicants.filter((a) => a.status === 'declined').length

    return (
      <section id="opportunities-feed" className="space-y-6 pt-2">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight m-0 flex items-center gap-2">
              <span>Explore Opportunities & Events</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {displayOpportunities.length} Available
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
              {userRole === 'organization'
                ? 'Manage your events, click on any drive to review applicants with Tick & Cross approval.'
                : 'Discover upcoming events and volunteer drives. Click on any event to see coordinator & venue details.'}
            </p>
          </div>

          {userRole === 'organization' && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opportunity</span>
            </button>
          )}
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, coordinator name, venue address, or skills..."
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 pr-1 pl-0.5">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {categoriesList.map((cat) => (
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
        {displayOpportunities.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white m-0">No matching opportunities found</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {selectedCategory === '🎯 Recommended'
                ? 'No opportunities match your current skills or city. Try exploring other categories or updating your interests!'
                : 'Try searching with different keywords or clearing your category filters.'}
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
            {displayOpportunities.map((op) => {
              const scoredOp = userRole === 'volunteer' ? scoreOpportunity(op, preferences) : null
              const eventApps = applicants.filter((a) => a.eventId === op.id)
              const eventPending = eventApps.filter((a) => a.status === 'pending').length
              const volunteerApp = userRole === 'volunteer'
                ? applicants.find((a) => a.eventId === op.id && isCurrentUserApplicant(a))
                : undefined

              return (
                <div
                  key={op.id}
                  onClick={() => {
                    if (userRole === 'organization') {
                      setManagingEvent(op)
                    } else {
                      setViewingEventModal(op)
                    }
                  }}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer ${
                    op.isCancelled
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10'
                      : scoredOp?.isRecommended
                      ? 'border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-500 ring-1 ring-emerald-500/10'
                      : 'border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                          {op.category}
                        </span>
                        {userRole === 'volunteer' && scoredOp?.isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black shadow-xs ring-1 ring-emerald-400/40">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            <span>{scoredOp.matchPercentage}% Match</span>
                          </span>
                        )}
                        {op.isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Completed</span>
                          </span>
                        )}
                        {op.isApplicationsClosed && !op.isCancelled && !op.isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Applications Closed</span>
                          </span>
                        )}
                        {op.isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold border border-rose-200 dark:border-rose-800/50">
                            <Ban className="w-2.5 h-2.5" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </div>
                      
                      {userRole === 'organization' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                          <Users className="w-3 h-3" />
                          <span>{eventApps.length} Applied {eventPending > 0 ? `(${eventPending} New)` : ''}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(op.id)
                          }}
                          aria-label="Bookmark opportunity"
                          className={`p-1.5 rounded-full transition-colors border-none cursor-pointer ${
                            op.bookmarked
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${op.bookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-white m-0 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {op.title}
                    </h4>

                    {userRole === 'volunteer' && scoredOp?.isRecommended && scoredOp.matchReasons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5 mb-1">
                        {scoredOp.matchReasons.slice(0, 2).map((reason, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                              reason.type === 'interest'
                                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
                                : reason.type === 'skill'
                                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                            }`}
                          >
                            {reason.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3 flex-wrap">
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrgForAbout(op.organization)
                          setAboutInitialTab('about')
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/70 dark:hover:bg-indigo-700 rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs shrink-0 ml-0.5"
                        title="Know More about this Organization, their mission, previous events & photos"
                      >
                        <Info className="w-2.5 h-2.5" />
                        <span>Know More</span>
                      </button>

                      {/* Overall Volunteer Rating Badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrgForAbout(op.organization)
                          setAboutInitialTab('reviews')
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 hover:bg-amber-500 hover:text-white dark:bg-amber-950/80 dark:hover:bg-amber-600 rounded-lg border border-amber-200/80 dark:border-amber-800/60 transition-all cursor-pointer shadow-xs shrink-0"
                        title="View Volunteer Ratings & Reviews for this NGO"
                      >
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{getOrgRatingSummary(op.organization).averageRating}</span>
                        <span className="text-[9px] opacity-75">({getOrgRatingSummary(op.organization).totalReviews})</span>
                      </button>
                    </div>

                    {op.isCancelled && op.cancelReason && (
                      <div className="mb-3 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span><strong>Cancelled:</strong> {op.cancelReason}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                      {op.description}
                    </p>

                    {/* Event Details Meta */}
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-3 bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{op.address || op.location}</span>
                        </div>
                        {!op.isRemote && (
                          <a
                            href={getGoogleMapsUrl(op.address || op.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 text-decoration-none px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40"
                            title="Open in Google Maps"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>Map</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{op.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{op.time}</span>
                      </div>

                      {/* Event Manager Info - Always visible */}
                      <div className="pt-2 border-t border-gray-200/70 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold truncate">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">In-Charge: {(op.managerName && op.managerName !== op.organization) ? op.managerName : 'Event Coordinator'}</span>
                        </span>
                        {op.managerPhone ? (
                          <a
                            href={`tel:${op.managerPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shrink-0 text-decoration-none shadow-2xs"
                            title={`Call In-Charge (${ (op.managerName && op.managerName !== op.organization) ? op.managerName : 'Event Coordinator'})`}
                          >
                            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{op.managerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">Phone on file</span>
                        )}
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
                          <span
                            className={`font-extrabold ${
                              op.isCancelled
                                ? 'text-rose-600'
                                : op.spotsLeft === 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : op.spotsLeft <= 3
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {op.isCancelled ? 'Cancelled' : op.spotsLeft === 0 ? '0 spots left (Full)' : `${op.spotsLeft} spot${op.spotsLeft !== 1 ? 's' : ''} left`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              op.isCancelled
                                ? 'bg-rose-500'
                                : op.spotsLeft === 0
                                ? 'bg-rose-500'
                                : op.spotsLeft <= 3
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
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
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setManagingEvent(op)
                            }}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Manage ({eventApps.length})</span>
                          </button>

                          {op.isCompleted ? (
                            <span className="px-2.5 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed ✓</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              title="Mark as Completed"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmCompleteEvent(op)
                              }}
                              className="px-2.5 py-2 rounded-xl font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {op.isCancelled ? (
                            <button
                              type="button"
                              title="Restore Event"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreEvent(op.id)
                              }}
                              className="px-2.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 hover:bg-amber-600 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Cancel Event"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCancellingEvent(op)
                              }}
                              className="px-2.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : op.isCancelled ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 font-bold text-xs border border-rose-200 dark:border-rose-900/50">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Event Cancelled 🚫</span>
                      </div>
                    ) : volunteerApp?.status === 'accepted' ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300/60 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✓ Approved Volunteer 🎉 (Click for Venue & Contact)</span>
                      </div>
                    ) : volunteerApp?.status === 'declined' ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Application Declined</span>
                      </div>
                    ) : volunteerApp?.status === 'pending' ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900/40">
                        <Clock3 className="w-4 h-4 text-amber-600" />
                        <span>Application Under Review ⏳</span>
                      </div>
                    ) : op.isApplicationsClosed ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs border border-gray-200/80 dark:border-gray-700">
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Applications Closed • Roster Finalized</span>
                      </div>
                    ) : op.spotsLeft === 0 ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Event Full (0 Spots Left)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenApplyModal(op)
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply to Volunteer</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* CANCEL EVENT CONFIRMATION MODAL */}
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
                    Cancel Event / Move to Bucket?
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                    {cancellingEvent.title}
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                <p className="m-0 font-semibold">
                  Cancelling this event will move it to your <strong>Cancelled Events Bucket</strong>.
                </p>
                <p className="m-0 text-[11px] text-rose-700 dark:text-rose-300">
                  All enrolled volunteers will receive an immediate cancellation notice. You can restore this event later from the Cancelled Bucket.
                </p>
              </div>

              <form onSubmit={handleCancelEvent} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Cancellation (Optional)
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
                      setCancellingEvent(null)
                      setCancelReasonInput('')
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                  >
                    Keep Event
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

        {/* ============================================================ */}
        {/* VOLUNTEER: VIEW EVENT & MANAGER DETAILS MODAL */}
        {/* ============================================================ */}
        {viewingEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto space-y-4">
              
              <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {viewingEventModal.category}
                    </span>
                    {viewingEventModal.isCancelled && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                        Cancelled 🚫
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0">
                    {viewingEventModal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{viewingEventModal.organization}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingEventModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewingEventModal.isCancelled && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                  <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">This event was cancelled by the organization</span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">
                      Reason: {viewingEventModal.cancelReason || 'Schedule conflict'}
                    </span>
                  </div>
                </div>
              )}

              {/* Event Manager / In-Charge Box */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        Person in Charge / Event {viewingEventModal.eventManagers && viewingEventModal.eventManagers.length > 1 ? 'Managers' : 'Manager'}
                      </span>
                      <h5 className="text-sm font-extrabold text-gray-900 dark:text-white m-0">
                        {(viewingEventModal.managerName && viewingEventModal.managerName !== viewingEventModal.organization)
                          ? viewingEventModal.managerName
                          : 'Event Coordinator'}
                      </h5>
                    </div>
                  </div>

                  {viewingEventModal.managerPhone && (
                    <a
                      href={`tel:${viewingEventModal.managerPhone.split(',')[0].trim()}`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm text-decoration-none transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Manager</span>
                    </a>
                  )}
                </div>

                {viewingEventModal.eventManagers && viewingEventModal.eventManagers.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-indigo-100/70 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                      Assigned Event Managers ({viewingEventModal.eventManagers.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewingEventModal.eventManagers.map((mgr, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-gray-800/90 border border-indigo-100/70 dark:border-indigo-900/40 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {mgr.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-5 flex items-center gap-1.5">
                              <span>{mgr.phone}</span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[9px]">
                                {mgr.employeeId}
                              </span>
                            </div>
                          </div>
                          {mgr.phone && (
                            <a
                              href={`tel:${mgr.phone}`}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950 dark:text-emerald-300 font-bold transition-all shrink-0"
                              title={`Call ${mgr.name}`}
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 pt-1 border-t border-indigo-100/70 dark:border-indigo-900/40">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Phone:</strong> {viewingEventModal.managerPhone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Org:</strong> {viewingEventModal.organization}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrgForAbout(viewingEventModal.organization)
                        setAboutInitialTab('about')
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-2xs ml-1"
                      title="Know More about this organization"
                    >
                      <Info className="w-2.5 h-2.5" />
                      <span>Know More</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrgForAbout(viewingEventModal.organization)
                        setAboutInitialTab('reviews')
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 hover:bg-amber-500 hover:text-white dark:bg-amber-950/80 rounded-lg border border-amber-200/80 dark:border-amber-800/60 transition-all cursor-pointer shadow-2xs"
                      title="View Volunteer Ratings & Reviews"
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{getOrgRatingSummary(viewingEventModal.organization).averageRating}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Venue Address & Embedded Map Box */}
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
                        {viewingEventModal.address || viewingEventModal.location}
                      </p>
                    </div>
                  </div>

                  {!viewingEventModal.isRemote && (
                    <a
                      href={getGoogleMapsUrl(viewingEventModal.address || viewingEventModal.location)}
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

                {!viewingEventModal.isRemote && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative bg-gray-200 dark:bg-gray-800">
                    <iframe
                      title="Event Location Map"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        viewingEventModal.address || viewingEventModal.location
                      )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{viewingEventModal.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{viewingEventModal.time}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs">
                <h6 className="font-bold text-gray-900 dark:text-white m-0">About this Drive</h6>
                <p className="text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                  {viewingEventModal.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                {!viewingEventModal.isRemote ? (
                  <a
                    href={getGoogleMapsUrl(viewingEventModal.address || viewingEventModal.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions in Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Virtual / Remote Event</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingEventModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                  >
                    Close
                  </button>
                  {(() => {
                    const modalApp = viewingEventModal && userRole === 'volunteer'
                      ? applicants.find((a) => a.eventId === viewingEventModal.id && isCurrentUserApplicant(a))
                      : null

                    if (modalApp) {
                      return (
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                          modalApp.status === 'accepted'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : modalApp.status === 'declined'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {modalApp.status === 'accepted'
                            ? '✓ Spot Confirmed'
                            : modalApp.status === 'declined'
                            ? 'Application Declined'
                            : '⏳ Application Under Review'}
                        </span>
                      )
                    }

                    if (viewingEventModal.isApplicationsClosed) {
                      return (
                        <span className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Applications Closed • Roster Finalized</span>
                        </span>
                      )
                    }

                    if (!viewingEventModal.isCancelled && viewingEventModal.spotsLeft > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            const ev = viewingEventModal
                            setViewingEventModal(null)
                            handleOpenApplyModal(ev)
                          }}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply for this Drive</span>
                        </button>
                      )
                    }

                    return null
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ORGANIZATION: EVENT APPLICANTS & APPROVAL (TICK/CROSS) MODAL */}
        {/* ============================================================ */}
        {managingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] flex flex-col">
              
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                      {managingEvent.category}
                    </span>
                    {managingEvent.isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed Event</span>
                      </span>
                    )}
                    {managingEvent.isCancelled && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        <span>In Cancelled Bucket</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white m-0 tracking-tight">
                    {managingEvent.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                    In-Charge: <strong>{managingEvent.managerName || 'Coordinator'}</strong> ({managingEvent.managerPhone || 'No phone'}) • Review applicants with <strong className="text-emerald-600">Tick (✔)</strong> or <strong className="text-rose-600">Cross (✖)</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManagingEvent(null)
                    setActionFeedbackToast(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionFeedbackToast && (
                <div className={`mt-3 p-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-1 ${
                  actionFeedbackToast.type === 'approve'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{actionFeedbackToast.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionFeedbackToast(null)}
                    className="border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Event Schedule, In-Charge & Venue Details Box */}
              <div className="bg-gray-50/80 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 my-3 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Date:</strong> {managingEvent.date || 'Upcoming'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Time:</strong> {managingEvent.time || '09:00 AM - 01:00 PM'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate"><strong>In-Charge:</strong> {managingEvent.managerName || managingEvent.organization || 'Coordinator'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate"><strong>Venue:</strong> {managingEvent.address || managingEvent.location}</span>
                  </div>

                  {!managingEvent.isRemote && (
                    <a
                      href={getGoogleMapsUrl(managingEvent.address || managingEvent.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-700 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 transition-all text-decoration-none shrink-0"
                    >
                      <Navigation className="w-2.5 h-2.5" />
                      <span>Open on Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>


              {/* Applications Closed & Final Roster Banner with Export / Print actions */}
              {managingEvent.isApplicationsClosed && !managingEvent.isCancelled && (
                <div className="my-2.5 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-xs text-indigo-950 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-sm">
                        <span>Applications Closed • Final Roster Finalized</span>
                      </div>
                      <p className="m-0 mt-0.5 text-[11px] text-indigo-700 dark:text-indigo-300">
                        New applications are frozen. Below is the final verified team ready for the event.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleExportCsv(managingEvent.title, currentEventApplicants.filter((c) => c.status === 'accepted'))}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                      title="Export finalized volunteers as CSV for Excel / Google Sheets"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintRoster(managingEvent, currentEventApplicants.filter((c) => c.status === 'accepted'))}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                      title="Print attendance check-in sheet for event day"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Roster</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    ...(managingEvent.isApplicationsClosed
                      ? [{ key: 'accepted', label: `⭐ Finalized Roster (${acceptedCount})` }]
                      : []),
                    { key: 'all', label: `All Candidates (${currentEventApplicants.length})` },
                    ...(!managingEvent.isApplicationsClosed
                      ? [{ key: 'accepted', label: `Approved (${acceptedCount})` }]
                      : []),
                    { key: 'pending', label: `Pending (${pendingCount})` },
                    { key: 'declined', label: `Declined (${declinedCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setApplicantStatusFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        applicantStatusFilter === tab.key
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
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    placeholder="Search candidate..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Scrollable Candidates List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-[48vh] pr-1">
                {filteredModalApplicants.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 m-0">
                      No candidates found matching this filter for this drive
                    </p>
                  </div>
                ) : (
                  filteredModalApplicants.map((app) => {
                    const initials = app.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <div
                        key={app.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                          app.status === 'accepted'
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50'
                            : app.status === 'declined'
                            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-800/50'
                            : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 shadow-xs'
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden ring-2 ring-indigo-200/50">
                              {app.avatarUrl ? (
                                <img src={app.avatarUrl} alt={app.name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white m-0">
                                  {app.name}
                                </h5>
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
                                      <Check className="w-2.5 h-2.5 stroke-[3]" /> Approved
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

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-indigo-500" />
                                  <a href={`mailto:${app.email}`} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 underline">
                                    {app.email}
                                  </a>
                                </span>
                                {app.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-emerald-500" />
                                    <a href={`tel:${app.phone}`} className="text-gray-600 dark:text-gray-300 hover:text-emerald-600">
                                      {app.phone}
                                    </a>
                                  </span>
                                )}
                                <span>• Applied {app.appliedAt}</span>
                              </div>
                            </div>
                          </div>

                          {app.note && (
                            <div className="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[11px] text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <p className="m-0 italic leading-relaxed">"{app.note}"</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-semibold text-gray-400">Skills:</span>
                            {app.skills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium border border-indigo-100 dark:border-indigo-900/40"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Approval Actions: Tick (Approve) & Cross (Decline) — only shown in All/Pending/Declined review tabs, hidden in Final Roster */}
                        {applicantStatusFilter !== 'accepted' && (
                          <div className="flex sm:flex-col md:flex-row items-center gap-2 pt-2 md:pt-0 shrink-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                            <button
                              type="button"
                              disabled={app.status === 'accepted'}
                              title="Approve Candidate (Tick)"
                              onClick={() => handleApplicantStatus(app.id, 'accepted', managingEvent)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-none flex items-center justify-center gap-1.5 shadow-xs ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/50 shadow-md scale-105 opacity-75 cursor-not-allowed'
                                  : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 cursor-pointer'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{app.status === 'accepted' ? 'Approved ✔' : 'Approve'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={app.status === 'declined'}
                              title="Decline Candidate (Cross)"
                              onClick={() => handleApplicantStatus(app.id, 'declined', managingEvent)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-none flex items-center justify-center gap-1.5 shadow-xs ${
                                app.status === 'declined'
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-500/50 shadow-md scale-105 opacity-75 cursor-not-allowed'
                                  : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800 cursor-pointer'
                              }`}
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                              <span>{app.status === 'declined' ? 'Declined ✖' : 'Decline'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Modal Bottom Action Footer with Complete & Cancel Event Options */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!managingEvent.isCompleted && !managingEvent.isCancelled && (
                    managingEvent.isApplicationsClosed ? (
                      <button
                        type="button"
                        onClick={() => handleToggleApplications(managingEvent.id, false)}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-gray-700 cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Re-open applications to allow new volunteers to apply"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-open Applications</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleApplications(managingEvent.id, true)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                        title="Stop accepting applications and finalize volunteer team"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Stop Applications</span>
                      </button>
                    )
                  )}

                  {managingEvent.isCompleted ? (
                    <span className="px-4 py-2 rounded-xl font-extrabold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Completed (Concluded)</span>
                    </span>
                  ) : !managingEvent.isCancelled ? (
                    <button
                      type="button"
                      onClick={() => setConfirmCompleteEvent(managingEvent)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-none transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Completed</span>
                    </button>
                  ) : null}

                  {managingEvent.isCancelled ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreEvent(managingEvent.id)}
                      className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore from Bucket</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCancellingEvent(managingEvent)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Event</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setManagingEvent(null)
                    setActionFeedbackToast(null)
                  }}
                  className="px-5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold text-xs border-none cursor-pointer transition-all shadow-xs"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VOLUNTEER: APPLY FOR EVENT MODAL */}
        {/* ============================================================ */}
        {applyingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {applyingEvent.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                    Apply for {applyingEvent.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                    Hosted by <strong>{applyingEvent.organization}</strong> • {applyingEvent.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyingEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitVolunteerApplication} className="space-y-4">
                {/* Autofill Banner */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs shadow-2xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="leading-snug">
                    <span className="font-bold">Autofilled from your profile.</span>{' '}
                    <span className="text-emerald-700/80 dark:text-emerald-300/80">You can update any field before submitting.</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Your Full Name *
                    </label>
                    {volunteerApplyName && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> From profile
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={volunteerApplyName}
                    onChange={(e) => setVolunteerApplyName(e.target.value)}
                    placeholder="e.g. Siddharth Verma"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Email Address *
                      </label>
                      {volunteerApplyEmail && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Account email
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      required
                      value={volunteerApplyEmail}
                      onChange={(e) => setVolunteerApplyEmail(e.target.value)}
                      placeholder="e.g. volunteer@togethernow.org"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      {volunteerApplyPhone && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> From profile
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={volunteerApplyPhone}
                      onChange={(e) => setVolunteerApplyPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Relevant Skills (comma separated)
                    </label>
                    {volunteerApplySkills && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Profile skills
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={volunteerApplySkills}
                    onChange={(e) => setVolunteerApplySkills(e.target.value)}
                    placeholder="e.g. Teamwork, First Aid, Logistics"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Why do you want to join this drive? (Optional Note)
                  </label>
                  <textarea
                    rows={3}
                    value={volunteerApplyNote}
                    onChange={(e) => setVolunteerApplyNote(e.target.value)}
                    placeholder="Tell the organizer about your interest or previous volunteering experience..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyingEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Volunteer Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* APPLICATION SUCCESS CONFIRMATION MODAL */}
        {/* ============================================================ */}
        {applySuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white m-0">You're Applied! 🎉</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 mb-6">
                Your application for <strong className="text-gray-900 dark:text-white">{applySuccessModal}</strong> has been submitted to the organization. You will receive an instant notification on your dashboard when reviewed!
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

        {/* ============================================================ */}
        {/* POST NEW OPPORTUNITY MODAL FOR ORGANIZATIONS */}
        {/* ============================================================ */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>City / Area {newIsRemote ? '(Virtual)' : '*'}</span>
                    </label>
                    <input
                      type="text"
                      required={!newIsRemote}
                      value={newIsRemote ? 'Online / Remote' : newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      disabled={newIsRemote}
                      placeholder={newIsRemote ? 'Online / Remote' : 'e.g. Marine Drive, Mumbai'}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Detailed Address / Venue {newIsRemote ? '(Virtual)' : '*'}</span>
                    </label>
                    <input
                      type="text"
                      required={!newIsRemote}
                      value={newIsRemote ? 'Online / Remote' : newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      disabled={newIsRemote}
                      placeholder={newIsRemote ? 'Online Link' : 'e.g. Gate 2, Promenade Landmark'}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100/70 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                          Person in Charge / Event Managers *
                        </div>
                        <p className="m-0 text-[10px] text-indigo-700/80 dark:text-indigo-300/80">
                          Enter details for each event manager. Each manager will get login access.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <label htmlFor="no-of-event-managers" className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                        No. of Managers:
                      </label>
                      <select
                        id="no-of-event-managers"
                        value={eventManagers.length}
                        onChange={(e) => handleManagerCountChange(Number(e.target.value))}
                        className="px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-xs font-bold text-indigo-950 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Manager' : 'Managers'}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddManager}
                        disabled={eventManagers.length >= 8}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all border-none cursor-pointer"
                        title="Add another Event Manager"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* List of each event manager */}
                  <div className="space-y-3">
                    {eventManagers.map((mgr, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs space-y-2.5 transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              Event Manager #{index + 1} {index === 0 && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">(Lead Coordinator)</span>}
                            </span>
                          </div>

                          {eventManagers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveManager(index)}
                              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 px-2 py-0.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/40 bg-transparent cursor-pointer transition-all flex items-center gap-1 text-[11px] font-bold"
                              title={`Remove Manager #${index + 1}`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Manager Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={mgr.name}
                              onChange={(e) => handleUpdateManager(index, 'name', e.target.value)}
                              placeholder={index === 0 ? "e.g. Arjun Nambiar" : `e.g. Manager ${index + 1} Name`}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Manager Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={mgr.phone}
                              onChange={(e) => handleUpdateManager(index, 'phone', e.target.value)}
                              placeholder="e.g. +91 98201 44521"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Employee ID / Code *
                            </label>
                            <input
                              type="text"
                              required
                              value={mgr.employeeId}
                              onChange={(e) => handleUpdateManager(index, 'employeeId', e.target.value.toUpperCase())}
                              placeholder={`e.g. EM10${index + 1}`}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 font-mono font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 m-0 pt-1">
                    Assigned employees can log in at <code className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/80 font-mono font-bold text-indigo-900 dark:text-indigo-200">/event-manager/login</code> to verify volunteers and track attendance.
                  </p>
                </div>

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Start Time *</span>
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
                      <span>End Time *</span>
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
                </div>

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
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Opportunity</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PROFILE INCOMPLETE & EMAIL OTP REQUIRED NOTICE MODAL */}
        {/* ============================================================ */}
        {profileIncompleteNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                    Profile 100% Completion Required
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                    To apply for "{profileIncompleteNoticeModal.op.title}"
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                <p className="m-0 font-bold">
                  To ensure authentic and safe volunteer coordination, your profile must be 100% complete before applying.
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block">
                    Remaining requirements to complete:
                  </span>
                  <ul className="m-0 pl-4 space-y-0.5 text-[11px] text-amber-900 dark:text-amber-200">
                    <li>📞 Contact Phone Number</li>
                    <li>📍 Address & City Details</li>
                    <li>🔑 Email OTP Verification</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setProfileIncompleteNoticeModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetOp = profileIncompleteNoticeModal.op
                    setPendingApplyOp(targetOp)
                    setProfileIncompleteNoticeModal(null)
                    setShowProfileCompleteModal(true)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Complete & Verify Now (OTP)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INTERACTIVE PROFILE COMPLETION & EMAIL OTP MODAL */}
        {/* ============================================================ */}
        <ProfileCompletionModal
          isOpen={showProfileCompleteModal}
          onClose={() => {
            setShowProfileCompleteModal(false)
            setPendingApplyOp(null)
          }}
          userEmail={userEmail}
          userRole={userRole}
          onCompleteSuccess={() => {
            setShowProfileCompleteModal(false)
            if (pendingApplyOp) {
              const op = pendingApplyOp
              setPendingApplyOp(null)
              handleOpenApplyModal(op)
            }
          }}
        />

        {/* Organization About Us & Trust Modal (Know More & Reviews) */}
        {selectedOrgForAbout && (
          <OrganizationAboutModal
            isOpen={Boolean(selectedOrgForAbout)}
            onClose={() => setSelectedOrgForAbout(null)}
            organizationName={selectedOrgForAbout}
            initialTab={aboutInitialTab}
            onExploreDrivesClick={(org) => {
              setSelectedCategory('All')
              setSearchQuery(org)
              const el = document.getElementById('opportunities-feed')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        )}

        {/* Confirm Permanent Event Completion Modal */}
        {confirmCompleteEvent && (
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
                    {confirmCompleteEvent.organization}
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
                  Once confirmed as completed, this event will conclude permanently. Verified volunteer hours will be credited to all enrolled attendees and public volunteer ratings will open.
                </p>
              </div>

              {/* Event Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                  {confirmCompleteEvent.title}
                </div>
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px] flex-wrap">
                  <span>📅 {confirmCompleteEvent.date}</span>
                  <span>📍 {confirmCompleteEvent.location}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    👥 {applicants.filter((a) => a.eventId === confirmCompleteEvent.id && a.status === 'accepted').length} Accepted Volunteers
                  </span>
                </div>
              </div>

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
                  onClick={() => executeCompleteEvent(confirmCompleteEvent)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, Confirm Completion</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </section>
    )
  }
)

OpportunitiesFeed.displayName = 'OpportunitiesFeed'

export default OpportunitiesFeed
