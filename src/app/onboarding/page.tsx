"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Piano, Guitar, Mic, User, Loader2, Eye, EyeOff, Camera, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const instruments = [
  { id: "piano", name: "Piano", icon: Piano },
  { id: "guitar", name: "Guitar", icon: Guitar },
  { id: "violin", name: "Violin", icon: Mic },
  { id: "drums", name: "Drums", icon: Mic },
  { id: "bass", name: "Bass", icon: Guitar },
  { id: "vocals", name: "Vocals", icon: Mic },
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
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Email signup states
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // If we've marked onboarding as complete, don't interfere with redirect
    if (onboardingComplete) return;
    
    // If user is logged in but profile is missing, show step 1 immediately
    if (user && !profile && !isLoading && step === 0) {
      setStep(1);
      return;
    }
    
    if (profile) {
      // Only set values from profile if we haven't started editing yet (step 0)
      if (step === 0) {
        setName(profile.name || "");
        setUsername(profile.username || "");
        setSelectedInstruments(profile.instruments || []);
        setExperienceLevel(profile.experience_level || "");
        setYearsPlaying(profile.years_playing || "");
        setAvatarUrl(profile.avatar_url || null);
      }
      
      const hasAllFields =
        profile.name?.trim() &&
        profile.username?.trim() &&
        Array.isArray(profile.instruments) && profile.instruments.length > 0 &&
        profile.experience_level?.trim();
      
      // Only redirect to feed if ALL onboarding fields are complete AND we're at step 0
      if (hasAllFields && step === 0) {
        router.push("/feed");
      } else if (step === 0) {
        // Advance to step 1 if we're still at step 0
        setStep(1);
      }
    }
  }, [user, profile, isLoading, router, step, onboardingComplete]);

  const toggleInstrument = (id: string) => {
    if (selectedInstruments.includes(id)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== id));
    } else if (selectedInstruments.length < 3) {
      setSelectedInstruments([...selectedInstruments, id]);
    }
  };

  const handleNext = async () => {
    // If at step 0 with user (showing step 1 content), go to step 2
    const effectiveStep = (step === 0 && user) ? 1 : step;
    
    if (effectiveStep < 4) {
      setStep(effectiveStep + 1);
    } else {
      // Final step - save everything and redirect
      setIsSaving(true);
      setOnboardingComplete(true); // Prevent useEffect from interfering
      try {
        await updateProfile({
          name: name.trim(),
          username: username.trim(),
          instruments: selectedInstruments,
          experience_level: experienceLevel,
          years_playing: yearsPlaying,
          avatar_url: avatarUrl,
        });
        
        // Redirect immediately
        router.push("/feed");
      } catch (error) {
        console.error("Error saving profile:", error);
        setAuthError("Failed to save profile. Please try again.");
        setIsSaving(false);
        setOnboardingComplete(false);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAuthError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setAuthError("");

    try {
      // Convert to base64 for preview (in production, upload to storage)
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setAuthError("Failed to read image");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setAuthError("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSaving(true);

    try {
      if (!signupName.trim()) {
        setAuthError("Please enter your name");
        setIsSaving(false);
        return;
      }
      await signUpWithEmail(email, password, signupName);
      // Signup succeeded - reset saving state and move to step 1
      setIsSaving(false);
      setName(signupName);
      setStep(1);
    } catch (error: any) {
      console.error("Signup error:", error);
      setAuthError(error.message || "Signup failed. Please try again.");
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    // If logged in at step 0, treat it as step 1
    const effectiveStep = (step === 0 && user) ? 1 : step;
    
    switch (effectiveStep) {
      case 0:
        return false;
      case 1:
        return name.trim() && username.trim();
      case 2:
        return selectedInstruments.length > 0;
      case 3:
        return experienceLevel.trim().length > 0;
      case 4:
        return true; // Profile pic is optional
      default:
        return false;
    }
  };

  // Show loading only while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1
          className="text-3xl font-bold text-center mb-8"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          PRONIA
        </h1>
        <Card className="p-6">
          {/* Step 0: Sign Up / Google - show when not logged in */}
          {!user && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Join Pronia</h2>
              <p className="text-sm text-muted-foreground text-center">
                Connect with musicians and track your practice journey
              </p>

              {!showEmailForm ? (
                <>
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full h-12 text-base font-medium gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold"
                  >
                    Sign Up with Email
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </>
              ) : (
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-gray-50 border-gray-200 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-sm text-red-500">{authError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    disabled={isSaving}
                    className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back to options
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 1: Profile Setup (NO BIO) - show when logged in and at step 0 or 1 */}
          {user && (step === 0 || step === 1) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">Set up your profile</h2>
              {profile?.avatar_url && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Years Playing</label>
                <Input
                  placeholder="e.g. 2, 5, 10+"
                  value={yearsPlaying}
                  onChange={(e) => setYearsPlaying(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Instruments */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Pick your instruments</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Select up to 3 instruments you play
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                {instruments.map((instrument) => {
                  const Icon = instrument.icon;
                  const isSelected = selectedInstruments.includes(instrument.id);
                  return (
                    <button
                      key={instrument.id}
                      onClick={() => toggleInstrument(instrument.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-foreground bg-muted"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="text-xs font-medium">{instrument.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Experience Level */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">What's your level?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Select your experience level
              </p>

              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      experienceLevel === level.id
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <p className="font-semibold">{level.label}</p>
                  </button>
                ))}
              </div>

              {authError && (
                <p className="text-sm text-red-500 text-center mt-4">{authError}</p>
              )}
            </div>
          )}

          {/* Step 4: Profile Picture */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Add a profile picture</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Help others recognize you (optional)
              </p>

              <div className="flex flex-col items-center gap-4">
                <div 
                  className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {avatarUrl ? "Change Photo" : "Upload Photo"}
                </Button>

                {avatarUrl && (
                  <button
                    onClick={() => setAvatarUrl(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {authError && (
                <p className="text-sm text-red-500 text-center mt-4">{authError}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {(step > 0 || user) && (
            <>
              <div className="mt-6 flex gap-3">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                    disabled={isSaving || isUploading}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving || isUploading}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 4 ? (
                    "Get Started"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {[1, 2, 3, 4].map((i) => {
                  // If at step 0 with user, treat as step 1
                  const displayStep = (step === 0 && user) ? 1 : step;
                  return (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-colors ${
                        i === displayStep ? "bg-foreground" : "bg-muted"
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}