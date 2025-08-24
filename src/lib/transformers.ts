import { 
  Profile, 
  VOD, 
  Transcript, 
  SearchResult, 
  VODStats,
  VODWithStats 
} from '@/types/database'
import { 
  APISuccessResponse, 
  APIErrorResponse, 
  PaginatedResponse,
  PaginationMeta,
  TranscriptionSegment,
  DashboardStats
} from '@/types/api'

// Database to API response transformers
export class DataTransformers {
  
  // Transform database profile to API response
  static profileToAPI(profile: Profile): APISuccessResponse<Profile> {
    return {
      success: true,
      data: {
        ...profile,
        // Remove sensitive data if needed
        stripe_customer_id: profile.stripe_customer_id || null
      },
      timestamp: new Date().toISOString()
    }
  }

  // Transform database VOD to API response
  static vodToAPI(vod: VOD, stats?: VODStats): APISuccessResponse<VODWithStats> {
    return {
      success: true,
      data: {
        ...vod,
        stats: stats || undefined
      },
      timestamp: new Date().toISOString()
    }
  }

  // Transform database VODs to paginated API response
  static vodsToAPI(
    vods: VOD[], 
    pagination: PaginationMeta
  ): PaginatedResponse<VOD> {
    return {
      success: true,
      data: vods,
      pagination,
      timestamp: new Date().toISOString()
    }
  }

  // Transform database transcript to API response
  static transcriptToAPI(transcript: Transcript): APISuccessResponse<Transcript> {
    return {
      success: true,
      data: transcript,
      timestamp: new Date().toISOString()
    }
  }

  // Transform database transcripts to API response
  static transcriptsToAPI(transcripts: Transcript[]): APISuccessResponse<Transcript[]> {
    return {
      success: true,
      data: transcripts,
      timestamp: new Date().toISOString()
    }
  }

  // Transform search results to API response
  static searchResultsToAPI(
    results: SearchResult[], 
    query: string,
    searchTimeMs: number = 0
  ): APISuccessResponse<SearchResult[]> & {
    query: string
    total_results: number
    search_time_ms: number
  } {
    return {
      success: true,
      data: results,
      query,
      total_results: results.length,
      search_time_ms: searchTimeMs,
      timestamp: new Date().toISOString()
    }
  }

  // Transform error to API error response
  static errorToAPI(
    error: Error | string, 
    statusCode: number = 500
  ): APIErrorResponse {
    const errorMessage = typeof error === 'string' ? error : error.message
    
    return {
      success: false,
      error: errorMessage,
      statusCode,
      timestamp: new Date().toISOString()
    }
  }

  // Transform validation errors to API response
  static validationErrorToAPI(
    errors: Array<{ field: string; message: string; code: string }>,
    statusCode: number = 400
  ): APIErrorResponse & { errors: typeof errors } {
    return {
      success: false,
      error: 'Validation failed',
      statusCode,
      errors,
      timestamp: new Date().toISOString()
    }
  }

  // Transform transcription segments to database format
  static transcriptionSegmentsToDatabase(
    segments: TranscriptionSegment[],
    vodId: number,
    userId: string
  ): Array<{
    vod_id: number
    user_id: string
    content: string
    timestamp: number
  }> {
    return segments.map(segment => ({
      vod_id: vodId,
      user_id: userId,
      content: segment.content,
      timestamp: segment.timestamp
    }))
  }

