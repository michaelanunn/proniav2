"use client";

import { Layout } from "@/components/Layout";

export default function Settings() {
  return (
    <Layout streak={0}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1>Settings Page</h1>
        <p>This is a minimal settings page</p>
      </div>
    </Layout>
  );
}