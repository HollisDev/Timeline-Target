'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { GuestRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')

  const handleSuccess = () => {
    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect') || '/dashboard'
    router.push(redirect)
  }

  const getPageTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In to Your Account'
      case 'signup': return 'Create Your Account'
      case 'reset': return 'Reset Your Password'
    }
  }

  const getPageDescription = () => {
    switch (mode) {
      case 'signin': return 'Welcome back! Please sign in to your account.'
      case 'signup': return 'Join us today and start discovering amazing content.'
      case 'reset': return 'Enter your email to receive a password reset link.'
    }
  }

  return (
    <GuestRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">VOD Search</span>
            </Link>
          </div>

          {/* Page Title */}
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {getPageTitle()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {getPageDescription()}
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <AuthForm
            mode={mode}
            onSuccess={handleSuccess}
            onModeChange={setMode}
          />
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600 space-x-4">
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-gray-900">
              Help
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Development Mode
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This is a demo environment. Use any email and password to test the authentication flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestRoute>
  )
}