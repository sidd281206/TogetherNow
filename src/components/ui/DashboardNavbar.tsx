'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Home, 
  Search, 
  Calendar, 
  Bell, 
  User, 
  LogOut, 
  PlusCircle, 
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { logoutAction } from '@/app/actions/auth'

interface DashboardNavbarProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      role?: string
    }
  }
  profileStatus: {
    isNewUser: boolean
    completionPercentage: number
    role: string
  }
  onSearchClick?: () => void
  onPostOpportunityClick?: () => void
}

export default function DashboardNavbar({
  user,
  profileStatus,
  onSearchClick,
  onPostOpportunityClick,
}: DashboardNavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState(false)

  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Member'
  const firstName = fullName.split(' ')[0]
  const role = profileStatus.role ?? 'volunteer'

  const mockNotifications = [
    {
      id: '1',
      title: 'Welcome to TogetherNow!',
      message: 'Explore events and volunteer opportunities in your area.',
      time: 'Just now',
      unread: !notificationsRead,
    },
    {
      id: '2',
      title: 'Profile Tip',
      message: `${profileStatus.completionPercentage}% complete. Complete remaining details to get better matches!`,
      time: '2h ago',
      unread: !notificationsRead,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/80 dark:border-gray-800/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group text-decoration-none">
            <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              TogetherNow
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/60 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-900 shadow-xs text-decoration-none transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <button
              type="button"
              onClick={onSearchClick}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800 transition-all border-none bg-transparent cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <span>Search</span>
            </button>

            <a
              href="#opportunities-feed"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800 text-decoration-none transition-all"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Events & Opportunities</span>
            </a>
          </nav>
        </div>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Post Opportunity Button for Organization */}
          {role === 'organization' && onPostOpportunityClick && (
            <button
              type="button"
              onClick={onPostOpportunityClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Event</span>
            </button>
          )}

          {/* Quick Search Icon (Mobile / Tablet) */}
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search events"
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors border-none bg-transparent cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfileMenu(false)
              }}
              aria-label="Notifications"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors border-none bg-transparent cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {!notificationsRead && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white m-0">Notifications</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsRead(true)}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-gray-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 m-0 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                setShowNotifications(false)
              }}
              className="group flex items-center gap-2.5 pl-3.5 pr-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/90 hover:border-emerald-300 dark:hover:border-emerald-700/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[130px]">
                  {firstName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 leading-none mt-0.5">
                  {role}
                </span>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-emerald-500/20 dark:ring-emerald-400/20 transition-transform group-hover:scale-105">
                {firstName[0]?.toUpperCase()}
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`}
              />
            </button>

            {/* Profile Popup Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {firstName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white m-0 leading-tight">{fullName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0 truncate max-w-[160px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Profile Completeness Quick Status */}
                <div className="mb-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Profile Strength
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {profileStatus.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileStatus.completionPercentage}%` }}
                    />
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setShowProfileMenu(false)}
                    className="inline-block mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-decoration-none"
                  >
                    {profileStatus.isNewUser
                      ? 'Complete profile now →'
                      : profileStatus.completionPercentage < 100
                      ? 'Finish remaining details →'
                      : 'Edit profile →'}
                  </Link>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <Link
                    href="/onboarding"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-decoration-none"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span>My Profile & Settings</span>
                  </Link>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border-none bg-transparent cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
