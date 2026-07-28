'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signupAction, signInWithGoogleAction, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = null

type Role = 'volunteer' | 'organization' | 'donor'

const ROLES: {
  id: Role
  label: string
  icon: string
  description: string
}[] = [
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: '🙋',
    description: 'Donate your time and skills to causes you care about.',
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: '🏛️',
    description: 'Post opportunities and connect with passionate volunteers.',
  },
  {
    id: 'donor',
    label: 'Donor',
    icon: '💛',
    description: 'Support meaningful projects with financial contributions.',
  },
]

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, initialState)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [password, setPassword] = useState('')

  const passwordStrength = getPasswordStrength(password)

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
            Your journey<br />
            <span className="auth-hero-accent">starts here.</span>
          </h1>
          <p className="auth-hero-subtitle">
            Whether you give time, resources, or funds — every act
            of service creates ripples that change lives.
          </p>
          <ul className="auth-hero-features">
            <li className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              Verified opportunities from trusted organizations
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              Track your volunteer hours and earn badges
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              Download impact certificates
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              100% free to join — always
            </li>
          </ul>
        </div>
        <div className="auth-hero-orbs" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-form-panel auth-form-panel-scroll">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">
              Join the TogetherNow community in under a minute.
            </p>
          </div>

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
            <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.875rem' }}>or sign up with email</span>
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
              {state.errors.general[0]}
            </div>
          )}

          {/* Success message */}
          {state?.message && (
            <div className="auth-alert auth-alert-success" role="alert" style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {state.message}
            </div>
          )}

          <form action={action} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">Full name</label>
              <input
                id="signup-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Priya Sharma"
                className={`auth-input ${state?.errors?.fullName ? 'auth-input-error' : ''}`}
              />
              {state?.errors?.fullName && (
                <p className="auth-field-error">{state.errors.fullName[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`auth-input ${state?.errors?.email ? 'auth-input-error' : ''}`}
              />
              {state?.errors?.email && (
                <p className="auth-field-error">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signup-password" className="auth-label">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`auth-input ${state?.errors?.password ? 'auth-input-error' : ''}`}
              />
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="auth-strength-bar" aria-label={`Password strength: ${passwordStrength.label}`}>
                  <div
                    className={`auth-strength-fill auth-strength-${passwordStrength.level}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              )}
              {password.length > 0 && (
                <p className={`auth-strength-label auth-strength-label-${passwordStrength.level}`}>
                  {passwordStrength.label}
                </p>
              )}
              {state?.errors?.password && (
                <p className="auth-field-error">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Role Selector */}
            <div className="auth-field">
              <span className="auth-label">I am joining as a…</span>
              {/* Hidden input to submit role value */}
              <input type="hidden" name="role" value={selectedRole ?? ''} />
              <div className="auth-role-grid">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    id={`role-${role.id}`}
                    onClick={() => setSelectedRole(role.id)}
                    className={`auth-role-card ${selectedRole === role.id ? 'auth-role-card-active' : ''}`}
                    aria-pressed={selectedRole === role.id}
                  >
                    <span className="auth-role-icon">{role.icon}</span>
                    <span className="auth-role-label">{role.label}</span>
                    <span className="auth-role-desc">{role.description}</span>
                    {selectedRole === role.id && (
                      <span className="auth-role-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {state?.errors?.role && (
                <p className="auth-field-error">{state.errors.role[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={pending}
              className="auth-btn-primary"
            >
              {pending ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                'Create free account'
              )}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account, you agree to our{' '}
            <a href="#" className="auth-switch-link">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="auth-switch-link">Privacy Policy</a>.
          </p>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/auth/login" className="auth-switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Password strength helper ────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  level: 'weak' | 'fair' | 'strong'
  label: string
  width: string
} {
  if (password.length < 6) return { level: 'weak', label: 'Weak', width: '25%' }
  if (password.length < 10) return { level: 'fair', label: 'Fair', width: '60%' }

  const hasLetter  = /[a-zA-Z]/.test(password)
  const hasNumber  = /[0-9]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  if (hasLetter && hasNumber && hasSpecial)
    return { level: 'strong', label: 'Strong', width: '100%' }

  return { level: 'fair', label: 'Fair', width: '60%' }
}
