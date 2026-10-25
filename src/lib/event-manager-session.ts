import { cookies } from 'next/headers'

export interface EventManagerSession {
  employeeId: string
  name: string
  phone: string
  email?: string
  address?: string
  organizationId?: string
  organizationName?: string
  roleTitle?: string
}

const COOKIE_NAME = 'tn_event_manager_session'

export async function getEventManagerSession(): Promise<EventManagerSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(COOKIE_NAME)
    if (!sessionCookie || !sessionCookie.value) return null

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session: EventManagerSession = JSON.parse(decoded)
    if (!session.employeeId) return null
    return session
  } catch (err) {
    return null
  }
}

export async function setEventManagerSession(session: EventManagerSession): Promise<void> {
  const cookieStore = await cookies()
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64')
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearEventManagerSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
