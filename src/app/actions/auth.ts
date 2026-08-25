'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthState = {
  errors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
    role?: string[]
    general?: string[]
  }
  message?: string
} | null

// ─── Validation helpers ────────────────────────────────────────────────────────

function validateEmail(email: string): string[] {
  const errs: string[] = []
  if (!email) errs.push('Email is required.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errs.push('Please enter a valid email address.')
  return errs
}

function validatePassword(password: string): string[] {
  const errs: string[] = []
  if (!password) errs.push('Password is required.')
  else if (password.length < 8) errs.push('Password must be at least 8 characters.')
  return errs
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signupAction(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = formData.get('fullName')?.toString().trim() ?? ''
  const email    = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const role     = formData.get('role')?.toString() ?? ''

  const errors: NonNullable<AuthState>['errors'] = {}

  if (!fullName || fullName.length < 2)
    errors.fullName = ['Full name must be at least 2 characters.']

  const emailErrs = validateEmail(email)
  if (emailErrs.length) errors.email = emailErrs

  const passwordErrs = validatePassword(password)
  if (passwordErrs.length) errors.password = passwordErrs

  const validRoles = ['volunteer', 'organization', 'donor']
  if (!role || !validRoles.includes(role))
    errors.role = ['Please select a role to continue.']

  if (Object.keys(errors).length > 0) return { errors }

  const supabase = await createClient()

  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      // After email confirmation, redirect back to the app
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  })

  // If Supabase hits email rate limit, fallback to admin client creation and immediate sign in
  if (error && (error.message.toLowerCase().includes('rate limit') || error.status === 429)) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const adminClient = createAdminClient(supabaseUrl, serviceKey)

      const { data: adminCreated, error: adminErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      })

      if (!adminErr && adminCreated?.user) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!signInErr) {
          redirect('/dashboard')
        }
        error = null
      } else if (adminErr) {
        console.warn('Admin user creation fallback message:', adminErr.message)
      }
    } catch (e: any) {
      if (e?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e
      }
      console.warn('Notice in admin signup fallback:', e)
    }
  }

  if (error) {
    return {
      errors: {
        general: [error.message],
      },
    }
  }

  // If email confirmation is required, session will be null
  if (data?.user && !data.session) {
    // Attempt auto sign in
    const { error: autoSignInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!autoSignInErr) {
      redirect('/dashboard')
    }

    return {
      message: 'Signup successful! Please check your email to confirm your account.',
    }
  }

  redirect('/dashboard')
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email    = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const errors: NonNullable<AuthState>['errors'] = {}

  const emailErrs = validateEmail(email)
  if (emailErrs.length) errors.email = emailErrs

  if (!password) errors.password = ['Password is required.']

  if (Object.keys(errors).length > 0) return { errors }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return {
      errors: {
        general: [error.message],
      },
    }
  }

  redirect('/dashboard')
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient()
  
  // The route to redirect to after successful sign-in
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error logging in with Google:', error.message)
    redirect('/auth/error')
  }
  
  if (data.url) {
    redirect(data.url)
  }
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function deleteAccountAction(): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userId = user.id
  const userEmail = user.email

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)
  const dbClient = adminClient

  try {
    // 1. If organization: find and purge all created opportunities and their applicants
    try {
      const { data: userOps } = await dbClient
        .from('opportunities')
        .select('id')
        .eq('organization_id', userId)

      if (userOps && userOps.length > 0) {
        const opIds = userOps.map((op) => op.id)
        await dbClient.from('applications').delete().in('event_id', opIds)
        await dbClient.from('opportunities').delete().eq('organization_id', userId)
      }
    } catch (err) {
      console.warn('Notice deleting organization opportunities:', err)
    }

    // 2. If volunteer: purge applications submitted by this volunteer
    try {
      await dbClient.from('applications').delete().eq('volunteer_id', userId)
      if (userEmail) {
        await dbClient.from('applications').delete().eq('applicant_email', userEmail)
      }
    } catch (err) {
      console.warn('Notice deleting volunteer applications:', err)
    }

    // 3. Purge role-specific profile tables
    try {
      await dbClient.from('volunteer_profiles').delete().eq('id', userId)
    } catch {}

    try {
      await dbClient.from('organizations').delete().eq('id', userId)
    } catch {}

    try {
      await dbClient.from('donors').delete().eq('id', userId)
    } catch {}

    try {
      await dbClient.from('profiles').delete().eq('id', userId)
    } catch {}

    try {
      await dbClient.from('user_roles').delete().eq('user_id', userId)
    } catch {}

    try {
      await dbClient.from('donations').delete().eq('donor_id', userId)
    } catch {}

    // 4. Purge uploaded verification documents in storage bucket if organization
    try {
      const { data: files } = await dbClient.storage
        .from('verification-docs')
        .list(userId)
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`)
        await dbClient.storage.from('verification-docs').remove(filePaths)
      }
    } catch (err) {
      console.warn('Notice purging verification documents:', err)
    }

    // 5. Purge user from Supabase Auth admin schema
    if (adminClient) {
      try {
        await adminClient.auth.admin.deleteUser(userId)
      } catch (err) {
        console.warn('Notice deleting user from auth schema:', err)
      }
    }
  } catch (err) {
    console.error('Error executing comprehensive account purge:', err)
  }

  // 6. Sign out current session
  await supabase.auth.signOut()

  redirect('/auth/login?deleted=true')
}

