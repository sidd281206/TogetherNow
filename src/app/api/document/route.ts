import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url') || ''
  const orgId = searchParams.get('orgId') || ''

  // Clean the URL by stripping out any appended (Reg No: ...) text
  let docUrl = rawUrl
    .replace(/\s*\(Reg No:[^)]*\)/gi, '')
    .replace(/\s*\(Reg:[^)]*\)/gi, '')
    .trim()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://couqorwshnrpadamzojn.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const adminClient = createAdminClient(supabaseUrl, serviceKey)

  // If orgId provided and docUrl is empty or placeholder, fetch from organizations table
  if ((!docUrl || !docUrl.startsWith('http')) && orgId) {
    const { data: org } = await adminClient
      .from('organizations')
      .select('verification_document_url')
      .eq('id', orgId)
      .maybeSingle()

    if (org?.verification_document_url) {
      docUrl = org.verification_document_url
        .replace(/\s*\(Reg No:[^)]*\)/gi, '')
        .replace(/\s*\(Reg:[^)]*\)/gi, '')
        .trim()
    }
  }

  // Extract storage path
  let storagePath = ''
  if (docUrl.includes('/verification-docs/')) {
    storagePath = docUrl.split('/verification-docs/')[1]
  } else if (docUrl && !docUrl.startsWith('http')) {
    storagePath = docUrl
  }

  // Clean storage path of any query parameters or spaces
  if (storagePath) {
    storagePath = storagePath.split('?')[0].split(' ')[0].trim()
  }

  // 1. If storage path found, download from Supabase Storage with admin service role
  if (storagePath) {
    try {
      const { data, error } = await adminClient.storage
        .from('verification-docs')
        .download(storagePath)

      if (data && !error) {
        const arrayBuffer = await data.arrayBuffer()
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="verification-document.pdf"',
          },
        })
      }

      // 2. Try creating a signed download URL
      const { data: signedData } = await adminClient.storage
        .from('verification-docs')
        .createSignedUrl(storagePath, 3600)

      if (signedData?.signedUrl) {
        return NextResponse.redirect(signedData.signedUrl)
      }
    } catch (err) {
      console.warn('Storage stream error:', err)
    }
  }

  // 3. If external URL, redirect directly
  if (docUrl.startsWith('http') && !docUrl.includes('supabase.co')) {
    return NextResponse.redirect(docUrl)
  }

  // 4. Fallback: Clean HTML preview summary card
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Organization Verification Document — TogetherNow</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }
        .card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .badge {
          display: inline-block;
          background: #065f46;
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 20px;
          margin: 0 0 8px 0;
          color: #ffffff;
        }
        p {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .info-box {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 16px;
          font-size: 13px;
          margin-bottom: 24px;
          word-break: break-all;
        }
        .info-label {
          font-weight: 700;
          color: #38bdf8;
          margin-bottom: 4px;
        }
        .btn {
          display: inline-block;
          background: #10b981;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Official Verification Record</span>
        <h1>Organization Verification Record</h1>
        <p>This document record was submitted during the organization onboarding review process.</p>
        
        <div class="info-box">
          <div class="info-label">Document Reference:</div>
          <div>${rawUrl || 'Verified Registration Certificate'}</div>
        </div>

        <a href="/admin/dashboard" class="btn">← Back to Admin Control Center</a>
      </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })
}
