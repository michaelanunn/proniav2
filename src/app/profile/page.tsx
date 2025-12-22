"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FollowersModal } from "@/components/FollowersModal";
import { usePractice } from "@/contexts/PracticeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Share2, User, Music, Flame, Clock, Loader2, Lock, Youtube, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const badges = [
  { icon: Music, color: "text-foreground", isComponent: false },
  { icon: User, color: "text-foreground", isComponent: false },
  { icon: Flame, color: "text-accent", isComponent: false },
];

export default function Profile() {
  const router = useRouter();
  const { user, profile, isLoading, updateProfile, refreshProfile } = useAuth();
  const { sessions, deleteSession } = usePractice();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postData, setPostData] = useState({
    youtubeUrl: "",
    title: "",
    notes: "",
  });

  // Check if profile is private
  useEffect(() => {
    const savedPrivate = localStorage.getItem("profile-private");
    if (savedPrivate) setIsPrivate(JSON.parse(savedPrivate));
  }, []);
  
  // Local state for edit modal
  const [editData, setEditData] = useState({
    profilePic: null as string | null,
    name: "",
    username: "",
    bio: "",
  });

  // Sync profile data to edit state
  useEffect(() => {
    if (profile) {
      setEditData({
        profilePic: profile.avatar_url,
        name: profile.name,
        username: profile.username,
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const handleSaveProfile = async (data: typeof editData) => {
    try {
      await updateProfile({
        name: data.name,
        username: data.username,
        bio: data.bio,
        avatar_url: data.profilePic,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePublishPost = () => {
    // TODO: Save post to database
    console.log("Publishing post:", postData);
    setShowCreatePost(false);
    setPostData({ youtubeUrl: "", title: "", notes: "" });
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setPostData({ youtubeUrl: "", title: "", notes: "" });
  };

  // Single unified loading check - prevents flickering
  if (isLoading || !user || !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={editData}
        onSave={handleSaveProfile}
      />
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        initialTab={followersModalTab}
        followersCount={profile.followers_count?.toString() || "0"}
        followingCount={profile.following_count?.toString() || "0"}
      />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-end items-center gap-2 mb-4">
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Private Profile Indicator */}
        {isPrivate && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
              Private Account - Only approved followers can see your posts
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
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

          <div className="flex flex-col items-center text-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-3 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>
            
            {/* Name with instrument badge to the side */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{profile.name || "User"}</h1>
              {profile.instruments && profile.instruments.length > 0 && (
                <span className="px-2 py-0.5 bg-secondary rounded-full text-xs font-medium capitalize">
                  {profile.instruments[0]}
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">@{profile.username || "user"}</p>
            {profile.bio && (
              <p className="text-sm mb-4 px-4">{profile.bio}</p>
            )}
            
            {/* Show additional instruments if more than one */}
            {profile.instruments && profile.instruments.length > 1 && (
              <div className="flex gap-2 mb-4">
                {profile.instruments.slice(1).map((instrument) => (
                  <span
                    key={instrument}
                    className="px-3 py-1 bg-secondary rounded-full text-xs font-medium capitalize"
                  >
                    {instrument}
                  </span>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full max-w-xs"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <button
              onClick={() => {
                setFollowersModalTab("followers");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-muted/50 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold">{profile.followers_count || 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </button>
            <button
              onClick={() => {
                setFollowersModalTab("following");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-muted/50 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold">{profile.following_count || 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
          </div>
        </div>

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
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "liked"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>
        </div>

        {activeTab === "posts" && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Youtube className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-1">Share Your Practice!</h2>
              <p className="text-3xl font-mono font-bold text-foreground">
                0 Posts
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                Share your practice sessions by posting YouTube videos.
              </p>

              <Button 
                className="w-full"
                onClick={() => setShowCreatePost(true)}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Create Your First Post
              </Button>
            </div>
          </Card>
        )}

        {/* Create Post Overlay */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 relative">
              <button
                onClick={handleCloseCreatePost}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <Youtube className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold mb-1">Create a Post</h2>
                <p className="text-sm text-muted-foreground">
                  Share a YouTube video with your practice community!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-600" />
                      YouTube Video Link
                    </div>
                  </label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={postData.youtubeUrl}
                    onChange={(e) => setPostData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Song Title</label>
                  <Input
                    placeholder="What song is this?"
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Caption (optional)</label>
                  <Textarea
                    placeholder="Add a caption for your post..."
                    value={postData.notes}
                    onChange={(e) => setPostData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleCloseCreatePost}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handlePublishPost}
                    disabled={!postData.youtubeUrl}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No practice logs yet</p>
                <p className="text-xs mt-1">Start a practice session to see your history</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">
                    {session.piece || "Practice Session"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString("en-US", { 
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })} • {formatDuration(session.duration)}
                  </p>
                  {session.notes && (
                    <p className="text-sm mt-2 text-muted-foreground">{session.notes}</p>
                  )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No liked posts yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
