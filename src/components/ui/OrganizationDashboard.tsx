export default function OrganizationDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-info-card text-center p-6">
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-[var(--auth-text-muted)]">Active Opportunities</div>
        </div>
        <div className="dashboard-info-card text-center p-6">
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-[var(--auth-text-muted)]">Pending Applications</div>
        </div>
        <div className="dashboard-info-card text-center p-6">
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-[var(--auth-text-muted)]">Hours Logged</div>
        </div>
      </div>

      <div className="dashboard-info-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="dashboard-info-title text-xl m-0">Your Opportunities</h3>
          <button className="auth-btn-primary max-w-xs !m-0 !w-auto !py-2 !px-4 text-sm">
            + Create Opportunity
          </button>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5">
          <div className="text-3xl mb-3">📝</div>
          <h4 className="text-white font-medium mb-1">No opportunities created yet</h4>
          <p className="dashboard-info-body !mb-0">Start by creating an opportunity to attract volunteers.</p>
        </div>
      </div>
    </div>
  )
}
