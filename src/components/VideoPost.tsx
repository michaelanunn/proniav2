"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

interface VideoPostProps {
  post: {
    id: string;
    user_id: string;
    caption: string | null;
    video_url: string;
    piece_name: string | null;
    composer: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profile?: {
      name: string;
      username: string;
      avatar_url: string | null;
    };
  };
  onLike?: () => void;
  onComment?: () => void;
}

export function VideoPost({ post, onLike, onComment }: VideoPostProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, post.id]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();
    
    setIsLiked(!!data);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like posts");
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from("post_likes")
          .insert([{ post_id: post.id, user_id: user.id }]);
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      
      if (onLike) onLike();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Link href={`/profile/${post.profile?.username || post.user_id}`}>
          {post.profile?.avatar_url ? (
            <img
              src={post.profile.avatar_url}
              alt={post.profile.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">
                {post.profile?.name?.[0] || "U"}
              </span>
            </div>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.profile?.username || post.user_id}`}>
            <p className="font-semibold text-sm hover:underline">
              {post.profile?.name || "Unknown User"}
            </p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Video */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={post.video_url}
          className="w-full h-full object-contain"
          loop
          playsInline
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play/Pause Overlay */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer group"
        >
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-4 group-hover:bg-black/70 transition-colors">
              <Play className="h-12 w-12 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700 group-hover:text-red-500"
              }`}
            />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle className="h-6 w-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
            <span className="text-sm font-medium">{post.comments_count}</span>
          </button>
        </div>

        {/* Piece Info */}
        {(post.piece_name || post.composer) && (
          <div className="text-sm">
            <span className="font-semibold">
              {post.piece_name}
              {post.piece_name && post.composer && " - "}
              {post.composer}
            </span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <Link href={`/profile/${post.profile?.username || post.user_id}`}>
              <span className="font-semibold hover:underline">
                {post.profile?.name || "User"}
              </span>
            </Link>{" "}
            {post.caption}
          </p>
        )}
      </div>
    </Card>
  );
}