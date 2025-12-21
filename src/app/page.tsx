"use client";


import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      {/* Logo */}
      <div className="w-full flex justify-center mt-12 mb-6">
        <BrandMark href="/" className="h-12" />
      </div>

      {/* Tagline */}
      <div className="mb-8 text-center">
        <span
          style={{ fontFamily: 'Courier New, Courier, monospace', fontSize: '1.1rem' }}
          className="text-gray-700"
        >
          The social media app if you play an instrument
        </span>
      </div>

      {/* Buttons */}
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
  );
}
