"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePractice } from "@/contexts/PracticeContext";

import CreatePostModal from "@/components/CreatePostModal";

export default function Feed() {
  const router = useRouter();
  const { sessions } = usePractice();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  // Calculate streak from sessions
  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  return (
    <Layout streak={streak}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-gray-100 border-gray-200 text-black placeholder:text-gray-500"
              onFocus={() => router.push("/explore")}
            />
          </div>

          <div className="flex items-center justify-center gap-8 border-b border-gray-200">
            <button
              className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "for-you"
                  ? "text-black border-black bg-white"
                  : "text-gray-500 border-transparent bg-white hover:text-gray-700"
              }`}
              style={{ minWidth: 80 }}
              onClick={() => setActiveTab("for-you")}
            >
              For You
            </button>
            <button
              className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "following"
                  ? "text-black border-black bg-white"
                  : "text-gray-500 border-transparent bg-white hover:text-gray-700"
              }`}
              style={{ minWidth: 80 }}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>
        </div>
        
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsPostModalOpen(true)} className="bg-black text-white">Create Post</Button>
        </div>
        {isPostModalOpen && (
          <CreatePostModal
            onPost={() => {
              setIsPostModalOpen(false);
              // Refresh posts
              (async () => {
                setLoadingPosts(true);
                const res = await fetch("/api/posts");
                if (res.ok) {
                  const data = await res.json();
                  setPosts(data.posts || []);
                }
                setLoadingPosts(false);
              })();
            }}
            onClose={() => setIsPostModalOpen(false)}
          />
        )}
        {/* Empty State */}
        {loadingPosts ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
              <Music className="h-10 w-10 text-gray-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-black">Loading posts...</h2>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
              <Music className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-black">No posts yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {activeTab === "following" 
                ? "Follow other musicians to see their posts here"
                : "Be the first to share your practice! Record a session to get started."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setIsPostModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create Post
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/explore")}
                className="border-gray-300 text-black hover:bg-gray-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Find Musicians
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={post.profiles?.avatar_url || "/logo.png"}
                    alt={post.profiles?.username || "user"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold">{post.profiles?.username || "Unknown"}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(post.created_at).toLocaleString()}</span>
                </div>
                {post.media_type === "video" ? (
                  <video src={post.media_url} controls className="w-full rounded mb-2" />
                ) : (
                  <audio src={post.media_url} controls className="w-full mb-2" />
                )}
                {post.caption && <div className="text-gray-800 mb-1">{post.caption}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
