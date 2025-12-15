"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Play, Plus, X, Trash2, Folder, FolderPlus, Image, Palette, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { AddPieceModal } from "@/components/AddPieceModal";
import { usePractice } from "@/contexts/PracticeContext";

interface Piece {
  id: string;
  title: string;
  artist: string;
  status: "Not Started" | "In Progress" | "Mastered";
  progress: number;
  folderId?: string;
}

interface MusicFolder {
  id: string;
  name: string;
  imageUrl: string | null;
  theme?: { type: "color" | "instrument" | "custom"; value: string } | null;
  createdAt: string;
}

export default function Library() {
  const { sessions } = usePractice();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderImage, setNewFolderImage] = useState<string | null>(null);
  const [newFolderTheme, setNewFolderTheme] = useState<{ type: "color" | "instrument" | "custom"; value: string } | null>(null);

  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  // Load from localStorage
  useEffect(() => {
    const savedPieces = localStorage.getItem("library-pieces");
    const savedFolders = localStorage.getItem("library-folders");
    if (savedPieces) setPieces(JSON.parse(savedPieces));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("library-pieces", JSON.stringify(pieces));
    } catch (err) {
      console.error("Failed to save library pieces:", err);
      alert("Could not save library data — image may be too large. Try a smaller image.");
    }
  }, [pieces]);

  useEffect(() => {
    try {
      localStorage.setItem("library-folders", JSON.stringify(folders));
    } catch (err) {
      console.error("Failed to save library folders:", err);
      alert("Could not save folders — image may be too large. Try a smaller image.");
    }
  }, [folders]);

  const handleAddPiece = (piece: { title: string; composer: string; era: string }) => {
    const newPiece: Piece = {
      id: Date.now().toString(),
      title: piece.title,
      artist: piece.composer,
      status: "Not Started",
      progress: 0,
      folderId: selectedFolder || undefined,
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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: MusicFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      imageUrl: newFolderImage,
      theme: newFolderTheme,
      createdAt: new Date().toISOString(),
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setNewFolderImage(null);
    setNewFolderTheme(null);
    setIsCreateFolderOpen(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
    setPieces(pieces.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p));
    if (selectedFolder === folderId) setSelectedFolder(null);
  };

  const handleFolderImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress/resize client-side to avoid large base64 strings
        const { compressImage } = await import('@/lib/image');
        const dataUrl = await compressImage(file, 1024, 0.8, 300 * 1024);

        // If Supabase configured, try server upload first
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const form = new FormData();
            form.append('file', new File([blob], file.name, { type: blob.type }));
            const upload = await fetch('/api/upload', { method: 'POST', body: form });
            if (upload.ok) {
              const json = await upload.json();
              setNewFolderImage(json.url);
              return;
            }
          } catch (err) {
            console.warn('Server upload failed, falling back to data URL', err);
          }
        }

        setNewFolderImage(dataUrl);
      } catch (err) {
        console.error('Image processing failed:', err);
        alert('Failed to process image. Try a different file.');
      }
    }
  };

  const filteredPieces = pieces.filter((piece) => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "progress" && piece.status === "In Progress") ||
      (filter === "mastered" && piece.status === "Mastered");
    
    const matchesSearch = 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = !selectedFolder || piece.folderId === selectedFolder;
    
    return matchesFilter && matchesSearch && matchesFolder;
  });

  return (
    <Layout streak={streak}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">My Library</h1>
        </div>

        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Folders</h2>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                    <Palette className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Folder Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="color"
                        onChange={(e) => setNewFolderTheme({ type: "color", value: e.target.value })}
                        value={(newFolderTheme && newFolderTheme.type === "color") ? newFolderTheme.value : "#ffffff"}
                        className="w-8 h-8 p-0 border-0"
                      />
                      <span className="text-sm text-gray-700">Pick color</span>
                    </label>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Music className="mr-2 h-4 w-4" />
                      Instrument Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => setNewFolderTheme({ type: "instrument", value: "piano" })}>Piano</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setNewFolderTheme({ type: "instrument", value: "guitar" })}>Guitar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setNewFolderTheme({ type: "instrument", value: "violin" })}>Violin</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setNewFolderTheme({ type: "instrument", value: "bass" })}>Bass</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => { setNewFolderTheme({ type: "custom", value: "" }); setIsCreateFolderOpen(true); }}>
                    Upload custom image...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
                className="text-gray-600 hover:text-black"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                selectedFolder === null 
                  ? "border-black bg-gray-100" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <Folder className="h-8 w-8 text-gray-500" />
              </div>
              <span className="text-xs font-medium text-black">All Pieces</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group relative ${
                  selectedFolder === folder.id 
                    ? "border-black bg-gray-100" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                  {folder.imageUrl ? (
                    <img src={folder.imageUrl} alt={folder.name} className="w-full h-full object-cover" />
                  ) : folder.theme ? (
                    folder.theme.type === 'color' ? (
                      <div className="w-full h-full" style={{ background: folder.theme.value }} />
                    ) : folder.theme.type === 'instrument' ? (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {folder.theme.value === 'piano' && '🎹'}
                        {folder.theme.value === 'guitar' && '🎸'}
                        {folder.theme.value === 'violin' && '🎻'}
                        {folder.theme.value === 'bass' && '🎻'}
                      </div>
                    ) : (
                      <Folder className="h-8 w-8 text-gray-500" />
                    )
                  ) : (
                    <Folder className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <span className="text-xs font-medium text-black max-w-[64px] truncate">{folder.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Create Folder Modal */}
        {isCreateFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <Card className="w-full max-w-sm p-6 bg-white">
              <h3 className="text-lg font-bold mb-4 text-black">Create New Folder</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Image (optional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {newFolderImage ? (
                      <img src={newFolderImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : newFolderTheme ? (
                      newFolderTheme.type === 'color' ? (
                        <div className="w-full h-full" style={{ background: newFolderTheme.value }} />
                      ) : newFolderTheme.type === 'instrument' ? (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {newFolderTheme.value === 'piano' && '🎹'}
                          {newFolderTheme.value === 'guitar' && '🎸'}
                          {newFolderTheme.value === 'violin' && '🎻'}
                          {newFolderTheme.value === 'bass' && '🎻'}
                        </div>
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleFolderImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Beethoven Pieces"
                  className="bg-gray-50 border-gray-200 text-black"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} className="flex-1 border-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} className="flex-1 bg-black text-white hover:bg-gray-800">
                  Create
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-black text-white" : "border-gray-300 text-black"}
          >
            All ({pieces.filter(p => !selectedFolder || p.folderId === selectedFolder).length})
          </Button>
          <Button
            variant={filter === "progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("progress")}
            className={filter === "progress" ? "bg-black text-white" : "border-gray-300 text-black"}
          >
            In Progress
          </Button>
          <Button
            variant={filter === "mastered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("mastered")}
            className={filter === "mastered" ? "bg-black text-white" : "border-gray-300 text-black"}
          >
            Mastered
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="pl-10 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Pieces List */}
        {filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No pieces found</p>
            <p className="text-sm text-gray-500 mt-1">Add some pieces to your library</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPieces.map((piece) => (
              <Card key={piece.id} className="p-4 group bg-white border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-gray-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate text-black">{piece.title}</h3>
                        <p className="text-sm text-gray-600">{piece.artist}</p>
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
                        className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
                      />
                      <span className="text-xs text-gray-600 w-8 text-right">{piece.progress}%</span>
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
          className="w-full mt-6 gap-2 bg-black text-white hover:bg-gray-800 h-12"
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
