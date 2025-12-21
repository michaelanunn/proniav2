"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePractice } from "@/contexts/PracticeContext";
// SPOTIFY PREMIUM FEATURE - COMMENTED OUT FOR FREE VERSION
// import { Lock, Loader2, ExternalLink, Crown } from "lucide-react";
// import { useSpotify } from "@/contexts/SpotifyContext";
// import { usePremium } from "@/contexts/PremiumContext";

const currentSongs = [
  { title: "Moonlight Sonata", artist: "Beethoven" },
  { title: "Clair de Lune", artist: "Debussy" },
  { title: "Für Elise", artist: "Beethoven" },
];

export default function Dashboard() {
  const router = useRouter();
  const { getWeeklyPracticeTime, getWeeklyPracticeByDay } = usePractice();
  
  // SPOTIFY PREMIUM FEATURE - COMMENTED OUT FOR FREE VERSION
  // const { isConnected, isLoading, recentTracks, connect, disconnect } = useSpotify();
  // const { isPremium, isTrialActive, openPaywall } = usePremium();
  // const hasPremiumAccess = isPremium || isTrialActive;
  
  const weeklyPractice = getWeeklyPracticeByDay();
  const weeklyPracticeHours = getWeeklyPracticeTime() / 3600;
  const maxHours = Math.max(...weeklyPractice.map(d => d.hours), 0.1);
  
  const formatHours = (hours: number) => {
    if (hours >= 1) {
      return `${hours.toFixed(1)}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  return (
    <Layout streak={7}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <Button 
          size="lg" 
          className="w-full mb-6"
          onClick={() => router.push("/record")}
        >
          Start Practicing
        </Button>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Practice Time</span>
            </div>
            <p className="text-3xl font-bold">{formatHours(weeklyPracticeHours)}</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Pieces Mastered</span>
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Practice Songs</span>
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">In library</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Practice</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyPractice.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-muted rounded-t-lg relative" style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-foreground rounded-t-lg" />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Currently Mastering</h2>
          <div className="space-y-3">
            {currentSongs.map((song) => (
              <div key={song.title} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SPOTIFY PREMIUM FEATURE - COMMENTED OUT FOR FREE VERSION
        <Card className="p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Spotify Listening</h2>
                {!hasPremiumAccess && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <Crown className="h-3 w-3" />
                    <span>Premium Feature</span>
                  </div>
                )}
              </div>
            </div>
            
            {!hasPremiumAccess ? (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                onClick={openPaywall}
              >
                <Lock className="mr-1 h-3 w-3" />
                Unlock
              </Button>
            ) : isConnected ? (
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-[#1DB954] hover:bg-[#1aa34a] text-white"
                onClick={connect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>

          {!hasPremiumAccess ? (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-700">
                Connect your Spotify account to import your listening history and discover new classical pieces to learn.
              </p>
              <Button 
                variant="link" 
                className="text-orange-600 p-0 h-auto mt-2"
                onClick={openPaywall}
              >
                Start free trial →
              </Button>
            </div>
          ) : isConnected ? (
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : recentTracks.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">Recently played</p>
                  {recentTracks.slice(0, 5).map((track) => (
                    <div key={`${track.id}-${track.playedAt}`} className="flex items-center gap-3">
                      {track.albumArt ? (
                        <img 
                          src={track.albumArt} 
                          alt={track.album}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <Music className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{track.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent tracks found. Start listening on Spotify!
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect your Spotify account to import your listening history and discover new pieces to learn.
            </p>
          )}
        </Card>
        */}
      </div>
    </Layout>
  );
}
