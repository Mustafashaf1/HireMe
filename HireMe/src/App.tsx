import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ProfileSetup } from "./components/ProfileSetup";
import { ServiceBrowser } from "./components/ServiceBrowser";
import { Dashboard } from "./components/Dashboard";
import { ServiceDetail } from "./components/ServiceDetail";
import { CreateService } from "./components/CreateService";
import { BookingChat } from "./components/BookingChat";
import { ProfileSettings } from "./components/ProfileSettings";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  const [currentView, setCurrentView] = useState<'browse' | 'dashboard' | 'create-service' | 'profile-settings'>('browse');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <header className="sticky top-0 z-50 gradient-header border-b border-secondary-200 dark:border-secondary-700 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setCurrentView('browse');
                setSelectedServiceId(null);
                setSelectedBookingId(null);
              }}
              className="flex items-center gap-3 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-container shadow-soft group-hover:shadow-medium transition-all duration-200 transform group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                HireMe
              </h1>
            </button>
            
            <Authenticated>
              <nav className="hidden md:flex gap-2">
                <button
                  onClick={() => {
                    setCurrentView('browse');
                    setSelectedServiceId(null);
                    setSelectedBookingId(null);
                  }}
                  className={`px-4 py-2 rounded-container font-medium transition-all duration-200 ${
                    currentView === 'browse' 
                      ? 'bg-primary-500 text-white shadow-soft' 
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                  }`}
                >
                  Browse Services
                </button>
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setSelectedServiceId(null);
                    setSelectedBookingId(null);
                  }}
                  className={`px-4 py-2 rounded-container font-medium transition-all duration-200 ${
                    currentView === 'dashboard' 
                      ? 'bg-primary-500 text-white shadow-soft' 
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                  }`}
                >
                  Dashboard
                </button>
              </nav>
            </Authenticated>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Authenticated>
              <UserMenu onProfileSettings={() => setCurrentView('profile-settings')} />
            </Authenticated>
            <Unauthenticated>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Sign in to get started
              </div>
            </Unauthenticated>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <Content 
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          selectedBookingId={selectedBookingId}
          setSelectedBookingId={setSelectedBookingId}
        />
      </main>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'card',
          style: {
            background: 'var(--tw-bg-opacity)',
          }
        }}
      />
    </div>
  );
}

function UserMenu({ onProfileSettings }: { onProfileSettings: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const profile = useQuery(api.profiles.getCurrentProfile);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-container hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-200"
      >
        {profile?.profilePhotoUrl ? (
          <img
            src={profile.profilePhotoUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {profile?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
        <svg className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 card shadow-large animate-slide-up">
          <div className="p-3 border-b border-secondary-100 dark:border-secondary-700">
            <p className="font-semibold text-secondary-900 dark:text-secondary-100">
              {profile?.name || "User"}
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              {profile?.isProvider ? "Service Provider" : "Customer"}
            </p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                onProfileSettings();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-container transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Settings
            </button>
            <div className="border-t border-secondary-100 dark:border-secondary-700 my-2"></div>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}

function Content({ 
  currentView, 
  setCurrentView, 
  selectedServiceId, 
  setSelectedServiceId,
  selectedBookingId,
  setSelectedBookingId 
}: {
  currentView: 'browse' | 'dashboard' | 'create-service' | 'profile-settings';
  setCurrentView: (view: 'browse' | 'dashboard' | 'create-service' | 'profile-settings') => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
}) {
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Unauthenticated>
        <div className="flex flex-col items-center gap-12 mt-16 animate-fade-in">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent mb-6 animate-bounce-subtle">
              HireMe
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8">
              Connect with local service providers or offer your skills to the community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card p-6 text-center card-hover">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-container mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Find Services</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Browse local services and connect with providers</p>
              </div>
              <div className="card p-6 text-center card-hover">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-container mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Offer Skills</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Create services and earn from your expertise</p>
              </div>
              <div className="card p-6 text-center card-hover">
                <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-600 rounded-container mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Stay Connected</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Chat and coordinate with real-time messaging</p>
              </div>
            </div>
          </div>
          <div className="card p-8 w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!profile ? (
          <ProfileSetup />
        ) : selectedBookingId ? (
          <BookingChat 
            bookingId={selectedBookingId} 
            onBack={() => setSelectedBookingId(null)} 
          />
        ) : selectedServiceId ? (
          <ServiceDetail 
            serviceId={selectedServiceId} 
            onBack={() => setSelectedServiceId(null)} 
          />
        ) : currentView === 'browse' ? (
          <ServiceBrowser onSelectService={setSelectedServiceId} />
        ) : currentView === 'dashboard' ? (
          <Dashboard 
            onCreateService={() => setCurrentView('create-service')}
            onSelectService={setSelectedServiceId}
            onSelectBooking={setSelectedBookingId}
          />
        ) : currentView === 'create-service' ? (
          <CreateService onBack={() => setCurrentView('dashboard')} />
        ) : currentView === 'profile-settings' ? (
          <ProfileSettings onBack={() => setCurrentView('dashboard')} />
        ) : null}
      </Authenticated>
    </div>
  );
}
