import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { AuthUser, AuthSession } from '@/types/api'
import { createError } from '@/types/errors'
import { User } from '@supabase/supabase-js'

export class AuthService {
  
  // Server-side authentication methods
  static async getServerUser(): Promise<User | null> {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting server user:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Server auth error:', error)
      return null
    }
  }

  static async requireServerUser(): Promise<User> {
    const user = await this.getServerUser()
    if (!user) {
      throw createError.unauthorized('Authentication required')
    }
    return user
  }

  static async getServerSession(): Promise<AuthSession | null> {
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
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
    } catch (error) {
      console.error('Error getting server session:', error)
      return null
    }
  }

  // Client-side authentication methods
  static getBrowserClient() {
    return createBrowserClient()
  }

  static async signUp(email: string, password: string) {
    const supabase = this.getBrowserClient()
    
    const { data, error } = await supabase.auth.signUp({
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
    const supabase = this.getBrowserClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const supabase = this.getBrowserClient()
    
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
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw createError.internalServerError('Failed to sign out')
      }
    } catch (error) {
      // Even if cleanup fails, try to sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw createError.internalServerError('Failed to sign out')
      }
      throw error
    }
  }

  static async resetPassword(email: string) {
    const supabase = this.getBrowserClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
    const supabase = this.getBrowserClient()
    
    const { error } = await supabase.auth.updateUser({
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
    const supabase = this.getBrowserClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  }

  static async getCurrentSession(): Promise<AuthSession | null> {
    const supabase = this.getBrowserClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
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

  // JWT token validation (server-side)
  static async validateToken(token: string): Promise<User | null> {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return null
      }
      
      return user
    } catch (error) {
      console.error('Token validation error:', error)
      return null
    }
  }

  // Admin operations (using service role)
  static async adminGetUser(userId: string): Promise<User | null> {
    try {
      const adminClient = createAdminClient()
      const { data: { user }, error } = await adminClient.auth.admin.getUserById(userId)
      
      if (error || !user) {
        return null
      }
      
      return user
    } catch (error) {
      console.error('Admin get user error:', error)
      return null
    }
  }

  static async adminDeleteUser(userId: string): Promise<boolean> {
    try {
      const adminClient = createAdminClient()
      const { error } = await adminClient.auth.admin.deleteUser(userId)
      
      if (error) {
        console.error('Admin delete user error:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Admin delete user error:', error)
      return false
    }
  }

  static async adminUpdateUser(userId: string, updates: {
    email?: string
    password?: string
    email_confirm?: boolean
  }): Promise<User | null> {
    try {
      const adminClient = createAdminClient()
      const { data: { user }, error } = await adminClient.auth.admin.updateUserById(userId, updates)
      
      if (error || !user) {
        console.error('Admin update user error:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Admin update user error:', error)
      return null
    }
  }

  // Utility methods
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  static getPasswordStrength(password: string): {
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Password should be at least 8 characters long')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Password should contain lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Password should contain uppercase letters')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Password should contain numbers')
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1
    } else {
      feedback.push('Password should contain special characters')
    }

    return { score, feedback }
  }

  // Session management
  static async refreshSession(): Promise<AuthSession | null> {
    const supabase = this.getBrowserClient()
    
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
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
}