"use client";

import { Layout } from "@/components/Layout";
import { Bookmark } from "lucide-react";
import { usePractice } from "@/contexts/PracticeContext";

export default function Saved() {
  const { sessions } = usePractice();
  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  return (
    <Layout streak={streak}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Saved Posts</h1>
        
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
            <Bookmark className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-black">No saved posts</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            When you save a post, it will appear here for easy access later.
          </p>
        </div>
      </div>
    </Layout>
  );
}
