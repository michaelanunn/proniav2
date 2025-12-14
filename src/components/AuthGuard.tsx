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

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.push("/onboarding");
    }
  }, [user, isLoading, isPublicPath, router]);

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

  return <>{children}</>;
};

export default AuthGuard;
