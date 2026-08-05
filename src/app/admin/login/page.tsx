'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { adminLoginAction } from '@/app/actions/admin'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-decoration-none">
          <Logo className="w-8 h-8" />
          <span className="font-extrabold text-lg text-white tracking-tight">TogetherNow</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Security Portal
        </span>
      </header>

      {/* Main Admin Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight m-0">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400 m-0">
              Authorized platform administrators only. Access organization & donor verification tools.
            </p>
          </div>

          {state?.error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@togethernow.org"
                  placeholder="admin@togethernow.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="admin123"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
              <div className="font-semibold text-slate-300">Demo Admin Credentials:</div>
              <div>Email: <code className="text-emerald-400">admin@togethernow.org</code></div>
              <div>Password: <code className="text-emerald-400">admin123</code></div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isPending ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 text-decoration-none">
              ← Return to Main Website
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 TogetherNow Platform Administration • Restricted Access
      </footer>

    </div>
  )
}
