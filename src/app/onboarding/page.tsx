"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Piano, Guitar, Mic, User, Loader2 } from "lucide-react";
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
  const { user, profile, isLoading, signInWithGoogle, updateProfile } = useAuth();
  
  const [step, setStep] = useState(0); // 0 = login, 1+ = onboarding steps
  const [showVerification, setShowVerification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);
  const [bio, setBio] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");

  // Only redirect if all required profile fields are set
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setSelectedInstruments(profile.instruments || []);
      setExperienceLevel(profile.experience_level || "");
      setBio(profile.bio || "");
      setYearsPlaying(profile.years_playing || "");

      // Check if all required fields are present
      const hasAllFields =
        profile.name?.trim() &&
        profile.username?.trim() &&
        Array.isArray(profile.instruments) && profile.instruments.length > 0 &&
        profile.experience_level?.trim();

      if (hasAllFields) {
        router.push("/feed");
      } else {
        setStep(1); // Start at profile setup
      }
    }
  }, [profile, router]);

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
      // Save profile and complete onboarding
      setIsSaving(true);
      try {
        await updateProfile({
          name,
          username,
          instruments: selectedInstruments,
          experience_level: experienceLevel,
          bio,
          years_playing: yearsPlaying,
        });
        // Show magic link verification message if user is not verified
        if (user && user.email && !user.email_confirmed_at) {
          setShowVerification(true);
        } else {
          router.push("/feed");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // No handleVerify needed for magic link

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return false; // Need to sign in
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
          {/* Magic Link Verification Step */}
          {showVerification ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Check your email</h2>
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ve sent a magic link to <span className="font-semibold">{user?.email}</span>.<br />
                Please click the link in your email to verify your account and continue.
              </p>
              <Button
                onClick={() => router.push("/feed")}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold"
              >
                Continue
              </Button>
            </div>
          ) : null}
          {/* Step 0: Google Login */}
          {!showVerification && step === 0 && !user && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Join Pronia</h2>
              <p className="text-sm text-muted-foreground text-center">
                Connect with musicians and track your practice journey
              </p>
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
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
          {/* ...existing onboarding steps... */}
          </>
        </Card>
      </div>
    </div>
  );

          {/* Step 1: Profile Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">Set up your profile</h2>
              {/* Avatar from Google */}
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

          {/* Step 3: Pieces */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Pick 3 pieces</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
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
                          ? "border-foreground bg-muted"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{piece.title}</p>
                      <p className="text-xs text-muted-foreground">{piece.composer}</p>
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
