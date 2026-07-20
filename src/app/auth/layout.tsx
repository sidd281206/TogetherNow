import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TogetherNow — Sign In',
  description: 'Sign in or create your TogetherNow account to start making an impact.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-shell">
      {children}
    </div>
  )
}
