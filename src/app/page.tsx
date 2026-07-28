import Navbar from '@/components/ui/Navbar'
import HeroSection from '@/components/ui/HeroSection'
import FeaturesSection from '@/components/ui/FeaturesSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TogetherNow — Connect, Contribute, Impact',
  description: 'TogetherNow connects passionate volunteers with incredible organizations to make a real-world difference.',
}

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
        <span className="landing-footer-text">Built for a better tomorrow.</span>
      </footer>
    </div>
  )
}
