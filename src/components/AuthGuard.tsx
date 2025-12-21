"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Pages that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/auth/callback", "/tos", "/privacy", "/forgot-password", "/reset-password"];

interface AuthGuardProps {
  children: React.ReactNode;
}

// Check if user has completed onboarding (has required profile fields)
const isOnboardingComplete = (profile: any): boolean => {
  if (!profile) return false;
  
  return !!(
    profile.name?.trim() &&
    profile.username?.trim() &&
    Array.isArray(profile.instruments) && profile.instruments.length > 0 &&
    profile.experience_level?.trim()
  );
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Track if user has ever passed onboarding check to prevent false redirects during updates
  const hasPassedOnboarding = useRef(false);

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  const isOnOnboarding = pathname === "/onboarding";
  
  // Update ref when onboarding is complete
  if (isOnboardingComplete(profile)) {
    hasPassedOnboarding.current = true;
  }

  useEffect(() => {
    if (isLoading) return;
    
    // Not logged in and trying to access protected path
    if (!user && !isPublicPath) {
      router.push("/onboarding");
      return;
    }
    
    // Logged in but onboarding not complete - redirect to onboarding
    // BUT only if we haven't previously passed onboarding (prevents false redirects during profile updates)
    if (user && !isOnOnboarding && !isOnboardingComplete(profile) && !hasPassedOnboarding.current) {
      router.push("/onboarding");
      return;
    }
  }, [user, profile, isLoading, isPublicPath, isOnOnboarding, router]);

  // For public paths, always render immediately - no loading spinner
  if (isPublicPath) {
    return <>{children}</>;
  }

  // For protected paths, show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not logged in and on protected path, show loader while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If onboarding not complete AND we haven't passed before, show loader while redirecting
  if (!isOnboardingComplete(profile) && !hasPassedOnboarding.current) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
