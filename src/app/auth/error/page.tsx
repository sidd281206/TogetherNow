import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Auth Error — TogetherNow',
}

export default function AuthErrorPage() {
  return (
    <div className="auth-error-page">
      <div className="auth-error-card">
        <div className="auth-error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="auth-error-title">Authentication Error</h1>
        <p className="auth-error-desc">
          Something went wrong during authentication. This could be because
          the link has expired or is invalid.
        </p>
        <div className="auth-error-actions">
          <Link href="/auth/login" className="auth-error-btn-primary">
            Back to Login
          </Link>
          <Link href="/auth/signup" className="auth-error-btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
