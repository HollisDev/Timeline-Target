'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthForm, useEmailValidation } from '@/lib/auth/hooks'
import { CheckCircle } from 'lucide-react'
import React, { useState } from 'react'

interface PasswordResetFormProps {
  onBack: () => void
}

export function PasswordResetForm({ onBack }: PasswordResetFormProps) {
  const { email, setEmail, isValid: isEmailValid, error: emailError } = useEmailValidation()
  const { loading, handleResetPassword } = useAuthForm()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailValid) return

    const resetSuccessful = await handleResetPassword(email)
    if (resetSuccessful) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Check Your Email</h2>
        <p className="text-text-secondary mb-6">
          We've sent a password reset link to <strong className="text-text-primary">{email}</strong>
        </p>
        <p className="text-sm text-text-secondary mb-6">
          If you don't see the email, check your spam folder.
        </p>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Reset Password</h1>
        <p className="text-text-secondary mt-2">
          Enter your email address and we'll send you a link to reset your password.
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

        <Button
          type="submit"
          disabled={loading || !isEmailValid}
          className="w-full h-10"
        >
          {loading ? <LoadingSpinner /> : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  )
}