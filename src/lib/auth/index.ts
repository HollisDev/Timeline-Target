// Authentication module exports

// Core service
export { AuthService } from './service'

// Middleware and server utilities
export {
  withAuth,
  requireServerAuth,
  getServerAuth,
  extractTokenFromRequest,
  createAuthenticatedRequest,
  checkRateLimit,
  createAuthResponse,
  createAuthErrorResponse,
  validateSession,
  addCorsHeaders,
  addSecurityHeaders
} from './middleware'

// Client-side context and hooks
export {
  AuthProvider,
  useAuth,
  useUser,
  useSession,
  useAuthLoading,
  useIsAuthenticated,
  useRequireAuth
} from './context'

export {
  useAuthForm,
  useRequireAuth as useRequireAuthHook,
  useRedirectIfAuthenticated,
  usePasswordValidation,
  useSessionManagement,
  useUserProfile,
  useAuthPersistence,
  useAuthError,
  useEmailValidation
} from './hooks'

// Utilities
export {
  hasPermission,
  isAdmin,
  canAccessResource,
  getUserDisplayName,
  getUserAvatarUrl,
  formatUserForAPI,
  isSessionValid,
  getSessionTimeRemaining,
  formatSessionTimeRemaining,
  validatePasswordRequirements,
  generatePasswordStrengthScore,
  isValidEmailDomain,
  isDisposableEmail,
  checkRateLimit as checkAuthRateLimit,
  sanitizeUserInput,
  generateSecureToken,
  hashString,
  createAuditLogEntry,
  handleAuthError,
  DEFAULT_PASSWORD_REQUIREMENTS
} from './utils'

// Types
export type {
  PasswordRequirements,
  RateLimitConfig,
  AuditLogEntry
} from './utils'

export type { AuthenticatedRequest } from './middleware'

// Re-export commonly used types from other modules
export type {
  AuthUser,
  AuthSession
} from '@/types/api'

export type { User, Session } from '@supabase/supabase-js'