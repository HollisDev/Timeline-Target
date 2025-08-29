'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { GuestRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signup')

  const handleSuccess = () => {
    // Redirect to onboarding or dashboard after successful signup
    router.push('/onboarding')
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
      case 'signup': return 'Join thousands of users discovering amazing content every day.'
      case 'reset': return 'Enter your email to receive a password reset link.'
    }
  }

  return (
    <GuestRoute>
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#5E6AD2] to-[#9B68E8] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Timeline Target</span>
            </Link>
          </div>

          {/* Page Title */}
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-extrabold text-white">
              {getPageTitle()}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {getPageDescription()}
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            {mode === 'reset' ? (
              <PasswordResetForm
                onBack={() => setMode('signin')}
              />
            ) : (
              <AuthForm
                mode={mode as 'signin' | 'signup'}
                onSuccess={handleSuccess}
                onModeChange={setMode}
              />
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-sm text-zinc-400 space-x-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-zinc-300 transition-colors">
              Help
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-400">
                    Development Mode
                  </h3>
                  <div className="mt-2 text-sm text-yellow-300">
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