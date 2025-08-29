'use client'

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="-ml-1 h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-white">VOD Workshop</h1>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col bg-zinc-950 min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
