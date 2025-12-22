"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "./AuthContext";

interface PracticeSession {
  id: string;
  date: string;
  duration: number; // in seconds
  piece?: string;
  composer?: string;
  notes?: string;
}

interface PracticeContextType {
  sessions: PracticeSession[];
  isLoading: boolean;
  addSession: (session: Omit<PracticeSession, "id">) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getTotalPracticeTime: () => number; // in seconds
  getWeeklyPracticeTime: () => number; // in seconds
  getWeeklyPracticeByDay: () => { day: string; hours: number }[];
  getStreak: () => number; // consecutive days of practice
  refreshSessions: () => Promise<void>;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sessions from Supabase
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("practiced_at", { ascending: false });

      if (error) {
        // Table might not exist yet
        if (error.code === "42P01") {
          console.log("Practice sessions table not found, using empty state");
          setSessions([]);
        } else {
          console.error("Error fetching sessions:", error);
        }
      } else {
        setSessions(
          (data || []).map((s) => ({
            id: s.id,
            date: s.practiced_at,
            duration: s.duration,
            piece: s.piece || undefined,
            composer: s.composer || undefined,
            notes: s.notes || undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Load sessions on mount and when user changes
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const refreshSessions = async () => {
    await fetchSessions();
  };

  const addSession = async (session: Omit<PracticeSession, "id">) => {
    if (!user) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newSession: PracticeSession = {
      ...session,
      id: tempId,
    };
    setSessions((prev) => [newSession, ...prev]);

    try {
      const { data, error } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: user.id,
          duration: session.duration,
          piece: session.piece || null,
          composer: session.composer || null,
          notes: session.notes || null,
          practiced_at: session.date,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding session:", error);
        // Revert optimistic update
        setSessions((prev) => prev.filter((s) => s.id !== tempId));
      } else if (data) {
        // Replace temp with real data
        setSessions((prev) =>
          prev.map((s) =>
            s.id === tempId
              ? {
                  id: data.id,
                  date: data.practiced_at,
                  duration: data.duration,
                  piece: data.piece || undefined,
                  composer: data.composer || undefined,
                  notes: data.notes || undefined,
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setSessions((prev) => prev.filter((s) => s.id !== tempId));
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;

    // Optimistic update
    const previousSessions = [...sessions];
    setSessions((prev) => prev.filter((session) => session.id !== id));

    try {
      const { error } = await supabase
        .from("practice_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting session:", error);
        // Revert
        setSessions(previousSessions);
      }
    } catch (err) {
      console.error("Error:", err);
      setSessions(previousSessions);
    }
  };

  const getTotalPracticeTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyPracticeTime = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return sessions
      .filter((session) => new Date(session.date) >= weekStart)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyPracticeByDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const dayTotals: Record<string, number> = {};
    days.forEach((day) => (dayTotals[day] = 0));

    sessions
      .filter((session) => new Date(session.date) >= weekStart)
      .forEach((session) => {
        const sessionDate = new Date(session.date);
        const dayName = days[sessionDate.getDay()];
        dayTotals[dayName] += session.duration / 3600; // Convert to hours
      });

    return days.map((day) => ({
      day,
      hours: Math.round(dayTotals[day] * 10) / 10,
    }));
  };

  const getStreak = () => {
    if (sessions.length === 0) return 0;

    // Get unique practice dates (normalized to start of day)
    const practiceDates = new Set<string>();
    sessions.forEach((session) => {
      const date = new Date(session.date);
      date.setHours(0, 0, 0, 0);
      practiceDates.add(date.toISOString());
    });

    // Sort dates in descending order
    const sortedDates = Array.from(practiceDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // Check if there's practice today or yesterday (streak can continue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentPractice = sortedDates[0];
    if (mostRecentPractice.getTime() < yesterday.getTime()) {
      return 0; // Streak broken - no practice today or yesterday
    }

    // Count consecutive days
    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i];
      const next = sortedDates[i + 1];
      const diffDays = Math.round(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <PracticeContext.Provider
      value={{
        sessions,
        isLoading,
        addSession,
        deleteSession,
        getTotalPracticeTime,
        getWeeklyPracticeTime,
        getWeeklyPracticeByDay,
        getStreak,
        refreshSessions,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
};
