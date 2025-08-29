'use client';

import {
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  VideoIcon,
} from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth/context';
import Image from 'next/image';
import Link from 'next/link';

const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'My VODs',
    url: '/dashboard/my-vods',
    icon: VideoIcon,
  },
  {
    title: 'Search',
    url: '/dashboard/search',
    icon: SearchIcon,
  },
  {
    title: 'Watchlist',
    url: '/dashboard/watchlist',
    icon: StarIcon,
  },
];

const navSecondary = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: SettingsIcon,
  },
  {
    title: 'Get Help',
    url: '/dashboard/help',
    icon: HelpCircleIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-600 group-hover:ring-white transition-all duration-200">
                  <Image
                    src="/assets/images/timeline-target-logo.svg"
                    alt="Timeline Target Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold">Timeline Target</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.email || 'Anonymous',
            email: user?.email || 'No email',
            avatar: '',
          }}
          loading={loading}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
