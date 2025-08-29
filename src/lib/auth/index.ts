// Authentication module exports

// Core service
export { AuthService } from './service';

// Middleware and server utilities
export {
  addCorsHeaders,
  addSecurityHeaders,
  checkRateLimit,
  createAuthErrorResponse,
  createAuthResponse,
  createAuthenticatedRequest,
  extractTokenFromRequest,
  getServerAuth,
  requireServerAuth,
  validateSession,
  withAuth,
} from './middleware';

// Client-side context and hooks
export {
  AuthProvider,
  useAuth,
  useAuthLoading,
  useIsAuthenticated,
  useRequireAuth,
  useSession,
  useUser,
} from './context';

export {
  useAuthForm,
  useRequireAuth as useRequireAuthHook,
  useRedirectIfAuthenticated,
  usePasswordValidation,
  useEmailValidation,
} from './hooks';

// Utilities
export {
  DEFAULT_PASSWORD_REQUIREMENTS,
  canAccessResource,
  checkRateLimit as checkAuthRateLimit,
  createAuditLogEntry,
  formatSessionTimeRemaining,
  formatUserForAPI,
  generatePasswordStrengthScore,
  generateSecureToken,
  getSessionTimeRemaining,
  getUserAvatarUrl,
  getUserDisplayName,
  handleAuthError,
  hasPermission,
  hashString,
  isAdmin,
  isDisposableEmail,
  isSessionValid,
  isValidEmailDomain,
  sanitizeUserInput,
  validatePasswordRequirements,
} from './utils';

// Types
export type {
  AuditLogEntry,
  PasswordRequirements,
  RateLimitConfig,
} from './utils';

export type { AuthenticatedRequest } from './middleware';

// Re-export commonly used types from other modules
export type { AuthSession, AuthUser } from '@/types/api';

export type { Session, User } from '@supabase/supabase-js';
