"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Square, 
  Check, 
  Clock,
  Pause,
  Youtube,
  Share2,
  Trash2,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePractice } from "@/contexts/PracticeContext";

export default function Record() {
  const { sessions, addSession, deleteSession } = usePractice();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [savedDuration, setSavedDuration] = useState(0);
  const intervalRef = useRef(null);
  
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sessionData, setSessionData] = useState({
    songTitle: "",
    composer: "",
    notes: "",
  });
  const [postData, setPostData] = useState({
    youtubeUrl: "",
    title: "",
    notes: "",
    caption: "",
  });

  const formatTime = (seconds) => {
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
    setSavedDuration(elapsedTime);
    setShowSavePrompt(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveLog = async () => {
    setIsSaving(true);
    try {
      await addSession({
        date: new Date().toISOString(),
        duration: savedDuration,
        piece: sessionData.songTitle || "Practice Session",
        composer: sessionData.composer,
        notes: sessionData.notes,
      });
      
      setShowSavePrompt(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error saving session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardPractice = () => {
    setShowSavePrompt(false);
    setShowSuccess(false);
    setShowCreatePost(false);
    setElapsedTime(0);
    setSavedDuration(0);
    setSessionData({ songTitle: "", composer: "", notes: "" });
    setPostData({ youtubeUrl: "", title: "", notes: "", caption: "" });
  };

  const handleDone = () => {
    setShowSuccess(false);
    setShowCreatePost(false);
    setElapsedTime(0);
    setSavedDuration(0);
    setSessionData({ songTitle: "", composer: "", notes: "" });
    setPostData({ youtubeUrl: "", title: "", notes: "", caption: "" });
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handlePublishPost = () => {
    // TODO: Save post to database with youtubeUrl and caption
    console.log("Publishing post:", postData);
    handleDone();
  };

  const recentSessions = sessions.slice(0, 5);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!showSavePrompt && !showSuccess ? (
          <>
            <Card className="p-8 mb-6 text-center">
              <div className="mb-8">
                <p className="text-6xl font-mono font-bold tracking-tight mb-2">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isTimerRunning 
                    ? isPaused 
                      ? "Paused" 
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
                          {session.piece}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} • {formatTime(session.duration)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        ) : showSavePrompt ? (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-1">Great Practice!</h2>
              <p className="text-3xl font-mono font-bold text-foreground">
                {formatTime(savedDuration)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add details to your practice log
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Song Title</label>
                <Input 
                  placeholder="What piece did you practice?"
                  value={sessionData.songTitle}
                  onChange={(e) => setSessionData(prev => ({ ...prev, songTitle: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Composer (optional)</label>
                <Input 
                  placeholder="Who composed this piece?"
                  value={sessionData.composer}
                  onChange={(e) => setSessionData(prev => ({ ...prev, composer: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea 
                  placeholder="Any notes about your practice session..."
                  value={sessionData.notes}
                  onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={handleDiscardPractice}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveLog}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-5 w-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Log"}
                </Button>
              </div>
            </div>
          </Card>
        ) : showSuccess && !showCreatePost ? (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-1">Session Saved!</h2>
              <p className="text-3xl font-mono font-bold text-foreground">
                {formatTime(savedDuration)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Added to your practice log
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleCreatePost}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share as Post
              </Button>
              <Button 
                className="w-full"
                onClick={handleDone}
              >
                Done
              </Button>
            </div>
          </Card>
        ) : showCreatePost ? (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Youtube className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-1">Create a Post</h2>
              <p className="text-sm text-muted-foreground">
                Share your practice with a YouTube video
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube Video Link
                  </div>
                </label>
                <Input 
                  placeholder="https://youtube.com/watch?v=..."
                  value={postData.youtubeUrl}
                  onChange={(e) => setPostData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Song Title</label>
                <Input 
                  placeholder="What piece are you playing?"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea 
                  placeholder="Any notes about your practice..."
                  value={postData.notes}
                  onChange={(e) => setPostData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Caption (optional)</label>
                <Textarea 
                  placeholder="Say something about your practice..."
                  value={postData.caption}
                  onChange={(e) => setPostData(prev => ({ ...prev, caption: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowCreatePost(false)}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePublishPost}
                  disabled={!postData.youtubeUrl}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Post
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
}