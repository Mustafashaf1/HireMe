import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Home Services",
  "Personal Care",
  "Tutoring",
  "Pet Services",
  "Event Services",
  "Fitness",
  "Technology",
  "Other"
];

export function CreateService({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const createService = useMutation(api.services.createService);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || uploadedPhotos.length >= 3) return;

    for (let i = 0; i < Math.min(files.length, 3 - uploadedPhotos.length); i++) {
      const file = files[i];
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        if (result.ok) {
          const { storageId } = await result.json();
          setUploadedPhotos(prev => [...prev, storageId]);
        }
      } catch (error) {
        toast.error("Failed to upload photo");
        console.error(error);
      }
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !price || !location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsLoading(true);
    try {
      await createService({
        title: title.trim(),
        description: description.trim(),
        category,
        price: priceNum,
        location: location.trim(),
        availability: availability.trim() || undefined,
        photos: uploadedPhotos as any,
      });
      toast.success("Service created successfully!");
      onBack();
    } catch (error) {
      toast.error("Failed to create service");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-primary hover:underline flex items-center gap-2"
      >
        ← Back to dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Service</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., House Cleaning, Dog Walking, Math Tutoring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe your service in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="City, State or specific area"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Weekdays 9AM-5PM, Weekends available"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos (up to 3)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={uploadedPhotos.length >= 3}
            />
            {uploadedPhotos.length > 0 && (
              <div className="mt-2 flex gap-2">
                {uploadedPhotos.map((_, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Photo {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Service..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
}
