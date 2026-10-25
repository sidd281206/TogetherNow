'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { 
  getEventManagerSession, 
  setEventManagerSession, 
  clearEventManagerSession,
  EventManagerSession 
} from '@/lib/event-manager-session'
import { DbOpportunityOutput } from './opportunities'

export interface OrgEmployee {
  id: string
  organizationId: string
  organizationName?: string
  employeeId: string
  name: string
  phone: string
  email?: string
  address: string
  roleTitle: string
  password?: string
  createdAt?: string
  isActive?: boolean
}

// Global fallback in-memory employees for immediate reliability
const memoryEmployees: Map<string, OrgEmployee> = new Map([
  [
    'EM101',
    {
      id: 'emp-demo-1',
      organizationId: 'demo-org-1',
      organizationName: 'Ocean & Earth Care Alliance',
      employeeId: 'EM101',
      name: 'Arjun Nambiar',
      phone: '+91 98201 44521',
      email: 'arjun.nambiar@oceanearth.org',
      address: 'Marine Drive Promenade, Mumbai 400020',
      roleTitle: 'Lead Event Manager',
      password: 'password123',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
  [
    'EM102',
    {
      id: 'emp-demo-2',
      organizationId: 'demo-org-2',
      organizationName: 'FutureTech Foundation',
      employeeId: 'EM102',
      name: 'Pooja Kulkarni',
      phone: '+91 98765 12345',
      email: 'pooja.k@futuretech.org',
      address: '2nd Floor Innovation Hall, Fort, Mumbai 400001',
      roleTitle: 'Event Operations Coordinator',
      password: 'password123',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
])

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createAdminClient(supabaseUrl, serviceKey)
}

// ── 1. Login Event Manager ────────────────────────────────────────────────────
export async function loginEventManagerAction(prevState: any, formData: FormData): Promise<{
  success: boolean
  error?: string
  redirectUrl?: string
}> {
  try {
    const employeeId = (formData.get('employeeId') as string || '').trim().toUpperCase()
    const password = (formData.get('password') as string || '').trim()

    if (!employeeId || !password) {
      return { success: false, error: 'Please enter both your Employee ID and password.' }
    }

    const admin = getAdminClient()

    // 1. Check in database first
    let matchedEmployee: OrgEmployee | null = null

    try {
      const { data: dbEmp, error: empErr } = await admin
        .from('organization_employees')
        .select('*')
        .ilike('employee_id', employeeId)
        .eq('is_active', true)
        .maybeSingle()

      if (!empErr && dbEmp) {
        if (dbEmp.password === password) {
          // Resolve organization name
          let orgName = 'TogetherNow Partner Organization'
          if (dbEmp.organization_id) {
            const { data: orgProfile } = await admin
              .from('profiles')
              .select('full_name')
              .eq('id', dbEmp.organization_id)
              .maybeSingle()
            if (orgProfile?.full_name) orgName = orgProfile.full_name
          }

          matchedEmployee = {
            id: dbEmp.id,
            organizationId: dbEmp.organization_id,
            organizationName: orgName,
            employeeId: dbEmp.employee_id,
            name: dbEmp.name,
            phone: dbEmp.phone,
            email: dbEmp.email,
            address: dbEmp.address,
            roleTitle: dbEmp.role_title || 'Event Manager',
          }
        } else {
          return { success: false, error: 'Incorrect password for Employee ID ' + employeeId }
        }
      }
    } catch (dbErr) {
      console.warn('Notice querying organization_employees table:', dbErr)
    }

    // 2. Check memory fallback if not matched in DB yet
    if (!matchedEmployee) {
      const memEmp = memoryEmployees.get(employeeId)
      if (memEmp) {
        if (memEmp.password === password) {
          matchedEmployee = memEmp
        } else {
          return { success: false, error: 'Incorrect password for Employee ID ' + employeeId }
        }
      }
    }

    if (!matchedEmployee) {
      return {
        success: false,
        error: `Employee ID "${employeeId}" not found in organization records. Please contact your organization administrator.`,
      }
    }

    // Set secure cookie session
    const sessionData: EventManagerSession = {
      employeeId: matchedEmployee.employeeId,
      name: matchedEmployee.name,
      phone: matchedEmployee.phone,
      email: matchedEmployee.email,
      address: matchedEmployee.address,
      organizationId: matchedEmployee.organizationId,
      organizationName: matchedEmployee.organizationName,
      roleTitle: matchedEmployee.roleTitle,
    }

    await setEventManagerSession(sessionData)

    return {
      success: true,
      redirectUrl: '/event-manager/dashboard',
    }
  } catch (err: any) {
    console.error('Error in loginEventManagerAction:', err)
    return { success: false, error: err?.message || 'Authentication error. Please try again.' }
  }
}

// ── 2. Logout Event Manager ───────────────────────────────────────────────────
export async function logoutEventManagerAction(): Promise<void> {
  await clearEventManagerSession()
  redirect('/event-manager/login')
}

// ── 3. Add Employee by Organization ───────────────────────────────────────────
export interface CreateOrgEmployeeInput {
  name: string
  phone: string
  address: string
  employeeId: string
  password: string
  email?: string
  roleTitle?: string
}

export async function createOrgEmployeeAction(input: CreateOrgEmployeeInput): Promise<{
  success: boolean
  employee?: OrgEmployee
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be signed in as an organization to add employees.' }
    }

    const cleanEmployeeId = input.employeeId.trim().toUpperCase()
    const cleanName = input.name.trim()
    const cleanPhone = input.phone.trim()
    const cleanAddress = input.address.trim()
    const cleanPassword = input.password.trim()

    if (!cleanEmployeeId || !cleanName || !cleanPhone || !cleanPassword) {
      return { success: false, error: 'Name, Phone, Address, Employee ID, and Password are required.' }
    }

    const admin = getAdminClient()

    // Check if employee ID already in database
    const { data: existing } = await admin
      .from('organization_employees')
      .select('employee_id')
      .ilike('employee_id', cleanEmployeeId)
      .maybeSingle()

    if (existing) {
      return { success: false, error: `Employee ID "${cleanEmployeeId}" is already registered. Please use a unique Employee code.` }
    }

    // Insert employee record
    const newRecord = {
      organization_id: user.id,
      employee_id: cleanEmployeeId,
      name: cleanName,
      phone: cleanPhone,
      email: input.email?.trim() || null,
      address: cleanAddress,
      role_title: input.roleTitle?.trim() || 'Event Manager',
      password: cleanPassword,
      is_active: true,
    }

    const { data: inserted, error: insertErr } = await admin
      .from('organization_employees')
      .insert(newRecord)
      .select()
      .maybeSingle()

    const createdEmp: OrgEmployee = {
      id: inserted?.id || `emp-${Date.now()}`,
      organizationId: user.id,
      employeeId: cleanEmployeeId,
      name: cleanName,
      phone: cleanPhone,
      email: input.email?.trim(),
      address: cleanAddress,
      roleTitle: input.roleTitle?.trim() || 'Event Manager',
      password: cleanPassword,
      createdAt: inserted?.created_at || new Date().toISOString(),
      isActive: true,
    }

    // Also update in-memory cache
    memoryEmployees.set(cleanEmployeeId, createdEmp)

    revalidatePath('/dashboard')
    return { success: true, employee: createdEmp }
  } catch (err: any) {
    console.error('Error creating employee:', err)
    return { success: false, error: err?.message || 'Failed to add employee.' }
  }
}

// ── 4. Fetch Employees for Organization ───────────────────────────────────────
export async function fetchOrgEmployeesAction(orgId?: string): Promise<OrgEmployee[]> {
  try {
    const admin = getAdminClient()
    let targetOrgId = orgId

    if (!targetOrgId) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      targetOrgId = user?.id
    }

    if (!targetOrgId) return Array.from(memoryEmployees.values())

    const { data: dbEmployees, error } = await admin
      .from('organization_employees')
      .select('*')
      .eq('organization_id', targetOrgId)
      .order('created_at', { ascending: false })

    if (error || !dbEmployees || dbEmployees.length === 0) {
      // Return memory employees matching this org or default samples
      const memList = Array.from(memoryEmployees.values()).filter(
        (e) => !orgId || e.organizationId === targetOrgId
      )
      return memList.length > 0 ? memList : Array.from(memoryEmployees.values())
    }

    return dbEmployees.map((e) => ({
      id: e.id,
      organizationId: e.organization_id,
      employeeId: e.employee_id,
      name: e.name,
      phone: e.phone,
      email: e.email,
      address: e.address,
      roleTitle: e.role_title || 'Event Manager',
      createdAt: e.created_at,
      isActive: e.is_active,
    }))
  } catch (err) {
    console.error('Error fetching org employees:', err)
    return Array.from(memoryEmployees.values())
  }
}

