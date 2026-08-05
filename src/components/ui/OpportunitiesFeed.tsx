'use client'

import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react'
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
  Check
} from 'lucide-react'

export interface Opportunity {
  id: string
  title: string
  organization: string
  orgRole?: string
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  location: string
  isRemote: boolean
  date: string
  time: string
  spotsLeft: number
  skillsNeeded: string[]
  description: string
  bookmarked?: boolean
  applied?: boolean
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Community Beach & Park Cleanup',
    organization: 'Ocean & Earth Care Alliance',
    category: 'Environment',
    location: 'Coastal Park, Marine Drive',
    isRemote: false,
    date: 'Sat, Aug 15, 2026',
    time: '08:00 AM - 12:00 PM',
    spotsLeft: 8,
    skillsNeeded: ['Teamwork', 'Physical Activity', 'Eco Awareness'],
    description: 'Join us for a morning cleanup drive to protect local marine wildlife and keep our coastal parks pristine.',
  },
  {
    id: '2',
    title: 'Youth Coding & Robotics Workshop Mentor',
    organization: 'FutureTech Foundation',
    category: 'Education',
    location: 'Downtown Public Library / Hybrid',
    isRemote: false,
    date: 'Sun, Aug 16, 2026',
    time: '10:00 AM - 02:00 PM',
    spotsLeft: 4,
    skillsNeeded: ['Python / JS', 'Mentorship', 'Patience'],
    description: 'Help middle school students build their first interactive coding project. No prior teaching experience required!',
  },
  {
    id: '3',
    title: 'Virtual Community Meal Drive Coordinator',
    organization: 'Nourish Hope Network',
    category: 'Community',
    location: 'Remote',
    isRemote: true,
    date: 'Flexible Schedule',
    time: '4-6 hours / week',
    spotsLeft: 12,
    skillsNeeded: ['Logistics', 'Communication', 'Social Media'],
    description: 'Coordinate surplus food donations from local restaurants and match them with food pantries in real time.',
  },
  {
    id: '4',
    title: 'Senior Citizen Digital Literacy Assistant',
    organization: 'Silver Connect',
    category: 'Tech',
    location: 'Community Wellness Center',
    isRemote: false,
    date: 'Wed, Aug 19, 2026',
    time: '02:00 PM - 04:30 PM',
    spotsLeft: 6,
    skillsNeeded: ['Smartphone Basics', 'Patience', 'Friendly Manner'],
    description: 'Teach seniors how to make video calls, navigate health apps, and stay safe online.',
  },
  {
    id: '5',
    title: 'Urban Tree Planting & Reforestation Drive',
    organization: 'Green Canopy Initiative',
    category: 'Environment',
    location: 'Northside Botanical Park',
    isRemote: false,
    date: 'Sat, Aug 22, 2026',
    time: '07:30 AM - 11:30 AM',
    spotsLeft: 15,
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

const OpportunitiesFeed = forwardRef<OpportunitiesFeedRef, OpportunitiesFeedProps>(
  ({ userRole = 'volunteer' }, ref) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [applySuccessModal, setApplySuccessModal] = useState<string | null>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)

    // Form state for creating new opportunity
    const [newTitle, setNewTitle] = useState('')
    const [newCategory, setNewCategory] = useState<Opportunity['category']>('Community')
    const [newLocation, setNewLocation] = useState('')
    const [newIsRemote, setNewIsRemote] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const [newSpots, setNewSpots] = useState(10)
    const [newSkills, setNewSkills] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const [managingEvent, setManagingEvent] = useState<Opportunity | null>(null)
    const [applicants, setApplicants] = useState<Array<{
      id: string
      name: string
      email: string
      skills: string[]
      status: 'pending' | 'accepted' | 'declined'
      appliedAt: string
    }>>([
      {
        id: 'app-1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        skills: ['Teamwork', 'Communication', 'Eco Awareness'],
        status: 'pending',
        appliedAt: '2 hours ago',
      },
      {
        id: 'app-2',
        name: 'Marcus Chen',
        email: 'marcus.chen@example.org',
        skills: ['Python', 'Robotics', 'Mentorship'],
        status: 'accepted',
        appliedAt: '1 day ago',
      },
      {
        id: 'app-3',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        skills: ['Logistics', 'First Aid'],
        status: 'pending',
        appliedAt: '3 hours ago',
      },
    ])

    const handleApplicantStatus = (applicantId: string, status: 'accepted' | 'declined') => {
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status } : a))
      )
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
      setOpportunities((prev) =>
        prev.map((op) => (op.id === id ? { ...op, bookmarked: !op.bookmarked } : op))
      )
    }

    // Handle Application
    const handleApply = (op: Opportunity) => {
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === op.id
            ? { ...o, applied: true, spotsLeft: Math.max(0, o.spotsLeft - 1) }
            : o
        )
      )
      setApplySuccessModal(op.title)
    }

    // Handle Create Opportunity Submit
    const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!newTitle.trim() || !newDescription.trim()) return

      const created: Opportunity = {
        id: Date.now().toString(),
        title: newTitle,
        organization: 'Your Organization',
        category: newCategory,
        location: newIsRemote ? 'Remote' : newLocation || 'Local Community Center',
        isRemote: newIsRemote,
        date: newDate || 'Upcoming',
        time: newTime || 'To be scheduled',
        spotsLeft: Number(newSpots) || 10,
        skillsNeeded: newSkills
          ? newSkills.split(',').map((s) => s.trim())
          : ['Volunteering'],
        description: newDescription,
      }

      setOpportunities([created, ...opportunities])
      setShowCreateModal(false)

      // Reset form
      setNewTitle('')
      setNewDescription('')
      setNewLocation('')
      setNewSkills('')
    }

    // Filtering logic
    const filteredOpportunities = opportunities.filter((op) => {
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
                : 'Discover verified volunteer opportunities, community workshops, and local drives.'}
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
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{op.organization}</span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                    {op.description}
                  </p>

                  {/* Event Details Meta */}
                  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{op.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{op.date} • {op.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {op.spotsLeft} spot{op.spotsLeft !== 1 ? 's' : ''} remaining
                      </span>
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
                    op.organization === 'Your Organization' ? (
                      <button
                        type="button"
                        onClick={() => alert(`Managing event: ${op.title}\n8 applicants registered.`)}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-4 h-4" />
                        <span>Manage & View Applicants</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-semibold text-xs text-center">
                        Posted by {op.organization}
                      </div>
                    )
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

        {/* Application Success Modal */}
        {applySuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white m-0">You're Applied! 🎉</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 mb-6">
                You have successfully registered interest for <strong className="text-gray-900 dark:text-white">{applySuccessModal}</strong>. The organizer will reach out to you shortly.
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Post New Opportunity</h3>
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
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Weekend Food Distribution Drive"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Opportunity['category'])}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      Spots Available
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newSpots}
                      onChange={(e) => setNewSpots(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. City Central Community Center"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="e.g. Sat, Sep 5"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 09:00 AM - 01:00 PM"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
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
                    placeholder="e.g. Teamwork, Communication, Organization"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the opportunity responsibilities and goals..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer"
                  >
                    Publish Opportunity
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
