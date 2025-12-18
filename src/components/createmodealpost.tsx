"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Loader2, Video } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  videoFile?: File | null;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated, videoFile: initialVideoFile }: CreatePostModalProps) {
  const { user, profile } = useAuth();
  const supabase = createClient();
  
  const [caption, setCaption] = useState("");
  const [pieceName, setPieceName] = useState("");
  const [composer, setComposer] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(initialVideoFile || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      alert("Please select a valid video file");
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("practice-videos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Video upload error:", error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("practice-videos")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile || !user) {
      alert("Please select a video");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Upload video
      const videoUrl = await uploadVideo(videoFile);
      setUploadProgress(60);

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            caption: caption.trim(),
            video_url: videoUrl,
            piece_name: pieceName.trim() || null,
            composer: composer.trim() || null,
            duration_seconds: 0, // You can add video duration detection if needed
          },
        ])
        .select()
        .single();

      setUploadProgress(100);

      if (postError) {
        console.error("Post creation error:", postError);
        throw postError;
      }

      console.log("Post created:", post);
      
      // Reset form
      setCaption("");
      setPieceName("");
      setComposer("");
      setVideoFile(null);
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.message || "Failed to create post");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Share Your Practice</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video Upload */}
            {!videoFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload video</p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV, or WebM (max 100MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {isUploading && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Caption (Optional)
              </label>
              <Textarea
                placeholder="Share your thoughts about this practice session..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={500}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {caption.length}/500
              </p>
            </div>

            {/* Piece Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Piece Name (Optional)
                </label>
                <Input
                  placeholder="e.g., Moonlight Sonata"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Composer (Optional)
                </label>
                <Input
                  placeholder="e.g., Beethoven"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!videoFile || isUploading}
                className="flex-1 bg-black hover:bg-gray-800"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}