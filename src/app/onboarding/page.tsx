"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Piano, Guitar, Mic, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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
  { id: 3, title: "Clair de Lune", composer: "Debussy", level: "advanced" },
  { id: 4, title: "Canon in D", composer: "Pachelbel", level: "beginner" },
  { id: 5, title: "La Campanella", composer: "Liszt", level: "professional" },
  { id: 6, title: "Nocturne Op.9 No.2", composer: "Chopin", level: "intermediate" },
  { id: 7, title: "Turkish March", composer: "Mozart", level: "beginner" },
  { id: 8, title: "Prelude in C Major", composer: "Bach", level: "intermediate" },
];

const experienceLevels = [
  { id: "beginner", label: "Beginner", years: "0-2 years" },
  { id: "intermediate", label: "Intermediate", years: "2-5 years" },
  { id: "advanced", label: "Advanced", years: "5+ years" },
  { id: "professional", label: "Professional", years: "" },
];

export default function Onboarding() {
  const router = useRouter();
  const { user, profile, signUpWithEmail, signInWithGoogle, updateProfile } = useAuth();
  
  const [step, setStep] = useState(0); // 0 = signup, 1+ = onboarding steps
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Signup form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);

  // If already logged in with profile, redirect
  useEffect(() => {
    if (user && profile?.instruments?.length > 0) {
      router.push("/feed");
    } else if (user && profile) {
      // User exists but hasn't completed onboarding
      setName(profile.name || "");
      setUsername(profile.username || "");
      setStep(1);
    }
  }, [user, profile, router]);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    try {
      await signUpWithEmail(email, password, name);
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save profile and complete onboarding
      setIsSaving(true);
      try {
        await updateProfile({
          name,
          username,
          instruments: selectedInstruments,
          experience_level: experienceLevel,
        });
        router.push("/feed");
      } catch (error) {
        console.error("Error saving profile:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return email && password && confirmPassword && name;
      case 1:
        return name.trim() && username.trim();
      case 2:
        return selectedInstruments.length > 0;
      case 3:
        return selectedPieces.length === 3;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 
          className="text-3xl font-bold text-center mb-8 text-black" 
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          PRONIA
        </h1>

        <Card className="p-6 border border-gray-200">
          {/* Step 0: Email/Password Signup */}
          {step === 0 && !user && (
            <form onSubmit={handleSignup} className="space-y-4">
              <h2 className="text-xl font-semibold text-center text-black">Create your account</h2>
              <p className="text-sm text-gray-500 text-center mb-4">
                Start your musical journey today
              </p>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={!canProceed() || isSaving}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-400">or</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={signInWithGoogle}
                variant="outline"
                className="w-full h-12 gap-3 border-gray-200"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-black font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}

          {/* Step 1: Username Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6 text-black">Set up your profile</h2>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <Input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                    className="pl-8 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Instruments */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2 text-black">Pick your instruments</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
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
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
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

          {/* Step 3: Pieces */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2 text-black">Pick 3 pieces</h2>
              <p className="text-sm text-gray-500 text-center mb-4">
                What pieces are you working on?
              </p>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {experienceLevels.map((level) => (
                  <Button
                    key={level.id}
                    variant={experienceLevel === level.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExperienceLevel(level.id)}
                    className="whitespace-nowrap"
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredPieces.map((piece) => {
                  const isSelected = selectedPieces.includes(piece.id);
                  return (
                    <button
                      key={piece.id}
                      onClick={() => togglePiece(piece.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <p className="font-semibold text-sm">{piece.title}</p>
                      <p className="text-xs text-gray-500">{piece.composer}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-black">You&apos;re all set, {name}!</h2>
              <p className="text-sm text-gray-500">
                Welcome to Pronia. Start tracking your practice and connecting with other musicians.
              </p>
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
                    className="flex-1 border-gray-200"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 4 ? (
                    "Get Started"
                  ) : step === 3 && selectedPieces.length < 3 ? (
                    `Selected ${selectedPieces.length}/3`
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
                      i === step ? "bg-black" : "bg-gray-200"
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
