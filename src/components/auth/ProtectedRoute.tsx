'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { LoadingSpinner, PageSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireAuth = true,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated but route requires auth
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // User is authenticated but route is for unauthenticated users
        router.push('/dashboard')
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return fallback || <PageSpinner />
  }

  // If auth is required but user is not authenticated, show nothing (will redirect)
  if (requireAuth && !user) {
    return null
  }

  // If auth is not required but user is authenticated, show nothing (will redirect)
  if (!requireAuth && user) {
    return null
  }

  // Render children if authentication state matches requirements
  return <>{children}</>
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for checking auth status in components
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo, router])

  return { user, loading, isAuthenticated: !!user }
}

// Component for routes that should only be accessible to unauthenticated users
export function GuestRoute({ children, redirectTo = '/dashboard' }: {
  children: React.ReactNode
  redirectTo?: string
}) {
  return (
    <ProtectedRoute requireAuth={false} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}

// Loading boundary for auth-dependent content
export function AuthLoadingBoundary({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}