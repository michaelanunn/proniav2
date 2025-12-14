"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePractice } from "@/contexts/PracticeContext";

export default function Feed() {
  const router = useRouter();
  const { sessions } = usePractice();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  // Calculate streak from sessions
  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  return (
    <Layout streak={streak}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-gray-100 border-gray-200 text-black placeholder:text-gray-500"
              onFocus={() => router.push("/explore")}
            />
          </div>

          <div className="flex items-center justify-center gap-8 border-b border-gray-200">
            <button
              className={`pb-3 px-1 text-sm font-semibold transition-colors ${
                activeTab === "for-you"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("for-you")}
            >
              For You
            </button>
            <button
              className={`pb-3 px-1 text-sm font-semibold transition-colors ${
                activeTab === "following"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
            <Music className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-black">No posts yet</h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {activeTab === "following" 
              ? "Follow other musicians to see their posts here"
              : "Be the first to share your practice! Record a session to get started."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push("/record")}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Start Practicing
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/explore")}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              <Users className="mr-2 h-4 w-4" />
              Find Musicians
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
