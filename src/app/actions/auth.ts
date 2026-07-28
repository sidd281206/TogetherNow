'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const { data, error } = await supabase.auth.signUp({
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

  if (error) {
    return {
      errors: {
        general: [error.message],
      },
    }
  }

  // If email confirmation is required, session will be null
  if (data.user && !data.session) {
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
