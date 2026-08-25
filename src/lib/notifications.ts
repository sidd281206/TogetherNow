export interface AppNotification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  targetRole?: 'volunteer' | 'organization' | 'all'
  type?: 'approval' | 'declined' | 'application' | 'general'
  eventId?: string
  eventTitle?: string
  applicantName?: string
  createdAt?: number
}

const NOTIFICATIONS_STORAGE_KEY = 'togethernow_notifications_v1'

export function getStoredNotifications(userRole?: string): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!raw) {
      const defaultNotifs: AppNotification[] = [
        {
          id: 'welcome-1',
          title: 'Welcome to TogetherNow!',
          message: 'Explore events and volunteer opportunities in your community.',
          time: 'Just now',
          unread: true,
          type: 'general',
          targetRole: 'all',
          createdAt: Date.now(),
        },
      ]
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultNotifs))
      return defaultNotifs
    }
    const parsed: AppNotification[] = JSON.parse(raw)
    if (!userRole || userRole === 'admin') return parsed
    return parsed.filter((n) => !n.targetRole || n.targetRole === 'all' || n.targetRole === userRole)
  } catch (err) {
    console.warn('Error reading notifications:', err)
    return []
  }
}

export function pushNotification(notif: Omit<AppNotification, 'id' | 'time' | 'unread' | 'createdAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    const existing: AppNotification[] = raw ? JSON.parse(raw) : []
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: notif.title,
      message: notif.message,
      targetRole: notif.targetRole || 'all',
      type: notif.type || 'general',
      eventId: notif.eventId,
      eventTitle: notif.eventTitle,
      applicantName: notif.applicantName,
      time: 'Just now',
      unread: true,
      createdAt: Date.now(),
    }
    const updated = [newNotif, ...existing]
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('togethernow_new_notification', { detail: newNotif }))
  } catch (err) {
    console.warn('Error pushing notification:', err)
  }
}

export function markAllNotificationsRead(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!raw) return
    const existing: AppNotification[] = JSON.parse(raw)
    const updated = existing.map((n) => ({ ...n, unread: false }))
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('togethernow_new_notification'))
  } catch (err) {
    console.warn('Error marking notifications as read:', err)
  }
}

export function deleteNotification(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!raw) return
    const existing: AppNotification[] = JSON.parse(raw)
    const updated = existing.filter((n) => n.id !== id)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('togethernow_new_notification'))
  } catch (err) {
    console.warn('Error deleting notification:', err)
  }
}

