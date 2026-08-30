export interface OrgReview {
  id: string
  orgName: string
  eventId?: string
  eventTitle?: string
  volunteerName: string
  volunteerEmail?: string
  rating: number // 1 to 5
  managementRating: number // 1 to 5
  supportRating: number // 1 to 5
  impactRating: number // 1 to 5
  feedback: string
  createdAt: string
  tags?: string[]
}

export interface OrgRatingSummary {
  averageRating: number
  totalReviews: number
  starDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  subRatings: {
    management: number
    support: number
    impact: number
  }
}

export const REVIEWS_STORAGE_KEY = 'togethernow_org_reviews_v2'

export const DEFAULT_ORG_REVIEWS: Record<string, OrgReview[]> = {
  'Ocean & Earth Care Alliance': [
    {
      id: 'rev-ocean-1',
      orgName: 'Ocean & Earth Care Alliance',
      eventTitle: 'Versova Beach Mega Cleanup Drive',
      volunteerName: 'Aarav Sharma',
      volunteerEmail: 'aarav.sharma@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Incredible drive! The coordinators provided high quality rubber gloves, trash grabbers, and water refill stations. We cleared over 3 tons of plastic waste before noon.',
      createdAt: 'Aug 12, 2026',
      tags: ['Well Organized', 'Great Equipment', 'High Impact'],
    },
    {
      id: 'rev-ocean-2',
      orgName: 'Ocean & Earth Care Alliance',
      eventTitle: 'Gorai Mangrove Bio-Shield Reforestation',
      volunteerName: 'Priya Iyer',
      volunteerEmail: 'priya.iyer@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 4,
      impactRating: 5,
      feedback: 'The mangrove plantation was so fulfilling. Marine biologist on site explained the ecosystem benefits of each sapling. Highly recommended for students and eco-enthusiasts!',
      createdAt: 'Aug 04, 2026',
      tags: ['Educational', 'Inspiring', 'Eco Friendly'],
    },
    {
      id: 'rev-ocean-3',
      orgName: 'Ocean & Earth Care Alliance',
      eventTitle: 'Monsoon Coastline Rescue & Cleanup',
      volunteerName: 'Rohan Patel',
      volunteerEmail: 'rohan.patel@example.com',
      rating: 4,
      managementRating: 4,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Very safety-focused even during high tide. The team ensured all first aid kits and refreshments were ready. Wonderful initiative!',
      createdAt: 'Jul 24, 2026',
      tags: ['Safety First', 'Supportive Team'],
    },
  ],

  'FutureTech Foundation': [
    {
      id: 'rev-ft-1',
      orgName: 'FutureTech Foundation',
      eventTitle: 'Underprivileged Youth Coding Bootcamp Mentor',
      volunteerName: 'Vikram Joshi',
      volunteerEmail: 'vikram.j@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Teaching Python to 8th graders was the highlight of my month. The classroom setup was seamless and curriculum materials were provided beforehand.',
      createdAt: 'Aug 14, 2026',
      tags: ['Great Curriculum', 'Empowering Youth'],
    },
    {
      id: 'rev-ft-2',
      orgName: 'FutureTech Foundation',
      eventTitle: 'Code & Create Weekend Hackathon',
      volunteerName: 'Sneha Kulkarni',
      volunteerEmail: 'sneha.k@example.com',
      rating: 5,
      managementRating: 4,
      supportRating: 5,
      impactRating: 5,
      feedback: 'The kids were so excited to build their own web games. FutureTech provides genuine opportunities for underprivileged youth to enter tech.',
      createdAt: 'Jul 30, 2026',
      tags: ['Inspiring', 'Well Prepared'],
    },
  ],

  'Nourish Hope Network': [
    {
      id: 'rev-nh-1',
      orgName: 'Nourish Hope Network',
      eventTitle: 'Virtual Community Meal Drive Coordinator',
      volunteerName: 'Ananya Deshmukh',
      volunteerEmail: 'ananya.d@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Super slick remote operations. Real-time Slack and WhatsApp dispatching made coordinating food pickups seamless. Zero food wasted!',
      createdAt: 'Aug 10, 2026',
      tags: ['Smooth Coordination', 'Real-Time Impact'],
    },
    {
      id: 'rev-nh-2',
      orgName: 'Nourish Hope Network',
      eventTitle: 'Surplus Food Rescue & Night Distribution Drive',
      volunteerName: 'Karan Mehra',
      volunteerEmail: 'karan.m@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 4,
      impactRating: 5,
      feedback: 'Heartwarming experience delivering hot meals to community shelters. Clean hygiene standards and compassionate team leaders.',
      createdAt: 'Aug 01, 2026',
      tags: ['Compassionate', 'High Hygiene'],
    },
  ],

  'Silver Connect': [
    {
      id: 'rev-sc-1',
      orgName: 'Silver Connect',
      eventTitle: 'Senior Citizen Digital Literacy Assistant',
      volunteerName: 'Neha Nair',
      volunteerEmail: 'neha.n@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Patient and thoughtful program. Seeing elderly grandparents learn to video call their overseas family was priceless. Wonderful coordinator support.',
      createdAt: 'Aug 08, 2026',
      tags: ['Caring Environment', 'Heartwarming'],
    },
  ],

  'Green Canopy Initiative': [
    {
      id: 'rev-gc-1',
      orgName: 'Green Canopy Initiative',
      eventTitle: 'Urban Tree Planting & Reforestation Drive',
      volunteerName: 'Manish Verma',
      volunteerEmail: 'manish.v@example.com',
      rating: 5,
      managementRating: 5,
      supportRating: 5,
      impactRating: 5,
      feedback: 'Over 200 saplings planted with native compost and tree guards. Great team spirit and healthy snacks provided.',
      createdAt: 'Aug 15, 2026',
      tags: ['Eco Champion', 'Great Teamwork'],
    },
  ],
}

