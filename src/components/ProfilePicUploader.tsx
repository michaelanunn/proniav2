import React, { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface ProfilePicUploaderProps {
  avatarUrl?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export default function ProfilePicUploader({ avatarUrl, onUpload, disabled }: ProfilePicUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onUpload(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-20 w-20">
        {preview ? (
          <AvatarImage src={preview} alt="Preview" />
        ) : avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Profile" />
        ) : (
          <AvatarFallback>
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading || disabled}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || disabled}
      >
        {uploading ? "Uploading..." : "Choose Photo"}
      </Button>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
