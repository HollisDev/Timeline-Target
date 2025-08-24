'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth/context'
import { useToast } from '@/lib/toast/context'
import { isValidUrl } from '@/lib/utils'
import { VOD } from '@/types/database'
import React, { useState } from 'react'

interface VODSubmissionFormProps {
  onSuccess?: (vod: VOD) => void
  className?: string
}

interface SubmissionResponse {
  success: boolean
  vod_id?: string
  message?: string
  error?: string
}

export function VODSubmissionForm({
  onSuccess,
  className = '',
}: VODSubmissionFormProps) {
  const { user, session } = useAuth()
  const { addToast } = useToast()
  const [vodUrl, setVodUrl] = useState('')
  const [title, setTitle] = useState('')
  const [durationHours, setDurationHours] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!vodUrl.trim()) {
      return 'Please enter a video URL'
    }
    if (!isValidUrl(vodUrl)) {
      return 'Please enter a valid URL'
    }
    if (!title.trim()) {
      return 'Please enter a title for the video'
    }
    if (durationHours < 1 || durationHours > 8) {
      return 'Duration must be between 1 and 8 hours'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !session) {
      addToast({ type: 'error', message: 'You must be logged in to submit a video' })
      return
    }

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      addToast({ type: 'error', message: validationError })
      return
    }

    setLoading(true)

    try {
      // Call the n8n webhook endpoint
      const webhookUrl =
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
        'http://localhost:5678/webhook/process-vod'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          vod_url: vodUrl.trim(),
          title: title.trim(),
          duration_hours: durationHours,
          user_id: user.id,
          jwt: session.access_token,
        }),
      })

      const result: SubmissionResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred')
      }

      addToast({
        type: 'success',
        message: result.message || 'VOD submitted successfully!',
      })

      if (onSuccess && result.vod_id) {
        // Create a temporary VOD object for optimistic update
        const newVod: VOD = {
          id: parseInt(result.vod_id, 10),
          created_at: new Date().toISOString(),
          user_id: user.id,
          vod_url: vodUrl.trim(),
          title: title.trim(),
          status: 'pending',
          duration_hours: durationHours,
          updated_at: new Date().toISOString(),
        }
        onSuccess(newVod)
      }

      // Reset form
      setVodUrl('')
      setTitle('')
      setDurationHours(1)
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to submit VOD. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-background-subtle p-4 rounded-lg ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter VOD URL"
          value={vodUrl}
          onChange={(e) => setVodUrl(e.target.value)}
          disabled={loading}
        />
        <Input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <Input
          type="number"
          placeholder="Estimated duration in hours"
          value={durationHours}
          onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
          min="1"
          max="8"
          disabled={loading}
        />
        <Button
          type="submit"
          className="w-full bg-gradient-to-br from-[#5E6AD2] to-[#9B68E8] text-white"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit VOD'}
        </Button>
      </form>
    </div>
  )
}