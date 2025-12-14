"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Feed() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <Layout streak={0}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-muted/50 border-0"
              onFocus={() => router.push("/explore")}
            />
          </div>

          <div className="flex items-center justify-center gap-8 border-b border-border">
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "for-you"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("for-you")}
            >
              For You
            </button>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "following"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-6">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {activeTab === "following" 
              ? "Follow other musicians to see their posts here"
              : "Be the first to share your practice! Record a session to get started."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/record")}>
              Start Practicing
            </Button>
            <Button variant="outline" onClick={() => router.push("/explore")}>
              <Users className="mr-2 h-4 w-4" />
              Find Musicians
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
