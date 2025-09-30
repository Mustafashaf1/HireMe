import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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

export function ServiceBrowser({ onSelectService }: { onSelectService: (id: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState("");

  const services = useQuery(api.services.listServices, {
    category: selectedCategory || undefined,
    location: locationFilter || undefined,
  });

  if (services === undefined) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          Discover Local Services
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
          Find the perfect service provider for your needs
        </p>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input min-w-48"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="input min-w-64"
          />
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            No services found
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Try adjusting your filters or check back later for new services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="card card-hover cursor-pointer overflow-hidden group"
              onClick={() => onSelectService(service._id)}
            >
              {service.photoUrls.length > 0 && service.photoUrls[0] && (
                <div className="relative overflow-hidden">
                  <img
                    src={service.photoUrls[0]}
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {service.title}
                  </h3>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    ${service.price}
                  </span>
                </div>
                
                <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-secondary-500 dark:text-secondary-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {service.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {service.providerName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
