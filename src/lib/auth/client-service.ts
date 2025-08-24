import { createClient } from '@/lib/supabase/client'
import { AuthSession } from '@/types/api'
import { createError } from '@/types/errors'
import { User } from '@supabase/supabase-js'

export class ClientAuthService {
  private static supabase = createClient()

  static async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw createError.validation([{
        field: 'auth',
        message: error.message,
        code: 'SIGNUP_ERROR',
        value: email
      }])
    }

    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw createError.validation([{
        field: 'auth',
        message: error.message,
        code: 'SIGNIN_ERROR',
        value: email
      }])
    }

    return data
  }

  static async signOut() {
    try {
      // Clear local storage items
      localStorage.removeItem('user-preferences')
      localStorage.removeItem('search-history')
      localStorage.removeItem('watchlist-cache')
      localStorage.removeItem('recent-searches')
      localStorage.removeItem('vod-cache')
      
      // Clear session storage
      sessionStorage.clear()
      
      // Sign out from Supabase
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        throw createError.internalServerError('Failed to sign out')
      }
    } catch (error) {
      // Even if cleanup fails, try to sign out from Supabase
      const { error: signOutError } = await this.supabase.auth.signOut()
      if (signOutError) {
        throw createError.internalServerError('Failed to sign out')
      }
      throw error
    }
  }

  static async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      throw createError.validation([{
        field: 'email',
        message: error.message,
        code: 'RESET_PASSWORD_ERROR',
        value: email
      }])
    }
  }

  static async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    })

    if (error) {
      throw createError.validation([{
        field: 'password',
        message: error.message,
        code: 'UPDATE_PASSWORD_ERROR',
        value: ''
      }])
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  }

  static async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token!,
      expires_at: session.expires_at!
    }
  }

  static async refreshSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.supabase.auth.refreshSession()
    
    if (error || !session) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token!,
      expires_at: session.expires_at!
    }
  }

  static isSessionExpired(session: AuthSession): boolean {
    return Date.now() / 1000 > session.expires_at
  }

  static getTimeUntilExpiry(session: AuthSession): number {
    return Math.max(0, session.expires_at - Date.now() / 1000)
  }

  static getBrowserClient() {
    return this.supabase
  }
}