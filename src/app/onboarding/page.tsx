"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Eye, EyeOff } from "lucide-react";
import ProfilePicUploader from "@/components/ProfilePicUploader";

const instruments = [
  { id: "piano", name: "Piano" },
  { id: "guitar", name: "Guitar" },
  { id: "violin", name: "Violin" },
  { id: "drums", name: "Drums" },
  { id: "bass", name: "Bass" },
  { id: "vocals", name: "Vocals" },
];

const experienceLevels = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export default function Onboarding() {
  const router = useRouter();
  const { user, profile, isLoading, signInWithGoogle, signUpWithEmail, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [error, setError] = useState("");
  
  // Profile data
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [bio, setBio] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Email signup states
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check profile when user is loaded
  useEffect(() => {
    if (isLoading) return;
    
    // If not authenticated, redirect to signup
    if (!user) {
      router.push("/signup");
      return;
    }
    
    if (!hasCheckedProfile) {
      if (profile) {
        if (profile.name?.trim()) setName(profile.name);
        if (profile.username?.trim()) setUsername(profile.username);
        if (profile.instruments?.length > 0) setSelectedInstruments(profile.instruments);
        if (profile.experience_level?.trim()) setExperienceLevel(profile.experience_level);
        if (profile.bio?.trim()) setBio(profile.bio);
        if (profile.years_playing?.trim()) setYearsPlaying(profile.years_playing);
        if (profile.avatar_url?.trim()) setAvatarUrl(profile.avatar_url);
        
        const hasAllFields =
          profile.name?.trim() &&
          profile.username?.trim() &&
          Array.isArray(profile.instruments) && 
          profile.instruments.length > 0 &&
          profile.experience_level?.trim();
        
        if (hasAllFields) {
          router.push("/feed");
        } else {
          setStep(1);
        }
      } else {
        setStep(1);
      }
      
      setHasCheckedProfile(true);
    }
  }, [user, profile, isLoading, hasCheckedProfile, router]);

  const toggleInstrument = (id: string) => {
    if (selectedInstruments.includes(id)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== id));
    } else if (selectedInstruments.length < 3) {
      setSelectedInstruments([...selectedInstruments, id]);
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      setError("");
      
      try {
        await updateProfile({
          name,
          username,
          instruments: selectedInstruments,
          experience_level: experienceLevel,
          bio,
          years_playing: yearsPlaying,
          avatar_url: avatarUrl,
        });
        
        router.push("/feed");
      } catch (err: any) {
        setError(err?.message || "Failed to save profile");
        setIsSaving(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSaving(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
      setIsSaving(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (!signupName.trim()) {
        setError("Please enter your name");
        setIsSaving(false);
        return;
      }
      
      await signUpWithEmail(email, password, signupName);
      setName(signupName);
      setStep(1);
      setIsSaving(false);
    } catch (err: any) {
      if (err.message?.includes("5 seconds")) {
        setError("Please wait a few seconds before trying again");
      } else if (err.message?.includes("already registered")) {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return false;
      case 1:
        return name.trim() && username.trim();
      case 2:
        return selectedInstruments.length > 0;
      case 3:
        return experienceLevel.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Show loading while checking auth or redirecting
  if (isLoading || !user || !hasCheckedProfile) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center bg-amber-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 
          className="text-4xl font-bold text-black mb-10 text-center tracking-tight"
          style={{ fontFamily: "Times New Roman, Times, serif" }}
        >
          PRONIA
        </h1>

        {/* Card */}
        <div className="bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-amber-200">
          
          {/* Step 0: Sign Up Options */}
          {step === 0 && !user && (
            <>
              <h2 
                className="text-2xl font-bold text-center mb-10 tracking-wide"
                style={{ fontFamily: "Times New Roman, Times, serif", letterSpacing: "0.15em" }}
              >
                CREATE ACCOUNT
              </h2>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              {/* Terms Agreement Checkbox - applies to all signup methods */}
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <span className="text-xs text-gray-600">
                  I agree to the{" "}
                  <Link href="/tos" className="text-black font-medium hover:underline" target="_blank">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-black font-medium hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSaving || !agreedToTerms}
                className="w-full py-3 border border-gray-200 rounded-lg bg-white text-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
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
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
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
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full py-3 px-4 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !agreedToTerms}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 1: Profile Setup */}
          {step === 1 && (
            <>
              <h2 
                className="text-2xl font-bold text-center mb-10 tracking-wide"
                style={{ fontFamily: "Times New Roman, Times, serif", letterSpacing: "0.1em" }}
              >
                YOUR PROFILE
              </h2>
              
              <div className="flex justify-center mb-8">
                <ProfilePicUploader
                  avatarUrl={avatarUrl || profile?.avatar_url}
                  onUpload={(url) => setAvatarUrl(url)}
                  disabled={isSaving}
                />
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full py-4 px-4 bg-white border border-amber-200 focus:outline-none focus:border-black text-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                      placeholder="username"
                      className="w-full py-4 pl-9 pr-4 bg-white border border-amber-200 focus:outline-none focus:border-black text-black transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    className="w-full py-4 px-4 bg-white border border-amber-200 focus:outline-none focus:border-black text-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Years Playing</label>
                  <input
                    type="text"
                    value={yearsPlaying}
                    onChange={(e) => setYearsPlaying(e.target.value)}
                    placeholder="e.g. 2, 5, 10+"
                    className="w-full py-4 px-4 bg-white border border-amber-200 focus:outline-none focus:border-black text-black transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Instruments */}
          {step === 2 && (
            <>
              <h2 
                className="text-2xl font-bold text-center mb-4 tracking-wide"
                style={{ fontFamily: "Times New Roman, Times, serif", letterSpacing: "0.1em" }}
              >
                YOUR INSTRUMENTS
              </h2>
              <p 
                className="text-sm text-amber-700 text-center mb-8"
                style={{ fontFamily: "Courier New, Courier, monospace" }}
              >
                Select up to 3 instruments
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {instruments.map((instrument) => {
                  const isSelected = selectedInstruments.includes(instrument.id);
                  return (
                    <button
                      key={instrument.id}
                      onClick={() => toggleInstrument(instrument.id)}
                      className={`py-4 px-4 border transition-colors text-center font-medium ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-amber-200 hover:border-black bg-white"
                      }`}
                      style={{ fontFamily: "Times New Roman, Times, serif" }}
                    >
                      {instrument.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3: Experience Level */}
          {step === 3 && (
            <>
              <h2 
                className="text-2xl font-bold text-center mb-4 tracking-wide"
                style={{ fontFamily: "Times New Roman, Times, serif", letterSpacing: "0.1em" }}
              >
                YOUR LEVEL
              </h2>
              <p 
                className="text-sm text-amber-700 text-center mb-8"
                style={{ fontFamily: "Courier New, Courier, monospace" }}
              >
                Select your experience level
              </p>

              <div className="space-y-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full py-4 border transition-colors text-center font-medium ${
                      experienceLevel === level.id
                        ? "border-black bg-black text-white"
                        : "border-amber-200 hover:border-black bg-white"
                    }`}
                    style={{ fontFamily: "Times New Roman, Times, serif" }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-amber-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-amber-400" />
                  </div>
                )}
              </div>
              
              <h2 
                className="text-2xl font-bold mb-4 tracking-wide"
                style={{ fontFamily: "Times New Roman, Times, serif", letterSpacing: "0.1em" }}
              >
                ALL SET, {name.toUpperCase()}!
              </h2>
              <p 
                className="text-sm text-amber-700"
                style={{ fontFamily: "Courier New, Courier, monospace" }}
              >
                Welcome to Pronia. Start tracking your practice.
              </p>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step > 0 && (
            <div className="mt-8">
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={isSaving}
                    className="flex-1 py-4 border border-black text-black hover:bg-amber-50 transition-colors disabled:opacity-50"
                    style={{ fontFamily: "Times New Roman, Times, serif" }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                  className="flex-1 py-4 bg-black text-white tracking-wide hover:bg-amber-900 transition-colors disabled:opacity-50 disabled:bg-amber-200"
                  style={{ fontFamily: "Times New Roman, Times, serif" }}
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : step === 4 ? (
                    "Get Started"
                  ) : (
                    "Next"
                  )}
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 transition-colors ${
                      i <= step ? "bg-black" : "bg-amber-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Login Link (only on step 0) */}
        {step === 0 && !user && (
          <>
            <p 
              className="mt-10 text-center text-sm text-amber-800"
              style={{ fontFamily: "Courier New, Courier, monospace" }}
            >
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Log in
              </Link>
            </p>

            <div className="text-center mt-6">
              <Link 
                href="/" 
                className="text-sm text-amber-600 hover:text-black transition-colors"
                style={{ fontFamily: "Courier New, Courier, monospace" }}
              >
                ←
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
