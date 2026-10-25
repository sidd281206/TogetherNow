'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  AlertCircle, 
  Check, 
  Lock,
  ArrowLeft
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { loginEventManagerAction } from '@/app/actions/event-manager'

export default function EventManagerLoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleQuickFill = (empCode: string, pass: string) => {
    setEmployeeId(empCode)
    setPassword(pass)
    setErrorMsg(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!employeeId.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Employee ID and password.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('employeeId', employeeId.trim().toUpperCase())
      formData.append('password', password.trim())

      const res = await loginEventManagerAction(null, formData)
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl)
      } else {
        setErrorMsg(res.error || 'Failed to authenticate. Please check your credentials.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top Bar Return Link */}
      <div className="absolute top-6 left-6 sm:left-12 flex items-center gap-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-decoration-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Login</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <Logo className="w-10 h-10 text-indigo-600" />
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">TogetherNow</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold uppercase tracking-wider mb-2">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Event Manager Portal</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white m-0">
          Sign In with Employee ID
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          Access your assigned events, manage volunteer attendance, and review candidates in real-time.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Employee ID / Manager Code *</span>
                <span className="text-[10px] text-gray-400 font-normal">Provided by your Organization</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="e.g. EM101 or TN-EM-102"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Password *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your manager password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-none cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isPending ? (
                <span>Verifying Employee ID...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In as Event Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Helper */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2">
              ⚡ Quick Demo Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('EM101', 'password123')}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-left border border-indigo-100 dark:border-indigo-900/40 cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">EM101 (Arjun)</div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400">Ocean Care Alliance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('EM102', 'password123')}
                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-left border border-purple-100 dark:border-purple-900/40 cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-purple-950 dark:text-purple-200">EM102 (Pooja)</div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400">FutureTech Foundation</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
              Not an Event Manager?{' '}
              <Link
                href="/auth/login"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Volunteer &amp; Org Login →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
