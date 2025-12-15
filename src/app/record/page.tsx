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
  Pause,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Record() {
  const { addSession, sessions } = usePractice();
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestPermissions = async (type: "audio" | "video") => {
    try {
      const constraints = type === "video" 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionStatus("granted");
      return stream;
    } catch (err) {
      console.error("Permission denied:", err);
      setPermissionStatus("denied");
      return null;
    }
  };

  const startAudioRecording = async () => {
    const stream = await requestPermissions("audio");
    if (!stream) return;

    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    setIsAudioRecording(true);
  };

  const startVideoRecording = async () => {
    const stream = await requestPermissions("video");
    if (!stream) return;

    streamRef.current = stream;
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    setIsVideoRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsAudioRecording(false);
    setIsVideoRecording(false);
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
            {/* Main Timer Card */}
            <Card className="p-8 mb-6 text-center bg-white border-2 border-gray-200">
              {/* Video Preview */}
              {isVideoRecording && (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video border-2 border-red-500">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Recording
                  </div>
                </div>
              )}

              <div className="mb-8">
                <p className="text-7xl font-mono font-bold tracking-tight mb-2 text-black">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-base text-gray-600 font-medium">
                  {isTimerRunning 
                    ? isPaused 
                      ? "⏸️ Paused" 
                      : isRecording
                        ? "🔴 Recording..."
                        : "▶️ Practice in progress..."
                    : "Ready to practice"
                  }
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {!isTimerRunning ? (
                  <Button
                    size="lg"
                    className="w-full h-16 text-xl font-bold bg-black hover:bg-gray-800 text-white"
                    onClick={handleStartPractice}
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start Practice
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 h-14 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-100"
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
                      className="flex-1 h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleEndPractice}
                    >
                      <Square className="mr-2 h-5 w-5" />
                      End
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Recording Options */}
            {isTimerRunning && (
              <Card className="p-6 mb-6 bg-white border-2 border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-black">Recording Options</h3>
                
                {permissionStatus === "denied" && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">Permission Required</p>
                      <p className="text-sm text-red-700">
                        Please allow camera/microphone access in your browser settings to record.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant={isAudioRecording ? "destructive" : "outline"}
                    className={`flex-1 h-14 text-base font-semibold ${
                      isAudioRecording 
                        ? "bg-red-600 hover:bg-red-700 text-white border-0" 
                        : "border-2 border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={isAudioRecording ? stopRecording : startAudioRecording}
                    disabled={isVideoRecording}
                  >
                    {isAudioRecording ? (
                      <>
                        <MicOff className="mr-2 h-5 w-5" />
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-5 w-5" />
                        🎙️ Record Audio
                      </>
                    )}
                  </Button>
                  <Button
                    variant={isVideoRecording ? "destructive" : "outline"}
                    className={`flex-1 h-14 text-base font-semibold ${
                      isVideoRecording 
                        ? "bg-red-600 hover:bg-red-700 text-white border-0" 
                        : "border-2 border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={isVideoRecording ? stopRecording : startVideoRecording}
                    disabled={isAudioRecording}
                  >
                    {isVideoRecording ? (
                      <>
                        <VideoOff className="mr-2 h-5 w-5" />
                        Stop Video
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-5 w-5" />
                        📹 Record Video
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-3 text-center">
                  Record to track and share your progress. Your browser will ask for permission.
                </p>
              </Card>
            )}

            {/* Recent Sessions */}
            <Card className="p-6 bg-white border-2 border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-black">Recent Practice Sessions</h2>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 font-medium">No practice sessions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start practicing to see your history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="h-12 w-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black truncate">
                          {session.piece || "Practice Session"}
                        </p>
                        <p className="text-sm text-gray-500">
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
          /* Save Form */
          <Card className="p-6 bg-white border-2 border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-1 text-black">Great Practice!</h2>
              <p className="text-4xl font-mono font-bold text-black">
                {formatTime(elapsedTime)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-black">
                  What did you practice?
                </label>
                <Input 
                  placeholder="e.g., Moonlight Sonata"
                  value={practiceData.piece}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, piece: e.target.value }))}
                  className="h-12 bg-gray-50 border-2 border-gray-200 text-black"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-black">Composer (optional)</label>
                <Input 
                  placeholder="e.g., Beethoven"
                  value={practiceData.composer}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, composer: e.target.value }))}
                  className="h-12 bg-gray-50 border-2 border-gray-200 text-black"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-black">Notes (optional)</label>
                <Textarea 
                  placeholder="How did the session go? Any breakthroughs?"
                  value={practiceData.notes}
                  onChange={(e) => setPracticeData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="bg-gray-50 border-2 border-gray-200 text-black"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 font-semibold border-2 border-gray-300" 
                  onClick={handleDiscardPractice}
                >
                  Discard
                </Button>
                <Button 
                  className="flex-1 h-12 font-semibold bg-black hover:bg-gray-800 text-white"
                  onClick={handleSaveLog}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Save Log
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
