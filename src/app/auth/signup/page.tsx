'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signupAction, type AuthState } from '@/app/actions/auth'

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
