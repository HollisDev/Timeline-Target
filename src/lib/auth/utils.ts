import { User } from '@supabase/supabase-js'
import { AuthSession } from '@/types/api'
import { createError } from '@/types/errors'

// Authentication utility functions

// Check if user has specific permissions
export function hasPermission(user: User, permission: string): boolean {
  // In a real app, you'd check user roles/permissions from the database
  // For now, we'll implement basic permission checks
  
  const userMetadata = user.user_metadata || {}
  const permissions = userMetadata.permissions || []
  
  return permissions.includes(permission)
}

// Check if user is admin
export function isAdmin(user: User): boolean {
  // Simple admin check - in production, use proper role-based access control
  return user.email?.endsWith('@admin.com') || 
         user.user_metadata?.role === 'admin' ||
         hasPermission(user, 'admin')
}

// Check if user can access resource
export function canAccessResource(user: User, resourceUserId: string): boolean {
  // Users can access their own resources, admins can access all
  return user.id === resourceUserId || isAdmin(user)
}

// Generate user display name
export function getUserDisplayName(user: User): string {
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  
  if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
  }
  
  if (user.user_metadata?.first_name) {
    return user.user_metadata.first_name
  }
  
  return user.email?.split('@')[0] || 'User'
}

// Get user avatar URL
export function getUserAvatarUrl(user: User): string | null {
  return user.user_metadata?.avatar_url || null
}

// Format user for API response
export function formatUserForAPI(user: User) {
  return {
    id: user.id,
    email: user.email,
    display_name: getUserDisplayName(user),
    avatar_url: getUserAvatarUrl(user),
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    is_admin: isAdmin(user)
  }
}

// Session utilities
export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false
  
  const now = Date.now() / 1000
  return session.expires_at > now
}

export function getSessionTimeRemaining(session: AuthSession): number {
  const now = Date.now() / 1000
  return Math.max(0, session.expires_at - now)
}

export function formatSessionTimeRemaining(session: AuthSession): string {
  const seconds = getSessionTimeRemaining(session)
  
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`
  } else {
    return `${Math.floor(seconds / 3600)}h`
  }
}

// Password utilities
export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
}

export function validatePasswordRequirements(
  password: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`)
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (requirements.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function generatePasswordStrengthScore(password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length scoring
  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 1
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security')

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')

  if (/\d/.test(password)) score += 1
  else feedback.push('Add numbers')

  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push('Add special characters')

  // Complexity bonus
  if (password.length >= 16 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password)) {
    score += 1
  }

  let level: 'weak' | 'fair' | 'good' | 'strong'
  if (score <= 2) level = 'weak'
  else if (score <= 4) level = 'fair'
  else if (score <= 6) level = 'good'
  else level = 'strong'

  return { score, level, feedback }
}

// Email utilities
export function isValidEmailDomain(email: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true
  
  const domain = email.split('@')[1]?.toLowerCase()
  return allowedDomains.some(allowed => domain === allowed.toLowerCase())
}

export function isDisposableEmail(email: string): boolean {
  // List of common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return disposableDomains.includes(domain)
}

// Rate limiting utilities
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime
    }
  }

  existing.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime
  }
}

// Security utilities
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

export function hashString(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return hash.toString()
}

// Audit logging utilities
export interface AuditLogEntry {
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export function createAuditLogEntry(
  user: User,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  request?: {
    ip?: string
    userAgent?: string
  }
): AuditLogEntry {
  return {
    userId: user.id,
    action,
    resource,
    resourceId,
    metadata,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
    timestamp: new Date().toISOString()
  }
}

// Error handling utilities
export function handleAuthError(error: any): never {
  if (error?.message?.includes('Invalid login credentials')) {
    throw createError.unauthorized('Invalid email or password')
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    throw createError.unauthorized('Please check your email and click the confirmation link')
  }
  
  if (error?.message?.includes('Password should be at least')) {
    throw createError.validation([{
      field: 'password',
      message: error.message,
      code: 'PASSWORD_TOO_SHORT',
      value: ''
    }])
  }
  
  if (error?.message?.includes('Unable to validate email address')) {
    throw createError.validation([{
      field: 'email',
      message: 'Invalid email address format',
      code: 'INVALID_EMAIL',
      value: ''
    }])
  }
  
  // Generic auth error
  throw createError.unauthorized(error?.message || 'Authentication failed')
}