import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Database utility functions
export class DatabaseService {
  private adminClient = createAdminClient()

  private async getSupabase() {
    return await createClient()
  }

  // Get authenticated user
  async getUser() {
    const supabase = await this.getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // User profile operations
  async getUserProfile(userId: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async createUserProfile(userId: string, email: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // VOD operations
  async getUserVODs(userId: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('vods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createVOD(userId: string, vodUrl: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('vods')
      .insert({ user_id: userId, vod_url: vodUrl, status: 'pending' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateVODStatus(vodId: number, status: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('vods')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', vodId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Transcript operations
  async createTranscripts(vodId: number, userId: string, transcripts: Array<{ content: string; timestamp: number }>) {
    const supabase = await this.getSupabase()
    const transcriptData = transcripts.map(transcript => ({
      vod_id: vodId,
      user_id: userId,
      content: transcript.content,
      timestamp: transcript.timestamp
    }))

    const { data, error } = await supabase
      .from('transcripts')
      .insert(transcriptData)
      .select()
    
    if (error) throw error
    return data
  }

  async searchTranscripts(vodId: number, userId: string, query: string) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('vod_id', vodId)
      .eq('user_id', userId)
      .textSearch('content', query)
      .order('timestamp', { ascending: true })
    
    if (error) throw error
    return data
  }

  // Admin operations (using service role key)
  async adminUpdateVODStatus(vodId: number, status: string) {
    const { data, error } = await this.adminClient
      .from('vods')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', vodId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async adminCreateTranscripts(vodId: number, userId: string, transcripts: Array<{ content: string; timestamp: number }>) {
    const transcriptData = transcripts.map(transcript => ({
      vod_id: vodId,
      user_id: userId,
      content: transcript.content,
      timestamp: transcript.timestamp
    }))

    const { data, error } = await this.adminClient
      .from('transcripts')
      .insert(transcriptData)
      .select()
    
    if (error) throw error
    return data
  }
}