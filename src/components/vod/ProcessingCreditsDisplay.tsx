'use client'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'

interface ProcessingCreditsDisplayProps {
  className?: string
  showLabel?: boolean
}

export function ProcessingCreditsDisplay({
  className = '',
  showLabel = true
}: ProcessingCreditsDisplayProps) {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('processing_credits')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setCredits(data?.processing_credits ?? 0)
    } catch (err: any) {
      console.error('Error fetching processing credits:', err)
      setError('Failed to load credits')
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        {showLabel && <span className="text-sm text-gray-600">Loading credits...</span>}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const creditColor = credits === null ? 'text-text-secondary' :
    credits === 0 ? 'text-destructive' :
      credits <= 2 ? 'text-yellow-500' :
        'text-green-500'

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-text-secondary">Processing Credits:</span>
      )}
      <span className={`font-semibold ${creditColor}`}>
        {credits ?? 0}
      </span>
      {credits !== null && credits <= 2 && credits > 0 && (
        <span className="text-xs text-yellow-500">
          (Low)
        </span>
      )}
    </div>
  )
}

// Compact version for navigation bars
export function CompactCreditsDisplay({ className = '' }: { className?: string }) {
  return (
    <ProcessingCreditsDisplay
      className={className}
      showLabel={false}
    />
  )
}