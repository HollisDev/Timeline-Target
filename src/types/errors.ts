// Error types and interfaces for the VOD Search Engine

// Base error interface
export interface BaseError {
  code: string
  message: string
  timestamp: string
  requestId?: string
}

// Application-specific error codes
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_URL_FORMAT = 'INVALID_URL_FORMAT',
  INVALID_UUID_FORMAT = 'INVALID_UUID_FORMAT',

  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // VOD-specific errors
  VOD_NOT_FOUND = 'VOD_NOT_FOUND',
  VOD_PROCESSING_FAILED = 'VOD_PROCESSING_FAILED',
  VOD_ALREADY_PROCESSING = 'VOD_ALREADY_PROCESSING',
  VOD_INVALID_STATUS = 'VOD_INVALID_STATUS',
  VOD_URL_INACCESSIBLE = 'VOD_URL_INACCESSIBLE',

  // Transcript errors
  TRANSCRIPT_NOT_FOUND = 'TRANSCRIPT_NOT_FOUND',
  TRANSCRIPT_GENERATION_FAILED = 'TRANSCRIPT_GENERATION_FAILED',
  TRANSCRIPT_CONTENT_TOO_LONG = 'TRANSCRIPT_CONTENT_TOO_LONG',

  // Search errors
  SEARCH_QUERY_TOO_SHORT = 'SEARCH_QUERY_TOO_SHORT',
  SEARCH_QUERY_TOO_LONG = 'SEARCH_QUERY_TOO_LONG',
  SEARCH_NO_RESULTS = 'SEARCH_NO_RESULTS',
  SEARCH_SERVICE_UNAVAILABLE = 'SEARCH_SERVICE_UNAVAILABLE',

  // Database errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_VIOLATION = 'DATABASE_CONSTRAINT_VIOLATION',

  // External service errors
  TRANSCRIPTION_SERVICE_ERROR = 'TRANSCRIPTION_SERVICE_ERROR',
  TRANSCRIPTION_SERVICE_TIMEOUT = 'TRANSCRIPTION_SERVICE_TIMEOUT',
  TRANSCRIPTION_SERVICE_UNAVAILABLE = 'TRANSCRIPTION_SERVICE_UNAVAILABLE',

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // File/Upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Permission errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED'
}

// HTTP status code mapping
export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,

  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_URL_FORMAT]: 400,
  [ErrorCode.INVALID_UUID_FORMAT]: 400,

  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_CONFLICT]: 409,

  [ErrorCode.VOD_NOT_FOUND]: 404,
  [ErrorCode.VOD_PROCESSING_FAILED]: 422,
  [ErrorCode.VOD_ALREADY_PROCESSING]: 409,
  [ErrorCode.VOD_INVALID_STATUS]: 400,
  [ErrorCode.VOD_URL_INACCESSIBLE]: 422,

  [ErrorCode.TRANSCRIPT_NOT_FOUND]: 404,
  [ErrorCode.TRANSCRIPT_GENERATION_FAILED]: 422,
  [ErrorCode.TRANSCRIPT_CONTENT_TOO_LONG]: 400,

  [ErrorCode.SEARCH_QUERY_TOO_SHORT]: 400,
  [ErrorCode.SEARCH_QUERY_TOO_LONG]: 400,
  [ErrorCode.SEARCH_NO_RESULTS]: 404,
  [ErrorCode.SEARCH_SERVICE_UNAVAILABLE]: 503,

  [ErrorCode.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorCode.DATABASE_QUERY_ERROR]: 500,
  [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: 409,

  [ErrorCode.TRANSCRIPTION_SERVICE_ERROR]: 502,
  [ErrorCode.TRANSCRIPTION_SERVICE_TIMEOUT]: 504,
  [ErrorCode.TRANSCRIPTION_SERVICE_UNAVAILABLE]: 503,

  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,

  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT_ERROR]: 504,

  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 415,
  [ErrorCode.UPLOAD_FAILED]: 422,

  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.RESOURCE_ACCESS_DENIED]: 403
}

// Application error class
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly timestamp: string
  public readonly requestId?: string
  public readonly details?: Record<string, any>

  constructor(
    code: ErrorCode,
    message?: string,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(message || code)
    this.name = 'AppError'
    this.code = code
    this.statusCode = ErrorStatusMap[code] || 500
    this.timestamp = new Date().toISOString()
    this.requestId = requestId
    this.details = details

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      requestId: this.requestId,
      details: this.details
    }
  }
}

// Validation error details
export interface ValidationErrorDetail {
  field: string
  value: any
  message: string
  code: string
}

// Validation error class
export class ValidationError extends AppError {
  public readonly errors: ValidationErrorDetail[]

  constructor(
    errors: ValidationErrorDetail[],
    message: string = 'Validation failed',
    requestId?: string
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, { errors }, requestId)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

// Database error class
export class DatabaseError extends AppError {
  public readonly query?: string
  public readonly constraint?: string

  constructor(
    code: ErrorCode,
    message: string,
    query?: string,
    constraint?: string,
    requestId?: string
  ) {
    super(code, message, { query, constraint }, requestId)
    this.name = 'DatabaseError'
    this.query = query
    this.constraint = constraint
  }
}

// External service error class
export class ExternalServiceError extends AppError {
  public readonly service: string
  public readonly originalError?: Error

  constructor(
    code: ErrorCode,
    service: string,
    message: string,
    originalError?: Error,
    requestId?: string
  ) {
    super(code, message, { service, originalError: originalError?.message }, requestId)
    this.name = 'ExternalServiceError'
    this.service = service
    this.originalError = originalError
  }
}

// Rate limit error class
export class RateLimitError extends AppError {
  public readonly limit: number
  public readonly remaining: number
  public readonly resetTime: number

