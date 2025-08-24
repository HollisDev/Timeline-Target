import { AuthSession } from '@/types/api'

// Session storage keys
const SESSION_KEY = 'vod-search-session'
const USER_PREFERENCES_KEY = 'user-preferences'
const SEARCH_HISTORY_KEY = 'search-history'
const WATCHLIST_CACHE_KEY = 'watchlist-cache'

export class SessionManager {
  // Session persistence
  static saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  static getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData) as AuthSession
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSession()
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  static isSessionExpired(session: AuthSession): boolean {
    return Date.now() / 1000 > session.expires_at
  }

  static getTimeUntilExpiry(session: AuthSession): number {
    return Math.max(0, session.expires_at - Date.now() / 1000)
  }

  // User preferences
  static saveUserPreferences(preferences: Record<string, any>): void {
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  static getUserPreferences(): Record<string, any> {
    try {
      const preferencesData = localStorage.getItem(USER_PREFERENCES_KEY)
      return preferencesData ? JSON.parse(preferencesData) : {}
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return {}
    }
  }

  static clearUserPreferences(): void {
    try {
      localStorage.removeItem(USER_PREFERENCES_KEY)
    } catch (error) {
      console.error('Failed to clear user preferences:', error)
    }
  }

  // Search history
  static saveSearchHistory(searches: string[]): void {
    try {
      // Keep only the last 50 searches
      const limitedSearches = searches.slice(-50)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limitedSearches))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  static getSearchHistory(): string[] {
    try {
      const historyData = localStorage.getItem(SEARCH_HISTORY_KEY)
      return historyData ? JSON.parse(historyData) : []
    } catch (error) {
      console.error('Failed to get search history:', error)
      return []
    }
  }

  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  // Watchlist cache
  static saveWatchlistCache(watchlist: any[]): void {
    try {
      localStorage.setItem(WATCHLIST_CACHE_KEY, JSON.stringify(watchlist))
    } catch (error) {
      console.error('Failed to save watchlist cache:', error)
    }
  }

  static getWatchlistCache(): any[] {
    try {
      const cacheData = localStorage.getItem(WATCHLIST_CACHE_KEY)
      return cacheData ? JSON.parse(cacheData) : []
    } catch (error) {
      console.error('Failed to get watchlist cache:', error)
      return []
    }
  }

  static clearWatchlistCache(): void {
    try {
      localStorage.removeItem(WATCHLIST_CACHE_KEY)
    } catch (error) {
      console.error('Failed to clear watchlist cache:', error)
    }
  }

  // Clear all data
  static clearAllData(): void {
    this.clearSession()
    this.clearUserPreferences()
    this.clearSearchHistory()
    this.clearWatchlistCache()
  }
}
  