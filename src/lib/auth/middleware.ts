import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './service'
import { createError } from '@/types/errors'
import { User } from '@supabase/supabase-js'

// Authentication middleware for API routes
export async function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: User, ...args: T) => Promise<NextResponse> | NextResponse,
  options: {
    requireAuth?: boolean
    adminOnly?: boolean
  } = {}
) {
  const { requireAuth = true, adminOnly = false } = options

  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token && requireAuth) {
        return NextResponse.json(
          createError.unauthorized('Authorization token required').toJSON(),
          { status: 401 }
        )
      }

      let user: User | null = null

      if (token) {
        user = await AuthService.validateToken(token)
        
        if (!user && requireAuth) {
          return NextResponse.json(
            createError.unauthorized('Invalid or expired token').toJSON(),
            { status: 401 }
          )
        }
      }

      // Check admin permissions if required
      if (adminOnly && user) {
        // In a real app, you'd check user roles/permissions here
        // For now, we'll use a simple check (you can extend this)
        const isAdmin = user.email?.endsWith('@admin.com') || false
        
        if (!isAdmin) {
          return NextResponse.json(
            createError.forbidden('Admin access required').toJSON(),
            { status: 403 }
          )
        }
      }

      // Call the handler with the authenticated user
      return await handler(request, user!, ...args)
    } catch (error) {
      console.error('Auth middleware error:', error)
      
      if (error instanceof Error) {
        return NextResponse.json(
          createError.internalServerError(error.message).toJSON(),
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        createError.internalServerError('Authentication error').toJSON(),
        { status: 500 }
      )
    }
  }
}

// Server-side authentication check for pages
export async function requireServerAuth(): Promise<User> {
  const user = await AuthService.getServerUser()
  
  if (!user) {
    throw createError.unauthorized('Authentication required')
  }
  
  return user
}

// Optional server-side authentication check
export async function getServerAuth(): Promise<User | null> {
  return await AuthService.getServerUser()
}

// JWT token extraction utilities
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  // Try cookie as fallback
  const tokenCookie = request.cookies.get('sb-access-token')
  if (tokenCookie) {
    return tokenCookie.value
  }

  return null
}

// Request context utilities
export interface AuthenticatedRequest extends NextRequest {
  user: User
  userId: string
}

export function createAuthenticatedRequest(request: NextRequest, user: User): AuthenticatedRequest {
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user
  authenticatedRequest.userId = user.id
  return authenticatedRequest
}

// Rate limiting by user
const userRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  userId: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userLimit = userRequestCounts.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    userRequestCounts.set(userId, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }

  if (userLimit.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userLimit.resetTime
    }
  }

  userLimit.count++
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetTime: userLimit.resetTime
  }
}

// Authentication response helpers
export function createAuthResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function createAuthErrorResponse(error: any, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: typeof error === 'string' ? error : error.message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// Session validation utilities
export async function validateSession(request: NextRequest): Promise<{
  valid: boolean
  user?: User
  error?: string
}> {
  try {
    const token = extractTokenFromRequest(request)
    
    if (!token) {
      return { valid: false, error: 'No authentication token provided' }
    }

    const user = await AuthService.validateToken(token)
    
    if (!user) {
      return { valid: false, error: 'Invalid or expired token' }
    }

    return { valid: true, user }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Session validation failed' 
    }
  }
}

// CORS headers for authenticated requests
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}