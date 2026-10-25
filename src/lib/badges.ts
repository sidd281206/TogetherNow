export type BadgeCategory = 'Starter' | 'Dedicated' | 'Leader' | 'Champion'

export interface BadgeDefinition {
  id: string
  name: string
  category: BadgeCategory
  hoursRequired: number
  description: string
  iconName: string
  glyph: string
  accentColor: string
  bgGradient: string
  borderColor: string
}

export interface VolunteerBadgeWithProgress extends BadgeDefinition {
  earned: boolean
  progressPercent: number
  hoursRemaining: number
}

export interface BadgeCategoryInfo {
  category: BadgeCategory
  label: string
  emoji: string
  hoursRange: string
  description: string
  accentColor: string
  badges: BadgeDefinition[]
}

export const ALL_BADGES: BadgeDefinition[] = [
  // ── 1. Starter Tier (1 - 10 Hours) ─────────────────────────────────
  {
    id: 'first-step',
    name: 'First Step',
    category: 'Starter',
    hoursRequired: 1,
    description: 'Completed your very first volunteer session and stepped forward to make a difference.',
    iconName: 'Footprints',
    glyph: '🌱',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-300 dark:border-emerald-700/60',
  },
  {
    id: 'helper',
    name: 'Helper',
    category: 'Starter',
    hoursRequired: 5,
    description: 'Accumulated 5 hours of dedicated volunteer service helping community causes.',
    iconName: 'HeartHandshake',
    glyph: '🤝',
    accentColor: '#14b8a6',
    bgGradient: 'from-teal-500/20 to-cyan-500/10',
    borderColor: 'border-teal-300 dark:border-teal-700/60',
  },
  {
    id: 'bronze-volunteer',
    name: 'Bronze Volunteer',
    category: 'Starter',
    hoursRequired: 10,
    description: 'Reached 10 hours of active community impact and reliable on-ground participation.',
    iconName: 'Award',
    glyph: '🥉',
    accentColor: '#d97706',
    bgGradient: 'from-amber-600/20 to-orange-500/10',
    borderColor: 'border-amber-400 dark:border-amber-700/60',
  },

  // ── 2. Dedicated Tier (25 - 50 Hours) ──────────────────────────────
  {
    id: 'active-citizen',
    name: 'Active Citizen',
    category: 'Dedicated',
    hoursRequired: 25,
    description: 'Dedicated 25 hours to community causes, building momentum for long-term social change.',
    iconName: 'Users',
    glyph: '🌟',
    accentColor: '#3b82f6',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'border-blue-400 dark:border-blue-700/60',
  },
  {
    id: 'silver-volunteer',
    name: 'Silver Volunteer',
    category: 'Dedicated',
    hoursRequired: 50,
    description: '50 hours of sustained volunteer commitment with proven dependability and leadership.',
    iconName: 'ShieldCheck',
    glyph: '🥈',
    accentColor: '#6366f1',
    bgGradient: 'from-indigo-500/20 to-purple-500/10',
    borderColor: 'border-indigo-400 dark:border-indigo-700/60',
  },

  // ── 3. Leader Tier (100 - 250 Hours) ──────────────────────────────
  {
    id: 'community-pillar',
    name: 'Community Pillar',
    category: 'Leader',
    hoursRequired: 100,
    description: '100 hours of grassroots community service — a true inspiration and pillar of social initiatives.',
    iconName: 'Building2',
    glyph: '🏛️',
    accentColor: '#8b5cf6',
    bgGradient: 'from-purple-500/20 to-fuchsia-500/10',
    borderColor: 'border-purple-400 dark:border-purple-700/60',
  },
  {
    id: 'gold-volunteer',
    name: 'Gold Volunteer',
    category: 'Leader',
    hoursRequired: 250,
    description: 'An extraordinary 250 hours of volunteer service demonstrating deep community mastery.',
    iconName: 'Sparkles',
    glyph: '🥇',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-500/25 to-yellow-500/10',
    borderColor: 'border-amber-400 dark:border-amber-600/70',
  },

  // ── 4. Champion Tier (500+ Hours) ─────────────────────────────────
  {
    id: 'champion',
    name: 'Champion',
    category: 'Champion',
    hoursRequired: 500,
    description: 'Legendary milestone: 500+ lifetime hours transforming communities and mentoring upcoming volunteers.',
    iconName: 'Crown',
    glyph: '👑',
    accentColor: '#ec4899',
    bgGradient: 'from-pink-500/25 to-rose-500/15',
    borderColor: 'border-pink-400 dark:border-pink-600/70',
  },
]

