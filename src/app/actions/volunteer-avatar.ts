'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function uploadVolunteerAvatarAction(formData: FormData): Promise<{
  success: boolean
  avatarUrl?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User is not signed in.' }
    }

    const file = formData.get('avatar') as File | null
    const directUrl = formData.get('avatarUrl') as string | null

    let finalAvatarUrl: string = ''

    if (directUrl && directUrl.trim()) {
      finalAvatarUrl = directUrl.trim()
    } else if (file && file.size > 0) {
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const adminStorage = createAdminClient(supabaseUrl, serviceKey).storage

      try {
        await adminStorage.createBucket('avatars', { public: true })
      } catch (bErr) {
        // bucket may already exist
      }

      const { error: uploadErr } = await adminStorage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (uploadErr) {
        console.warn('Storage upload warning, fallback to data URL:', uploadErr.message)
        // Fallback to data URL
        const base64 = fileBuffer.toString('base64')
        finalAvatarUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`
      } else {
        const { data: urlData } = adminStorage.from('avatars').getPublicUrl(filePath)
        finalAvatarUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`
      }
    } else {
      return { success: false, error: 'Please choose an image file to upload.' }
    }

    // 1. Update profiles table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    try {
      await adminClient
        .from('profiles')
        .update({ avatar_url: finalAvatarUrl })
        .eq('id', user.id)
    } catch (dbErr) {
      console.warn('Notice updating profiles.avatar_url:', dbErr)
    }

    // 2. Update Auth metadata
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          avatar_url: finalAvatarUrl,
        },
      })
    } catch (authErr) {
      console.warn('Notice updating auth user_metadata.avatar_url:', authErr)
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      avatarUrl: finalAvatarUrl,
    }
  } catch (err: any) {
    console.error('Error in uploadVolunteerAvatarAction:', err)
    return { success: false, error: err?.message || 'Failed to upload photo.' }
  }
}
