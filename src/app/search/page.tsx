'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SearchInterface } from '@/components/search/SearchInterface'
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { VODList } from '@/components/vod/VODList'
import { VOD } from '@/types/database'
import React, { useState } from 'react'

export default function SearchPage() {
  const [selectedVodId, setSelectedVodId] = useState<number | undefined>()

  const handleVodSelect = (vod: VOD) => {
    setSelectedVodId(vod.id)
  }

  const handleVodIdChange = (vodId: number) => {
    setSelectedVodId(vodId || undefined)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold mb-6">Search Videos</h1>
                <div className="space-y-6">
                  {/* Search Interface */}
                  <SearchInterface
                    selectedVodId={selectedVodId}
                    onVodSelect={handleVodIdChange}
                  />

                  {/* VOD List for selection */}
                  <div className="grid lg:grid-cols-1 gap-6">
                    <VODList
                      onVODSelect={handleVodSelect}
                      className="lg:max-h-96 lg:overflow-y-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}