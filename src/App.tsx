
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppInitializer from '@/components/AppInitializer';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import Saved from '@/pages/Saved';
import Profile from '@/pages/Profile';
import Services from '@/pages/Services';
import PropertyDetail from '@/pages/PropertyDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import Dijual from '@/pages/Dijual';
import Disewa from '@/pages/Disewa';
import BookingPage from '@/pages/BookingPage';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import VendorKYCDashboard from '@/pages/VendorKYCDashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import CustomerServiceDashboardPage from '@/pages/CustomerServiceDashboard';
import UserDashboardPage from '@/pages/UserDashboardPage';
import ThreeDShowcase from '@/pages/ThreeDShowcase';
import PreLaunching from '@/pages/PreLaunching';
import AstraTokensPage from '@/pages/AstraTokensPage';
import Properties from '@/pages/Properties';
import Notifications from '@/pages/Notifications';
import Users from '@/pages/Users';
import Analytics from '@/pages/Analytics';
import ErrorPage from '@/pages/ErrorPage';
import MobileFirstDemo from '@/components/responsive/MobileFirstDemo';


const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = ['/admin', '/admin-dashboard', '/settings'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isAdminRoute && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Profile />} />
          <Route path="/astra-tokens" element={<AstraTokensPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/dijual" element={<Dijual />} />
          <Route path="/buy" element={<Dijual />} />
          <Route path="/disewa" element={<Disewa />} />
          <Route path="/rent" element={<Disewa />} />
          <Route path="/pre-launching" element={<PreLaunching />} />
          <Route path="/dijual" element={<Properties />} />
          <Route path="/3d-showcase" element={<ThreeDShowcase />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/settings" element={<AdminDashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/listings" element={<AgentDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/agent-listings" element={<AgentDashboard />} />
          <Route path="/vendor/kyc" element={<VendorKYCDashboard />} />
          <Route path="/dashboard/vendor" element={<VendorDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/dashboard/customer-service" element={<CustomerServiceDashboardPage />} />
          <Route path="/dashboard/user" element={<UserDashboardPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/booking/:propertyId" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/mobile-demo" element={<MobileFirstDemo />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <ProfessionalFooter language="en" />}
    </div>
  );
};

function App() {
  // Create QueryClient instance directly to avoid hook context issues
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
          <LanguageProvider>
            <AlertProvider>
              <AuthProvider>
                <NotificationProvider>
                  <PropertyComparisonProvider>
                    <Router>
                      <AppInitializer>
                        <AppContent />
                      </AppInitializer>
                    </Router>
                    <Toaster />
                  </PropertyComparisonProvider>
                </NotificationProvider>
              </AuthProvider>
            </AlertProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
