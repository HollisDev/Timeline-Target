import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

    // Verify the VOD belongs to the user
    const { data: vod, error: vodError } = await supabase
      .from('vods')
      .select('id')
      .eq('id', vodId)
      .eq('user_id', user.id)
      .single();

    if (vodError || !vod) {
      return NextResponse.json(
        { error: 'VOD not found or access denied' },
        { status: 404 }
      );
    }

    // Get transcripts for the VOD
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, vod_id, content, timestamp, created_at')
      .eq('vod_id', vodId)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true });

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError);
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcripts: transcripts || [],
      total_count: transcripts?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
