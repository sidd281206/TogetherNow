/**
 * TogetherNow — Database Type Definitions
 * 
 * These types mirror the exact schema defined in:
 * supabase/migrations/20260720000001_initial_schema.sql
 * 
 * In Phase 2+, these can be auto-generated via:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */

export type UserRole = 'volunteer' | 'organization' | 'donor' | 'admin'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface Profile {
  id: string
  updated_at: string
  full_name: string
  phone: string | null
  location: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
}

export interface Skill {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
}

export interface VolunteerProfile {
  id: string
  availability: string | null
  total_hours: number
  skills: string[] | null
  interests: string[] | null
}

export interface Organization {
  id: string
  registration_number?: string | null
  verification_document_url: string | null
  status: VerificationStatus
  verified_at: string | null
  website: string | null
}

export interface Opportunity {
  id: string
  organization_id: string
  category_id: number | null
  title: string
  description: string
  created_at: string
}

export interface Event {
  id: string
  opportunity_id: string
  event_date: string
  address: string
  latitude: number
  longitude: number
  created_at: string
}

export interface Application {
  id: string
  volunteer_id: string
  opportunity_id: string
  status: ApplicationStatus
  applied_at: string
}

export interface Attendance {
  id: string
  volunteer_id: string
  event_id: string
  check_in: string
  check_out: string | null
  calculated_hours: number | null
}

export interface Donation {
  id: string
  donor_id: string | null
  organization_id: string
  amount: number
  currency: string
  status: string
  donated_at: string
}

export interface Badge {
  id: number
  name: string
  description: string | null
  icon_url: string | null
  hours_required: number
}

export interface UserBadge {
  id: string
  volunteer_id: string
  badge_id: number
  earned_at: string
}

export interface Certificate {
  id: string
  volunteer_id: string
  opportunity_id: string
  certificate_url: string | null
  issued_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: number
  changed_by: string | null
  action: string
  details: Record<string, unknown> | null
  performed_at: string
}

// ── Joined / Extended Types (for common queries) ─────────────────────────────

export interface OpportunityWithOrg extends Opportunity {
  organizations: Pick<Organization, 'id' | 'status'> & {
    profiles: Pick<Profile, 'full_name' | 'avatar_url' | 'location'>
  }
  categories: Pick<Category, 'name'> | null
}

export interface EventWithOpportunity extends Event {
  opportunities: Pick<Opportunity, 'title' | 'organization_id'>
}

export interface ApplicationWithDetails extends Application {
  volunteer_profiles: VolunteerProfile & {
    profiles: Pick<Profile, 'full_name' | 'avatar_url'>
  }
  opportunities: Pick<Opportunity, 'title'>
}

export interface AttendanceWithDetails extends Attendance {
  volunteer_profiles: {
    profiles: Pick<Profile, 'full_name' | 'avatar_url'>
  }
}

export interface BadgeWithStatus extends Badge {
  earned: boolean
  earned_at?: string
}
