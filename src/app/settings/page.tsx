"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Lock, Moon, Palette, Crown } from "lucide-react";
// import { useTheme, ThemeColor } from "@/contexts/ThemeContext";
import { usePremium } from "@/contexts/PremiumContext";
import { PaywallModal } from "@/components/PaywallModal";

// Theme colors removed (ThemeContext missing)
const themeColors: any[] = [];

export default function Settings() {
  // ThemeContext removed - so we'll manage theme locally
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [color, setColor] = useState("default");
  
  const { isPremium, isTrialActive, startTrial } = usePremium();
  const canUseThemes = isPremium || isTrialActive;
  
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);


          {/* Appearance */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Appearance
            </h2>
            <Card className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Dark Mode</span>
                </div>
                <Switch 
                  checked={mode === "dark"} 
                  onCheckedChange={(checked) => setMode(checked ? "dark" : "light")}
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Theme Color</span>
                  {!canUseThemes && (
                    <span className="ml-auto flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3 mt-2">
                  {themeColors.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleColorChange(theme.id)}
                      className={`relative w-10 h-10 rounded-full transition-all ${
                        color === theme.id ? "ring-2 ring-offset-2 ring-accent scale-110" : "hover:scale-105"
                      } ${!canUseThemes && theme.id !== "default" ? "opacity-50" : ""}`}
                      style={{ backgroundColor: mode === "dark" ? theme.darkColor : theme.color }}
                      title={theme.name}
                    >
                      {!canUseThemes && theme.id !== "default" && (
                        <Lock className="absolute inset-0 m-auto h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Notifications
            </h2>
            <Card className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium">Push Notifications</span>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium">Email Updates</span>
                <Switch 
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </Card>
          </div>

          {/* Subscription */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Subscription
            </h2>
            <Card className="p-4">
              {isPremium ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-accent">Premium Active</p>
                    <p className="text-sm text-muted-foreground">You have full access to all features</p>
                  </div>
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
              ) : isTrialActive ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-accent">Trial Active</p>
                    <p className="text-sm text-muted-foreground">Enjoying premium features</p>
                  </div>
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Upgrade to unlock all features</p>
                  </div>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold text-sm"
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