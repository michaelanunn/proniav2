"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePractice } from "@/contexts/PracticeContext";
import { 
  Play, 
  Square, 
  Check, 
  Mic, 
  MicOff, 
  Video,
  VideoOff,
  Clock,
  Pause
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Record() {
  const { addSession, sessions } = usePractice();
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [practiceData, setPracticeData] = useState({
    piece: "",
    composer: "",
    notes: "",
  });

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, isPaused]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsAudioRecording(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error("Failed to start audio recording:", err);
      setPermissionDenied(true);
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsVideoRecording(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error("Failed to start video recording:", err);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsAudioRecording(false);
      setIsVideoRecording(false);
    }
  };

  const handleStartPractice = () => {
    setIsTimerRunning(true);
    setIsPaused(false);
    setElapsedTime(0);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndPractice = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    stopRecording();
    setShowSaveForm(true);
  };

  const handleSaveLog = () => {
    addSession({
      date: new Date().toISOString(),
      duration: elapsedTime,
      piece: practiceData.piece || undefined,
      composer: practiceData.composer || undefined,
      notes: practiceData.notes || undefined,
    });
    
    setShowSaveForm(false);
    setElapsedTime(0);
    setPracticeData({ piece: "", composer: "", notes: "" });
  };

  const handleDiscardPractice = () => {
    setShowSaveForm(false);
    setElapsedTime(0);
    setPracticeData({ piece: "", composer: "", notes: "" });
  };

  const recentSessions = sessions.slice(0, 5);
  const isRecording = isAudioRecording || isVideoRecording;

  return (
    <Layout streak={0}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!showSaveForm ? (
          <>
            <Card className="p-8 mb-6 text-center">
              {/* Video Preview */}
              {isVideoRecording && (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mb-8">
                <p className="text-6xl font-mono font-bold tracking-tight mb-2">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isTimerRunning 
                    ? isPaused 
                      ? "Paused" 
                      : isRecording
                        ? "Recording..."
                        : "Practice in progress..."
                    : "Ready to practice"
                  }
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {!isTimerRunning ? (
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold"
                    onClick={handleStartPractice}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Practice
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 h-14"
                      onClick={handlePauseResume}
                    >
                      {isPaused ? (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="flex-1 h-14"
                      onClick={handleEndPractice}
                    >
                      <Square className="mr-2 h-5 w-5" />
                      End Practice
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Recording Options */}
            {isTimerRunning && (
              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4">Recording Options</h3>
                <div className="flex gap-3">
                  <Button
                    variant={isAudioRecording ? "destructive" : "outline"}
                    className="flex-1"
                    onClick={isAudioRecording ? stopRecording : startAudioRecording}
                    disabled={isVideoRecording}
                  >
                    {isAudioRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Record Audio
                      </>
                    )}
                  </Button>
                  <Button
                    variant={isVideoRecording ? "destructive" : "outline"}
                    className="flex-1"
                    onClick={isVideoRecording ? stopRecording : startVideoRecording}
                    disabled={isAudioRecording}
                  >
                    {isVideoRecording ? (
                      <>
                        <VideoOff className="mr-2 h-4 w-4" />
                        Stop Video
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Record Video
                      </>
                    )}
                  </Button>
                </div>

                {permissionDenied && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      Camera/microphone access denied. Please enable it in your browser settings.
                    </p>
                  </div>
                )}
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Practice Sessions</h2>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No practice sessions yet</p>
                  <p className="text-xs mt-1">Start practicing to see your history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {session.piece || "Practice Session"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} • {formatTime(session.duration)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-1">Great Practice!</h2>
              <p className="text-3xl font-mono font-bold text-accent">
                {formatTime(elapsedTime)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What did you practice?
                </label>
                <Input 
                  placeholder="e.g., Moonlight Sonata"
                  value={practiceData.piece}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, piece: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Composer (optional)</label>
                <Input 
                  placeholder="e.g., Beethoven"
                  value={practiceData.composer}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, composer: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea 
                  placeholder="How did the session go? Any breakthroughs?"
                  value={practiceData.notes}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleDiscardPractice}
                >
                  Discard
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveLog}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Save Practice Log
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
