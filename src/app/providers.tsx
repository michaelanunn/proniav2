"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { PracticeProvider } from "@/contexts/PracticeContext";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
// import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/AuthGuard";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          {/* ThemeProvider removed (file missing) */}
          <PracticeProvider>
            <SpotifyProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthGuard>
                  {children}
                </AuthGuard>
              </TooltipProvider>
            </SpotifyProvider>
          </PracticeProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

