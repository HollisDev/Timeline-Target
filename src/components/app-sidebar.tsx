"use client"

import {
    BarChart3,
    Home,
    Search,
    Upload,
    User,
    Video
} from "lucide-react"
import Link from "next/link"
import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Search Videos",
    url: "/search",
    icon: Search,
  },
  {
    title: "Upload Video",
    url: "/dashboard",
    icon: Upload,
  },
  {
    title: "My Videos",
    url: "/dashboard",
    icon: Video,
  },
  {
    title: "Analytics",
    url: "/dashboard",
    icon: BarChart3,
  },
]

export function AppSidebar({ variant = "sidebar", ...props }: React.ComponentProps<typeof Sidebar> & { variant?: "sidebar" | "floating" | "inset" }) {
  return (
    <Sidebar variant={variant} {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src="/assets/images/timeline-target-logo.svg"
              alt="Target Timeline"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Target Timeline
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Video Search Platform
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "transition-colors duration-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              User Profile
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Settings & Account
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
