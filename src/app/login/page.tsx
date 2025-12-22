"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push("/feed");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center bg-stone-200 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 
          className="text-4xl font-bold text-black mb-8 text-center tracking-tight"
          style={{ fontFamily: "Times New Roman, Times, serif" }}
        >
          PRONIA
        </h1>

        {/* Card */}
        <div className="bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-stone-300">
          <h2 
            className="text-2xl font-bold text-center mb-8 tracking-tight"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Welcome back
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 border border-black bg-white text-black tracking-wide hover:bg-stone-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 mb-6"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-stone-300"></div>
            <span 
              className="px-4 text-sm text-stone-400"
              style={{ fontFamily: "Courier New, Courier, monospace" }}
            >
              or
            </span>
            <div className="flex-1 border-t border-stone-300"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-4 px-4 bg-white border border-stone-300 focus:outline-none focus:border-black text-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full py-4 px-4 pr-12 bg-white border border-stone-300 focus:outline-none focus:border-black text-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white tracking-wide hover:bg-gray-900 transition-colors disabled:opacity-50"
              style={{ fontFamily: "Times New Roman, Times, serif" }}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-stone-500 hover:text-black transition-colors"
              style={{ fontFamily: "Courier New, Courier, monospace" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign Up Link */}
        <p 
          className="mt-8 text-center text-sm text-stone-600"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black font-semibold hover:underline">
            Sign up
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-stone-400 hover:text-black transition-colors"
            style={{ fontFamily: "Courier New, Courier, monospace" }}
          >
            ←
          </Link>
        </div>
      </div>
    </div>
  );
}
