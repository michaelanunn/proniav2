"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMemo } from "react";

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
  email?: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  instruments: string[];
  years_playing?: string;
  experience_level: string;
  followers_count?: number;
  following_count?: number;
  total_practice_seconds?: number;
  current_streak?: number;
  longest_streak?: number;
  last_practice_date?: string | null;
  is_premium?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
  subscription_status?: string;
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
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

const supabase = useMemo(() => createClientComponentClient(), []);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety timeout - force isLoading to false after 5 seconds max
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing isLoading to false');
        setIsLoading(false);
      }
    }, 5000);

    const init = async () => {
      if (supabase) {
        setIsLoading(true);
        try {
          const { data } = await supabase.auth.getUser();
          const currentUser = data.user;
          if (currentUser && mounted) {
            const userObj: User = {
              id: currentUser.id,
              email: currentUser.email || "",
              user_metadata: (currentUser.user_metadata as any) || {},
            };
            setUser(userObj);

            // Use maybeSingle instead of single to avoid error when profile doesn't exist
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
            if (profileData && mounted) {
              setProfile(profileData as Profile);
            }
          } else if (mounted) {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Supabase init error:', err);
        } finally {
          if (mounted) setIsLoading(false);
          clearTimeout(safetyTimeout);
        }

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if (session?.user) {
            const u = session.user;
            const userObj: User = { id: u.id, email: u.email || '', user_metadata: (u.user_metadata as any) || {} };
            setUser(userObj);
            try {
              // Use maybeSingle to avoid error when profile doesn't exist yet
              const { data: profileData } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
              if (profileData) {
                setProfile(profileData as Profile);
                localStorage.setItem('pronia-profile', JSON.stringify(profileData));
              }
              // Don't set profile to null here - it might have been set by signUpWithEmail
            } catch (err) {
              console.error('Error fetching profile after auth change:', err);
            }
            localStorage.setItem('pronia-user', JSON.stringify(userObj));
          } else {
            setUser(null);
            setProfile(null);
            localStorage.removeItem('pronia-user');
            localStorage.removeItem('pronia-profile');
          }
        });

        return () => {
          mounted = false;
          clearTimeout(safetyTimeout);
          listener?.subscription?.unsubscribe();
        };
      } else {
        try {
          const savedUser = localStorage.getItem('pronia-user');
          const savedProfile = localStorage.getItem('pronia-profile');
          if (savedUser) setUser(JSON.parse(savedUser));
          if (savedProfile) setProfile(JSON.parse(savedProfile));
        } catch (err) {
          console.error('Error loading local auth:', err);
        } finally {
          if (mounted) setIsLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    init();
  }, []);

  const signInWithGoogle = async () => {
    if (!hasSupabase || !supabase) {
      alert('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/auth/callback` },
});

  };

  const signInWithEmail = async (email: string, password: string) => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (u) {
        const userObj: User = { id: u.id, email: u.email || '', user_metadata: (u.user_metadata as any) || {} };
        setUser(userObj);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', u.id).single();
        if (profileData) {
          setProfile(profileData as Profile);
          localStorage.setItem('pronia-profile', JSON.stringify(profileData));
        }
        localStorage.setItem('pronia-user', JSON.stringify(userObj));
      }
      return;
    }

    const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
    const userData = users[email];
    if (!userData) throw new Error("No account found with this email. Please sign up first.");
    if (userData.password !== password) throw new Error("Incorrect password.");

    const user: User = { id: userData.id, email, user_metadata: { name: userData.name, username: userData.username } };
    const profile: Profile = {
      id: userData.id,
      email,
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
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { name } } 
    });
    
    if (error) {
      console.error('Signup error:', error);
      throw error;
    }
    
    const u = data.user;
    
    if (!u) {
      throw new Error('User registration failed: no user returned from Supabase.');
    }

    console.log('User created:', u.id);
    await new Promise(resolve => setTimeout(resolve, 100));

    const username = (email.split('@')[0] || 'user') + '_' + u.id.slice(0, 6);
    
    try {
      console.log('Attempting to create profile for user:', u.id);
      
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();
      
      let profileData;
      
      if (existingProfile) {
        // Profile already exists (maybe from trigger), just use it
        console.log('Profile already exists, using existing profile');
        profileData = existingProfile;
      } else {
        // Create new profile
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: u.id,
            email: email,
            name: name,
            username: username,
            avatar_url: null,
            bio: '',
            instruments: [],
            experience_level: '',
            years_playing: ''
          }])
          .select()
          .single();
        
        if (insertError) {
          // If duplicate key error, fetch the existing profile
          if (insertError.code === '23505') {
            console.log('Duplicate key error, fetching existing profile');
            const { data: fetchedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', u.id)
              .single();
            profileData = fetchedProfile;
          } else {
            console.error('Profile insert error:', insertError);
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }
        } else {
          profileData = insertedProfile;
        }
      }
      
      console.log('Profile ready:', profileData);
      
      setProfile(profileData as Profile);
      localStorage.setItem('pronia-profile', JSON.stringify(profileData));
      
      const userObj: User = { 
        id: u.id, 
        email: u.email || '', 
        user_metadata: { name, username } 
      };
      setUser(userObj);
      localStorage.setItem('pronia-user', JSON.stringify(userObj));
      
    } catch (err: any) {
      console.error('Profile creation failed:', err);
      throw new Error(`Failed to create user profile: ${err.message}`);
    }
    
    return;
  }

  // Fallback localStorage shim
  const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
  if (users[email]) throw new Error("An account with this email already exists. Please log in.");
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
    years_playing: "",
    experience_level: "", 
    followers_count: 0,
    following_count: 0,
    total_practice_seconds: 0,
    current_streak: 0,
    longest_streak: 0,
    is_premium: false,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: 'free',
    is_private: false,
    created_at: new Date().toISOString() 
  };
  localStorage.setItem("pronia-users", JSON.stringify(users));
  
  const user: User = { id, email, user_metadata: { name, username } };
  const profile: Profile = { 
    id, 
    email, 
    name, 
    username, 
    bio: "", 
    avatar_url: null, 
    instruments: [], 
    years_playing: "",
    experience_level: "", 
    followers_count: 0, 
    following_count: 0,
    total_practice_seconds: 0,
    current_streak: 0,
    longest_streak: 0,
    is_premium: false,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: 'free',
    is_private: false
  };      
  setUser(user); 
  setProfile(profile); 
  localStorage.setItem("pronia-user", JSON.stringify(user)); 
  localStorage.setItem("pronia-profile", JSON.stringify(profile));
};

  const signOut = async () => {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem("pronia-user");
    localStorage.removeItem("pronia-profile");
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user || !profile) return;

    const updatedProfile = { ...profile, ...data };
    setProfile(updatedProfile);
    try {
      localStorage.setItem("pronia-profile", JSON.stringify(updatedProfile));
    } catch (err) {
      console.error("Failed to save profile to localStorage:", err);
    }

    if (hasSupabase && supabase) {
      try {
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.username !== undefined) payload.username = data.username;
        if (data.bio !== undefined) payload.bio = data.bio;
        if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url;
        if (data.instruments !== undefined) payload.instruments = data.instruments;
        if (data.experience_level !== undefined) payload.experience_level = data.experience_level;
        if (data.years_playing !== undefined) payload.years_playing = data.years_playing;
        await supabase.from('profiles').update(payload).eq('id', user.id);
      } catch (err) {
        console.error('Failed to update profile in Supabase:', err);
      }
    }

    try {
      const users = JSON.parse(localStorage.getItem("pronia-users") || "{}");
      if (users[user.email]) {
        users[user.email] = { ...users[user.email], ...data };
        localStorage.setItem("pronia-users", JSON.stringify(users));
      }
    } catch (err) {
      // ignore
    }

    try {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...(user.user_metadata || {}),
          name: updatedProfile.name,
          username: updatedProfile.username,
          avatar_url: updatedProfile.avatar_url || undefined,
        },
      };
      setUser(updatedUser);
      localStorage.setItem("pronia-user", JSON.stringify(updatedUser));
      if (hasSupabase && supabase) {
        try {
          await supabase.auth.updateUser({ data: { name: updatedProfile.name, username: updatedProfile.username } as any });
        } catch (err) {
          console.warn('Failed to update supabase user metadata:', err);
        }
      }
    } catch (err) {
      console.error("Failed to update cached user metadata:", err);
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