  constructor(
    limit: number,
    remaining: number,
    resetTime: number,
    message: string = 'Rate limit exceeded',
    requestId?: string
  ) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, { limit, remaining, resetTime }, requestId)
    this.name = 'RateLimitError'
    this.limit = limit
    this.remaining = remaining
    this.resetTime = resetTime
  }
}

// Error factory functions
export const createError = {
  unauthorized: (message?: string, requestId?: string) =>
    new AppError(ErrorCode.UNAUTHORIZED, message || 'Unauthorized access', undefined, requestId),

  forbidden: (message?: string, requestId?: string) =>
    new AppError(ErrorCode.FORBIDDEN, message || 'Access forbidden', undefined, requestId),

  notFound: (resource: string, requestId?: string) =>
    new AppError(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, undefined, requestId),

  validation: (errors: ValidationErrorDetail[], requestId?: string) =>
    new ValidationError(errors, 'Validation failed', requestId),

  vodNotFound: (vodId: number, requestId?: string) =>
    new AppError(ErrorCode.VOD_NOT_FOUND, `VOD with ID ${vodId} not found`, { vodId }, requestId),

  vodProcessingFailed: (vodId: number, reason: string, requestId?: string) =>
    new AppError(ErrorCode.VOD_PROCESSING_FAILED, `VOD processing failed: ${reason}`, { vodId, reason }, requestId),

  transcriptNotFound: (transcriptId: number, requestId?: string) =>
    new AppError(ErrorCode.TRANSCRIPT_NOT_FOUND, `Transcript with ID ${transcriptId} not found`, { transcriptId }, requestId),

  searchNoResults: (query: string, requestId?: string) =>
    new AppError(ErrorCode.SEARCH_NO_RESULTS, `No results found for query: "${query}"`, { query }, requestId),

  databaseError: (message: string, query?: string, requestId?: string) =>
    new DatabaseError(ErrorCode.DATABASE_QUERY_ERROR, message, query, undefined, requestId),

  transcriptionServiceError: (message: string, originalError?: Error, requestId?: string) =>
    new ExternalServiceError(ErrorCode.TRANSCRIPTION_SERVICE_ERROR, 'transcription', message, originalError, requestId),

  rateLimitExceeded: (limit: number, resetTime: number, requestId?: string) =>
    new RateLimitError(limit, 0, resetTime, 'Rate limit exceeded', requestId),

  internalServerError: (message?: string, requestId?: string) =>
    new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message || 'Internal server error', undefined, requestId)
}

// Error message templates
export const ErrorMessages = {
  [ErrorCode.UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',

  [ErrorCode.VALIDATION_ERROR]: 'The provided data is invalid',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ErrorCode.INVALID_URL_FORMAT]: 'Invalid URL format',
  [ErrorCode.INVALID_UUID_FORMAT]: 'Invalid UUID format',

  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource was not found',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCode.RESOURCE_CONFLICT]: 'Resource conflict occurred',

  [ErrorCode.VOD_NOT_FOUND]: 'VOD not found',
  [ErrorCode.VOD_PROCESSING_FAILED]: 'VOD processing failed',
  [ErrorCode.VOD_ALREADY_PROCESSING]: 'VOD is already being processed',
  [ErrorCode.VOD_INVALID_STATUS]: 'Invalid VOD status',
  [ErrorCode.VOD_URL_INACCESSIBLE]: 'VOD URL is not accessible',

  [ErrorCode.TRANSCRIPT_NOT_FOUND]: 'Transcript not found',
  [ErrorCode.TRANSCRIPT_GENERATION_FAILED]: 'Failed to generate transcript',
  [ErrorCode.TRANSCRIPT_CONTENT_TOO_LONG]: 'Transcript content is too long',

  [ErrorCode.SEARCH_QUERY_TOO_SHORT]: 'Search query is too short',
  [ErrorCode.SEARCH_QUERY_TOO_LONG]: 'Search query is too long',
  [ErrorCode.SEARCH_NO_RESULTS]: 'No search results found',
  [ErrorCode.SEARCH_SERVICE_UNAVAILABLE]: 'Search service is currently unavailable',

  [ErrorCode.DATABASE_CONNECTION_ERROR]: 'Database connection error',
  [ErrorCode.DATABASE_QUERY_ERROR]: 'Database query error',
  [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: 'Database constraint violation',

  [ErrorCode.TRANSCRIPTION_SERVICE_ERROR]: 'Transcription service error',
  [ErrorCode.TRANSCRIPTION_SERVICE_TIMEOUT]: 'Transcription service timeout',
  [ErrorCode.TRANSCRIPTION_SERVICE_UNAVAILABLE]: 'Transcription service is unavailable',

  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please slow down',

  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An internal server error occurred',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is currently unavailable',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timeout',

  [ErrorCode.FILE_TOO_LARGE]: 'File is too large',
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 'Unsupported file type',
  [ErrorCode.UPLOAD_FAILED]: 'File upload failed',

  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [ErrorCode.RESOURCE_ACCESS_DENIED]: 'Access to resource denied'
} as const

// Type guard functions
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError
}

export function isDatabaseError(error: any): error is DatabaseError {
  return error instanceof DatabaseError
}

export function isExternalServiceError(error: any): error is ExternalServiceError {
  return error instanceof ExternalServiceError
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error instanceof RateLimitError
}