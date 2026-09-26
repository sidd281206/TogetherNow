import { Opportunity } from '@/components/ui/OpportunitiesFeed'

export interface VolunteerPreferences {
  skills: string[]
  interests: string[]
  city: string
}

export interface MatchReason {
  type: 'skill' | 'interest' | 'city' | 'remote'
  label: string
}

export interface ScoredOpportunity extends Opportunity {
  matchScore: number
  matchPercentage: number
  matchReasons: MatchReason[]
  isRecommended: boolean
  recommendationExplanation?: string
}

/**
 * Common keyword associations and stemming for intelligent volunteer matching.
 */
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  photography: ['photo', 'photograph', 'camera', 'visual storytelling', 'photo editing', 'videography', 'media', 'shots', 'content creation'],
  photo: ['photography', 'photograph', 'camera', 'photo editing'],
  coding: ['code', 'python', 'javascript', 'js', 'programming', 'robotics', 'software', 'developer', 'web', 'tech'],
  tech: ['coding', 'programming', 'digital', 'smartphone', 'computer', 'software', 'robotics'],
  environment: ['eco', 'nature', 'tree', 'clean', 'cleanup', 'wildlife', 'conservation', 'marine', 'earth', 'gardening', 'green', 'planting'],
  education: ['teach', 'mentor', 'tutoring', 'literacy', 'workshop', 'coding', 'students', 'school', 'children', 'youth'],
  health: ['medical', 'wellness', 'first aid', 'mental health', 'clinic', 'care', 'fitness', 'nutrition'],
  community: ['social', 'relief', 'meal', 'food', 'elderly', 'senior', 'neighborhood', 'support', 'civic'],
  music: ['audio', 'instrument', 'singing', 'concert', 'sound', 'band'],
  art: ['creative', 'design', 'drawing', 'painting', 'craft', 'visual'],
}

function normalize(text: string): string {
  return (text || '').toLowerCase().trim()
}

function containsTerm(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false
  const h = normalize(haystack)
  const n = normalize(needle)
  if (!n) return false
  if (h.includes(n)) return true

  // Check synonym matches
  const synonyms = KEYWORD_SYNONYMS[n]
  if (synonyms) {
    for (const syn of synonyms) {
      if (h.includes(syn)) return true
    }
  }
  return false
}

/**
 * Scores an individual opportunity against a volunteer's saved skills, interests, and city.
 */
