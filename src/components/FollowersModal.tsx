"use client";

import { useState, useEffect } from "react";
import { X, User, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UserItem {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  isFollowing: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  followersCount: string;
  followingCount: string;
  userId?: string; // Optional - defaults to current user
}

export const FollowersModal = ({
  isOpen,
  onClose,
  initialTab,
  followersCount,
  followingCount,
  userId,
}: FollowersModalProps) => {
  const router = useRouter();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followState, setFollowState] = useState<Record<string, boolean>>({});

  const targetUserId = userId || profile?.id;

  // Fetch followers/following when modal opens or tab changes
  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const endpoint = activeTab === "followers" 
          ? `/api/users/${targetUserId}/followers`
          : `/api/users/${targetUserId}/following`;
        
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        } else {
          // Fallback: if API not configured (no supabase), read from localStorage
          const saved = localStorage.getItem('pronia-users');
          if (saved) {
            const parsed = JSON.parse(saved);
            const list = Object.values(parsed).filter((u: any) => u.id !== profile?.id).map((u: any) => ({
              id: u.id,
              name: u.name || '',
              username: u.username || '',
              avatar_url: u.avatar_url || null,
              isFollowing: false,
            }));
            setUsers(list);
          } else {
            setUsers([]);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to localStorage if fetch fails
        const saved = localStorage.getItem('pronia-users');
        if (saved) {
          const parsed = JSON.parse(saved);
          const list = Object.values(parsed).filter((u: any) => u.id !== profile?.id).map((u: any) => ({
            id: u.id,
            name: u.name || '',
            username: u.username || '',
            avatar_url: u.avatar_url || null,
            isFollowing: false,
          }));
          setUsers(list);
        } else {
          setUsers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, activeTab, targetUserId]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollowToggle = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user.username}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFollowState((prev) => ({
          ...prev,
          [user.id]: data.following,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const isUserFollowing = (user: UserItem) => {
    return followState[user.id] !== undefined ? followState[user.id] : user.isFollowing;
  };

  const handleUserClick = (username: string) => {
    onClose();
    router.push(`/user/${username}`);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md h-[85vh] sm:h-[70vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-200 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="w-8" />
            <h2 className="text-base font-semibold text-gray-900">
              {activeTab === "followers" ? "Followers" : "Following"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "followers"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {followersCount} Followers
              {activeTab === "followers" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "following"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {followingCount} Following
              {activeTab === "following" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-9 pl-9 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder:text-gray-500 focus:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* User List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <User className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? "No users found" : `No ${activeTab} yet`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-500">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.name}</p>
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant={isUserFollowing(user) ? "outline" : "default"}
                    className={`h-8 px-4 text-xs font-semibold rounded-lg ${
                      isUserFollowing(user)
                        ? "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                        : "bg-accent hover:bg-accent/90 text-white border-0"
                    }`}
                    onClick={() => handleFollowToggle(user)}
                  >
                    {isUserFollowing(user) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
