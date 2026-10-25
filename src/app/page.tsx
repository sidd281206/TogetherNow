import Navbar from '@/components/ui/Navbar'
import HeroSection from '@/components/ui/HeroSection'
import FeaturesSection from '@/components/ui/FeaturesSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TogetherNow — Connect, Contribute, Impact',
  description: 'TogetherNow connects passionate volunteers with incredible organizations to make a real-world difference.',
}

import Link from 'next/link'

export default function Home() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <footer className="landing-footer">
        <span className="landing-footer-text">© {new Date().getFullYear()} TogetherNow. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/admin/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
              backgroundColor: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
            }}
          >
            <span>🛡️ Admin Login</span>
          </Link>
          <Link
            href="/event-manager/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#a5b4fc',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
              backgroundColor: 'rgba(165, 180, 252, 0.08)',
              border: '1px solid rgba(165, 180, 252, 0.2)',
            }}
          >
            <span>👔 Event Manager Login</span>
          </Link>
        </div>
        <span className="landing-footer-text">Built for a better tomorrow.</span>
      </footer>
    </div>
  )
}
