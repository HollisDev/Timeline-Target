'use client'

import { Button, ButtonProps } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface LogoutButtonProps extends ButtonProps {
  redirectTo?: string
  showConfirmation?: boolean
}

export function LogoutButton({
  variant = 'ghost',
  size = 'sm',
  className,
  children = 'Sign Out',
  redirectTo = '/',
  showConfirmation = false,
  ...props
}: LogoutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (showConfirmation) {
      const confirmed = window.confirm('Are you sure you want to sign out?')
      if (!confirmed) return
    }

    try {
      setIsLoading(true)
      await signOut()

      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()

        // Clear sessionStorage
        sessionStorage.clear()

        // Clear any cached API responses
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        }
      }

      // Redirect to specified page
      router.push(redirectTo)
      router.refresh() // Force a full page refresh to clear any remaining state
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, try to redirect
      router.push(redirectTo)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? <LoadingSpinner className="mr-2" /> : null}
      {children}
    </Button>
  )
}

// Dropdown menu item version
export function LogoutMenuItem({
  className,
  onClick,
  children = 'Sign Out'
}: {
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await signOut()

      // Clear cached data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      onClick?.()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center ${className}`}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="xs" className="mr-2" />
          Signing out...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {children}
        </>
      )}
    </button>
  )
}