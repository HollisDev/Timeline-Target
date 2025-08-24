'use client'

import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast/context'
import { debounce, truncate } from '@/lib/utils'
import { SearchResult, VOD } from '@/types/database'
import { Search } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

interface SearchInterfaceProps {
  className?: string
  selectedVodId?: number
  onVodSelect?: (vodId: number) => void
}

interface SearchResultWithVod extends SearchResult {
  vod?: VOD
}

export function SearchInterface({ className = '', selectedVodId, onVodSelect }: SearchInterfaceProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [completedVods, setCompletedVods] = useState<VOD[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultWithVod[]>([])
  const [loading, setLoading] = useState(false)
  const [vodsLoading, setVodsLoading] = useState(true)
  const [searchTime, setSearchTime] = useState<number | null>(null)

  // Fetch completed VODs for the dropdown
  const fetchCompletedVods = useCallback(async () => {
    if (!user) {
      setCompletedVods([])
      setVodsLoading(false)
      return
    }

    try {
      setVodsLoading(true)
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('vods')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setCompletedVods(data || [])
    } catch (err: any) {
      console.error('Error fetching completed VODs:', err)
      addToast({ type: 'error', message: 'Failed to load completed videos. Please try refreshing the page.' })
    } finally {
      setVodsLoading(false)
    }
  }, [user, addToast])

  useEffect(() => {
    fetchCompletedVods()
  }, [fetchCompletedVods])

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string, vodId?: number) => {
      if (!query.trim() || !user) {
        setSearchResults([])
        setSearchTime(null)
        return
      }

      try {
        setLoading(true)
        const startTime = Date.now()

        // Call the Supabase Edge Function for search
        const supabase = createClient()
        const { data, error: searchError } = await supabase.functions.invoke('search-vods', {
          body: {
            query: query.trim(),
            vod_id: vodId || null,
            user_id: user.id
          }
        })

        if (searchError) {
          throw searchError
        }

        const endTime = Date.now()
        setSearchTime(endTime - startTime)
        setSearchResults(data?.results || [])

        if (!data?.results || data.results.length === 0) {
            addToast({ type: 'info', message: 'No results found for your query.'})
        }

      } catch (err: any) {
        console.error('Search error:', err)
        addToast({ type: 'error', message: err.message || 'Search failed. Please try again.' })
        setSearchResults([])
        setSearchTime(null)
      } finally {
        setLoading(false)
      }
    }, 300),
    [user, addToast]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    performSearch(query, selectedVodId)
  }

  const handleResultClick = (result: SearchResultWithVod) => {
    // In a real app, this would navigate to the video at the specific timestamp
    console.log('Navigate to video:', result.vod_id, 'at timestamp:', result.timestamp)
    addToast({ type: 'info', message: `Navigating to timestamp ${formatTimestamp(result.timestamp)}...`})
  }

  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  const highlightSearchTerm = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-[#9B68E8]/50 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8 bg-background-subtle rounded-lg">
        <p className="text-text-secondary">
          Please sign in to search your videos.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-background-subtle p-4 rounded-lg ${className}`}>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <Input
          type="text"
          placeholder="Search all videos..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="p-3 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-text-primary">
                  {truncate(result.vod?.title || 'Untitled VOD', 50)}
                </h4>
                <Badge variant="secondary">
                  {formatTimestamp(result.timestamp)}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {highlightSearchTerm(result.content, searchQuery)}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-text-primary">No results</h3>
          <p className="text-sm text-text-secondary mt-1">
            Try a different search term.
          </p>
        </div>
      )}
    </div>
  )
}