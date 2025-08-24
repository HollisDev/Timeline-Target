import { z } from 'zod'
import { VOD_STATUSES } from './database'

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const emailSchema = z.string().email('Invalid email format')
export const urlSchema = z.string().url('Invalid URL format')
export const timestampSchema = z.string().datetime('Invalid timestamp format')

// VOD Status validation
export const vodStatusSchema = z.enum(VOD_STATUSES).refine(
  (value) => VOD_STATUSES.includes(value),
  { message: `Status must be one of: ${VOD_STATUSES.join(', ')}` }
)

// Profile validation schemas
export const profileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  stripe_customer_id: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema
})

export const profileInsertSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  stripe_customer_id: z.string().optional().nullable(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional()
})

export const profileUpdateSchema = z.object({
  id: uuidSchema.optional(),
  email: emailSchema.optional(),
  stripe_customer_id: z.string().optional().nullable(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

// VOD validation schemas
export const vodSchema = z.object({
  id: z.number().int().positive('VOD ID must be a positive integer'),
  user_id: uuidSchema,
  vod_url: urlSchema,
  status: vodStatusSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema
})

export const vodInsertSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: uuidSchema,
  vod_url: urlSchema.refine(
    (url) => {
      // Basic video URL validation - can be extended for specific platforms
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
      const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext))
      const isStreamingPlatform = /youtube\.com|vimeo\.com|twitch\.tv|dailymotion\.com/i.test(url)
      return hasVideoExtension || isStreamingPlatform
    },
    { message: 'URL must be a valid video URL or from a supported streaming platform' }
  ),
  status: vodStatusSchema.optional(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional()
})

export const vodUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: uuidSchema.optional(),
  vod_url: urlSchema.optional(),
  status: vodStatusSchema.optional(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

// Transcript validation schemas
export const transcriptSchema = z.object({
  id: z.number().int().positive('Transcript ID must be a positive integer'),
  vod_id: z.number().int().positive('VOD ID must be a positive integer'),
  user_id: uuidSchema,
  content: z.string().min(1, 'Content cannot be empty').max(10000, 'Content too long (max 10000 characters)'),
  timestamp: z.number().min(0, 'Timestamp must be non-negative'),
  created_at: timestampSchema
})

export const transcriptInsertSchema = z.object({
  id: z.number().int().positive().optional(),
  vod_id: z.number().int().positive('VOD ID must be a positive integer'),
  user_id: uuidSchema,
  content: z.string().min(1, 'Content cannot be empty').max(10000, 'Content too long (max 10000 characters)'),
  timestamp: z.number().min(0, 'Timestamp must be non-negative'),
  created_at: timestampSchema.optional()
})

export const transcriptUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  vod_id: z.number().int().positive().optional(),
  user_id: uuidSchema.optional(),
  content: z.string().min(1).max(10000).optional(),
  timestamp: z.number().min(0).optional(),
  created_at: timestampSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

// Search validation schemas
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500, 'Search query too long'),
  vod_id: z.number().int().positive().optional(),
  user_id: uuidSchema.optional()
})

export const searchResultSchema = z.object({
  id: z.number().int().positive(),
  vod_id: z.number().int().positive(),
  user_id: uuidSchema,
  content: z.string(),
  timestamp: z.number().min(0),
  created_at: timestampSchema,
  rank: z.number().min(0).max(1)
})

// VOD statistics validation
export const vodStatsSchema = z.object({
  total_transcripts: z.number().int().min(0),
  total_duration: z.number().min(0),
  status: vodStatusSchema
})

// API request/response validation schemas
export const createVODRequestSchema = z.object({
  vod_url: urlSchema.refine(
    (url) => {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
      const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext))
      const isStreamingPlatform = /youtube\.com|vimeo\.com|twitch\.tv|dailymotion\.com/i.test(url)
      return hasVideoExtension || isStreamingPlatform
    },
    { message: 'URL must be a valid video URL or from a supported streaming platform' }
  )
})

export const updateVODStatusRequestSchema = z.object({
  vod_id: z.number().int().positive(),
  status: vodStatusSchema
})

export const searchTranscriptsRequestSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500, 'Search query too long'),
  vod_id: z.number().int().positive('VOD ID must be a positive integer')
})

// Batch operations validation
export const batchTranscriptInsertSchema = z.object({
  vod_id: z.number().int().positive(),
  user_id: uuidSchema,
  transcripts: z.array(z.object({
    content: z.string().min(1).max(10000),
    timestamp: z.number().min(0)
  })).min(1, 'At least one transcript must be provided').max(1000, 'Too many transcripts (max 1000)')
})

// Error response validation
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int().min(400).max(599),
  timestamp: timestampSchema
})

// Success response validation
export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional()
})

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'updated_at', 'timestamp']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

// Type inference from schemas
export type ProfileValidation = z.infer<typeof profileSchema>
export type ProfileInsertValidation = z.infer<typeof profileInsertSchema>
export type ProfileUpdateValidation = z.infer<typeof profileUpdateSchema>

export type VODValidation = z.infer<typeof vodSchema>
export type VODInsertValidation = z.infer<typeof vodInsertSchema>
export type VODUpdateValidation = z.infer<typeof vodUpdateSchema>

export type TranscriptValidation = z.infer<typeof transcriptSchema>
export type TranscriptInsertValidation = z.infer<typeof transcriptInsertSchema>
export type TranscriptUpdateValidation = z.infer<typeof transcriptUpdateSchema>

export type SearchQueryValidation = z.infer<typeof searchQuerySchema>
export type SearchResultValidation = z.infer<typeof searchResultSchema>
export type VODStatsValidation = z.infer<typeof vodStatsSchema>

export type CreateVODRequest = z.infer<typeof createVODRequestSchema>
export type UpdateVODStatusRequest = z.infer<typeof updateVODStatusRequestSchema>
export type SearchTranscriptsRequest = z.infer<typeof searchTranscriptsRequestSchema>
export type BatchTranscriptInsert = z.infer<typeof batchTranscriptInsertSchema>

export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
export type PaginationParams = z.infer<typeof paginationSchema>