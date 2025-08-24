import { VOD, Transcript, SearchResult, VODStats } from './database'

// Base API response structure
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// Success response wrapper
export interface APISuccessResponse<T = any> extends APIResponse<T> {
  success: true
  data: T
}

// Error response wrapper
export interface APIErrorResponse extends APIResponse {
  success: false
  error: string
  statusCode: number
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Paginated response
export interface PaginatedResponse<T> extends APISuccessResponse<T[]> {
  pagination: PaginationMeta
}

// Authentication related types
export interface AuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

// VOD related API types
export interface VODListResponse extends PaginatedResponse<VOD> {}

export interface VODDetailResponse extends APISuccessResponse<VOD & {
  stats: VODStats
  recent_transcripts?: Transcript[]
}> {}

export interface VODCreateRequest {
  vod_url: string
  duration_hours: number
}

export interface VODCreateResponse extends APISuccessResponse<VOD> {}

export interface VODUpdateRequest {
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  vod_url?: string
}

export interface VODUpdateResponse extends APISuccessResponse<VOD> {}

// Transcript related API types
export interface TranscriptListResponse extends PaginatedResponse<Transcript> {}

export interface TranscriptCreateRequest {
  vod_id: number
  content: string
  timestamp: number
}

export interface TranscriptBatchCreateRequest {
  vod_id: number
  transcripts: Array<{
    content: string
    timestamp: number
  }>
}

export interface TranscriptCreateResponse extends APISuccessResponse<Transcript[]> {}

// Search related API types
export interface SearchRequest {
  query: string
  vod_id: number
}

export interface SearchResponse extends APISuccessResponse<SearchResult[]> {
  data: SearchResult[]
  query: string
  total_results: number
  search_time_ms: number
}

// Processing related types
export interface ProcessingStatus {
  vod_id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  estimated_completion?: string
  error_message?: string
}

export interface ProcessingStatusResponse extends APISuccessResponse<ProcessingStatus> {}

// Transcription service types (for mock implementation)
export interface TranscriptionSegment {
  content: string
  timestamp: number
  confidence?: number
  speaker?: string
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[]
  duration: number
  language?: string
  confidence_score?: number
}

export interface TranscriptionServiceResponse {
  success: boolean
  result?: TranscriptionResult
  error?: string
  processing_time_ms?: number
}

// Dashboard/Analytics types
export interface DashboardStats {
  total_vods: number
  completed_vods: number
  processing_vods: number
  failed_vods: number
  total_transcripts: number
  total_duration_hours: number
  recent_activity: Array<{
    type: 'vod_created' | 'vod_completed' | 'search_performed'
    timestamp: string
    details: string
  }>
}

export interface DashboardResponse extends APISuccessResponse<DashboardStats> {}

// File upload types (for future use)
export interface FileUploadRequest {
  file: File
  vod_id?: number
}

export interface FileUploadResponse extends APISuccessResponse<{
  file_url: string
  file_size: number
  mime_type: string
}> {}

// Webhook types (for external integrations)
export interface WebhookPayload {
  event: 'vod.created' | 'vod.processing' | 'vod.completed' | 'vod.failed'
  data: VOD
  timestamp: string
  user_id: string
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface APIValidationErrorResponse extends APIErrorResponse {
  errors: ValidationError[]
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retry_after?: number
}

export interface RateLimitResponse extends APIErrorResponse {
  rate_limit: RateLimitInfo
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: 'up' | 'down'
    supabase: 'up' | 'down'
    transcription: 'up' | 'down'
  }
  version: string
  uptime: number
}

// Type guards for API responses
export function isAPISuccessResponse<T>(response: APIResponse<T>): response is APISuccessResponse<T> {
  return response.success === true
}

export function isAPIErrorResponse(response: APIResponse): response is APIErrorResponse {
  return response.success === false
}

export function isValidationErrorResponse(response: APIResponse): response is APIValidationErrorResponse {
  return response.success === false && 'errors' in response
}

export function isRateLimitResponse(response: APIResponse): response is RateLimitResponse {
  return response.success === false && 'rate_limit' in response
}

// Utility types for API endpoints
export type APIEndpoint = 
  | '/api/vods'
  | '/api/vods/[id]'
  | '/api/vods/[id]/transcripts'
  | '/api/vods/[id]/search'
  | '/api/process-vod'
  | '/api/transcripts'
  | '/api/search'
  | '/api/dashboard'
  | '/api/health'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface APIEndpointConfig {
  method: HTTPMethod
  path: string
  requiresAuth: boolean
  rateLimit?: {
    requests: number
    window: number // in seconds
  }
}