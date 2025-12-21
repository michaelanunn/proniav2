"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { User, Music, Flame, Clock, Loader2, Lock, Heart, Trash2, Youtube } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.user_metadata?.username === username;

  // Fetch posts for this user
  const fetchPosts = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setIsPostsLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("id, user_id, caption, media_url, media_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        return;
      }

      // Get likes for these posts
      const postIds = postsData?.map(p => p.id) || [];
      
      if (postIds.length === 0) {
        setPosts([]);
        return;
      }

      // Get likes counts
      const { data: likesData } = await supabase
        .from("likes")
        .select("post_id")
        .in("post_id", postIds);

      // Get current user's likes
      let userLikedPosts = new Set<string>();
      if (currentUser) {
        const { data: userLikes } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", currentUser.id)
          .in("post_id", postIds);
        userLikedPosts = new Set(userLikes?.map(l => l.post_id) || []);
      }

      const likesCount: Record<string, number> = {};
      likesData?.forEach(like => {
        likesCount[like.post_id] = (likesCount[like.post_id] || 0) + 1;
      });

      const transformedPosts: Post[] = (postsData || []).map((post) => ({
        ...post,
        likes_count: likesCount[post.id] || 0,
        is_liked: userLikedPosts.has(post.id),
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error:", error);
      setPosts([]);
    } finally {
      setIsPostsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          // Fetch posts for this user
          if (data.user?.id) {
            fetchPosts(data.user.id);
          }
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
  }, [username, currentUser, router, fetchPosts]);

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
        
        if (profile) {
          const currentCount = profile.followers_count || 0;
          setProfile({
            ...profile,
            followers_count: data.following ? currentCount + 1 : Math.max(0, currentCount - 1),
          });
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        is_liked: !isLiked,
        likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
      };
    }));

    try {
      const endpoint = isLiked ? "/api/posts/unlike" : "/api/posts/like";
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch (error) {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          is_liked: isLiked,
          likes_count: isLiked ? p.likes_count + 1 : p.likes_count - 1,
        };
      }));
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setDeletingPostId(postId);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", currentUser?.id);

      if (!error) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold">User not found</h1>
          <p className="text-muted-foreground">@{username} doesn&apos;t exist</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
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
              <>
                {isPostsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="overflow-hidden">
                        {/* Post Header */}
                        <div className="p-3 pb-2 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </p>
                          {isOwnProfile && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPostId === post.id}
                            >
                              {deletingPostId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Post Content */}
                        {post.caption && (
                          <div className="px-3 pb-3">
                            <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
                          </div>
                        )}

                        {/* YouTube Embed */}
                        {post.media_url && getYouTubeEmbedUrl(post.media_url) && (
                          <div className="aspect-video bg-muted">
                            <iframe
                              src={getYouTubeEmbedUrl(post.media_url)!}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="p-3 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 px-2"
                            onClick={() => handleLike(post.id, post.is_liked)}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                post.is_liked ? "fill-red-500 text-red-500" : ""
                              }`}
                            />
                            <span className="text-xs">{post.likes_count}</span>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
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
