"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePremium } from "./PremiumContext";

export type ThemeMode = "light" | "dark";
export type ThemeColor = "default" | "pink" | "blue" | "grey" | "black";

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  canUseThemes: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS = {
  default: {
    primary: "hsl(0, 0%, 9%)",
    accent: "hsl(262, 83%, 58%)",
    background: "hsl(0, 0%, 100%)",
    backgroundDark: "hsl(0, 0%, 7%)",
  },
  pink: {
    primary: "hsl(330, 100%, 50%)",
    accent: "hsl(330, 100%, 50%)",
    background: "hsl(330, 50%, 98%)",
    backgroundDark: "hsl(330, 20%, 10%)",
  },
  blue: {
    primary: "hsl(210, 100%, 50%)",
    accent: "hsl(210, 100%, 50%)",
    background: "hsl(210, 50%, 98%)",
    backgroundDark: "hsl(210, 20%, 10%)",
  },
  grey: {
    primary: "hsl(0, 0%, 40%)",
    accent: "hsl(0, 0%, 50%)",
    background: "hsl(0, 0%, 96%)",
    backgroundDark: "hsl(0, 0%, 12%)",
  },
  black: {
    primary: "hsl(0, 0%, 100%)",
    accent: "hsl(0, 0%, 80%)",
    background: "hsl(0, 0%, 5%)",
    backgroundDark: "hsl(0, 0%, 5%)",
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [color, setColorState] = useState<ThemeColor>("default");
  const { isPremium, isTrialActive } = usePremium();
  
  const canUseThemes = isPremium || isTrialActive;

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null;
    const savedColor = localStorage.getItem("theme-color") as ThemeColor | null;
    
    if (savedMode) setModeState(savedMode);
    if (savedColor && (isPremium || isTrialActive)) setColorState(savedColor);
  }, [isPremium, isTrialActive]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = THEME_COLORS[canUseThemes ? color : "default"];
    
    if (mode === "dark" || color === "black") {
      root.classList.add("dark");
      root.style.setProperty("--background", theme.backgroundDark);
      root.style.setProperty("--foreground", "hsl(0, 0%, 98%)");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--background", theme.background);
      root.style.setProperty("--foreground", "hsl(0, 0%, 3.9%)");
    }
    
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--accent", theme.accent);
  }, [mode, color, canUseThemes]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const setColor = (newColor: ThemeColor) => {
    if (!canUseThemes && newColor !== "default") return;
    setColorState(newColor);
    localStorage.setItem("theme-color", newColor);
  };

  return (
    <ThemeContext.Provider value={{ mode, color, setMode, setColor, canUseThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

