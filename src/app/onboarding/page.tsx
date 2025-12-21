"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Piano, Guitar, Mic, User, Loader2, Eye, EyeOff } from "lucide-react";
import ProfilePicUploader from "@/components/ProfilePicUploader";
import { useAuth } from "@/contexts/AuthContext";

const instruments = [
  { id: "piano", name: "Piano", icon: Piano },
  { id: "guitar", name: "Guitar", icon: Guitar },
  { id: "violin", name: "Violin", icon: Mic },
  { id: "drums", name: "Drums", icon: Mic },
  { id: "bass", name: "Bass", icon: Guitar },
  { id: "vocals", name: "Vocals", icon: Mic },
];

const popularPieces = [
  { id: 1, title: "Moonlight Sonata", composer: "Beethoven", level: "intermediate" },
  { id: 2, title: "Für Elise", composer: "Beethoven", level: "beginner" },
  { id: 3, title: "Clair de Lune", composer: "Debussy", level: "intermediate" },
  { id: 4, title: "Prelude in C Major", composer: "Bach", level: "beginner" },
  { id: 5, title: "Nocturne Op. 9 No. 2", composer: "Chopin", level: "intermediate" },
  { id: 6, title: "Turkish March", composer: "Mozart", level: "intermediate" },
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
  
  // Profile data
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);
  const [bio, setBio] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Email signup states
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check profile when user is loaded
  useEffect(() => {
    if (isLoading) return;
    
    // If user exists but we haven't checked profile yet
    if (user && !hasCheckedProfile) {
      if (profile) {
        console.log("Checking profile completion:", profile);
        
        // Only override fields if profile has actual values (don't clear existing input)
        if (profile.name?.trim()) setName(profile.name);
        if (profile.username?.trim()) setUsername(profile.username);
        if (profile.instruments?.length > 0) setSelectedInstruments(profile.instruments);
        if (profile.experience_level?.trim()) setExperienceLevel(profile.experience_level);
        if (profile.bio?.trim()) setBio(profile.bio);
        if (profile.years_playing?.trim()) setYearsPlaying(profile.years_playing);
        if (profile.avatar_url?.trim()) setAvatarUrl(profile.avatar_url);
        
        // Only redirect if profile is FULLY complete
        const hasAllFields =
          profile.name?.trim() &&
          profile.username?.trim() &&
          Array.isArray(profile.instruments) && 
          profile.instruments.length > 0 &&
          profile.experience_level?.trim();
        
        if (hasAllFields) {
          console.log("Profile complete, redirecting to feed");
          router.push("/feed");
        } else {
          console.log("Profile incomplete, starting onboarding at step 1");
          setStep(1);
        }
      } else {
        // User exists but no profile yet - go to step 1
        console.log("User exists but no profile, starting at step 1");
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

  const togglePiece = (id: number) => {
    if (selectedPieces.includes(id)) {
      setSelectedPieces(selectedPieces.filter((p) => p !== id));
    } else if (selectedPieces.length < 3) {
      setSelectedPieces([...selectedPieces, id]);
    }
  };

  const filteredPieces = experienceLevel
    ? popularPieces.filter((p) => p.level === experienceLevel)
    : popularPieces;

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      setAuthError("");
      
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
        
        console.log("Profile saved, redirecting to feed");
        router.push("/feed");
      } catch (error: any) {
        console.error("Profile save error:", error);
        setAuthError(error?.message || "Failed to save profile");
        setIsSaving(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
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
      // Pre-populate the name field from signup and move to step 1
      setName(signupName);
      setStep(1);
      setIsSaving(false);
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Better error messages
      if (error.message?.includes("5 seconds")) {
        setAuthError("Please wait a few seconds before trying again");
      } else if (error.message?.includes("already registered")) {
        setAuthError("This email is already registered. Try logging in instead.");
      } else {
        setAuthError(error.message || "Signup failed. Please try again.");
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
        // Must select experience level (pieces are optional)
        return experienceLevel.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Show loading while auth is loading OR while we haven't checked a logged-in user's profile yet
  if (isLoading || (user && !hasCheckedProfile)) {
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
          {/* Step 0: Sign Up Options */}
          {step === 0 && !user && (
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
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{authError}</p>
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      required 
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a 
                        href="/tos" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>
                      {" "}and{" "}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={isSaving || !agreedToTerms}
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
                    onClick={() => {
                      setShowEmailForm(false);
                      setAuthError("");
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to options
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 1: Profile Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">Set up your profile</h2>
              <div className="flex justify-center mb-4">
                <ProfilePicUploader
                  avatarUrl={avatarUrl || profile?.avatar_url}
                  onUpload={(url) => setAvatarUrl(url)}
                  disabled={isSaving}
                />
              </div>
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
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Input
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
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
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold">You&apos;re all set, {name}!</h2>
              <p className="text-sm text-muted-foreground">
                Welcome to Pronia. Start tracking your practice and connecting with other musicians.
              </p>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step > 0 && (
            <>
              <div className="mt-6 flex gap-3">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
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
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      i === step ? "bg-foreground" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}