export function scoreOpportunity(
  opportunity: Opportunity,
  preferences: VolunteerPreferences
): ScoredOpportunity {
  const reasons: MatchReason[] = []
  let score = 0

  const userCity = normalize(preferences.city)
  const userSkills = (preferences.skills || []).map(normalize).filter(Boolean)
  const userInterests = (preferences.interests || []).map(normalize).filter(Boolean)

  const opTitle = opportunity.title || ''
  const opDesc = opportunity.description || ''
  const opCategory = opportunity.category || ''
  const opLocation = `${opportunity.location || ''} ${opportunity.address || ''}`
  const opSkills = opportunity.skillsNeeded || []
  const opSkillsJoined = opSkills.join(' ')
  const opFullContent = `${opTitle} ${opDesc} ${opCategory} ${opSkillsJoined}`

  // 1. City / Location Match
  let cityMatched = false
  if (userCity) {
    if (containsTerm(opLocation, userCity)) {
      cityMatched = true
      score += 35
      reasons.push({
        type: 'city',
        label: `In ${preferences.city}`,
      })
    } else if (opportunity.isRemote) {
      score += 20
      reasons.push({
        type: 'remote',
        label: `Remote (Open to ${preferences.city})`,
      })
    }
  } else if (opportunity.isRemote) {
    score += 15
    reasons.push({
      type: 'remote',
      label: 'Virtual / Remote',
    })
  }

  // 2. Skills Match
  const matchedSkills: string[] = []
  for (const skill of userSkills) {
    const rawSkill = preferences.skills.find((s) => normalize(s) === skill) || skill
    // Check in skillsNeeded array or full content
    const inSkillsNeeded = opSkills.some((s) => containsTerm(s, skill) || containsTerm(skill, normalize(s)))
    const inContent = containsTerm(opFullContent, skill)

    if (inSkillsNeeded || inContent) {
      if (!matchedSkills.includes(rawSkill)) {
        matchedSkills.push(rawSkill)
      }
    }
  }

  if (matchedSkills.length > 0) {
    const skillScore = Math.min(40, matchedSkills.length * 20)
    score += skillScore
    matchedSkills.forEach((s) => {
      reasons.push({
        type: 'skill',
        label: `Matches Skill: ${s}`,
      })
    })
  }

  // 3. Interests Match
  const matchedInterests: string[] = []
  for (const interest of userInterests) {
    const rawInterest = preferences.interests.find((i) => normalize(i) === interest) || interest
    const inCategory = containsTerm(opCategory, interest)
    const inContent = containsTerm(opFullContent, interest)

    if (inCategory || inContent) {
      if (!matchedInterests.includes(rawInterest)) {
        matchedInterests.push(rawInterest)
      }
    }
  }

  if (matchedInterests.length > 0) {
    const interestScore = Math.min(40, matchedInterests.length * 20)
    score += interestScore
    matchedInterests.forEach((i) => {
      reasons.push({
        type: 'interest',
        label: `Matches Interest: ${i}`,
      })
    })
  }

  // Determine if it qualifies as a recommended opportunity
  const hasSkillOrInterestMatch = matchedSkills.length > 0 || matchedInterests.length > 0
  const isEligibleLocation = cityMatched || opportunity.isRemote || !userCity

  // Special boost if both skill and interest match, plus location
  if (matchedSkills.length > 0 && matchedInterests.length > 0 && isEligibleLocation) {
    score += 15
  }

  // An opportunity is recommended if:
  // 1. It matches skills or interests AND is accessible (city match or remote)
  // 2. OR it has multiple matching criteria achieving high score
  const isRecommended = (hasSkillOrInterestMatch && isEligibleLocation) || score >= 55

  // Normalize match percentage to a friendly 50% - 99% range for recommended items, or lower for non-recommended
  let matchPercentage = 0
  if (isRecommended) {
    matchPercentage = Math.min(99, Math.max(70, Math.round(score * 0.95)))
  } else if (hasSkillOrInterestMatch || cityMatched) {
    matchPercentage = Math.min(68, Math.max(40, Math.round(score * 0.7)))
  } else {
    matchPercentage = Math.min(35, Math.round(score * 0.5))
  }

  // Human-readable explanation
  let explanation = ''
  if (matchedInterests.length > 0 && matchedSkills.length > 0 && cityMatched) {
    explanation = `Recommended because you're interested in ${matchedInterests.join(', ')}, have ${matchedSkills.join(', ')} skills, and it takes place in ${preferences.city}.`
  } else if (matchedInterests.length > 0 && cityMatched) {
    explanation = `Recommended based on your interest in ${matchedInterests.join(', ')} and registered location in ${preferences.city}.`
  } else if (matchedSkills.length > 0 && cityMatched) {
    explanation = `Recommended based on your ${matchedSkills.join(', ')} skills and registered location in ${preferences.city}.`
  } else if (matchedInterests.length > 0 && opportunity.isRemote) {
    explanation = `Recommended based on your interest in ${matchedInterests.join(', ')} (Available remotely).`
  } else if (matchedSkills.length > 0) {
    explanation = `Recommended because it specifically seeks volunteers with ${matchedSkills.join(', ')} skills.`
  } else if (cityMatched) {
    explanation = `Happening locally in your registered city ${preferences.city}.`
  }

  return {
    ...opportunity,
    matchScore: score,
    matchPercentage,
    matchReasons: reasons,
    isRecommended,
    recommendationExplanation: explanation,
  }
}

/**
 * Returns opportunities sorted and filtered by recommendation relevance for the volunteer.
 */
export function getRecommendedOpportunities(
  opportunities: Opportunity[],
  preferences: VolunteerPreferences
): ScoredOpportunity[] {
  if (!preferences || (!preferences.skills?.length && !preferences.interests?.length && !preferences.city)) {
    return []
  }

  return opportunities
    .filter((op) => !op.isCancelled && !op.isCompleted)
    .map((op) => scoreOpportunity(op, preferences))
    .filter((op) => op.isRecommended)
    .sort((a, b) => b.matchScore - a.matchScore)
}
