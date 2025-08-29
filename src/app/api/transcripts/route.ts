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

    // TODO: Implement transcripts retrieval
    // This would fetch transcripts for the authenticated user

    return NextResponse.json({
      success: true,
      message: 'Transcripts endpoint - not yet fully implemented',
      transcripts: []
    })

  } catch (error) {
    console.error('Unexpected error in transcripts:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
