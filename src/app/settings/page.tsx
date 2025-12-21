"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import {
  User,
  Bell,
  Download,
  FileText,
  Info,
  LogOut,
  Trash2,
  Mail,
  Lock,
  Clock,
  Flame,
  ExternalLink,
  Loader2,
  Check,
  X,
} from "lucide-react";

interface UserPreferences {
  practice_reminder_enabled: boolean;
  practice_reminder_time: string;
  streak_alerts_enabled: boolean;
}

export default function Settings() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    practice_reminder_enabled: false,
    practice_reminder_time: "09:00",
    streak_alerts_enabled: true,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data && !error) {
        setPreferences({
          practice_reminder_enabled: data.practice_reminder_enabled ?? false,
          practice_reminder_time: data.practice_reminder_time ?? "09:00",
          streak_alerts_enabled: data.streak_alerts_enabled ?? true,
        });
      }
    };
    
    loadPreferences();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (error) throw error;
      setPasswordResetSent(true);
    } catch (error) {
      console.error("Error sending password reset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE" || !user) return;
    
    setIsLoading(true);
    try {
      // Delete user data first (practice sessions, etc.)
      await supabase.from("practice_sessions").delete().eq("user_id", user.id);
      await supabase.from("user_preferences").delete().eq("id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      
      // Sign out the user (actual account deletion requires admin API)
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleTogglePreference = async (key: keyof UserPreferences, value: boolean | string) => {
    if (!user) return;
    
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSavingPreferences(true);
    
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          id: user.id,
          ...newPreferences,
        });
      
      if (error) throw error;
      
      // Request notification permission if enabling reminders
      if (key === "practice_reminder_enabled" && value === true) {
        if ("Notification" in window && Notification.permission !== "granted") {
          await Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch("/api/export-data");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pronia-practice-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Account Section */}
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    {passwordResetSent ? "Reset email sent!" : "••••••••"}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePasswordReset}
                disabled={isLoading || passwordResetSent}
              >
                {passwordResetSent ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Sent
                  </>
                ) : (
                  "Change"
                )}
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Practice Reminders</p>
                  <p className="text-sm text-muted-foreground">Daily reminder to practice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preferences.practice_reminder_enabled && (
                  <Input
                    type="time"
                    value={preferences.practice_reminder_time}
                    onChange={(e) => handleTogglePreference("practice_reminder_time", e.target.value)}
                    className="w-24 h-8 text-sm"
                  />
                )}
                <button
                  onClick={() => handleTogglePreference("practice_reminder_enabled", !preferences.practice_reminder_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.practice_reminder_enabled ? "bg-foreground" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      preferences.practice_reminder_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Streak Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about your streak</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePreference("streak_alerts_enabled", !preferences.streak_alerts_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.streak_alerts_enabled ? "bg-foreground" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    preferences.streak_alerts_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Data Section */}
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">Data</h2>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleExportData}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Practice History
          </Button>
        </Card>

        {/* Legal Section */}
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">Legal</h2>
          </div>
          
          <div className="space-y-2">
            <a 
              href="/tos" 
              target="_blank"
              className="flex items-center justify-between py-3 border-b border-border hover:bg-gray-50 rounded px-2 -mx-2"
            >
              <span className="text-sm font-medium">Terms of Service</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="/privacy" 
              target="_blank"
              className="flex items-center justify-between py-3 hover:bg-gray-50 rounded px-2 -mx-2"
            >
              <span className="text-sm font-medium">Privacy Policy</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">About</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-muted-foreground">1.0.2</span>
            </div>
            
            <a 
              href="mailto:support@pronia.app"
              className="flex items-center justify-between py-3 border-b border-border hover:bg-gray-50 rounded px-2 -mx-2"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contact Support</span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Account</h2>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Type DELETE to confirm
                </label>
                <Input
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
