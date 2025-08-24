// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          stripe_customer_id: string | null
          processing_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          stripe_customer_id?: string | null
          processing_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_customer_id?: string | null
          processing_credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      vods: {
        Row: {
          id: number
          user_id: string
          title: string | null
          vod_url: string
          duration_hours: number
          status: VODStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title?: string | null
          vod_url: string
          duration_hours: number
          status?: VODStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string | null
          vod_url?: string
          duration_hours?: number
          status?: VODStatus
          created_at?: string
          updated_at?: string
        }
      }
      transcripts: {
        Row: {
          id: number
          vod_id: number
          user_id: string
          content: string
          timestamp: number
          created_at: string
        }
        Insert: {
          id?: number
          vod_id: number
          user_id: string
          content: string
          timestamp: number
          created_at?: string
        }
        Update: {
          id?: number
          vod_id?: number
          user_id?: string
          content?: string
          timestamp?: number
          created_at?: string
        }
      }
    }
    Functions: {
      search_transcripts: {
        Args: {
          search_query: string
          vod_id_param?: number
          user_id_param?: string
        }
        Returns: SearchResult[]
      }
      get_vod_stats: {
        Args: {
          vod_id_param: number
        }
        Returns: VODStats[]
      }
      update_vod_status: {
        Args: {
          vod_id_param: number
          new_status: VODStatus
        }
        Returns: boolean
      }
    }
  }
}

// Enums and constants
export const VOD_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const
export type VODStatus = typeof VOD_STATUSES[number]

// Type aliases for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type VOD = Database['public']['Tables']['vods']['Row']
export type Transcript = Database['public']['Tables']['transcripts']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type VODInsert = Database['public']['Tables']['vods']['Insert']
export type TranscriptInsert = Database['public']['Tables']['transcripts']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type VODUpdate = Database['public']['Tables']['vods']['Update']
export type TranscriptUpdate = Database['public']['Tables']['transcripts']['Update']

// Extended types for application use
export interface SearchResult {
  id: number
  vod_id: number
  user_id: string
  content: string
  timestamp: number
  created_at: string
  rank: number
}

export interface VODStats {
  total_transcripts: number
  total_duration: number
  status: VODStatus
}

export interface VODWithStats extends VOD {
  stats?: VODStats
  transcripts?: Transcript[]
}