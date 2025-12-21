"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, User, Loader2, Bell, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  type: "follow" | "like" | "comment";
  actor_id: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
  };
  post?: {
    id: string;
    caption: string;
  };
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select(`
            id,
            type,
            actor_id,
            post_id,
            read,
            created_at,
            actor:profiles!notifications_actor_id_fkey(id, username, name, avatar_url),
            post:posts(id, caption)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching notifications:", error);
          // If table doesn't exist, show empty state
          if (error.code === "42P01") {
            setNotifications([]);
          } else {
            setError("Failed to load notifications");
          }
        } else {
          // Transform the data to match our interface
          const transformed = (data || []).map((n: any) => ({
            ...n,
            actor: Array.isArray(n.actor) ? n.actor[0] : n.actor,
            post: Array.isArray(n.post) ? n.post[0] : n.post,
          }));
          setNotifications(transformed);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch the full notification with actor details
          const { data } = await supabase
            .from("notifications")
            .select(`
              id,
              type,
              actor_id,
              post_id,
              read,
              created_at,
              actor:profiles!notifications_actor_id_fkey(id, username, name, avatar_url),
              post:posts(id, caption)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const transformed = {
              ...data,
              actor: Array.isArray(data.actor) ? data.actor[0] : data.actor,
              post: Array.isArray(data.post) ? data.post[0] : data.post,
            };
            setNotifications((prev) => [transformed, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mark notification as read and navigate
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }

    // Navigate based on type
    if (notification.type === "follow") {
      router.push(`/user/${notification.actor?.username}`);
    } else if (notification.type === "like" && notification.post_id) {
      router.push(`/feed`); // TODO: Navigate to specific post
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <User className="h-5 w-5" />;
      case "like":
        return <Heart className="h-5 w-5 fill-red-500 text-red-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const name = notification.actor?.name || "Someone";
    switch (notification.type) {
      case "follow":
        return `${name} started following you`;
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      default:
        return "New notification";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Log in to see when people follow you or like your posts.
            </p>
            <Button onClick={() => router.push("/login")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-muted-foreground"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-sm">
              When people follow you or like your posts, you&apos;ll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.read ? "bg-primary/5 border-primary/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {notification.actor?.avatar_url ? (
                    <img
                      src={notification.actor.avatar_url}
                      alt={notification.actor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>

                {/* Icon indicator */}
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
