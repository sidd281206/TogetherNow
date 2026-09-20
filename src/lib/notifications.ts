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
  targetUserId?: string
  targetEmail?: string
  createdAt?: number
}

const NOTIFICATIONS_STORAGE_KEY = 'togethernow_notifications_v1'

export function getStoredNotifications(
  userRole?: string,
  storageKey?: string,
  filterUser?: { userId?: string; userEmail?: string }
): AppNotification[] {
  if (typeof window === 'undefined') return []
  const key = storageKey || NOTIFICATIONS_STORAGE_KEY
  try {
    const raw = localStorage.getItem(key)
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
      localStorage.setItem(key, JSON.stringify(defaultNotifs))
      return defaultNotifs
    }
    const parsed: AppNotification[] = JSON.parse(raw)
    return parsed.filter((n) => {
      // Role match
      if (userRole && userRole !== 'admin') {
        if (n.targetRole && n.targetRole !== 'all' && n.targetRole !== userRole) return false
      }
      // Target user match (if a notification was sent to a specific user)
      if (filterUser && (n.targetUserId || n.targetEmail)) {
        const matchesUser =
          (filterUser.userId && n.targetUserId && n.targetUserId === filterUser.userId) ||
          (filterUser.userEmail && n.targetEmail && n.targetEmail.toLowerCase() === filterUser.userEmail.toLowerCase())
        if (!matchesUser) return false
      }
      return true
    })
  } catch (err) {
    console.warn('Error reading notifications:', err)
    return []
  }
}

export function pushNotification(
  notif: Omit<AppNotification, 'id' | 'time' | 'unread' | 'createdAt'>,
  storageKey?: string
): void {
  if (typeof window === 'undefined') return
  const key = storageKey || NOTIFICATIONS_STORAGE_KEY
  try {
    const raw = localStorage.getItem(key)
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
      targetUserId: notif.targetUserId,
      targetEmail: notif.targetEmail,
      time: 'Just now',
      unread: true,
      createdAt: Date.now(),
    }
    const updated = [newNotif, ...existing]
    localStorage.setItem(key, JSON.stringify(updated))

    // If notification has a specific recipient and was pushed to global key, also mirror to their scoped key
    const targetScopeId = notif.targetUserId || notif.targetEmail
    if (targetScopeId && key === NOTIFICATIONS_STORAGE_KEY) {
      try {
        const userScopedKey = `togethernow_notifications_v1_${targetScopeId}`
        const userRaw = localStorage.getItem(userScopedKey)
        const userExisting: AppNotification[] = userRaw ? JSON.parse(userRaw) : []
        localStorage.setItem(userScopedKey, JSON.stringify([newNotif, ...userExisting]))
      } catch {}
    }

    window.dispatchEvent(new CustomEvent('togethernow_new_notification', { detail: newNotif }))
  } catch (err) {
    console.warn('Error pushing notification:', err)
  }
}

export function markAllNotificationsRead(storageKey?: string): void {
  if (typeof window === 'undefined') return
  const key = storageKey || NOTIFICATIONS_STORAGE_KEY
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const existing: AppNotification[] = JSON.parse(raw)
    const updated = existing.map((n) => ({ ...n, unread: false }))
    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('togethernow_new_notification'))
  } catch (err) {
    console.warn('Error marking notifications as read:', err)
  }
}

export function deleteNotification(id: string, storageKey?: string): void {
  if (typeof window === 'undefined') return
  const key = storageKey || NOTIFICATIONS_STORAGE_KEY
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const existing: AppNotification[] = JSON.parse(raw)
    const updated = existing.filter((n) => n.id !== id)
    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('togethernow_new_notification'))
  } catch (err) {
    console.warn('Error deleting notification:', err)
  }
}

