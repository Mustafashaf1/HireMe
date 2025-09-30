import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSettings({ onBack }: { onBack: () => void }) {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current profile data
  useState(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setContactInfo(profile.contactInfo || "");
      setProfilePhotoId(profile.profilePhoto || null);
    }
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (result.ok) {
        const { storageId } = await result.json();
        setProfilePhotoId(storageId);
        toast.success("Photo uploaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        profilePhoto: profilePhotoId as any,
      });
      toast.success("Profile updated successfully!");
      onBack();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 btn-ghost flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </button>

      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Profile Settings
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Update your personal information and preferences
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="text-center">
            <div className="relative inline-block">
              {profile?.profilePhotoUrl || profilePhotoId ? (
                <img
                  src={profile?.profilePhotoUrl || ""}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-secondary-700 shadow-medium"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-secondary-700 shadow-medium">
                  <span className="text-2xl font-bold text-white">
                    {name.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-medium transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 spinner border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
              Click the camera icon to update your photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
              Contact Information
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="input"
              placeholder="Phone number or email"
            />
          </div>

          {/* Provider Status */}
          {profile?.isProvider && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-container border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                    Service Provider Account
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    You can create and manage services
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 spinner border-white"></div>
                  Updating...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
