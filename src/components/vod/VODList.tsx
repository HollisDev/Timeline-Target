'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast/context'
import { formatRelativeTime, truncate } from '@/lib/utils'
import { VOD } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

interface VODListProps {
  className?: string
  onVODSelect?: (vod: VOD) => void
  refreshTrigger?: number // Used to trigger refresh from parent
  optimisticVods?: VOD[]
}

export function VODList({
  className = '',
  onVODSelect,
  refreshTrigger,
  optimisticVods = [],
}: VODListProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [vods, setVods] = useState<VOD[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVODs = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setVods([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('vods')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setVods(data || [])
        if (isRefresh) {
          addToast({ type: 'success', message: 'Video list updated!' })
        }
      } catch (err: any) {
        console.error('Error fetching VODs:', err)
        addToast({
          type: 'error',
          message: 'Failed to load videos. Please try again.',
        })
      } finally {
        setLoading(false)
      }
    },
    [user, addToast]
  )

  useEffect(() => {
    fetchVODs()
  }, [fetchVODs, refreshTrigger])

  useEffect(() => {
    if (optimisticVods.length > 0) {
      setVods((currentVods) => {
        const newVods = optimisticVods.filter(
          (optimisticVod) =>
            !currentVods.some(
              (existingVod) => existingVod.id === optimisticVod.id
            )
        )
        return [...newVods, ...currentVods]
      })
    }
  }, [optimisticVods])

  const handleRefresh = () => {
    fetchVODs(true)
  }

  const handleVODClick = (vod: VOD) => {
    if (onVODSelect) {
      onVODSelect(vod)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    )
  }

  if (vods.length === 0) {
    return (
      <div className="text-center py-10 bg-background-subtle rounded-lg">
        <h3 className="text-lg font-medium text-text-primary">No VODs yet</h3>
        <p className="text-sm text-text-secondary mt-1">
          Submit a VOD to get started.
        </p>
      </div>
    )
  }

  const getBadgeVariant = (status: VOD['status']): 'default' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {vods.map((vod) => (
        <div
          key={vod.id}
          onClick={() => handleVODClick(vod)}
          className="p-3 rounded-md bg-background-subtle hover:bg-white/5 cursor-pointer transition-colors"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-text-primary">
              {truncate(vod.title ?? 'Untitled', 50)}
            </h4>
            <Badge
              variant={getBadgeVariant(vod.status)}
              className="capitalize"
            >
              {vod.status}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {formatRelativeTime(new Date(vod.created_at))}
          </p>
        </div>
      ))}
      <Button
        onClick={handleRefresh}
        variant="outline"
        size="sm"
        className="w-full mt-4"
      >
        Refresh List
      </Button>
    </div>
  )
}