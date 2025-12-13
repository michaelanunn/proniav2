"use client";

import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Music, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserResult {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  instruments: string[];
  followers_count: number;
}

const mockPieces = [
  { id: 1, title: "Liszt - La Campanella", composer: "Franz Liszt" },
  { id: 2, title: "Hungarian Rhapsody No. 2", composer: "Franz Liszt" },
  { id: 3, title: "Liebestraum No. 3", composer: "Franz Liszt" },
];

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load initial users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?limit=10");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToUser = (username: string) => {
    router.push(`/user/${username}`);
  };

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users, composers, pieces..."
              className="pl-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="space-y-6">
          {/* Users Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              {searchQuery ? "Search Results" : "Musicians"}
            </h2>
            
            {isLoading || isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => navigateToUser(user.username)}
                    className="w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      {user.instruments?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.instruments.slice(0, 2).map((instrument) => (
                            <span
                              key={instrument}
                              className="text-xs bg-secondary px-2 py-0.5 rounded capitalize"
                            >
                              {instrument}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {user.followers_count || 0} followers
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "No users found" : "No musicians yet"}
                </p>
                <p className="text-xs mt-1">
                  {searchQuery ? "Try a different search term" : "Be the first to join!"}
                </p>
              </div>
            )}
          </div>

          {/* Pieces Section - Static for now */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Music className="h-5 w-5" />
                Popular Pieces
              </h2>
              <div className="space-y-2">
                {mockPieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="font-semibold">{piece.title}</p>
                    <p className="text-sm text-muted-foreground">{piece.composer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
