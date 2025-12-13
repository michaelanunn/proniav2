"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { User, Music, Flame, Clock, Loader2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  instruments: string[];
  followers_count: number;
  following_count: number;
  is_private?: boolean;
}

const badges = [
  { icon: Music, color: "text-foreground" },
  { icon: User, color: "text-foreground" },
  { icon: Flame, color: "text-accent" },
];

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Check if viewing own profile
  const isOwnProfile = currentUser?.user_metadata?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else if (res.status === 404) {
          router.push("/404");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkFollowing = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`/api/users/${username}/follow`);
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.following);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    fetchProfile();
    checkFollowing();
  }, [username, currentUser, router]);

  const handleFollow = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setIsFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        // Update follower count locally
        if (profile) {
          setProfile({
            ...profile,
            followers_count: profile.followers_count + (data.following ? 1 : -1),
          });
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout streak={7}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout streak={7}>
        <div className="flex flex-col items-center justify-center py-20">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold">User not found</h1>
          <p className="text-muted-foreground">@{username} doesn&apos;t exist</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          {/* Badges */}
          <div className="flex justify-center gap-3 mb-6">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full border-2 border-border bg-background flex items-center justify-center"
              >
                <badge.icon className={`h-5 w-5 ${badge.color}`} />
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-3 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{profile.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm mb-4 px-4">{profile.bio}</p>
            )}
            
            {/* Instruments */}
            {profile.instruments?.length > 0 && (
              <div className="flex gap-2 mb-4">
                {profile.instruments.map((instrument) => (
                  <span
                    key={instrument}
                    className="px-3 py-1 bg-secondary rounded-full text-xs font-medium capitalize"
                  >
                    {instrument}
                  </span>
                ))}
              </div>
            )}
            
            {isOwnProfile ? (
              <Button 
                variant="outline" 
                className="w-full max-w-xs"
                onClick={() => router.push("/profile")}
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? "outline" : "default"}
                className="w-full max-w-xs"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.followers_count}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.following_count}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        {/* Private Account Indicator */}
        {profile.is_private && !isFollowing && !isOwnProfile && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
              This account is private. Follow to see their posts and practice logs.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-border justify-center">
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "logs"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
        </div>

        {/* Content */}
        {profile.is_private && !isFollowing && !isOwnProfile ? (
          <div className="text-center py-16 text-muted-foreground">
            <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-1">This Account is Private</h3>
            <p className="text-sm">Follow this account to see their posts and practice logs.</p>
          </div>
        ) : (
          <>
            {activeTab === "posts" && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No posts yet</p>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No practice logs yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

