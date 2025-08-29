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

    // Get chapters for the VOD
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, vod_id, timestamp, title, created_at')
      .eq('vod_id', vodId)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true });

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json(
        { error: 'Failed to fetch chapters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      chapters: chapters || [],
      total_count: chapters?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
