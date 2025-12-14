"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  instruments: string[];
  experience_level: string;
  followers_count: number;
  following_count: number;
  is_premium: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("pronia-user");
        const savedProfile = localStorage.getItem("pronia-profile");
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signInWithGoogle = async () => {
    // For now, just show an alert - Google OAuth requires Supabase setup
    alert("Google sign-in requires Supabase configuration. Use email/password for now.");
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Simple local auth - check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
    const userData = users[email];
    
    if (!userData) {
      throw new Error("No account found with this email. Please sign up first.");
    }
    
    if (userData.password !== password) {
      throw new Error("Incorrect password.");
    }

    const user: User = {
      id: userData.id,
      email: email,
      user_metadata: {
        name: userData.name,
        username: userData.username,
      },
    };

    const profile: Profile = {
      id: userData.id,
      email: email,
      name: userData.name || "",
      username: userData.username || email.split("@")[0],
      bio: userData.bio || "",
      avatar_url: userData.avatar_url || null,
      instruments: userData.instruments || [],
      experience_level: userData.experience_level || "",
      followers_count: 0,
      following_count: 0,
      is_premium: false,
    };

    setUser(user);
    setProfile(profile);
    localStorage.setItem("pronia-user", JSON.stringify(user));
    localStorage.setItem("pronia-profile", JSON.stringify(profile));
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    // Simple local auth - store user in localStorage
    const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
    
    if (users[email]) {
      throw new Error("An account with this email already exists. Please log in.");
    }

    const id = `user_${Date.now()}`;
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + id.slice(-4);

    users[email] = {
      id,
      email,
      password,
      name,
      username,
      bio: "",
      avatar_url: null,
      instruments: [],
      experience_level: "",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem("pronia-users", JSON.stringify(users));

    const user: User = {
      id,
      email,
      user_metadata: { name, username },
    };

    const profile: Profile = {
      id,
      email,
      name,
      username,
      bio: "",
      avatar_url: null,
      instruments: [],
      experience_level: "",
      followers_count: 0,
      following_count: 0,
      is_premium: false,
    };

    setUser(user);
    setProfile(profile);
    localStorage.setItem("pronia-user", JSON.stringify(user));
    localStorage.setItem("pronia-profile", JSON.stringify(profile));
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("pronia-user");
    localStorage.removeItem("pronia-profile");
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user || !profile) return;

    const updatedProfile = { ...profile, ...data };
    setProfile(updatedProfile);
    localStorage.setItem("pronia-profile", JSON.stringify(updatedProfile));

    // Also update in users storage
    const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
    if (users[user.email]) {
      users[user.email] = { ...users[user.email], ...data };
      localStorage.setItem("pronia-users", JSON.stringify(users));
    }
  };

  const refreshProfile = async () => {
    const savedProfile = localStorage.getItem("pronia-profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
