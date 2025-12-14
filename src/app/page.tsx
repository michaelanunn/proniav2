"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If logged in, redirect to feed
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/feed");
    }
  }, [user, isLoading, router]);

  // If logged in and done loading, show nothing while redirecting
  if (user && !isLoading) {
    return null;
  }

  // Always show the landing page - don't wait for auth
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="w-full py-6 px-6 flex justify-center">
        <BrandMark href="/" className="h-10" />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-2xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Track Your Musical Journey
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-lg mx-auto">
            Practice smarter, connect with musicians, and watch your skills grow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors text-center min-w-[160px]"
            >
              LOG IN
            </Link>
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg border-2 border-black hover:bg-gray-50 transition-colors text-center min-w-[160px]"
            >
              SIGN UP
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mb-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Practice</h3>
            <p className="text-gray-600 text-sm">Log your sessions and see your progress over time.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect</h3>
            <p className="text-gray-600 text-sm">Follow musicians and share your musical journey.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Build Library</h3>
            <p className="text-gray-600 text-sm">Organize your repertoire and master new pieces.</p>
          </div>
        </div>

        {/* Testimonials Section - Placeholder */}
        <section className="w-full max-w-4xl">
          <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            What Musicians Are Saying
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Testimonial Placeholder 1 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <p className="text-gray-600 italic mb-4">
                &ldquo;Add your testimonial here...&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">Name</p>
                  <p className="text-xs text-gray-500">Instrument</p>
                </div>
              </div>
            </div>
            {/* Testimonial Placeholder 2 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <p className="text-gray-600 italic mb-4">
                &ldquo;Add your testimonial here...&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">Name</p>
                  <p className="text-xs text-gray-500">Instrument</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p 
            className="text-lg font-bold"
            style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
          >
            PRONIA
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Pronia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
