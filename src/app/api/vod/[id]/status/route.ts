import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

// Zod schema for status update
const StatusUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    const { id: vodId } = await params;

    // Get VOD status
    const { data: vod, error: vodError } = await supabase
      .from('vods')
      .select(
        'id, vod_url, status, duration_hours, summary, created_at, updated_at'
      )
      .eq('id', vodId)
      .eq('user_id', user.id)
      .single();

    if (vodError) {
      console.error('Error fetching VOD:', vodError);
      return NextResponse.json(
        { error: 'VOD not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vod });
  } catch (error) {
    console.error('Unexpected error fetching VOD status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    const { id: vodId } = await params;

    // Parse request body
    const body = await request.json();
    const validationResult = StatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.message || 'Invalid input';
      return NextResponse.json(
        { error: `Invalid input: ${errorMessage}` },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Update VOD status using the database function
    const { data: updateResult, error: updateError } = await supabase.rpc(
      'update_vod_status',
      {
        vod_id_param: vodId,
        new_status: status,
      }
    );

    if (updateError) {
      console.error('Error updating VOD status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update VOD status' },
        { status: 500 }
      );
    }

    if (!updateResult) {
      return NextResponse.json(
        { error: 'VOD not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch updated VOD data
    const { data: updatedVod, error: fetchError } = await supabase
      .from('vods')
      .select(
        'id, vod_url, status, duration_hours, summary, created_at, updated_at'
      )
      .eq('id', vodId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated VOD:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated VOD data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ vod: updatedVod });
  } catch (error) {
    console.error('Unexpected error updating VOD status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
