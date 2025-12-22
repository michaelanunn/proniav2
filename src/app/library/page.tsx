"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Play, Plus, X, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AddPieceModal } from "@/components/AddPieceModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";

interface Piece {
  id: string;
  title: string;
  composer: string;
  status: "Not Started" | "In Progress" | "Mastered";
  progress: number;
  era?: string;
}

export default function Library() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch pieces from Supabase
  const fetchPieces = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("library_pieces")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching library:", error);
        // If table doesn't exist, show empty state
        if (error.code === "42P01") {
          setPieces([]);
        }
      } else {
        setPieces(
          (data || []).map((p) => ({
            id: p.id,
            title: p.title,
            composer: p.composer,
            status: p.status as Piece["status"],
            progress: p.progress,
            era: p.era,
          }))
        );
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  const handleAddPiece = async (piece: { title: string; composer: string; era: string }) => {
    if (!user) return;

    setIsSaving(true);
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newPiece: Piece = {
      id: tempId,
      title: piece.title,
      composer: piece.composer,
      status: "Not Started",
      progress: 0,
      era: piece.era,
    };
    setPieces((prev) => [newPiece, ...prev]);

    try {
      const { data, error } = await supabase
        .from("library_pieces")
        .insert({
          user_id: user.id,
          title: piece.title,
          composer: piece.composer,
          era: piece.era,
          status: "Not Started",
          progress: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding piece:", error);
        // Revert optimistic update
        setPieces((prev) => prev.filter((p) => p.id !== tempId));
        alert("Failed to add piece. Please try again.");
      } else if (data) {
        // Replace temp with real data
        setPieces((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? {
                  id: data.id,
                  title: data.title,
                  composer: data.composer,
                  status: data.status as Piece["status"],
                  progress: data.progress,
                  era: data.era,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setPieces((prev) => prev.filter((p) => p.id !== tempId));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePiece = async (id: string) => {
    if (!user) return;

    // Optimistic update
    const previousPieces = [...pieces];
    setPieces((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error } = await supabase
        .from("library_pieces")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting piece:", error);
        // Revert
        setPieces(previousPieces);
      }
    } catch (err) {
      console.error("Error:", err);
      setPieces(previousPieces);
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    if (!user) return;

    let status: Piece["status"] = "Not Started";
    if (progress >= 100) status = "Mastered";
    else if (progress > 0) status = "In Progress";

    // Optimistic update
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progress, status } : p))
    );

    try {
      const { error } = await supabase
        .from("library_pieces")
        .update({ progress, status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating progress:", error);
        // Refetch to get correct state
        fetchPieces();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const filteredPieces = pieces.filter((piece) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "progress" && piece.status === "In Progress") ||
      (filter === "mastered" && piece.status === "Mastered");

    const matchesSearch =
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.composer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Sign in to view your library</p>
            <Button className="mt-4" onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Library</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({pieces.length})
          </Button>
          <Button
            variant={filter === "progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("progress")}
          >
            In Progress ({pieces.filter((p) => p.status === "In Progress").length})
          </Button>
          <Button
            variant={filter === "mastered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("mastered")}
          >
            Mastered ({pieces.filter((p) => p.status === "Mastered").length})
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {pieces.length === 0
                ? "Your library is empty. Add your first piece!"
                : "No pieces found"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPieces.map((piece) => (
              <Card key={piece.id} className="p-4 group">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{piece.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {piece.composer}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePiece(piece.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={piece.progress}
                        onChange={(e) =>
                          handleUpdateProgress(piece.id, parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-[rgba(245,245,245,1)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {piece.progress}%
                      </span>
                    </div>
                    {piece.status === "Mastered" && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Mastered ✓
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          className="w-full mt-6 gap-2"
          onClick={() => setIsAddModalOpen(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          Add New Piece
        </Button>
      </div>

      <AddPieceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPiece}
      />
    </Layout>
  );
}
