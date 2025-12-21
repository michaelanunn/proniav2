"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  addSession: (session: Omit<PracticeSession, "id">) => void;
  deleteSession: (id: string) => void;
  getTotalPracticeTime: () => number; // in seconds
  getWeeklyPracticeTime: () => number; // in seconds
  getWeeklyPracticeByDay: () => { day: string; hours: number }[];
  getStreak: () => number; // consecutive days of practice
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

const STORAGE_KEY = "pronia_practice_sessions";

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  // Load stored sessions on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (session: Omit<PracticeSession, "id">) => {
    const newSession: PracticeSession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
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
        addSession,
        deleteSession,
        getTotalPracticeTime,
        getWeeklyPracticeTime,
        getWeeklyPracticeByDay,
        getStreak,
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

