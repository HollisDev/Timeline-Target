'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../toast/context'
import { useAuth } from './context'
import { getPasswordStrength, isValidEmail, isValidPassword } from './validation'

// Hook for handling authentication forms
export function useAuthForm() {
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, resetPassword } = useAuth()
  const { addToast } = useToast()

  const handleReq = async (
    action: 'signin' | 'signup' | 'reset',
    email: string,
    password?: string
  ) => {
    setLoading(true)
    try {
      if (action === 'signin' && password) {
        await signIn(email, password)
        addToast({ type: 'success', message: 'Signed in successfully!' })
      } else if (action === 'signup' && password) {
        await signUp(email, password)
        addToast({ type: 'success', message: 'Account created! Please check your email to verify.' })
      } else if (action === 'reset') {
        await resetPassword(email)
        addToast({ type: 'success', message: 'Password reset email sent!' })
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      addToast({ type: 'error', message: errorMessage })
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = (email: string, password: string) => handleReq('signin', email, password)
  const handleSignUp = (email: string, password: string) => handleReq('signup', email, password)
  const handleResetPassword = (email: string) => handleReq('reset', email)

  return { loading, handleSignIn, handleSignUp, handleResetPassword }
}

// Hook for protected routes
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}

// Hook for redirecting authenticated users
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}

// Hook for password validation
export function usePasswordValidation() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] })
  const [isValid, setIsValid] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  useEffect(() => {
    const strengthResult = getPasswordStrength(password)
    setStrength(strengthResult)
    setIsValid(isValidPassword(password))
  }, [password])

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const canSubmit = isValid && passwordsMatch && confirmPassword !== ''

  const reset = useCallback(() => {
    setPassword('')
    setConfirmPassword('')
    setStrength({ score: 0, feedback: [] })
    setIsValid(false)
    setPasswordsMatch(true)
  }, [])

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    strength,
    isValid,
    passwordsMatch,
    canSubmit,
    reset
  }
}

// Hook for email validation
export function useEmailValidation() {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (email === '') {
      setIsValid(false)
      setError(null)
      return
    }

    const valid = isValidEmail(email)
    setIsValid(valid)
    setError(valid ? null : 'Please enter a valid email address')
  }, [email])

  const reset = useCallback(() => {
    setEmail('')
    setIsValid(false)
    setError(null)
  }, [])

  return {
    email,
    setEmail,
    isValid,
    error,
    reset
  }
}