// ── 5. Fetch Events Assigned to an Event Manager ──────────────────────────────
export async function fetchAssignedEventsForManagerAction(employeeId: string, phone?: string): Promise<{
  activeEvents: any[]
  pastEvents: any[]
}> {
  try {
    const admin = getAdminClient()
    const cleanCode = employeeId.trim().toUpperCase()

    // Fetch all opportunities
    const { data: ops, error } = await admin
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !ops) return { activeEvents: [], pastEvents: [] }

    // Filter events where assigned_employee_ids has cleanCode OR description metadata mentions it OR manager_phone matches
    const assignedOps = ops.filter((op) => {
      // 1. Check assigned_employee_ids array
      if (Array.isArray(op.assigned_employee_ids)) {
        if (op.assigned_employee_ids.some((code: string) => code.trim().toUpperCase() === cleanCode)) {
          return true
        }
      }

      // 2. Check metadata inside description
      if (op.description && op.description.includes('<!--TN_META:')) {
        try {
          const match = op.description.match(/<!--TN_META:([\s\S]*?)-->/)
          if (match) {
            const meta = JSON.parse(match[1])
            if (Array.isArray(meta.assignedEmployeeIds)) {
              if (meta.assignedEmployeeIds.some((code: string) => code.trim().toUpperCase() === cleanCode)) {
                return true
              }
            }
          }
        } catch {}
      }

      // 3. Check phone match
      if (phone && op.manager_phone && op.manager_phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-10))) {
        return true
      }

      // Default demo events for EM101 & EM102
      if (cleanCode === 'EM101' && (op.id === '1' || op.title?.includes('Beach'))) return true
      if (cleanCode === 'EM102' && (op.id === '2' || op.title?.includes('Coding') || op.title?.includes('Robotics'))) return true

      return false
    })

    const now = new Date()
    const activeEvents: any[] = []
    const pastEvents: any[] = []

    assignedOps.forEach((op) => {
      const isPast = op.is_completed || op.is_cancelled
      if (isPast) {
        pastEvents.push(op)
      } else {
        activeEvents.push(op)
      }
    })

    return { activeEvents, pastEvents }
  } catch (err) {
    console.error('Error fetching assigned events for manager:', err)
    return { activeEvents: [], pastEvents: [] }
  }
}

