import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/ui/Logo'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="landing-navbar">
      <Link href="/" className="landing-logo">
        <Logo className="logo-svg" />
        <span>TogetherNow</span>
      </Link>
      <div className="landing-nav-actions">
        <Link
          href="/admin/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.95rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#34d399',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '99px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <ShieldCheck style={{ width: '15px', height: '15px' }} />
          <span>Admin Login</span>
        </Link>
        {user ? (
          <Link href="/dashboard" className="landing-btn-primary">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link href="/auth/login" className="landing-btn-secondary">
              Log in
            </Link>
            <Link href="/auth/signup" className="landing-btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
