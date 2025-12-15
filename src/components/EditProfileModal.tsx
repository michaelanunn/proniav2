"use client";

import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  profilePic: string | null;
  name: string;
  username: string;
  bio: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileData;
  onSave: (data: ProfileData) => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.profilePic);

  // Sync with initialData when it changes
  useEffect(() => {
    setFormData(initialData);
    setPreviewImage(initialData.profilePic);
  }, [initialData]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      (async () => {
        try {
          const { compressImage } = await import('@/lib/image');
          const dataUrl = await compressImage(file, 1024, 0.8, 300 * 1024);

          // If Supabase is configured, attempt server upload
          if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            try {
              // convert dataUrl to blob
              const res = await fetch(dataUrl);
              const blob = await res.blob();
              const form = new FormData();
              form.append('file', new File([blob], file.name, { type: blob.type }));
              const upload = await fetch('/api/upload', { method: 'POST', body: form });
              if (upload.ok) {
                const json = await upload.json();
                setPreviewImage(json.url);
                setFormData((prev) => ({ ...prev, profilePic: json.url }));
                return;
              }
            } catch (err) {
              console.warn('Server upload failed, falling back to data URL', err);
            }
          }

          setPreviewImage(dataUrl);
          setFormData((prev) => ({ ...prev, profilePic: dataUrl }));
        } catch (err) {
          console.error('Failed to process profile image:', err);
          alert('Could not process image. Try a smaller file.');
        }
      })();
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-black">Edit profile</h2>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-1 h-8 rounded-md"
          >
            Save
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-gray-500">
                      {formData.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <label className="mt-3 text-sm font-medium text-black cursor-pointer hover:underline">
              Change photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 rounded-lg text-black placeholder:text-gray-400"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  @
                </span>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    }))
                  }
                  placeholder="username"
                  className="h-11 pl-8 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 rounded-lg text-black placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                pronia.app/@{formData.username || "username"}
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell everyone about yourself"
                maxLength={80}
                rows={3}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 rounded-lg text-black placeholder:text-gray-400 resize-none"
              />
              <p className="text-xs text-gray-500 text-right">
                {formData.bio?.length || 0}/80
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
