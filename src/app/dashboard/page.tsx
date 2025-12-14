"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Lock, Loader2, ExternalLink, Crown, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePractice } from "@/contexts/PracticeContext";
import { useSpotify } from "@/contexts/SpotifyContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useState, useEffect } from "react";

interface MasteringPiece {
  id: string;
  title: string;
  composer: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { sessions, getWeeklyPracticeTime, getWeeklyPracticeByDay } = usePractice();
  const { isConnected, isLoading: spotifyLoading, recentTracks, connect, disconnect } = useSpotify();
  const { isPremium, isTrialActive, openPaywall } = usePremium();
  
  const [masteringPieces, setMasteringPieces] = useState<MasteringPiece[]>([]);
  const [isAddingPiece, setIsAddingPiece] = useState(false);
  const [newPieceTitle, setNewPieceTitle] = useState("");
  const [newPieceComposer, setNewPieceComposer] = useState("");
  
  const hasPremiumAccess = isPremium || isTrialActive;
  const weeklyPractice = getWeeklyPracticeByDay();
  const weeklyPracticeHours = getWeeklyPracticeTime() / 3600;
  const maxHours = Math.max(...weeklyPractice.map(d => d.hours), 0.1);
  
  // Calculate streak from sessions
  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  // Load mastering pieces from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-mastering");
    if (saved) {
      setMasteringPieces(JSON.parse(saved));
    }
  }, []);

  // Save mastering pieces to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard-mastering", JSON.stringify(masteringPieces));
  }, [masteringPieces]);
  
  const formatHours = (hours: number) => {
    if (hours >= 1) {
      return `${hours.toFixed(1)}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  const handleAddPiece = () => {
    if (!newPieceTitle.trim()) return;
    if (masteringPieces.length >= 3) return;
    
    const newPiece: MasteringPiece = {
      id: Date.now().toString(),
      title: newPieceTitle,
      composer: newPieceComposer,
    };
    
    setMasteringPieces([...masteringPieces, newPiece]);
    setNewPieceTitle("");
    setNewPieceComposer("");
    setIsAddingPiece(false);
  };

  const handleRemovePiece = (id: string) => {
    setMasteringPieces(masteringPieces.filter(p => p.id !== id));
  };

  return (
    <Layout streak={streak}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Dashboard</h1>

        <Button 
          size="lg" 
          className="w-full mb-6 bg-black text-white hover:bg-gray-800 h-12 font-semibold"
          onClick={() => router.push("/record")}
        >
          Start Practicing
        </Button>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Practice Time</span>
            </div>
            <p className="text-3xl font-bold text-black">{formatHours(weeklyPracticeHours)}</p>
            <p className="text-xs text-gray-500">This week</p>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Sessions</span>
            </div>
            <p className="text-3xl font-bold text-black">{sessions.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Streak</span>
            </div>
            <p className="text-3xl font-bold text-black">{streak}</p>
            <p className="text-xs text-gray-500">Days</p>
          </Card>
        </div>

        <Card className="p-6 mb-6 bg-white border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-black">Weekly Practice</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyPractice.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-black rounded-t-lg" />
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Currently Mastering - Max 3 pieces, user adds them */}
        <Card className="p-6 mb-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Currently Mastering</h2>
            {masteringPieces.length < 3 && !isAddingPiece && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingPiece(true)}
                className="text-gray-600 hover:text-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {masteringPieces.length === 0 && !isAddingPiece ? (
            <div className="text-center py-8">
              <Music className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No pieces yet</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddingPiece(true)}
                className="mt-2 text-black"
              >
                Add your first piece →
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {masteringPieces.map((piece) => (
                <div key={piece.id} className="flex items-center gap-4 group">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-black">{piece.title}</h3>
                    {piece.composer && (
                      <p className="text-sm text-gray-500">{piece.composer}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemovePiece(piece.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}

              {isAddingPiece && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Input
                    value={newPieceTitle}
                    onChange={(e) => setNewPieceTitle(e.target.value)}
                    placeholder="Piece title"
                    className="mb-2 bg-white border-gray-200 text-black"
                  />
                  <Input
                    value={newPieceComposer}
                    onChange={(e) => setNewPieceComposer(e.target.value)}
                    placeholder="Composer (optional)"
                    className="mb-3 bg-white border-gray-200 text-black"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setIsAddingPiece(false); setNewPieceTitle(""); setNewPieceComposer(""); }}
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddPiece}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                      disabled={!newPieceTitle.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {masteringPieces.length > 0 && masteringPieces.length < 3 && !isAddingPiece && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              {3 - masteringPieces.length} more slot{3 - masteringPieces.length > 1 ? 's' : ''} available
            </p>
          )}
        </Card>

        {/* Spotify Integration Card */}
        <Card className="p-6 overflow-hidden bg-white border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black">Spotify Listening</h2>
                {!hasPremiumAccess && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Crown className="h-3 w-3" />
                    <span>Premium Feature</span>
                  </div>
                )}
              </div>
            </div>
            
            {!hasPremiumAccess ? (
              <Button 
                size="sm" 
                className="bg-black text-white hover:bg-gray-800"
                onClick={openPaywall}
              >
                <Lock className="mr-1 h-3 w-3" />
                Unlock
              </Button>
            ) : isConnected ? (
              <Button variant="outline" size="sm" onClick={disconnect} className="border-gray-300 text-black">
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-[#1DB954] hover:bg-[#1aa34a] text-white"
                onClick={connect}
                disabled={spotifyLoading}
              >
                {spotifyLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>

          {!hasPremiumAccess ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Connect your Spotify account to import your listening history and discover new classical pieces to learn.
              </p>
              <Button 
                variant="link" 
                className="text-black p-0 h-auto mt-2"
                onClick={openPaywall}
              >
                Start free trial →
              </Button>
            </div>
          ) : isConnected ? (
            <div className="space-y-3">
              {spotifyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : recentTracks.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mb-3">Recently played</p>
                  {recentTracks.slice(0, 5).map((track) => (
                    <div key={`${track.id}-${track.playedAt}`} className="flex items-center gap-3">
                      {track.albumArt ? (
                        <img 
                          src={track.albumArt} 
                          alt={track.album}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          <Music className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-black">{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No recent tracks found. Start listening on Spotify!
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Connect your Spotify account to import your listening history and discover new pieces to learn.
            </p>
          )}
        </Card>
      </div>
    </Layout>
  );
}