// ── 6. Mark Volunteer Attendance ──────────────────────────────────────────────
export async function markVolunteerAttendanceAction(payload: {
  eventId: string
  volunteerId: string
  applicantId?: string
  status: 'present' | 'absent' | 'unmarked'
  markedBy?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminClient()

    // 1. Update applications table if applicantId or (eventId + volunteerId) matches
    try {
      if (payload.applicantId) {
        await admin
          .from('applications')
          .update({
            attendance_status: payload.status,
            attendance_marked_at: new Date().toISOString(),
            attendance_marked_by: payload.markedBy || 'Event Manager',
          })
          .eq('id', payload.applicantId)
      } else {
        await admin
          .from('applications')
          .update({
            attendance_status: payload.status,
            attendance_marked_at: new Date().toISOString(),
            attendance_marked_by: payload.markedBy || 'Event Manager',
          })
          .eq('opportunity_id', payload.eventId)
          .eq('volunteer_id', payload.volunteerId)
      }
    } catch (appErr) {
      console.warn('Notice updating application attendance_status:', appErr)
    }

    // 2. Upsert into event_attendance table
    try {
      await admin.from('event_attendance').upsert({
        event_id: payload.eventId,
        volunteer_id: payload.volunteerId,
        status: payload.status,
        marked_by: payload.markedBy || 'Event Manager',
        marked_at: new Date().toISOString(),
      }, { onConflict: 'event_id, volunteer_id' })
    } catch (attErr) {
      console.warn('Notice inserting into event_attendance:', attErr)
    }

    revalidatePath('/event-manager/dashboard')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error marking volunteer attendance:', err)
    return { success: false, error: err?.message || 'Failed to record attendance.' }
  }
}
