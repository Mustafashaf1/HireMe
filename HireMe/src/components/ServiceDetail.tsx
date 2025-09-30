import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ServiceDetail({ serviceId, onBack }: { serviceId: string; onBack: () => void }) {
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const service = useQuery(api.services.getService, { serviceId: serviceId as any });
  const createBooking = useMutation(api.bookings.createBooking);

  const handleBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedDate || !requestedTime) {
      toast.error("Please select date and time");
      return;
    }

    setIsBooking(true);
    try {
      await createBooking({
        serviceId: serviceId as any,
        requestedDate,
        requestedTime,
        message: message.trim() || undefined,
      });
      toast.success("Booking request sent!");
      setRequestedDate("");
      setRequestedTime("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send booking request");
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };

  if (service === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Service not found.</p>
        <button
          onClick={onBack}
          className="mt-4 text-primary hover:underline"
        >
          ← Back to services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-primary hover:underline flex items-center gap-2"
      >
        ← Back to services
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {service.photoUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4">
            {service.photoUrls.filter(Boolean).map((url, index) => (
              <img
                key={index}
                src={url!}
                alt={`${service.title} ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <p className="text-xl text-primary font-bold">${service.price}</p>
            </div>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {service.category}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-700">{service.location}</p>
            </div>
            {service.availability && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Availability</h3>
                <p className="text-gray-700">{service.availability}</p>
              </div>
            )}
          </div>

          {service.provider && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">About the Provider</h3>
              <div className="flex items-start gap-4">
                {service.provider.profilePhotoUrl && (
                  <img
                    src={service.provider.profilePhotoUrl}
                    alt={service.provider.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{service.provider.name}</h4>
                  {service.provider.bio && (
                    <p className="text-gray-600 mt-1">{service.provider.bio}</p>
                  )}
                  {service.provider.contactInfo && (
                    <p className="text-sm text-gray-500 mt-2">
                      Contact: {service.provider.contactInfo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Request Booking</h3>
            <form onSubmit={handleBookingRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any additional details or questions..."
                />
              </div>
              <button
                type="submit"
                disabled={isBooking}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isBooking ? "Sending Request..." : "Request Booking"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
