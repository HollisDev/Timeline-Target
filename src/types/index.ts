// Main types export file for the VOD Search Engine

// Database types
export * from './database'

// API types
export * from './api'

// Validation schemas and types
export * from './validation'

// Error types
export * from './errors'

// Re-export commonly used types for convenience

// Database entities
export type {
  Profile,
  VOD,
  Transcript,
  SearchResult,
  VODStats,
  VODWithStats,
  VODStatus
} from './database'

// API responses
export type {
  APIResponse,
  APISuccessResponse,
  APIErrorResponse,
  PaginatedResponse,
  PaginationMeta,
  AuthUser,
  AuthSession,
  VODCreateRequest,
  VODCreateResponse,
  VODUpdateRequest,
  VODUpdateResponse,
  VODListResponse,
  VODDetailResponse,
  TranscriptCreateRequest,
  TranscriptBatchCreateRequest,
  TranscriptCreateResponse,
  TranscriptListResponse,
  SearchRequest,
  SearchResponse,
  ProcessingStatus,
  ProcessingStatusResponse,
  TranscriptionResult,
  TranscriptionSegment,
  DashboardStats,
  DashboardResponse
} from './api'

// Validation types
export type {
  ProfileValidation,
  VODValidation,
  TranscriptValidation,
  SearchQueryValidation,
  CreateVODRequest,
  SearchTranscriptsRequest,
  PaginationParams
} from './validation'

// Error types
export type {
  BaseError,
  ValidationErrorDetail
} from './errors'

// Constants
export { VOD_STATUSES } from './database'

export {
  // Error codes
  ErrorCode,
  ErrorStatusMap,
  ErrorMessages,
  
  // Error classes
  AppError,
  ValidationError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  
  // Error factory
  createError,
  
  // Type guards
  isAppError,
  isValidationError,
  isDatabaseError,
  isExternalServiceError,
  isRateLimitError
} from './errors'

export {
  // API type guards
  isAPISuccessResponse,
  isAPIErrorResponse,
  isValidationErrorResponse,
  isRateLimitResponse
} from './api'

// Common utility types
export interface RequestContext {
  userId?: string
  requestId: string
  userAgent?: string
  ipAddress?: string
  timestamp: string
}

export interface ServiceConfig {
  maxRetries: number
  timeoutMs: number
  rateLimitPerMinute: number
}

export interface CacheConfig {
  ttlSeconds: number
  maxSize: number
  enabled: boolean
}

// Application configuration types
export interface AppConfig {
  database: {
    maxConnections: number
    queryTimeoutMs: number
    retryAttempts: number
  }
  transcription: {
    maxFileSizeMB: number
    supportedFormats: string[]
    timeoutMs: number
    maxDurationMinutes: number
  }
  search: {
    maxQueryLength: number
    minQueryLength: number
    maxResults: number
    highlightEnabled: boolean
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
  }
  cache: CacheConfig
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableRequestLogging: boolean
    enableQueryLogging: boolean
  }
}

// Feature flags
export interface FeatureFlags {
  enableBatchTranscriptUpload: boolean
  enableAdvancedSearch: boolean
  enableRealTimeUpdates: boolean
  enableAnalytics: boolean
  enableFileUpload: boolean
  enableWebhooks: boolean
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  searchResultsPerPage: number
  autoPlayVideos: boolean
  showTimestamps: boolean
}

// Audit log types
export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
}

// Webhook types
export interface WebhookEvent {
  id: string
  type: 'vod.created' | 'vod.processing' | 'vod.completed' | 'vod.failed' | 'transcript.created'
  data: Record<string, any>
  timestamp: string
  userId: string
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: WebhookEvent['type'][]
  secret: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// Analytics types
export interface AnalyticsEvent {
  eventType: 'page_view' | 'vod_upload' | 'search_query' | 'transcript_view'
  userId?: string
  sessionId: string
  properties: Record<string, any>
  timestamp: string
}

export interface AnalyticsMetrics {
  totalUsers: number
  activeUsers: number
  totalVODs: number
  totalSearches: number
  averageProcessingTime: number
  popularSearchTerms: Array<{ term: string; count: number }>
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
}

// Export validation schemas for runtime use
export {
  // Profile schemas
  profileSchema,
  profileInsertSchema,
  profileUpdateSchema,
  
  // VOD schemas
  vodSchema,
  vodInsertSchema,
  vodUpdateSchema,
  
  // Transcript schemas
  transcriptSchema,
  transcriptInsertSchema,
  transcriptUpdateSchema,
  
  // Search schemas
  searchQuerySchema,
  searchResultSchema,
  
  // API request schemas
  createVODRequestSchema,
  updateVODStatusRequestSchema,
  searchTranscriptsRequestSchema,
  batchTranscriptInsertSchema,
  
  // Response schemas
  errorResponseSchema,
  successResponseSchema,
  
  // Utility schemas
  paginationSchema,
  uuidSchema,
  emailSchema,
  urlSchema,
  timestampSchema,
  vodStatusSchema
} from './validation'