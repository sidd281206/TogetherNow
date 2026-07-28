import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="landing-hero-content">
        <span className="landing-hero-badge">
          <span>✨</span> The New Standard for Volunteering
        </span>
        <h1 className="landing-hero-title">
          Connect, Contribute, and <span className="landing-hero-title-highlight">Make an Impact</span>
        </h1>
        <p className="landing-hero-subtitle">
          TogetherNow connects passionate volunteers with incredible organizations. 
          Track your hours, earn badges, and see the real-world difference you are making in your community.
        </p>
        <div className="landing-hero-actions">
          <Link href="/auth/signup" className="landing-btn-primary landing-hero-btn-large">
            Join the Movement
          </Link>
          <Link href="/auth/login" className="landing-btn-secondary landing-hero-btn-large">
            Explore Opportunities
          </Link>
        </div>
      </div>
    </section>
  )
}
