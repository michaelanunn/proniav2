"use client";

import { Flame, User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { ProfilePopup } from "./ProfilePopup";
import { useAuth } from "@/contexts/AuthContext";
import { BrandMark } from "./BrandMark";

interface TopBarProps {
  streak?: number;
  showBranding?: boolean;
}

export const TopBar = ({ streak = 0, showBranding = true }: TopBarProps) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { profile } = useAuth();

  const avatarUrl = profile?.avatar_url;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="h-8" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm font-semibold">{streak}</span>
                <Flame className="h-4 w-4 text-[#ff6b35]" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => setShowProfilePopup(true)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
              </Button>
            </div>
          </div>

          {showBranding && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">
                <BrandMark href="/feed" />
              </div>
            </div>
          )}
        </div>
      </header>

      <ProfilePopup 
        isOpen={showProfilePopup} 
        onClose={() => setShowProfilePopup(false)} 
      />
    </>
  );
};
