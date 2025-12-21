"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Play, Search, Bookmark, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentsOverlay } from "@/components/CommentsOverlay";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar_url?: string;
    isPrivate?: boolean;
  };
  piece: string;
  composer: string;
  time: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  isSaved: boolean;
}

// Posts will be fetched from the database - no mock data
const initialPosts: Post[] = [];

export default function Feed() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeComments, setActiveComments] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? p.likes - 1 : p.likes + 1,
      };
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      return { ...p, isSaved: !p.isSaved };
    }));
  };

  const handleAddComment = (postId: string, content: string, replyToId?: string) => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      
      const newComment: Comment = {
        id: Date.now().toString(),
        user: { id: "me", name: "You", username: "me", avatar_url: "" },
        content,
        created_at: new Date().toISOString(),
        likes: 0,
      };

      if (replyToId) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id !== replyToId) return c;
            return { ...c, replies: [...(c.replies || []), newComment] };
          }),
        };
      }

      return { ...p, comments: [newComment, ...p.comments] };
    }));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id === commentId) {
            return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
                  : r
              ),
            };
          }
          return c;
        }),
      };
    }));
  };

  const activePost = posts.find(p => p.id === activeComments);

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-muted/50 border-0"
              onFocus={() => router.push("/explore")}
            />
          </div>

          <div className="flex items-center justify-center gap-8 border-b border-border">
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
        </div>
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "following" 
                  ? "Follow musicians to see their practice posts here"
                  : "Be the first to share your practice session!"}
              </p>
              <Button onClick={() => router.push("/record")}>
                Record Practice
              </Button>
            </div>
          ) : posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => router.push(`/user/${post.user.username}`)}
                  >
                    <AvatarImage src={post.user.avatar_url} />
                    <AvatarFallback className="bg-muted text-xs">
                      {post.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span 
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => router.push(`/user/${post.user.username}`)}
                      >
                        {post.user.name}
                      </span>{" "}
                      <span className="text-muted-foreground">@{post.user.username}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
              </div>

              <div className="aspect-square bg-muted relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-xl bg-black/80 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="mb-2">
                  <p className="font-semibold text-sm">{post.piece}</p>
                  <p className="text-xs text-muted-foreground">{post.composer}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 h-8 px-2"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-xs">{post.likes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 h-8 px-2"
                    onClick={() => setActiveComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments.length}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleSave(post.id)}
                  >
                    <Bookmark className={`h-4 w-4 ${post.isSaved ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 ml-auto">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {activePost && (
        <CommentsOverlay
          isOpen={!!activeComments}
          onClose={() => setActiveComments(null)}
          postId={activePost.id}
          comments={activePost.comments}
          onAddComment={(content, replyToId) => handleAddComment(activePost.id, content, replyToId)}
          onLikeComment={(commentId) => handleLikeComment(activePost.id, commentId)}
        />
      )}
    </Layout>
  );
}

