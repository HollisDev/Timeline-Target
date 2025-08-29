import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

// Zod schema for VOD submission
const VodSubmissionSchema = z.object({
  vod_url: z.string().url({ message: "Invalid URL format" }),
  title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title must be less than 200 characters" }),
  duration_hours: z.number().min(0.1, { message: "Duration must be at least 0.1 hours" }).max(24, { message: "Duration cannot exceed 24 hours" }),
})

// Function to estimate duration from URL (placeholder - would need actual implementation)
async function estimateVideoDuration(url: string): Promise<number> {
  // This is a placeholder - in a real implementation, you might:
  // 1. Use a service like YouTube API for YouTube videos
  // 2. Download video metadata with ffprobe
  // 3. Use a third-party service for duration estimation

  // For now, we'll require the user to provide duration
  throw new Error("Duration estimation not implemented - please provide duration_hours")
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const validationResult = VodSubmissionSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e: any) => e.message).join(', ')
      return NextResponse.json(
        { error: `Invalid input: ${errorMessage}` },
        { status: 400 }
      )
    }

    const { vod_url, title, duration_hours } = validationResult.data

    // Check user's processing credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('processing_credits')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user has enough credits
    if (profile.processing_credits < duration_hours) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You have ${profile.processing_credits} credits but need ${duration_hours} credits for this video.`
        },
        { status: 400 }
      )
    }

    // Deduct credits using the database function
    const { data: deductResult, error: deductError } = await supabase
      .rpc('deduct_processing_credits', {
        user_id: user.id,
        credits_to_deduct: duration_hours
      })

    if (deductError) {
      console.error('Error deducting credits:', deductError)
      return NextResponse.json(
        { error: 'Failed to deduct processing credits' },
        { status: 500 }
      )
    }

    if (!deductResult) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }

    // Insert VOD record
    const { data: vod, error: vodError } = await supabase
      .from('vods')
      .insert({
        user_id: user.id,
        vod_url,
        title,
        duration_hours,
        status: 'pending'
      })
      .select()
      .single()

    if (vodError) {
      console.error('Error creating VOD record:', vodError)
      return NextResponse.json(
        { error: 'Failed to create VOD record' },
        { status: 500 }
      )
    }

    // Trigger n8n workflow
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vod_id: vod.id,
            vod_url: vod.vod_url,
            title: body.title || 'Untitled VOD',
            duration_hours: vod.duration_hours,
            user_id: user.id,
            user_email: user.email,
          }),
        })

        if (!n8nResponse.ok) {
          console.error('Failed to trigger n8n workflow:', await n8nResponse.text())
          // Don't fail the submission if n8n fails, just log it
        } else {
          console.log('Successfully triggered n8n workflow for VOD:', vod.id)
        }
      } catch (error) {
        console.error('Error calling n8n webhook:', error)
        // Don't fail the submission if n8n fails
      }
    } else {
      console.warn('N8N_WEBHOOK_URL not configured, skipping workflow trigger')
    }

    return NextResponse.json({
      success: true,
      vod: {
        id: vod.id,
        vod_url: vod.vod_url,
        title: vod.title,
        duration_hours: vod.duration_hours,
        status: vod.status,
        created_at: vod.created_at
      },
      credits_remaining: profile.processing_credits - duration_hours
    })

  } catch (error) {
    console.error('Unexpected error in VOD submission:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
