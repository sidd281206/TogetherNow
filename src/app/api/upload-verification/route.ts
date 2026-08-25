import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawOrgName = (formData.get('orgName')?.toString() || '').trim()
    const userId = (formData.get('userId')?.toString() || '').trim()

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const adminClient = createAdminClient(supabaseUrl, serviceKey)

    // Resolve real organization name from DB if not passed
    let resolvedOrgName = rawOrgName
    if (!resolvedOrgName || resolvedOrgName.toLowerCase() === 'organization') {
      if (userId) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle()

        if (profile?.full_name) {
          resolvedOrgName = profile.full_name
        }
      }
    }

    const orgFolderName =
      (resolvedOrgName || 'organization')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || (userId ? `org-${userId.slice(0, 8)}` : 'organization')

    const fileExt = file.name.split('.').pop() || 'pdf'
    const filePath = `documents/${orgFolderName}/${Date.now()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    const adminStorage = adminClient.storage

    try {
      await adminStorage.createBucket('verification-docs', { public: true })
    } catch {
      // bucket exists
    }

    const { error: uploadErr } = await adminStorage
      .from('verification-docs')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      })

    if (uploadErr) {
      console.error('API Upload error:', uploadErr.message)
      return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 })
    }

    const { data: urlData } = adminStorage
      .from('verification-docs')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/verification-docs/${filePath}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath,
    })
  } catch (err: any) {
    console.error('Upload exception:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Server error uploading file' }, { status: 500 })
  }
}
