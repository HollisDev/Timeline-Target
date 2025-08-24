import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const redirectTo = (path: string, errorMessage?: string) => {
    const url = new URL(path, origin)
    if (errorMessage) {
      url.searchParams.set('error', 'true')
      url.searchParams.set('message', errorMessage)
    }
    return NextResponse.redirect(url)
  }

  if (error || errorDescription) {
    console.error('Auth callback error:', error, errorDescription)
    return redirectTo('/login', errorDescription || 'Sorry, we could not log you in. Please try again.')
  }

  if (!code) {
    return redirectTo('/login', 'Authentication code is missing. Please try again.')
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError)
    return redirectTo('/login', exchangeError.message || 'Failed to create a session. Please try again.')
  }

  // After successful login, check if it's a new user to determine if they should be sent to the onboarding page.
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_onboarded')
    .eq('id', user!.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') { // Ignore 'No rows found' error for now
    console.error('Error fetching profile:', profileError)
    // Redirect to dashboard even if profile fetch fails, to not block login
    return redirectTo(next)
  }

  // If the user has not been onboarded, redirect to the onboarding page.
  // The `is_onboarded` flag is expected to be set to `true` at the end of the onboarding flow.
  if (profile && !profile.is_onboarded) {
    const onboardingUrl = new URL('/onboarding', origin)
    onboardingUrl.searchParams.set('next', next) // Carry over the original 'next' param
    return NextResponse.redirect(onboardingUrl)
  }

  // Default redirection to the dashboard or the originally intended page.
  return redirectTo(next)
}

export async function POST(request: NextRequest) {
  // Handle POST requests (e.g., from OAuth providers that use POST)
  return GET(request)
}