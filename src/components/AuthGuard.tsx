"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Pages that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/auth/callback"];

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

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  const isOnOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (isLoading) return;
    
    // Not logged in and trying to access protected path
    if (!user && !isPublicPath) {
      router.push("/onboarding");
      return;
    }
    
    // Logged in but onboarding not complete - redirect to onboarding
    // (unless already on onboarding page)
    if (user && !isOnOnboarding && !isOnboardingComplete(profile)) {
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

  // If onboarding not complete, show loader while redirecting
  if (!isOnboardingComplete(profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
