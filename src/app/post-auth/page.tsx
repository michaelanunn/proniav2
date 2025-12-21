"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

export default function PostAuth() {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // Check if profile exists and is complete
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, name, username, instruments, experience_level")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile check error:", error);
          router.replace("/onboarding");
          return;
        }

        // Check if profile is complete (has required fields)
        const isComplete = profile && 
          profile.name?.trim() && 
          profile.username?.trim() && 
          Array.isArray(profile.instruments) && 
          profile.instruments.length > 0 &&
          profile.experience_level?.trim();

        if (isComplete) {
          router.replace("/feed");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Post-auth error:", error);
        router.replace("/onboarding");
      }
    })();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
