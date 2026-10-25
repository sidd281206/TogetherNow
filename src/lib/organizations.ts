export interface OrgGalleryItem {
  id: string
  url: string
  title: string
  date?: string
  caption?: string
}

export interface OrgPastEvent {
  id: string
  title: string
  date: string
  category: 'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'
  description: string
  attendeesCount: number
  impactSummary: string
  imageUrl?: string
}

export interface OrganizationProfileData {
  id: string
  name: string
  tagline: string
  about: string
  mission: string
  vision: string
  foundedYear: string
  registrationNumber: string
  isVerified: boolean
  verificationDate?: string
  website: string
  email: string
  phone: string
  location: string
  address: string
  upiId?: string
  causes: string[]
  stats: {
    volunteersCount: number
    drivesCompleted: number
    hoursVolunteered: number
    peopleImpacted: number
  }
  gallery: OrgGalleryItem[]
  pastEvents: OrgPastEvent[]
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
    facebook?: string
  }
}

export const ORG_ABOUT_STORAGE_KEY_PREFIX = 'togethernow_org_about_v2_'
export const ORG_UPI_STORAGE_KEY_PREFIX = 'togethernow_org_upi_'

export const DEFAULT_ORGANIZATION_PROFILES: Record<string, OrganizationProfileData> = {
  'Ocean & Earth Care Alliance': {
    id: 'org-ocean-earth',
    name: 'Ocean & Earth Care Alliance',
    tagline: 'Preserving Marine Wildlife & Coastal Ecosystems Across Western India',
    about: 'Ocean & Earth Care Alliance is a grassroots environmental non-profit founded by marine biologists, conservationists, and coastal community leaders. We spearhead regular shoreline cleanup drives, mangrove reforestation, plastic interception, and ecological education in coastal Maharashtra.',
    mission: 'To protect marine biodiversity, restore degraded coastlines, and empower citizen volunteers to become lifelong ecological stewards.',
    vision: 'Pristine, plastic-free coastlines where marine life thrives in harmony with informed, active coastal communities.',
    foundedYear: '2018',
    registrationNumber: 'NGO-MH-2018-092841',
    isVerified: true,
    verificationDate: 'Jan 15, 2026',
    website: 'https://oceanearthcare.org',
    email: 'contact@oceanearthcare.org',
    phone: '+91 98201 44521',
    location: 'Mumbai, Maharashtra',
    address: 'Gate 2 Promenade, Marine Drive Coastal Stretch, Mumbai 400020',
    upiId: 'oceanearth@okaxis',
    causes: ['Environment', 'Marine Conservation', 'Waste Management', 'Eco Awareness'],
    stats: {
      volunteersCount: 3450,
      drivesCompleted: 48,
      hoursVolunteered: 13800,
      peopleImpacted: 85000,
    },
    gallery: [
      {
        id: 'gal-1',
        url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
        title: 'Versova Beach Mega Cleanup Drive',
        date: 'July 2026',
        caption: 'Over 200 volunteers gathered at dawn to remove 3.2 tons of macro-plastics and ghost nets.',
      },
      {
        id: 'gal-2',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        title: 'Mangrove Sapling Plantation',
        date: 'June 2026',
        caption: 'Restoring critical coastal wetlands with 1,500 native mangrove saplings in the creek zone.',
      },
      {
        id: 'gal-3',
        url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        title: 'Youth Marine Biology Workshop',
        date: 'May 2026',
        caption: 'Teaching school students about tidal zone biodiversity and micro-plastic hazards.',
      },
      {
        id: 'gal-4',
        url: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=800&q=80',
        title: 'Plastic Upcycling & Sorting Hub',
        date: 'April 2026',
        caption: 'Sorting collected shoreline waste for recycling partnerships with eco-friendly pavement makers.',
      },
    ],
    pastEvents: [
      {
        id: 'past-1',
        title: 'Monsoon Coastline Rescue & Cleanup',
        date: 'July 18, 2026',
        category: 'Environment',
        description: 'Post-high tide cleanup tackling washed-up debris along Marine Drive promenade and Girgaon Chowpatty.',
        attendeesCount: 140,
        impactSummary: '2.8 tons of waste safely intercepted from returning into the Arabian Sea.',
        imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'past-2',
        title: 'Gorai Mangrove Bio-Shield Reforestation',
        date: 'June 05, 2026',
        category: 'Environment',
        description: 'World Environment Day special planting 1,200 mangrove saplings with student volunteers.',
        attendeesCount: 95,
        impactSummary: 'Stabilized 1.5 km of eroding tidal creek bank.',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'past-3',
        title: 'Zero Waste Living Community Seminar',
        date: 'May 12, 2026',
        category: 'Environment',
        description: 'Interactive workshop on household composting, plastic-free alternatives, and sustainable living.',
        attendeesCount: 65,
        impactSummary: 'Empowered 65 households to adopt zero-waste kitchen segregation.',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
      },
    ],
    socialLinks: {
      twitter: 'https://twitter.com/oceanearthcare',
      linkedin: 'https://linkedin.com/company/ocean-earth-care',
      instagram: 'https://instagram.com/oceanearthcare',
    },
  },

  'FutureTech Foundation': {
    id: 'org-futuretech',
    name: 'FutureTech Foundation',
    tagline: 'Bridging the Digital Divide with Free STEM, Robotics & AI Education',
    about: 'FutureTech Foundation is an educational NGO dedicated to providing world-class technology and computer science learning to underserved youth from low-income schools and orphanages.',
    mission: 'To ensure every child, regardless of socioeconomic background, has access to computational thinking and digital career pathways.',
    vision: 'A future where technological opportunity is democratized and all youth can build solutions for their communities.',
    foundedYear: '2020',
    registrationNumber: 'NGO-MH-2020-119402',
    isVerified: true,
    verificationDate: 'Feb 10, 2026',
    website: 'https://futuretechfoundation.org',
    email: 'info@futuretechfoundation.org',
    phone: '+91 98765 12345',
    location: 'Mumbai, Maharashtra',
    address: '2nd Floor Innovation Hall, Downtown Public Library, Fort, Mumbai 400001',
    upiId: 'futuretech@okicici',
    causes: ['Education', 'Tech', 'Youth Empowerment', 'STEM'],
    stats: {
      volunteersCount: 1850,
      drivesCompleted: 36,
      hoursVolunteered: 7400,
      peopleImpacted: 14200,
    },
    gallery: [
      {
        id: 'gal-ft-1',
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        title: 'Robotics Summer Camp with Mentors',
        date: 'June 2026',
        caption: 'Volunteer engineers guiding middle school students to build Arduino sensor robots.',
      },
      {
        id: 'gal-ft-2',
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        title: 'Girls in Code Mentorship Circle',
        date: 'May 2026',
        caption: 'Weekly Python coding sessions focused on increasing female representation in software engineering.',
      },
      {
        id: 'gal-ft-3',
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        title: 'Community Innovation Lab Launch',
        date: 'April 2026',
        caption: 'Setting up 25 refurbished laptops with offline coding curricula in Fort Community Center.',
      },
    ],
    pastEvents: [
      {
        id: 'past-ft-1',
        title: 'Code & Create Weekend Hackathon',
        date: 'July 04, 2026',
        category: 'Education',
        description: 'Mentorship event helping 80 middle schoolers deploy their very first interactive web games.',
        attendeesCount: 80,
        impactSummary: '32 creative student apps built and showcased to parents.',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'past-ft-2',
        title: 'Refurbished PC Donation & Setup Drive',
        date: 'May 24, 2026',
        category: 'Tech',
        description: 'Testing, installing Linux OS, and distributing donated laptops to municipal schools.',
        attendeesCount: 35,
        impactSummary: 'Equipped 3 schools with 45 functioning multimedia workstations.',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      },
    ],
    socialLinks: {
      twitter: 'https://twitter.com/futuretechngo',
      linkedin: 'https://linkedin.com/company/futuretech-foundation',
    },
  },

  'Nourish Hope Network': {
    id: 'org-nourish-hope',
    name: 'Nourish Hope Network',
    tagline: 'Fighting Hunger & Food Waste Through Community Logistics & Compassion',
    about: 'Nourish Hope Network coordinates surplus food rescue from local restaurants, banquet halls, and farmers, routing fresh, nutritious meals directly to community shelters and food pantries in real time.',
    mission: 'To create zero-hunger neighborhoods where excess nutritious food reaches vulnerable families with dignity and care.',
    vision: 'A food-secure society where no meal is wasted and no human goes to sleep hungry.',
    foundedYear: '2019',
    registrationNumber: 'NGO-MH-2019-048123',
    isVerified: true,
    verificationDate: 'Nov 20, 2025',
    website: 'https://nourishhopenetwork.org',
    email: 'help@nourishhopenetwork.org',
    phone: '+91 98111 99887',
    location: 'Mumbai & Thane',
    address: 'Online & Central Operations Hub, Kurla West, Mumbai 400070',
    upiId: 'nourishhope@okhdfcbank',
    causes: ['Community', 'Crisis Support', 'Food Security', 'Zero Waste'],
    stats: {
      volunteersCount: 4200,
      drivesCompleted: 62,
      hoursVolunteered: 16800,
      peopleImpacted: 350000,
    },
    gallery: [
      {
        id: 'gal-nh-1',
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        title: 'Warm Meal Distribution at Shelter',
        date: 'July 2026',
        caption: 'Delivering 450 freshly packed meals from surplus restaurant kitchens.',
      },
      {
        id: 'gal-nh-2',
        url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        title: 'Weekend Grocery Ration Kits Packing',
        date: 'June 2026',
        caption: 'Assembling monthly grocery dry-ration kits containing pulses, rice, oil, and flour.',
      },
    ],
    pastEvents: [
      {
        id: 'past-nh-1',
        title: 'Surplus Food Rescue & Night Distribution Drive',
        date: 'July 28, 2026',
        category: 'Community',
        description: 'Night operations coordinating surplus catering food pickup and hygiene-verified delivery.',
        attendeesCount: 40,
        impactSummary: '620 hot meals served without a single plate wasted.',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },

  'Silver Connect': {
    id: 'org-silver-connect',
    name: 'Silver Connect',
    tagline: 'Empowering Seniors with Digital Independence, Care & Companionship',
    about: 'Silver Connect supports senior citizens in overcoming isolation and digital barriers through empathetic, one-on-one tech coaching, social wellness circles, and health access guidance.',
    mission: 'To bring dignity, safety, and digital inclusion to elders so they can navigate the modern world with confidence.',
    vision: 'A connected society where older adults feel valued, technologically capable, and socially engaged.',
    foundedYear: '2021',
    registrationNumber: 'NGO-MH-2021-073192',
    isVerified: true,
    verificationDate: 'Dec 02, 2025',
    website: 'https://silverconnect.org',
    email: 'care@silverconnect.org',
    phone: '+91 99887 22334',
    location: 'Dadar, Mumbai',
    address: 'Room 104, Community Wellness Center, Shivaji Park, Dadar, Mumbai 400028',
    upiId: 'silverconnect@okaxis',
    causes: ['Tech', 'Community', 'Senior Care', 'Digital Inclusion'],
    stats: {
      volunteersCount: 920,
      drivesCompleted: 24,
      hoursVolunteered: 3680,
      peopleImpacted: 2800,
    },
    gallery: [
      {
        id: 'gal-sc-1',
        url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
        title: 'Smartphone & Video Calling Workshop',
        date: 'June 2026',
        caption: 'Teaching elderly grandparents how to video-call their grandchildren and use emergency safety apps.',
      },
    ],
    pastEvents: [
      {
        id: 'past-sc-1',
        title: 'Cyber Safety & Digital Banking for Elders',
        date: 'June 19, 2026',
        category: 'Tech',
        description: 'Educating senior citizens on OTP security, spotting phishing calls, and safe UPI usage.',
        attendeesCount: 30,
        impactSummary: '30 seniors trained in safe online banking with individual volunteer mentors.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },

  'Green Canopy Initiative': {
    id: 'org-green-canopy',
    name: 'Green Canopy Initiative',
    tagline: 'Revitalizing Urban Ecosystems with Native Forests & Tree Plantations',
    about: 'Green Canopy Initiative works to transform barren urban pockets and school campuses into dense, native micro-forests using Miyawaki afforestation methods.',
    mission: 'To cool urban heat islands, recharge groundwater, and restore indigenous flora and fauna in city landscapes.',
    vision: 'Lush, green urban spaces where every neighborhood is within walking distance of a biodiversity-rich canopy.',
    foundedYear: '2017',
    registrationNumber: 'NGO-MH-2017-033108',
    isVerified: true,
    verificationDate: 'Jan 05, 2026',
    website: 'https://greencanopy.org',
    email: 'info@greencanopy.org',
    phone: '+91 98222 33445',
    location: 'Mumbai, Maharashtra',
    address: 'Main Entrance Nursery, Northside Botanical Park, Mumbai 400078',
    upiId: 'greencanopy@icici',
    causes: ['Environment', 'Afforestation', 'Biodiversity', 'Climate Resilience'],
    stats: {
      volunteersCount: 5200,
      drivesCompleted: 54,
      hoursVolunteered: 20800,
      peopleImpacted: 120000,
    },
    gallery: [
      {
        id: 'gal-gc-1',
        url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        title: 'Miyawaki Forest Plantation Drive',
        date: 'July 2026',
        caption: 'Planting 3,000 indigenous trees including Neem, Peepal, and Banyan varieties.',
      },
      {
        id: 'gal-gc-2',
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
        title: 'Seedball Making & Dispersal Camp',
        date: 'May 2026',
        caption: 'Volunteers crafted over 10,000 clay seed balls for monsoon dispersal along barren hillsides.',
      },
    ],
    pastEvents: [
      {
        id: 'past-gc-1',
        title: 'Urban Reforestation & Sapling Plantation Drive',
        date: 'July 11, 2026',
        category: 'Environment',
        description: 'Community afforestation drive along park perimeter with native soil composting.',
        attendeesCount: 110,
        impactSummary: '500 native saplings planted with 94% recorded survival rate.',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
}

/**
 * Retrieve an organization's About Us profile from localStorage (fallback to defaults or generated profile)
 */
export function getOrganizationProfile(orgNameOrId: string, currentUserId?: string): OrganizationProfileData {
  if (typeof window === 'undefined') {
    return DEFAULT_ORGANIZATION_PROFILES[orgNameOrId] || generateDefaultOrgProfile(orgNameOrId)
  }

  try {
    // Check specific user key if current logged in org
    if (currentUserId) {
      const userSaved = localStorage.getItem(`${ORG_ABOUT_STORAGE_KEY_PREFIX}${currentUserId}`)
      if (userSaved) {
        return JSON.parse(userSaved)
      }
    }

    // Check by org name
    const orgSaved = localStorage.getItem(`${ORG_ABOUT_STORAGE_KEY_PREFIX}${orgNameOrId}`)
    if (orgSaved) {
      return JSON.parse(orgSaved)
    }

    // Check default pre-populated orgs
    if (DEFAULT_ORGANIZATION_PROFILES[orgNameOrId]) {
      return DEFAULT_ORGANIZATION_PROFILES[orgNameOrId]
    }

    // Search by partial or match in defaults
    const match = Object.values(DEFAULT_ORGANIZATION_PROFILES).find(
      (o) => o.name.toLowerCase() === orgNameOrId.toLowerCase() || o.id === orgNameOrId
    )
    if (match) return match
  } catch (e) {
    console.warn('Error reading org profile:', e)
  }

  return generateDefaultOrgProfile(orgNameOrId)
}

/**
 * Save an organization's About Us profile to localStorage and broadcast sync event
 */
export function saveOrganizationProfile(profile: OrganizationProfileData, userId?: string): void {
  if (typeof window === 'undefined') return

  try {
    const key = userId ? `${ORG_ABOUT_STORAGE_KEY_PREFIX}${userId}` : `${ORG_ABOUT_STORAGE_KEY_PREFIX}${profile.name}`
    localStorage.setItem(key, JSON.stringify(profile))
    localStorage.setItem(`${ORG_ABOUT_STORAGE_KEY_PREFIX}${profile.name}`, JSON.stringify(profile))

    window.dispatchEvent(
      new CustomEvent('togethernow_org_about_updated', {
        detail: { orgName: profile.name, userId, profile },
      })
    )
  } catch (e) {
    console.warn('Error saving org profile:', e)
  }
}

/**
 * Check if a custom About Us profile has been created and saved in localStorage
 */
export function hasCustomOrganizationProfile(orgNameOrId: string, currentUserId?: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    if (currentUserId && localStorage.getItem(`${ORG_ABOUT_STORAGE_KEY_PREFIX}${currentUserId}`)) {
      return true
    }
    if (orgNameOrId && localStorage.getItem(`${ORG_ABOUT_STORAGE_KEY_PREFIX}${orgNameOrId}`)) {
      return true
    }
  } catch (e) {
    // ignore
  }

  return false
}

/**
 * Helper to generate a rich default profile for any new or unknown organization name
 */
export function generateDefaultOrgProfile(orgName: string): OrganizationProfileData {
  const safeName = orgName?.trim() || 'Community Partner Organization'
  return {
    id: `org-${Date.now()}`,
    name: safeName,
    tagline: 'Driving Positive Community Change Through Volunteer Action & Grassroots Impact',
    about: `${safeName} is a community-driven non-profit organization focused on solving real-world challenges through collective action, volunteer engagement, and sustainable community programs. We organize hands-on drives and social initiatives to uplift local neighborhoods.`,
    mission: `To mobilize caring citizens, youth, and skilled professionals to create meaningful, measurable progress in our communities.`,
    vision: `An inclusive, empathetic society where community organizations and volunteers work side by side to build lasting impact.`,
    foundedYear: '2022',
    registrationNumber: `NGO-MH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`,
    isVerified: true,
    verificationDate: 'Verified Organization',
    website: `https://${safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
    email: `contact@${safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
    phone: '+91 98201 55678',
    location: 'Mumbai, Maharashtra',
    address: 'Central Community Office, Mumbai, Maharashtra 400001',
    upiId: `${safeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'care.togethernow'}@okaxis`,
    causes: ['Community', 'Education', 'Environment', 'Youth Empowerment'],
    stats: {
      volunteersCount: 450,
      drivesCompleted: 12,
      hoursVolunteered: 1800,
      peopleImpacted: 6500,
    },
    gallery: [
      {
        id: 'gal-def-1',
        url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
        title: 'Community Volunteer Orientation',
        date: 'Recent',
        caption: 'Passionate volunteers coming together for community drive coordination.',
      },
      {
        id: 'gal-def-2',
        url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
        title: 'Field Team & Volunteers at Work',
        date: 'Recent',
        caption: 'Making a tangible difference through collaborative grassroots action.',
      },
    ],
    pastEvents: [
      {
        id: 'past-def-1',
        title: 'Neighborhood Action & Awareness Drive',
        date: 'June 2026',
        category: 'Community',
        description: 'Mobilized local volunteers for public outreach, community support, and environmental cleanliness.',
        attendeesCount: 45,
        impactSummary: 'Successfully assisted over 300 local families.',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
      },
    ],
  }
}

/**
 * Retrieve the configured UPI ID for an organization
 */
export function getOrganizationUpiId(orgNameOrId?: string): string {
  if (!orgNameOrId) return 'oceanearth@okaxis'
  if (typeof window === 'undefined') return 'oceanearth@okaxis'

  try {
    // 1. Direct explicit storage key
    const direct = localStorage.getItem(`${ORG_UPI_STORAGE_KEY_PREFIX}${orgNameOrId}`)
    if (direct && direct.trim()) return direct.trim()

    // 2. Organization profile from storage or defaults
    const profile = getOrganizationProfile(orgNameOrId)
    if (profile && profile.upiId && profile.upiId.trim()) {
      return profile.upiId.trim()
    }
  } catch (e) {
    // fallback
  }

  const cleanHandle = orgNameOrId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'togethernow'
  return `${cleanHandle}@okaxis`
}

/**
 * Set and persist the UPI ID for an organization
 */
export function setOrganizationUpiId(orgNameOrId: string, upiId: string): void {
  if (typeof window === 'undefined' || !orgNameOrId) return

  try {
    const cleanUpi = upiId.trim()
    localStorage.setItem(`${ORG_UPI_STORAGE_KEY_PREFIX}${orgNameOrId}`, cleanUpi)

    // Also update in organization profile if exists
    const profile = getOrganizationProfile(orgNameOrId)
    if (profile) {
      profile.upiId = cleanUpi
      saveOrganizationProfile(profile)
    }

    window.dispatchEvent(
      new CustomEvent('togethernow_org_upi_updated', {
        detail: { orgNameOrId, upiId: cleanUpi },
      })
    )
  } catch (e) {
    console.warn('Error saving organization UPI ID:', e)
  }
}

