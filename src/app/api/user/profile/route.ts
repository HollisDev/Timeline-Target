import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authentication token' },
        { status: 401 }
      )
    }

    // Get user profile with credit balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, processing_credits, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Get user's VODs
    const { data: vods, error: vodsError } = await supabase
      .from('vods')
      .select('id, vod_url, status, duration_hours, summary, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (vodsError) {
      console.error('Error fetching user VODs:', vodsError)
      return NextResponse.json(
        { error: 'Failed to fetch VODs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile,
      vods: vods || [],
      total_vods: vods?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error fetching user data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
