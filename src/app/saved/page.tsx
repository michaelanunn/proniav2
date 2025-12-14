"use client";

import { Layout } from "@/components/Layout";
import { Bookmark } from "lucide-react";

export default function Saved() {
  return (
    <Layout streak={0}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>
        
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-6">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved posts</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            When you save a post, it will appear here for easy access later.
          </p>
        </div>
      </div>
    </Layout>
  );
}
