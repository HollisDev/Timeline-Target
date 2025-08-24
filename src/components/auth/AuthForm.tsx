'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { useAuthForm, useEmailValidation, usePasswordValidation } from '@/lib/auth/hooks'
import { useToast } from '@/lib/toast/context'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
  onSuccess?: () => void
  onForgotPassword?: () => void
}

export function AuthForm({ mode, onModeChange, onSuccess, onForgotPassword }: AuthFormProps) {
  const { loading, handleSignIn, handleSignUp } = useAuthForm()
  const { addToast } = useToast()
  const { email, setEmail, isValid: isEmailValid, error: emailError } = useEmailValidation()
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    strength,
    passwordsMatch,
    canSubmit
  } = usePasswordValidation()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      addToast({ type: 'error', message: decodeURIComponent(errorParam) })
    }
  }, [searchParams, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailValid) {
      addToast({ type: 'error', message: emailError || 'Please enter a valid email address.' })
      return
    }

    if (mode === 'signup' && !canSubmit) {
      addToast({ type: 'error', message: 'Please ensure your password meets all requirements.' })
      return
    }

    if (mode === 'signin' && !password) {
      addToast({ type: 'error', message: 'Password is required.' })
      return
    }

    const success = mode === 'signin'
      ? await handleSignIn(email, password)
      : await handleSignUp(email, password)

    if (success) {
      onSuccess?.()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-text-secondary mt-2">
          {mode === 'signin'
            ? 'Welcome back! Please sign in to your account.'
            : 'Get started with your VOD Search Engine account.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="h-10"
        />
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}

        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="h-10"
        />

        {mode === 'signup' && (
          <>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="h-10"
            />
            <PasswordStrengthIndicator strength={strength} />
            {!passwordsMatch && confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match.</p>
            )}
          </>
        )}

        <Button
          type="submit"
          disabled={loading || (mode === 'signup' && !canSubmit)}
          className="w-full h-10"
        >
          {loading ? <LoadingSpinner /> : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
        {mode === 'signin' && onForgotPassword && (
          <button
            onClick={onForgotPassword}
            className="ml-4 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  )
}