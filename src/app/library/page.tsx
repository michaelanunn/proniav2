"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Play, Plus, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddPieceModal } from "@/components/AddPieceModal";

interface Piece {
  id: string;
  title: string;
  artist: string;
  status: "Not Started" | "In Progress" | "Mastered";
  progress: number;
  era?: string;
}

const defaultPieces: Piece[] = [
  {
    id: "1",
    title: "Moonlight Sonata",
    artist: "Ludwig van Beethoven",
    status: "In Progress",
    progress: 65,
  },
  {
    id: "2",
    title: "Clair de Lune",
    artist: "Claude Debussy",
    status: "Mastered",
    progress: 100,
  },
  {
    id: "3",
    title: "Für Elise",
    artist: "Ludwig van Beethoven",
    status: "In Progress",
    progress: 40,
  },
];

export default function Library() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pieces, setPieces] = useState<Piece[]>(defaultPieces);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("library-pieces");
    if (saved) {
      setPieces(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("library-pieces", JSON.stringify(pieces));
  }, [pieces]);

  const handleAddPiece = (piece: { title: string; composer: string; era: string }) => {
    const newPiece: Piece = {
      id: Date.now().toString(),
      title: piece.title,
      artist: piece.composer,
      status: "Not Started",
      progress: 0,
      era: piece.era,
    };
    setPieces([newPiece, ...pieces]);
  };

  const handleDeletePiece = (id: string) => {
    setPieces(pieces.filter(p => p.id !== id));
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setPieces(pieces.map(p => {
      if (p.id !== id) return p;
      let status: Piece["status"] = "Not Started";
      if (progress >= 100) status = "Mastered";
      else if (progress > 0) status = "In Progress";
      return { ...p, progress, status };
    }));
  };

  const filteredPieces = pieces.filter((piece) => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "progress" && piece.status === "In Progress") ||
      (filter === "mastered" && piece.status === "Mastered");
    
    const matchesSearch = 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
            In Progress ({pieces.filter(p => p.status === "In Progress").length})
          </Button>
          <Button
            variant={filter === "mastered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("mastered")}
          >
            Mastered ({pieces.filter(p => p.status === "Mastered").length})
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

        {filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pieces found</p>
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
                        <p className="text-sm text-muted-foreground">{piece.artist}</p>
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
                        onChange={(e) => handleUpdateProgress(piece.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-[rgba(245,245,245,1)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{piece.progress}%</span>
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
        >
          <Plus className="h-5 w-5" />
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
