"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FollowersModal } from "@/components/FollowersModal";
import { usePractice } from "@/contexts/PracticeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Share2, User, Clock, Loader2, Lock, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Profile() {
  const router = useRouter();
  const { user, profile, isLoading, updateProfile } = useAuth();
  const { sessions } = usePractice();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Calculate streak from sessions
  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

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
      router.push("/onboarding");
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

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${profile?.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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

  if (isLoading) {
    return (
      <Layout streak={streak}>
        <div className="flex items-center justify-center py-20">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Enclosed profile section */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 flex flex-col items-center">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleShareProfile}
                  className="hover:bg-gray-100"
                >
                  <Share2 className="h-5 w-5 text-black" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push("/settings")}
                  className="hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5 text-black" />
                </Button>
              </div>

              {/* Private Profile Indicator */}
              {isPrivate && (
                <Alert className="mb-4 border-amber-200 bg-amber-50">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium">
                    Private Account - Only approved followers can see your posts
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center text-center mb-2">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden border-2 border-gray-200">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h1 className="text-xl font-bold mb-1 text-black flex items-center gap-2 justify-center">
                  {profile.name}
                  {/* Instrument badge and label */}
                  {profile.instruments?.length > 0 && (
                    <span className="flex items-center gap-1 ml-2">
                      {profile.instruments.slice(0,1).map((instrument) => {
                        let icon = null;
                        let label = "";
                        switch (instrument.toLowerCase()) {
                          case "piano":
                            icon = <img src="/instruments/piano.svg" alt="piano" className="h-6 w-6 inline-block" />;
                            label = "pianist";
                            break;
                          case "guitar":
                            icon = <img src="/instruments/guitar.svg" alt="guitar" className="h-6 w-6 inline-block" />;
                            label = "guitarist";
                            break;
                          case "violin":
                            icon = <img src="/instruments/violin.svg" alt="violin" className="h-6 w-6 inline-block" />;
                            label = "violinist";
                            break;
                          case "voice":
                          case "vocal":
                          case "singer":
                            icon = <img src="/instruments/microphone.svg" alt="voice" className="h-6 w-6 inline-block" />;
                            label = "vocalist";
                            break;
                          default:
                            icon = <span className="inline-block h-6 w-6 bg-gray-200 rounded-full" />;
                            label = instrument.toLowerCase() + " player";
                        }
                        return (
                          <span key={instrument} className="flex items-center gap-1">
                            {icon}
                            <span className="text-xs text-gray-600 font-medium">({label})</span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mb-3">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-sm mb-4 px-4 text-gray-700">{profile.bio}</p>
                )}
                {/* Instrument badges row */}
                {profile.instruments?.length > 1 && (
                  <div className="flex gap-2 mb-4 justify-center">
                    {profile.instruments.slice(1).map((instrument) => {
                      let icon = null;
                      let label = "";
                      switch (instrument.toLowerCase()) {
                        case "piano":
                          icon = <img src="/instruments/piano.svg" alt="piano" className="h-5 w-5 inline-block" />;
                          label = "pianist";
                          break;
                        case "guitar":
                          icon = <img src="/instruments/guitar.svg" alt="guitar" className="h-5 w-5 inline-block" />;
                          label = "guitarist";
                          break;
                        case "violin":
                          icon = <img src="/instruments/violin.svg" alt="violin" className="h-5 w-5 inline-block" />;
                          label = "violinist";
                          break;
                        case "voice":
                        case "vocal":
                        case "singer":
                          icon = <img src="/instruments/microphone.svg" alt="voice" className="h-5 w-5 inline-block" />;
                          label = "vocalist";
                          break;
                        default:
                          icon = <span className="inline-block h-5 w-5 bg-gray-200 rounded-full" />;
                          label = instrument.toLowerCase() + " player";
                      }
                      return (
                        <span key={instrument} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                          {icon}
                          <span className="text-xs text-gray-600 font-medium">{label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full max-w-xs border-gray-300 text-black hover:bg-gray-100"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center py-6">
              <div>
                <p className="text-2xl font-bold text-black">{sessions.length}</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <button
                onClick={() => {
                  setFollowersModalTab("followers");
                  setIsFollowersModalOpen(true);
                }}
                className="hover:bg-gray-100 rounded-lg py-2 transition-colors"
              >
                <p className="text-2xl font-bold text-black">{profile.followers_count || 0}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </button>
              <button
                onClick={() => {
                  setFollowersModalTab("following");
                  setIsFollowersModalOpen(true);
                }}
                className="hover:bg-gray-100 rounded-lg py-2 transition-colors"
              >
                <p className="text-2xl font-bold text-black">{profile.following_count || 0}</p>
                <p className="text-xs text-gray-500">Following</p>
              </button>
            </div>
            <Button 
              variant="outline" 
              className="w-full max-w-xs border-gray-300 text-black hover:bg-gray-100"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-2xl font-bold text-black">{sessions.length}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            <button
              onClick={() => {
                setFollowersModalTab("followers");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-gray-100 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold text-black">{profile.followers_count || 0}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </button>
            <button
              onClick={() => {
                setFollowersModalTab("following");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-gray-100 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold text-black">{profile.following_count || 0}</p>
              <p className="text-xs text-gray-500">Following</p>
            </button>
          </div>
        </div>

        <div className="flex gap-6 mb-6 border-b border-gray-200 justify-center">
          <button
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "posts"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "logs"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
          <button
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "liked"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>
        </div>

        {activeTab === "posts" && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-600">No posts yet</p>
            <p className="text-xs mt-1 text-gray-400">Record a practice session to share</p>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-600">No practice logs yet</p>
                <p className="text-xs mt-1 text-gray-400">Start a practice session to see your history</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                  <h3 className="font-semibold mb-1 text-black">
                    {session.piece || "Practice Session"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString("en-US", { 
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })} • {formatDuration(session.duration)}
                  </p>
                  {session.notes && (
                    <p className="text-sm mt-2 text-gray-600">{session.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-600">No liked posts yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
  }
}
