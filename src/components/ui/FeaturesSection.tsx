export default function FeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "Smart Matching",
      desc: "Our algorithm connects you with opportunities that match your skills, interests, and availability perfectly."
    },
    {
      icon: "📊",
      title: "Impact Tracking",
      desc: "Log your hours, earn verified certificates, and showcase your community impact with a personalized dashboard."
    },
    {
      icon: "🏢",
      title: "For Organizations",
      desc: "Streamline volunteer management, track attendance seamlessly, and focus on what matters most—your mission."
    }
  ]

  return (
    <section className="landing-features">
      <div className="landing-section-header">
        <h2 className="landing-section-title">Everything you need to make a difference</h2>
        <p className="landing-section-subtitle">
          Whether you are a volunteer looking to give back or an organization seeking passionate individuals, we have you covered.
        </p>
      </div>
      <div className="landing-features-grid">
        {features.map((feature, i) => (
          <div key={i} className="landing-feature-card">
            <div className="landing-feature-icon">{feature.icon}</div>
            <h3 className="landing-feature-title">{feature.title}</h3>
            <p className="landing-feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