export const BADGE_CATEGORIES: BadgeCategoryInfo[] = [
  {
    category: 'Starter',
    label: 'Starter Tier',
    emoji: '🌱',
    hoursRange: '1 – 10 Hours',
    description: 'Beginner milestones acknowledging initial volunteer participation and helpful community support.',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    badges: ALL_BADGES.filter((b) => b.category === 'Starter'),
  },
  {
    category: 'Dedicated',
    label: 'Dedicated Tier',
    emoji: '🌟',
    hoursRange: '25 – 50 Hours',
    description: 'Recognizing reliable, recurring contributors with consistent community attendance and involvement.',
    accentColor: 'text-blue-600 dark:text-blue-400',
    badges: ALL_BADGES.filter((b) => b.category === 'Dedicated'),
  },
  {
    category: 'Leader',
    label: 'Leader Tier',
    emoji: '🏆',
    hoursRange: '100 – 250 Hours',
    description: 'High-impact milestones recognizing leadership, deep commitment, and pillar-level social impact.',
    accentColor: 'text-purple-600 dark:text-purple-400',
    badges: ALL_BADGES.filter((b) => b.category === 'Leader'),
  },
  {
    category: 'Champion',
    label: 'Champion Tier',
    emoji: '👑',
    hoursRange: '500+ Hours',
    description: 'Elite lifetime milestone representing legendary social change and supreme dedication.',
    accentColor: 'text-pink-600 dark:text-pink-400',
    badges: ALL_BADGES.filter((b) => b.category === 'Champion'),
  },
]

/**
 * Returns all categorized badges enriched with real-time earned state and progress percentage.
 */
export function getVolunteerBadges(totalHours: number): VolunteerBadgeWithProgress[] {
  const safeHours = Math.max(0, totalHours || 0)

  return ALL_BADGES.map((badge) => {
    const earned = safeHours >= badge.hoursRequired
    const progressPercent = Math.min(100, Math.round((safeHours / badge.hoursRequired) * 100))
    const hoursRemaining = Math.max(0, badge.hoursRequired - safeHours)

    return {
      ...badge,
      earned,
      progressPercent,
      hoursRemaining,
    }
  })
}

/**
 * Returns the highest earned badge for a volunteer based on total hours.
 */
export function getHighestBadge(totalHours: number): VolunteerBadgeWithProgress | null {
  const badges = getVolunteerBadges(totalHours)
  const earnedBadges = badges.filter((b) => b.earned)
  if (earnedBadges.length === 0) return null
  return earnedBadges[earnedBadges.length - 1]
}

/**
 * Returns tier information and progress toward next tier.
 */
export function getCurrentTierInfo(totalHours: number): {
  currentTier: BadgeCategory
  currentTierLabel: string
  currentTierEmoji: string
  nextTierLabel?: string
  hoursToNextTier: number
  progressToNextTier: number
} {
  const safeHours = Math.max(0, totalHours || 0)

  if (safeHours >= 500) {
    return {
      currentTier: 'Champion',
      currentTierLabel: 'Champion Tier',
      currentTierEmoji: '👑',
      hoursToNextTier: 0,
      progressToNextTier: 100,
    }
  }

  if (safeHours >= 100) {
    const nextTarget = 500
    const progress = Math.min(100, Math.round(((safeHours - 100) / (nextTarget - 100)) * 100))
    return {
      currentTier: 'Leader',
      currentTierLabel: 'Leader Tier',
      currentTierEmoji: '🏆',
      nextTierLabel: 'Champion Tier (500h)',
      hoursToNextTier: nextTarget - safeHours,
      progressToNextTier: progress,
    }
  }

  if (safeHours >= 25) {
    const nextTarget = 100
    const progress = Math.min(100, Math.round(((safeHours - 25) / (nextTarget - 25)) * 100))
    return {
      currentTier: 'Dedicated',
      currentTierLabel: 'Dedicated Tier',
      currentTierEmoji: '🌟',
      nextTierLabel: 'Leader Tier (100h)',
      hoursToNextTier: nextTarget - safeHours,
      progressToNextTier: progress,
    }
  }

  // Starter Tier (0 - 24 hrs)
  const nextTarget = 25
  const progress = Math.min(100, Math.round((safeHours / nextTarget) * 100))
  return {
    currentTier: 'Starter',
    currentTierLabel: 'Starter Tier',
    currentTierEmoji: '🌱',
    nextTierLabel: 'Dedicated Tier (25h)',
    hoursToNextTier: nextTarget - safeHours,
    progressToNextTier: progress,
  }
}
