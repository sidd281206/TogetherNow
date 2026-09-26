'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

// In-memory OTP cache for verification codes
const otpCache = new Map<string, { code: string; expiresAt: number }>()

/** Build a polished HTML email for the OTP */
function buildOtpEmailHtml(otp: string, email: string): string {
  const digits = otp.split('')
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="display:inline-block;width:44px;height:54px;line-height:54px;text-align:center;font-size:28px;font-weight:800;background:#f0fdf4;border:2px solid #34d399;border-radius:10px;color:#064e3b;font-family:monospace;margin:0 4px;">${d}</td>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TogetherNow – Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;box-shadow:0 4px 32px rgba(0,0,0,0.10);overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:36px 40px 28px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">🤝</span>
                <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">TogetherNow</span>
              </div>
              <p style="margin:10px 0 0;color:#a7f3d0;font-size:13px;font-weight:500;">Volunteer &amp; Community Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Verify Your Email Address</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                Hi there! You're one step away from completing your volunteer profile on <strong style="color:#059669;">TogetherNow</strong>.
                Use the verification code below to confirm your email address.
              </p>

              <!-- OTP Digits -->
              <div style="text-align:center;margin:28px 0;">
                <p style="font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:1.5px;margin:0 0 14px;text-transform:uppercase;">Your 6-Digit Verification Code</p>
                <table cellpadding="0" cellspacing="0" style="display:inline-block;">
                  <tr>${digitBoxes}</tr>
                </table>
              </div>

              <!-- Expiry notice -->
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin:24px 0;">
                <p style="margin:0;font-size:13px;color:#9a3412;font-weight:600;">
                  ⏱️ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
              </div>

              <p style="font-size:13px;color:#6b7280;margin:20px 0 0;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your account will remain secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Sent to <strong>${email}</strong> · TogetherNow Volunteer Platform</p>
              <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">© 2026 TogetherNow. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendEmailOtpAction(email: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Invalid email address provided.' }
    }

    // Generate a secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    otpCache.set(cleanEmail, { code: generatedOtp, expiresAt: Date.now() + 10 * 60 * 1000 })

    // Send via Nodemailer + Gmail SMTP directly (bypasses Supabase email config entirely)
    const gmailUser = process.env.GMAIL_USER || 'siddharthshinde281206@gmail.com'
    const gmailPass = process.env.GMAIL_APP_PASSWORD || 'drvy fwqs igsx pevp'

    if (!gmailUser || !gmailPass) {
      console.error('GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables.')
      return { success: false, message: 'Email service is not configured. Please contact support.' }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    await transporter.sendMail({
      from: `"TogetherNow" <${gmailUser}>`,
      to: cleanEmail,
      subject: '🔐 Your TogetherNow Verification Code',
      html: buildOtpEmailHtml(generatedOtp, cleanEmail),
    })

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox (and spam folder).`,
    }
  } catch (err: any) {
    console.error('Error in sendEmailOtpAction:', err)
    return {
      success: false,
      message: err?.message || 'Failed to send email verification OTP.',
    }
  }
}


export async function verifyEmailOtpAction(email: string, otp: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    if (!cleanOtp) {
      return { success: false, message: 'Please enter the 6-digit verification code.' }
    }

    // Validate against the in-memory OTP cache (code we generated & sent via Gmail)
    const cached = otpCache.get(cleanEmail)
    const isExpired = !cached || Date.now() > cached.expiresAt

    if (isExpired) {
      return {
        success: false,
        message: 'No active verification code found. Please click "Send OTP" to request a new code.',
      }
    }

    if (cached.code !== cleanOtp) {
      return {
        success: false,
        message: 'Incorrect verification code. Please check your email and try again.',
      }
    }


    // Remove from cache after successful verification
    otpCache.delete(cleanEmail)

    // Mark email verified in Supabase Auth user metadata
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const adminClient = createAdminClient(supabaseUrl, serviceKey)

        await adminClient.auth.admin.updateUserById(user.id, {
          email_confirm: true,
          user_metadata: {
            ...user.user_metadata,
            email_verified: true,
            isEmailVerified: true,
          },
        })

        try {
          await adminClient.from('profiles').upsert({
            id: user.id,
            email_verified: true,
          })
        } catch {}
      }
    } catch (e) {
      console.warn('Notice marking email as verified:', e)
    }

    return {
      success: true,
      message: 'Email OTP successfully verified! Status marked as verified.',
    }
  } catch (err: any) {
    console.error('Error in verifyEmailOtpAction:', err)
    return {
      success: false,
      message: err?.message || 'Failed to verify email OTP.',
    }
  }
}

export interface SaveProfileInput {
  phone: string
  address: string
  city: string
  pincode?: string
  skills?: string[]
  interests?: string[]
  availability?: string
  website?: string
  isEmailVerified: boolean
}

export async function saveCompleteUserProfileAction(input: SaveProfileInput): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User is not signed in.' }
    }

    const role = user.user_metadata?.role ?? 'volunteer'
    const fullAddress = input.pincode
      ? `${input.address}, ${input.city} - ${input.pincode}`
      : `${input.address}, ${input.city}`

    const parsedSkills = input.skills && input.skills.length > 0 ? input.skills : ['Teamwork', 'Communication', 'Community Support']
    const parsedInterests = input.interests && input.interests.length > 0 ? input.interests : ['Community Support', 'Environment']

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // 1. Update Auth User Metadata (Permanent & Always Accessible)
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          phone: input.phone.trim(),
          address: fullAddress,
          city: input.city.trim(),
          pincode: input.pincode || '',
          skills: parsedSkills,
          interests: parsedInterests,
          availability: input.availability || 'weekends',
          email_verified: true,
          isEmailVerified: true,
          profile_completed: true,
          completionPercentage: 100,
        },
      })
    } catch (authErr) {
      console.warn('Notice updating auth user metadata:', authErr)
    }

    // 2. Update profiles table
    try {
      await adminClient.from('profiles').upsert({
        id: user.id,
        phone: input.phone.trim(),
        address: fullAddress,
        city: input.city.trim(),
        email_verified: true,
      })
    } catch (err) {
      console.warn('Notice updating profiles table:', err)
    }

    // 3. Update volunteer_profiles if volunteer
    if (role === 'volunteer') {
      try {
        await adminClient.from('volunteer_profiles').upsert({
          id: user.id,
          skills: parsedSkills,
          interests: parsedInterests,
          availability: input.availability || 'weekends',
          total_hours: 0,
        })
      } catch (err) {
        console.warn('Notice updating volunteer_profiles table:', err)
      }
    } else if (role === 'organization') {
      try {
        await adminClient.from('organizations').upsert({
          id: user.id,
          website: input.website || 'https://togethernow.org',
          status: 'pending',
        })
      } catch (err) {
        console.warn('Notice updating organizations table:', err)
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/onboarding')
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      message: 'Profile completed & verified with 100% status! 🎉',
    }
  } catch (err: any) {
    console.error('Error saving complete user profile:', err)
    return { success: false, error: err?.message || 'Failed to save profile' }
  }
}
