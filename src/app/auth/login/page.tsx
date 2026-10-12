'use client'

import { useActionState, Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction, signInWithGoogleAction, type AuthState } from '@/app/actions/auth'
import { Logo } from '@/components/ui/Logo'

const initialState: AuthState = null

function DeletedNotice() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDeleted = searchParams.get('deleted') === 'true'

  if (!isDeleted) return null

  return (
    <div className="auth-alert" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
      🗑️ Your account and associated profile data have been permanently deleted.
    </div>
  )
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <div className="auth-page" suppressHydrationWarning>
      {/* ── Left panel ── */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <Logo className="logo-svg" />
            <span className="auth-logo-text">TogetherNow</span>
          </div>
          <h1 className="auth-hero-title">
            Creating impact,<br />
            <span className="auth-hero-accent">together.</span>
          </h1>
          <p className="auth-hero-subtitle">
            Join thousands of volunteers, organizations, and donors
            building a better tomorrow — one act of kindness at a time.
          </p>
          <div className="auth-hero-stats">
            <div className="auth-stat">
              <span className="auth-stat-value">12,400+</span>
              <span className="auth-stat-label">Volunteers</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">840+</span>
              <span className="auth-stat-label">Organizations</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">95K hrs</span>
              <span className="auth-stat-label">Contributed</span>
            </div>
          </div>
        </div>
        <div className="auth-hero-orbs" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">
              Sign in to your account to continue your impact journey.
            </p>
          </div>

          <Suspense fallback={null}>
            <DeletedNotice />
          </Suspense>

          <form action={signInWithGoogleAction}>
            <button type="submit" className="auth-btn-secondary" style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.875rem' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          </div>

          {/* General error */}
          {state?.errors?.general && (
            <div className="auth-alert auth-alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {state.errors.general[0] && state.errors.general[0] !== '{}' && state.errors.general[0] !== '[object Object]'
                ? state.errors.general[0]
                : 'Invalid email or password. Please try again.'}
            </div>
          )}

          <form action={action} className="auth-form" noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`auth-input ${state?.errors?.email ? 'auth-input-error' : ''}`}
                aria-describedby={state?.errors?.email ? 'login-email-error' : undefined}
              />
              {state?.errors?.email && (
                <p id="login-email-error" className="auth-field-error">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">
                  Password
                </label>
                <a href="#" className="auth-forgot-link">
                  Forgot password?
                </a>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`auth-input ${state?.errors?.password ? 'auth-input-error' : ''}`}
                aria-describedby={state?.errors?.password ? 'login-password-error' : undefined}
              />
              {state?.errors?.password && (
                <p id="login-password-error" className="auth-field-error">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={pending}
              className="auth-btn-primary"
            >
              {pending ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="auth-switch-link">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
