
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import ServiceCategory from '@/pages/ServiceCategory';
import PropertyDetail from '@/pages/PropertyDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import Dijual from '@/pages/Dijual';
import Disewa from '@/pages/Disewa';
import BookingPage from '@/pages/BookingPage';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import VendorKYCDashboard from '@/pages/VendorKYCDashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import VendorOnlyRoute from '@/components/VendorOnlyRoute';
import CustomerServiceDashboardPage from '@/pages/CustomerServiceDashboard';
import UserDashboardPage from '@/pages/UserDashboardPage';
import ProfileEditPage from '@/pages/ProfileEditPage';
import ThreeDShowcase from '@/pages/ThreeDShowcase';
import PreLaunching from '@/pages/PreLaunching';
import NewProjects from '@/pages/NewProjects';
import AstraTokensPage from '@/pages/AstraTokensPage';
import ConstructionCostCalculator from '@/pages/calculators/ConstructionCostCalculator';
import HomeLoanCalculator from '@/pages/calculators/HomeLoanCalculator';
import AreaUnitConverter from '@/pages/calculators/AreaUnitConverter';
import AreaGuides from '@/pages/AreaGuides';
import Properties from '@/pages/Properties';
import Notifications from '@/pages/Notifications';
import Users from '@/pages/Users';
import Analytics from '@/pages/Analytics';
import AddProperty from '@/pages/AddProperty';
import ErrorPage from '@/pages/ErrorPage';
import MobileFirstDemo from '@/components/responsive/MobileFirstDemo';
import { useLanguage } from '@/contexts/LanguageContext';


const AppContent = () => {
  const location = useLocation();
  const { language } = useLanguage();
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
          <Route path="/services/category/:categoryId" element={<ServiceCategory />} />
          <Route path="/dijual" element={<Dijual />} />
          <Route path="/buy" element={<Dijual />} />
          <Route path="/disewa" element={<Disewa />} />
          <Route path="/rent" element={<Disewa />} />
          <Route path="/pre-launching" element={<PreLaunching />} />
          <Route path="/new-projects" element={<NewProjects />} />
          <Route path="/dijual" element={<Properties />} />
          <Route path="/3d-showcase" element={<ThreeDShowcase />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/settings" element={<AdminDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          {/* Redirect other agent URLs to main dashboard */}
          <Route path="/agent" element={<Navigate to="/agent-dashboard" replace />} />
          <Route path="/listings" element={<Navigate to="/agent-dashboard" replace />} />
          <Route path="/agent-listings" element={<Navigate to="/agent-dashboard" replace />} />
          <Route path="/vendor/kyc" element={<VendorKYCDashboard />} />
          <Route element={<VendorOnlyRoute />}>
            <Route path="/dashboard/vendor" element={<VendorDashboard />} />
            <Route path="/vendor" element={<VendorDashboard />} />
          </Route>
          <Route path="/dashboard/customer-service" element={<CustomerServiceDashboardPage />} />
          <Route path="/dashboard/user" element={<UserDashboardPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/booking/:propertyId" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calculators/construction" element={<ConstructionCostCalculator />} />
          <Route path="/calculators/loan" element={<HomeLoanCalculator />} />
          <Route path="/calculators/area" element={<AreaUnitConverter />} />
          <Route path="/areas" element={<AreaGuides />} />
          <Route path="/mobile-demo" element={<MobileFirstDemo />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <ProfessionalFooter language={language} />}
    </div>
  );
};

// Create QueryClient instance outside component to avoid recreation on every render
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
            <LanguageProvider>
              <AlertProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <PropertyComparisonProvider>
                      <AppInitializer>
                        <AppContent />
                      </AppInitializer>
                      <Toaster />
                    </PropertyComparisonProvider>
                  </NotificationProvider>
                </AuthProvider>
              </AlertProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
