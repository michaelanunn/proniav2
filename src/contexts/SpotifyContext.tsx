"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePremium } from "./PremiumContext";

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  playedAt?: string;
}

interface SpotifyContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  recentTracks: SpotifyTrack[];
  topTracks: SpotifyTrack[];
  connect: () => void;
  disconnect: () => void;
  refreshData: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

const STORAGE_KEY = "pronia_spotify_token";

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const { isPremium, isTrialActive, openPaywall } = usePremium();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);

  // Check if user has premium access
  const hasPremiumAccess = isPremium || isTrialActive;

  // Load token from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.accessToken && data.expiresAt > Date.now()) {
        setAccessToken(data.accessToken);
        setIsConnected(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Fetch Spotify data when connected
  useEffect(() => {
    if (isConnected && accessToken) {
      refreshData();
    }
  }, [isConnected, accessToken]);

  const connect = () => {
    // Check premium access first
    if (!hasPremiumAccess) {
      openPaywall();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${window.location.origin}/api/spotify/callback`;
    
    const scopes = [
      "user-read-recently-played",
      "user-top-read",
      "user-read-currently-playing",
      "user-library-read",
    ].join(" ");

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", clientId || "");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("show_dialog", "true");

    window.location.href = authUrl.toString();
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setIsConnected(false);
    setRecentTracks([]);
    setTopTracks([]);
  };

  const refreshData = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent tracks
      const recentRes = await fetch("/api/spotify/recent-tracks", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentTracks(data.tracks || []);
      }

      // Fetch top tracks
      const topRes = await fetch("/api/spotify/top-tracks", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (topRes.ok) {
        const data = await topRes.json();
        setTopTracks(data.tracks || []);
      }
    } catch (err) {
      setError("Failed to fetch Spotify data");
      console.error("Spotify fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle callback from Spotify OAuth
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("spotify_code");
      const token = params.get("spotify_token");
      const expiresIn = params.get("spotify_expires_in");

      if (token && expiresIn) {
        const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: token, expiresAt }));
        setAccessToken(token);
        setIsConnected(true);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleCallback();
  }, []);

  return (
    <SpotifyContext.Provider
      value={{
        isConnected,
        isLoading,
        error,
        recentTracks,
        topTracks,
        connect,
        disconnect,
        refreshData,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
};

