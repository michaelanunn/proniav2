import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function CreatePostModal({ onPost, onClose }: { onPost: () => void; onClose: () => void }) {
  const [mediaType, setMediaType] = useState<"video" | "audio">("video");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start recording
  const startRecording = async () => {
    const constraints = mediaType === "video" ? { video: true, audio: true } : { audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaType === "video" ? "video/webm" : "audio/webm" });
      setMediaBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Post to server
  const handlePost = async () => {
    if (!mediaBlob) return;
    setIsPosting(true);
    // Upload to /api/upload (reuse avatar upload route for now)
    const form = new FormData();
    form.append("file", mediaBlob, mediaType + ".webm");
    const upload = await fetch("/api/upload", { method: "POST", body: form });
    const { url } = await upload.json();
    // Create post
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_url: url, media_type: mediaType, caption }),
    });
    setIsPosting(false);
    onPost();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create a Post</h2>
        <div className="flex gap-2 mb-4">
          <Button variant={mediaType === "video" ? "default" : "outline"} onClick={() => setMediaType("video")}>Video</Button>
          <Button variant={mediaType === "audio" ? "default" : "outline"} onClick={() => setMediaType("audio")}>Audio</Button>
        </div>
        {!mediaBlob && (
          <Button onClick={isRecording ? stopRecording : startRecording} className="mb-4 w-full">
            {isRecording ? "Stop Recording" : `Record ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`}
          </Button>
        )}
        {previewUrl && (
          <div className="mb-4">
            {mediaType === "video" ? (
              <video src={previewUrl} controls className="w-full rounded" />
            ) : (
              <audio src={previewUrl} controls className="w-full" />
            )}
          </div>
        )}
        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handlePost} disabled={!mediaBlob || isPosting} className="w-full">
            {isPosting ? "Posting..." : "Post"}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
