
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import { Toaster } from '@/components/ui/toaster';
import MobileAppLayout from '@/components/MobileAppLayout';
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
import ThreeDShowcase from '@/pages/ThreeDShowcase';
import PreLaunching from '@/pages/PreLaunching';
import NotFound from '@/pages/NotFound';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
        <LanguageProvider>
          <WebsiteSettingsProvider>
            <AlertProvider>
              <AuthProvider>
                <NotificationProvider>
                  <PropertyComparisonProvider>
                  <Router>
                    <MobileAppLayout>
                      <div className="min-h-screen bg-background text-foreground">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/search" element={<Search />} />
                          <Route path="/saved" element={<Saved />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/auth" element={<Profile />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/dijual" element={<Dijual />} />
                          <Route path="/buy" element={<Dijual />} />
                          <Route path="/disewa" element={<Disewa />} />
                          <Route path="/rent" element={<Disewa />} />
                          <Route path="/pre-launching" element={<PreLaunching />} />
                          <Route path="/3d-showcase" element={<ThreeDShowcase />} />
                          <Route path="/properties/:id" element={<PropertyDetail />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard" element={<AdminDashboard />} />
                          <Route path="/settings" element={<AdminDashboard />} />
                          <Route path="/agent" element={<AgentDashboard />} />
                          <Route path="/vendor/kyc" element={<VendorKYCDashboard />} />
                          <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                          <Route path="/vendor" element={<VendorDashboard />} />
                          <Route path="/booking/:propertyId" element={<BookingPage />} />
                          <Route path="/booking-success" element={<BookingSuccessPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </MobileAppLayout>
                    </Router>
                  </PropertyComparisonProvider>
                </NotificationProvider>
              </AuthProvider>
            </AlertProvider>
          </WebsiteSettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
