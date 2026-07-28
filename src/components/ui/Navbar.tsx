import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="landing-navbar">
      <Link href="/" className="landing-logo">
        <span>🤝</span>
        <span>TogetherNow</span>
      </Link>
      <div className="landing-nav-actions">
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
