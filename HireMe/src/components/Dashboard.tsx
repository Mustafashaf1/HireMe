import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BookingCard } from "./BookingCard";

export function Dashboard({ 
  onCreateService, 
  onSelectService,
  onSelectBooking 
}: { 
  onCreateService: () => void;
  onSelectService: (id: string) => void;
  onSelectBooking: (id: string) => void;
}) {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const myServices = useQuery(api.services.getMyServices);
  const bookings = useQuery(api.bookings.getMyBookings);

  if (profile === undefined || myServices === undefined || bookings === undefined) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 spinner"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const declinedBookings = bookings.filter(b => b.status === "declined");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="card p-8 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-secondary-800 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-4">
          {profile?.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-secondary-700 shadow-medium"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-secondary-700 shadow-medium">
              <span className="text-xl font-bold text-white">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              {profile?.isProvider ? "Manage your services and bookings" : "Discover amazing local services"}
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {profile?.isProvider && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                My Services
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400">
                Manage and track your service offerings
              </p>
            </div>
            <button
              onClick={onCreateService}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Service
            </button>
          </div>
          
          {myServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                No services yet
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                Create your first service to start earning from your skills
              </p>
              <button
                onClick={onCreateService}
                className="btn-primary"
              >
                Create Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myServices.map((service) => (
                <div
                  key={service._id}
                  className="card card-hover cursor-pointer overflow-hidden group"
                  onClick={() => onSelectService(service._id)}
                >
                  {service.photoUrls.length > 0 && service.photoUrls[0] && (
                    <img
                      src={service.photoUrls[0]}
                      alt={service.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                        {service.title}
                      </h3>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                      {service.location}
                    </p>
                    <span className={service.isActive ? 'badge-active' : 'badge-inactive'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Section */}
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
            Bookings
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Track your service requests and appointments
          </p>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No bookings yet
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {profile?.isProvider 
                ? "Bookings will appear here when customers request your services"
                : "Start browsing services to make your first booking"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-warning-600 dark:text-warning-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending ({pendingBookings.length})
                </h3>
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <BookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onSelectBooking={onSelectBooking}
                    />
                  ))}
                </div>
              </div>
            )}

            {acceptedBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-success-600 dark:text-success-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Accepted ({acceptedBookings.length})
                </h3>
                <div className="space-y-3">
                  {acceptedBookings.map((booking) => (
                    <BookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onSelectBooking={onSelectBooking}
                    />
                  ))}
                </div>
              </div>
            )}

            {declinedBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Declined ({declinedBookings.length})
                </h3>
                <div className="space-y-3">
                  {declinedBookings.map((booking) => (
                    <BookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onSelectBooking={onSelectBooking}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