/**
 * Get all reviews grouped by organization
 */
export function getAllReviews(): Record<string, OrgReview[]> {
  if (typeof window === 'undefined') {
    return DEFAULT_ORG_REVIEWS
  }

  try {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        // Merge with defaults so default orgs always have rich initial reviews
        const merged = { ...DEFAULT_ORG_REVIEWS }
        Object.keys(parsed).forEach((k) => {
          merged[k] = parsed[k]
        })
        return merged
      }
    }
  } catch (e) {
    console.warn('Error reading reviews from storage:', e)
  }

  return DEFAULT_ORG_REVIEWS
}

/**
 * Get reviews for a specific organization
 */
export function getOrgReviews(orgName: string): OrgReview[] {
  const all = getAllReviews()
  const exact = all[orgName]
  if (exact && exact.length > 0) return exact

  // Case insensitive match
  const matchKey = Object.keys(all).find((k) => k.toLowerCase() === orgName?.toLowerCase())
  if (matchKey && all[matchKey]) return all[matchKey]

  return []
}

/**
 * Calculate the overall rating summary & breakdown for an organization
 */
export function getOrgRatingSummary(orgName: string): OrgRatingSummary {
  const reviews = getOrgReviews(orgName)

  if (!reviews || reviews.length === 0) {
    // Default pleasant baseline rating for verified NGOs without user reviews yet
    return {
      averageRating: 4.9,
      totalReviews: 8,
      starDistribution: { 5: 7, 4: 1, 3: 0, 2: 0, 1: 0 },
      subRatings: { management: 4.9, support: 4.8, impact: 5.0 },
    }
  }

  let totalScore = 0
  let totalMgmt = 0
  let totalSupport = 0
  let totalImpact = 0

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)))
    dist[star] = (dist[star] || 0) + 1

    totalScore += r.rating || 5
    totalMgmt += r.managementRating || r.rating || 5
    totalSupport += r.supportRating || r.rating || 5
    totalImpact += r.impactRating || r.rating || 5
  })

  const count = reviews.length
  return {
    averageRating: Number((totalScore / count).toFixed(1)),
    totalReviews: count,
    starDistribution: dist as OrgRatingSummary['starDistribution'],
    subRatings: {
      management: Number((totalMgmt / count).toFixed(1)),
      support: Number((totalSupport / count).toFixed(1)),
      impact: Number((totalImpact / count).toFixed(1)),
    },
  }
}

/**
 * Check if a volunteer has already reviewed an event
 */
export function hasVolunteerReviewedEvent(volunteerEmail: string, eventId?: string): boolean {
  if (!volunteerEmail || !eventId || typeof window === 'undefined') return false
  try {
    const all = getAllReviews()
    return Object.values(all).some((orgReviews) =>
      orgReviews.some(
        (r) => r.eventId === eventId && r.volunteerEmail?.toLowerCase() === volunteerEmail.toLowerCase()
      )
    )
  } catch {
    return false
  }
}

/**
 * Submit a new volunteer review for an organization
 */
export function submitOrgReview(
  reviewData: Omit<OrgReview, 'id' | 'createdAt'>
): OrgReview {
  const newReview: OrgReview = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }

  if (typeof window !== 'undefined') {
    try {
      const all = getAllReviews()
      const orgKey = reviewData.orgName || 'Community Organization'
      const existing = all[orgKey] || []
      const updated = [newReview, ...existing]
      all[orgKey] = updated

      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all))

      window.dispatchEvent(
        new CustomEvent('togethernow_org_review_submitted', {
          detail: { orgName: orgKey, review: newReview },
        })
      )
    } catch (e) {
      console.warn('Error saving review to localStorage:', e)
    }
  }

  return newReview
}
