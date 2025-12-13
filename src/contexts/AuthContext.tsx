"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  instruments: string[];
  experience_level: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  is_premium: boolean;
  trial_start_date: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as UserProfile | null;
  };

  // Create initial profile for new users
  const createProfile = async (user: User) => {
    const username = user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || username;
    
    const newProfile = {
      id: user.id,
      email: user.email || "",
      name,
      username,
      bio: "",
      avatar_url: user.user_metadata?.avatar_url || null,
      instruments: [],
      experience_level: "",
      followers_count: 0,
      following_count: 0,
      is_premium: false,
      trial_start_date: null,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(newProfile)
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return data as UserProfile;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          let profile = await fetchProfile(session.user.id);
          if (!profile) {
            profile = await createProfile(session.user);
          }
          setProfile(profile);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          let profile = await fetchProfile(session.user.id);
          if (!profile) {
            profile = await createProfile(session.user);
          }
          setProfile(profile);

          // Redirect new users to onboarding
          if (event === "SIGNED_IN" && !profile?.instruments?.length) {
            router.push("/onboarding");
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    router.push("/");
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    // Refresh profile data
    await refreshProfile();
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

