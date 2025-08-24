'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchResult, VOD } from '@/types/database'
import React from 'react'

interface SearchResultWithVod extends SearchResult {
  vod?: VOD
}

interface SearchResultsProps {
  results: SearchResultWithVod[]
  searchQuery: string
  onResultClick?: (result: SearchResultWithVod) => void
  className?: string
}

export function SearchResults({
  results,
  searchQuery,
  onResultClick,
  className = ''
}: SearchResultsProps) {
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
        <mark key={index} className="bg-yellow-200/50 text-white px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getContextSnippet = (content: string, query: string, maxLength: number = 200): string => {
    if (!query.trim()) return content.substring(0, maxLength)

    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const queryIndex = lowerContent.indexOf(lowerQuery)

    if (queryIndex === -1) {
      return content.substring(0, maxLength)
    }

    // Calculate start position to center the query
    const start = Math.max(0, queryIndex - Math.floor((maxLength - query.length) / 2))
    const end = Math.min(content.length, start + maxLength)

    let snippet = content.substring(start, end)

    // Add ellipsis if we're not at the beginning/end
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet = snippet + '...'

    return snippet
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No results found
        </h3>
        <p className="text-text-secondary">
          Try different keywords or search across all videos
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-text-primary">
          Search Results ({results.length})
        </h4>
        <div className="text-sm text-text-secondary">
          Sorted by relevance
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={`${result.vod_id}-${result.timestamp}-${result.id || index}`}
            className="p-4 rounded-lg bg-background-subtle hover:bg-white/5 cursor-pointer transition-colors"
            onClick={() => onResultClick?.(result)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant="secondary">Video {result.vod_id}</Badge>
                <Badge variant="secondary">
                  {formatTimestamp(result.timestamp)}
                </Badge>
                {result.rank && (
                  <Badge variant="default">
                    {Math.round(result.rank * 100)}% match
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResultClick?.(result)
                }}
              >
                Jump to
              </Button>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed mb-2">
              {highlightSearchTerm(
                getContextSnippet(result.content, searchQuery, 300),
                searchQuery
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>
                Found in transcript at {formatTimestamp(result.timestamp)}
              </span>
              <span>{new Date(result.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Compact search results for smaller spaces
export function CompactSearchResults({
  results,
  searchQuery,
  onResultClick,
  className = ''
}: SearchResultsProps) {
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const highlightSearchTerm = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200/50 text-white px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-text-secondary">No results found</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {results.slice(0, 5).map((result, index) => (
        <div
          key={`${result.vod_id}-${result.timestamp}-${result.id || index}`}
          className="p-3 bg-background-subtle rounded-md hover:bg-white/5 cursor-pointer transition-colors"
          onClick={() => onResultClick?.(result)}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Video {result.vod_id}</Badge>
              <span className="text-xs text-text-tertiary">
                {formatTimestamp(result.timestamp)}
              </span>
            </div>
            {result.rank && (
              <span className="text-xs text-text-tertiary">
                {Math.round(result.rank * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary line-clamp-2">
            {highlightSearchTerm(
              result.content.substring(0, 100) + (result.content.length > 100 ? '...' : ''),
              searchQuery
            )}
          </p>
        </div>
      ))}
      {results.length > 5 && (
        <div className="text-center mt-2">
          <Button variant="outline" size="sm">
            View {results.length - 5} more results
          </Button>
        </div>
      )}
    </div>
  )
}