'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = null

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <span className="auth-logo-icon">🤝</span>
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

          {/* General error */}
          {state?.errors?.general && (
            <div className="auth-alert auth-alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {state.errors.general[0]}
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
