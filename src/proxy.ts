import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Do not add any logic between createServerClient and
    // supabase.auth.getUser(). It refreshes the session cookie so that
    // server components can always read a valid session.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isAuthPage =
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/signup')

    // Redirect unauthenticated users away from protected routes
    if (
      !user &&
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/event-manager') &&
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/api') &&
      pathname !== '/' &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/favicon')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Redirect logged-in users away from auth pages to dashboard
    if (isAuthPage && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Proxy auth error:', error)
  }

  // IMPORTANT: Return supabaseResponse as-is so that session cookies are
  // forwarded to the browser correctly.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run proxy on all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, and image files in public/
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
