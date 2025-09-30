import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Booking {
  _id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  requestedDate: string;
  requestedTime: string;
  message?: string;
  status: "pending" | "accepted" | "declined";
  service: any;
  customer: any;
  provider: any;
  isCustomer: boolean;
  isProvider: boolean;
}

export function BookingCard({ 
  booking, 
  onSelectBooking 
}: { 
  booking: Booking;
  onSelectBooking: (id: string) => void;
}) {
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);

  const handleStatusUpdate = async (status: "accepted" | "declined") => {
    try {
      await updateBookingStatus({
        bookingId: booking._id as any,
        status,
      });
      toast.success(`Booking ${status}!`);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} booking`);
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card card-hover p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-secondary-900 dark:text-secondary-100 mb-1">
            {booking.service?.title}
          </h4>
          <p className="text-secondary-600 dark:text-secondary-400 mb-2">
            {booking.isCustomer 
              ? `Provider: ${booking.provider?.name}` 
              : `Customer: ${booking.customer?.name}`
            }
          </p>
        </div>
        <span className={`${
          booking.status === 'pending' ? 'badge-pending' :
          booking.status === 'accepted' ? 'badge-accepted' :
          'badge-declined'
        }`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(booking.requestedDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(booking.requestedTime)}</span>
        </div>
      </div>

      {booking.message && (
        <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-container">
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            <span className="font-medium">Message:</span> {booking.message}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {booking.isProvider && booking.status === "pending" && (
          <>
            <button
              onClick={() => handleStatusUpdate("accepted")}
              className="flex-1 bg-success-500 hover:bg-success-600 text-white py-2 px-4 rounded-container font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept
            </button>
            <button
              onClick={() => handleStatusUpdate("declined")}
              className="flex-1 bg-error-500 hover:bg-error-600 text-white py-2 px-4 rounded-container font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
          </>
        )}
        {booking.status === "accepted" && (
          <button
            onClick={() => onSelectBooking(booking._id)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Chat
          </button>
        )}
      </div>
    </div>
  );
}
