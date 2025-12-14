"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Lock, Moon, Crown } from "lucide-react";
import { usePremium } from "@/contexts/PremiumContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import { PaywallModal } from "@/components/PaywallModal";

export default function Settings() {
  const { isPremium, isTrialActive } = usePremium();
  const { user, profile } = useAuth();
  const { sessions } = usePractice();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  useEffect(() => {
    const savedPrivate = localStorage.getItem("profile-private");
    if (savedPrivate) setIsPrivate(JSON.parse(savedPrivate));
    
    const savedDark = localStorage.getItem("dark-mode");
    if (savedDark) setIsDarkMode(JSON.parse(savedDark));
  }, []);

  const handlePrivateChange = (value: boolean) => {
    setIsPrivate(value);
    localStorage.setItem("profile-private", JSON.stringify(value));
  };

  const handleDarkModeChange = (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem("dark-mode", JSON.stringify(value));
    if (value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const userEmail = profile?.email || user?.email || "Not set";

  return (
    <Layout streak={streak}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Settings</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Account
            </h2>
            <Card className="divide-y divide-gray-100 bg-white border-gray-200">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-black">Private Profile</span>
                </div>
                <Switch 
                  checked={isPrivate} 
                  onCheckedChange={handlePrivateChange}
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium text-black">Email</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{userEmail}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Appearance */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Appearance
            </h2>
            <Card className="bg-white border-gray-200">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-black">Dark Mode</span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={handleDarkModeChange}
                />
              </div>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Notifications
            </h2>
            <Card className="divide-y divide-gray-100 bg-white border-gray-200">
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium text-black">Push Notifications</span>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium text-black">Email Updates</span>
                <Switch 
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </Card>
          </div>

          {/* Subscription */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Subscription
            </h2>
            <Card className="p-4 bg-white border-gray-200">
              {isPremium ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">Premium Active</p>
                    <p className="text-sm text-gray-600">You have full access to all features</p>
                  </div>
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
              ) : isTrialActive ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">Trial Active</p>
                    <p className="text-sm text-gray-600">Enjoying premium features</p>
                  </div>
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">Free Plan</p>
                    <p className="text-sm text-gray-600">Upgrade to unlock all features</p>
                  </div>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-800"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </Layout>
  );
}
