// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schema for input validation
const SearchRequestSchema = z.object({
  query: z.string().min(1, { message: "Search query cannot be empty." }),
  vod_id: z.number().optional().nullable(),
  user_id: z.string().uuid({ message: "Invalid user ID format." }),
})

// Error response utility
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// @ts-ignore
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
  // @ts-ignore
  Deno.env.get('SUPABASE_URL') ?? '',
  // @ts-ignore
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized: Invalid or missing authentication token.', 401)
    }

    const body = await req.json()
    const validationResult = SearchRequestSchema.safeParse(body)

    if (!validationResult.success) {
  // @ts-ignore
  const errorMessage = validationResult.error.errors.map(e => e.message).join(' ')
      return createErrorResponse(`Invalid input: ${errorMessage}`, 400)
    }

    const { query, vod_id, user_id } = validationResult.data

    if (user_id !== user.id) {
      return createErrorResponse('Forbidden: User ID does not match authenticated user.', 403)
    }

    const startTime = Date.now()

    // Use the built-in search_transcripts function
    const { data, error } = await supabaseClient.rpc('search_transcripts', {
      search_query: query,
      user_id_param: user.id,
      vod_id_param: vod_id,
    })

    if (error) {
      console.error('RPC search_transcripts error:', error)
      return createErrorResponse('An error occurred while searching.', 500)
    }

    const searchTime = Date.now() - startTime

    return new Response(
      JSON.stringify({
        results: data,
        query: query,
        total_results: data?.length ?? 0,
        search_time_ms: searchTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error in search-vods function:', error)
    // Distinguish between JSON parsing errors and other errors
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON format in request body.', 400)
    }
    return createErrorResponse('Internal Server Error.', 500)
  }
})