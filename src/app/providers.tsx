"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/lib/toast/context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}