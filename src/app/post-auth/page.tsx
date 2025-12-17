"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PostAuth() {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        router.replace("/onboarding?error=profile_check_failed");
        return;
      }

      router.replace(profile ? "/feed" : "/onboarding");
    })();
  }, [router, supabase]);

  return null;
}
