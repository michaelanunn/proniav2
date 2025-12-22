"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Search, Music, Loader2, Trash2, Youtube, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
  };
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

export default function Feed() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostYoutubeUrl, setNewPostYoutubeUrl] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("posts")
        .select(`
          id,
          user_id,
          caption,
          media_url,
          media_type,
          created_at,
          profiles(id, username, name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      // For "following" tab, filter to only followed users + self
      if (activeTab === "following") {
        const { data: following } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = following?.map(f => f.following_id) || [];
        followingIds.push(user.id); // Include own posts

        if (followingIds.length > 0) {
          query = query.in("user_id", followingIds);
        } else {
          // Not following anyone, show only own posts
          query = query.eq("user_id", user.id);
        }
      }

      const { data: postsData, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        return;
      }

      // Get likes for these posts (if the table exists)
      const postIds = postsData?.map(p => p.id) || [];
      
      let likesCount: Record<string, number> = {};
      let userLikedPosts = new Set<string>();
      
      if (postIds.length > 0) {
        try {
          // Get likes counts
          const { data: likesData, error: likesError } = await supabase
            .from("likes")
            .select("post_id")
            .in("post_id", postIds);

          if (!likesError && likesData) {
            likesData.forEach(like => {
              likesCount[like.post_id] = (likesCount[like.post_id] || 0) + 1;
            });
          }

          // Get user's likes
          const { data: userLikes, error: userLikesError } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds);

          if (!userLikesError && userLikes) {
            userLikedPosts = new Set(userLikes.map(l => l.post_id));
          }
        } catch {
          // Likes table may not exist yet - continue without likes
          console.log("Likes table not available");
        }
      }

      const transformedPosts: Post[] = (postsData || []).map((post: any) => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
        likes_count: likesCount[post.id] || 0,
        is_liked: userLikedPosts.has(post.id),
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTab, supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time subscription for new posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => {
          fetchPosts(); // Refetch to get full post data with profiles
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPosts]);

  // Handle like/unlike
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
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

  // Handle create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostYoutubeUrl.trim()) return;
    if (!user) {
      router.push("/login");
      return;
    }

    setIsPosting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: newPostContent.trim(),
          media_url: newPostYoutubeUrl.trim() || null,
          media_type: newPostYoutubeUrl.trim() ? "youtube" : null,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewPostContent("");
        setNewPostYoutubeUrl("");
        setShowCreatePost(false);
        // Add the new post to the top of the list immediately
        if (data.post) {
          const newPost: Post = {
            ...data.post,
            profiles: profile ? {
              id: profile.id,
              username: profile.username,
              name: profile.name,
              avatar_url: profile.avatar_url,
            } : data.post.profiles,
            likes_count: 0,
            is_liked: false,
          };
          setPosts(prev => [newPost, ...prev]);
        }
      } else {
        console.error("Error creating post:", data.error);
        setError(data.error || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
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
        .eq("user_id", user?.id);

      if (!error) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar - Links to Explore */}
        <div 
          className="mb-4 cursor-pointer"
          onClick={() => router.push("/explore")}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <div className="w-full pl-10 pr-4 py-2.5 bg-muted/50 rounded-lg text-muted-foreground text-sm">
              Search users, composers, pieces...
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-8 border-b border-border mb-6">
          <button
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "for-you"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("for-you")}
          >
            For You
          </button>
          <button
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "following"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>

        {/* Create Post Button */}
        {user && !showCreatePost && (
          <Button
            className="w-full mb-6"
            variant="outline"
            onClick={() => setShowCreatePost(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Share something with the community
          </Button>
        )}

        {/* Create Post Form */}
        {showCreatePost && (
          <Card className="p-4 mb-6">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="What are you practicing?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value.slice(0, 500))}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <input
                    type="text"
                    placeholder="YouTube link (optional)"
                    value={newPostYoutubeUrl}
                    onChange={(e) => setNewPostYoutubeUrl(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-b border-border focus:border-primary outline-none pb-1"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {newPostContent.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreatePost(false);
                        setNewPostContent("");
                        setNewPostYoutubeUrl("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreatePost}
                      disabled={isPosting || (!newPostContent.trim() && !newPostYoutubeUrl.trim())}
                    >
                      {isPosting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Posts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "following"
                ? "Follow musicians to see their posts here"
                : "Be the first to share your practice session!"}
            </p>
            {!user && (
              <Button onClick={() => router.push("/login")}>
                Sign in to post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {/* Post Header */}
                <div className="p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => router.push(`/user/${post.profiles?.username}`)}
                    >
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {post.profiles?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span
                          className="font-semibold cursor-pointer hover:underline"
                          onClick={() => router.push(`/user/${post.profiles?.username}`)}
                        >
                          {post.profiles?.name || "Unknown"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          @{post.profiles?.username || "unknown"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                    {user?.id === post.user_id && (
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
                <div className="p-3 pt-2 flex items-center gap-1">
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
                  <Button variant="ghost" size="sm" className="h-8 px-2 ml-auto">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
