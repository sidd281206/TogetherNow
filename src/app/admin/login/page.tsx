'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { adminLoginAction } from '@/app/actions/admin'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none">
          <Logo className="w-8 h-8 text-emerald-600" />
          <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">TogetherNow</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Platform Security Portal
        </span>
      </header>

      {/* Main Admin Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight m-0">
              Administrator Login
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0">
              Authorized platform administrators only. Access organization &amp; donor verification tools.
            </p>
          </div>

          {state?.error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@togethernow.org"
                  placeholder="admin@togethernow.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="admin123"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
              <div className="font-extrabold text-emerald-900 dark:text-emerald-300">Demo Admin Credentials:</div>
              <div>Email: <code className="font-mono font-bold text-emerald-700 dark:text-emerald-400">admin@togethernow.org</code></div>
              <div>Password: <code className="font-mono font-bold text-emerald-700 dark:text-emerald-400">admin123</code></div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isPending ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-decoration-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Website</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/60 dark:border-gray-800">
        © {new Date().getFullYear()} TogetherNow Platform Administration • Restricted Access
      </footer>

    </div>
  )
}