  // Calculate pagination metadata
  static calculatePagination(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit)
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  // Transform VODs with stats for dashboard
  static vodsToDashboardStats(vods: VOD[], transcripts: Transcript[]): DashboardStats {
    const totalVods = vods.length
    const completedVods = vods.filter(v => v.status === 'completed').length
    const processingVods = vods.filter(v => v.status === 'processing').length
    const failedVods = vods.filter(v => v.status === 'failed').length
    const totalTranscripts = transcripts.length
    
    // Calculate total duration in hours
    const totalDurationSeconds = transcripts.reduce((sum, t) => Math.max(sum, t.timestamp), 0)
    const totalDurationHours = Math.round((totalDurationSeconds / 3600) * 100) / 100

    // Generate recent activity
    const recentActivity = [
      ...vods.slice(0, 5).map(vod => ({
        type: 'vod_created' as const,
        timestamp: vod.created_at,
        details: `VOD created: ${this.truncateUrl(vod.vod_url)}`
      })),
      ...vods.filter(v => v.status === 'completed').slice(0, 3).map(vod => ({
        type: 'vod_completed' as const,
        timestamp: vod.updated_at,
        details: `VOD processing completed: ${this.truncateUrl(vod.vod_url)}`
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return {
      total_vods: totalVods,
      completed_vods: completedVods,
      processing_vods: processingVods,
      failed_vods: failedVods,
      total_transcripts: totalTranscripts,
      total_duration_hours: totalDurationHours,
      recent_activity: recentActivity
    }
  }

  // Format timestamp for display
  static formatTimestamp(timestamp: number): string {
    const hours = Math.floor(timestamp / 3600)
    const minutes = Math.floor((timestamp % 3600) / 60)
    const seconds = Math.floor(timestamp % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Format duration for display
  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60)
      return `${minutes}m`
    } else {
      const hours = Math.round(seconds / 3600 * 10) / 10
      return `${hours}h`
    }
  }

  // Truncate URL for display
  static truncateUrl(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) return url
    
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const path = urlObj.pathname
      
      if (domain.length + path.length <= maxLength) {
        return `${domain}${path}`
      } else {
        const availableLength = maxLength - domain.length - 3 // 3 for "..."
        const truncatedPath = path.length > availableLength 
          ? path.substring(0, availableLength) + '...'
          : path
        return `${domain}${truncatedPath}`
      }
    } catch {
      return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url
    }
  }

  // Sanitize content for display
  static sanitizeContent(content: string, maxLength: number = 200): string {
    // Remove excessive whitespace
    const cleaned = content.replace(/\s+/g, ' ').trim()
    
    // Truncate if too long
    if (cleaned.length > maxLength) {
      return cleaned.substring(0, maxLength - 3) + '...'
    }
    
    return cleaned
  }

  // Calculate search relevance score
  static calculateRelevanceScore(
    content: string, 
    query: string, 
    timestamp: number
  ): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentWords = content.toLowerCase().split(/\s+/)
    
    let score = 0
    
    // Exact phrase match gets highest score
    if (content.toLowerCase().includes(query.toLowerCase())) {
      score += 1.0
    }
    
    // Word matches
    const matchedWords = queryWords.filter(qWord => 
      contentWords.some(cWord => cWord.includes(qWord))
    )
    score += (matchedWords.length / queryWords.length) * 0.8
    
    // Boost score for earlier timestamps (assuming more important content is at the beginning)
    const timestampBoost = Math.max(0, 1 - (timestamp / 3600)) * 0.1
    score += timestampBoost
    
    return Math.min(score, 1.0)
  }

  // Group transcripts by time intervals
  static groupTranscriptsByInterval(
    transcripts: Transcript[], 
    intervalSeconds: number = 60
  ): Array<{
    startTime: number
    endTime: number
    transcripts: Transcript[]
    content: string
  }> {
    if (transcripts.length === 0) return []

    const sorted = [...transcripts].sort((a, b) => a.timestamp - b.timestamp)
    const groups: Array<{
      startTime: number
      endTime: number
      transcripts: Transcript[]
      content: string
    }> = []

    let currentGroup: Transcript[] = []
    let currentStartTime = Math.floor(sorted[0].timestamp / intervalSeconds) * intervalSeconds

    for (const transcript of sorted) {
      const groupStartTime = Math.floor(transcript.timestamp / intervalSeconds) * intervalSeconds
      
      if (groupStartTime === currentStartTime) {
        currentGroup.push(transcript)
      } else {
        // Finish current group
        if (currentGroup.length > 0) {
          groups.push({
            startTime: currentStartTime,
            endTime: currentStartTime + intervalSeconds,
            transcripts: [...currentGroup],
            content: currentGroup.map(t => t.content).join(' ')
          })
        }
        
        // Start new group
        currentGroup = [transcript]
        currentStartTime = groupStartTime
      }
    }

    // Add final group
    if (currentGroup.length > 0) {
      groups.push({
        startTime: currentStartTime,
        endTime: currentStartTime + intervalSeconds,
        transcripts: currentGroup,
        content: currentGroup.map(t => t.content).join(' ')
      })
    }

    return groups
  }
}