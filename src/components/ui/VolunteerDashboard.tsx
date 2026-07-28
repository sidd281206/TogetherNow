export default function VolunteerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-info-card flex flex-col items-center justify-center text-center p-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="dashboard-info-title text-xl">Impact Feed</h3>
          <p className="dashboard-info-body">You haven't logged any hours yet. Apply for an opportunity to get started!</p>
        </div>
        
        <div className="dashboard-info-card flex flex-col items-center justify-center text-center p-8">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="dashboard-info-title text-xl">Badges</h3>
          <p className="dashboard-info-body">Complete your first 10 hours of volunteering to earn the "Rising Star" badge.</p>
        </div>
      </div>

      <div className="dashboard-info-card p-6">
        <h3 className="dashboard-info-title text-xl mb-4 text-center">Suggested Opportunities</h3>
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
          <div className="text-3xl mb-3">🔍</div>
          <p className="dashboard-info-body">No opportunities available at the moment. Please check back later.</p>
          <button className="auth-btn-primary max-w-xs mx-auto mt-2">Refresh Feed</button>
        </div>
      </div>
    </div>
  )
}
