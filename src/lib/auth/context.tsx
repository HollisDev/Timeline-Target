'use client'

import { AuthSession } from '@/types/api'
import { User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { ClientAuthService } from './client-service'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentSession = await ClientAuthService.getCurrentSession()
        const currentUser = await ClientAuthService.getCurrentUser()

        setSession(currentSession)
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const supabase = ClientAuthService.getBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('Auth state changed:', event)

        if (supabaseSession) {
          const authSession: AuthSession = {
            user: {
              id: supabaseSession.user.id,
              email: supabaseSession.user.email!,
              created_at: supabaseSession.user.created_at,
              updated_at: supabaseSession.user.updated_at || supabaseSession.user.created_at
            },
            access_token: supabaseSession.access_token,
            refresh_token: supabaseSession.refresh_token!,
            expires_at: supabaseSession.expires_at!
          }

          setSession(authSession)
          setUser(supabaseSession.user)
        } else {
          setSession(null)
          setUser(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session) return

    const timeUntilExpiry = ClientAuthService.getTimeUntilExpiry(session)
    const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000) // Refresh 5 minutes before expiry

    const refreshTimer = setTimeout(async () => {
      try {
        const newSession = await ClientAuthService.refreshSession()
        if (newSession) {
          setSession(newSession)
        }
      } catch (error) {
        console.error('Auto refresh failed:', error)
      }
    }, refreshTime)

    return () => clearTimeout(refreshTimer)
  }, [session])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      await ClientAuthService.signUp(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await ClientAuthService.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await ClientAuthService.signOut()

      // Clear local state immediately
      setSession(null)
      setUser(null)

      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()

        // Clear any cached API responses
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        }
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      // Even if there's an error, clear the local state
      setSession(null)
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await ClientAuthService.resetPassword(email)
  }

  const updatePassword = async (password: string) => {
    await ClientAuthService.updatePassword(password)
  }

  const refreshSession = async () => {
    try {
      const newSession = await ClientAuthService.refreshSession()
      if (newSession) {
        setSession(newSession)
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      // If refresh fails, sign out the user
      await signOut()
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hooks for specific auth states
export function useUser(): User | null {
  const { user } = useAuth()
  return user
}

export function useSession(): AuthSession | null {
  const { session } = useAuth()
  return session
}

export function useAuthLoading(): boolean {
  const { loading } = useAuth()
  return loading
}

export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth()
  return !loading && !!user
}

export function useRequireAuth(): User {
  const { user, loading } = useAuth()

  if (loading) {
    throw new Error('Authentication is still loading')
  }

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}