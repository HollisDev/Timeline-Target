import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected and public routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/vods',
  '/search',
  '/watchlist',
  '/api/vods',
  '/api/search',
  '/api/process-vod',
  '/api/user'
]

const authRoutes = [
  '/login',
  '/signup',
  '/auth'
]

const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/help',
  '/terms',
  '/privacy',
  '/api/health'
]

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return supabaseResponse
  }

  try {
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession()

    // Log authentication status for debugging
    console.log(`Middleware: ${pathname}, Session: ${session ? 'exists' : 'none'}`)

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

    // Handle protected routes
    if (isProtectedRoute) {
      if (!session) {
        // Redirect to login with return URL
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        // Session expired, redirect to login
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        redirectUrl.searchParams.set('error', 'Session expired. Please sign in again.')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Handle auth routes (login, signup)
    if (isAuthRoute && session) {
      // User is already authenticated, redirect to dashboard
      const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      // Skip auth check for public API routes
      if (pathname.startsWith('/api/health') || pathname.startsWith('/api/auth/')) {
        return supabaseResponse
      }

      // Check authentication for protected API routes
      if (isProtectedRoute && !session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Add user info to headers for API routes
      if (session) {
        supabaseResponse.headers.set('x-user-id', session.user.id)
        supabaseResponse.headers.set('x-user-email', session.user.email || '')
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error and it's a protected route, redirect to login
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    if (isProtectedRoute) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('error', 'Authentication error. Please sign in again.')
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}