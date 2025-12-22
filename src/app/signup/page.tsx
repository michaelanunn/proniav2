"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Signup() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, name);
      setSuccess(true);
    } catch (err: any) {
      if (err.message?.includes("5 seconds")) {
        setError("Please wait a few seconds before trying again.");
      } else if (err.message?.includes("already registered")) {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError(err.message || "Failed to sign up. Please try again.");
      }
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
      setError(err.message || "Failed to sign up with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center bg-stone-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 
          className="text-3xl font-bold text-black mb-6 text-center"
          style={{ fontFamily: "Times New Roman, Times, serif" }}
        >
          PRONIA
        </h1>

        {/* Card */}
        <div className="bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-stone-200">
          {success ? (
            // Success State - Account Created
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "Times New Roman, Times, serif" }}
              >
                Account Created!
              </h2>
              <p className="text-stone-600 mb-6 text-sm">
                Check your email to verify your account, then log in to get started.
              </p>
              <Link 
                href="/login"
                className="block w-full py-3 bg-black text-white hover:bg-stone-800 transition-colors text-center"
                style={{ fontFamily: "Times New Roman, Times, serif" }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 
                className="text-xl font-semibold text-center mb-6"
                style={{ fontFamily: "Times New Roman, Times, serif" }}
              >
                Create your account
              </h2>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 border border-black bg-white text-black hover:bg-stone-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
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
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-stone-200"></div>
                <span className="px-4 text-sm text-stone-400">or</span>
                <div className="flex-1 border-t border-stone-200"></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full py-3 px-4 bg-white border border-stone-200 focus:outline-none focus:border-black text-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-3 px-4 bg-white border border-stone-200 focus:outline-none focus:border-black text-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full py-3 px-4 pr-12 bg-white border border-stone-200 focus:outline-none focus:border-black text-black transition-colors"
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
                  className="w-full py-3 bg-black text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              {/* Terms Agreement Text */}
              <p className="mt-4 text-xs text-center text-stone-500">
                By signing up, I agree to the{" "}
                <Link href="/tos" className="text-black hover:underline" target="_blank">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-black hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Login Link */}
        {!success && (
          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-semibold hover:underline">
              Log in
            </Link>
          </p>
        )}

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link 
            href="/" 
            className="text-sm text-stone-400 hover:text-black transition-colors"
          >
            ←
          </Link>
        </div>
      </div>
    </div>
  );
}
