import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import MobileFooter from '@/components/MobileFooter';
import InitialLoadingScreen from '@/components/ui/InitialLoadingScreen';
import { DesignSystemProvider } from '@/components/DesignSystemProvider';
import CookieSystem from '@/components/cookies/CookieSystem';
import ResponsiveAIChatWidget from '@/components/ai/ResponsiveAIChatWidget';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCLSMonitor } from '@/hooks/useCLSMonitor';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVIPNotifications } from '@/hooks/useVIPNotifications';
import GlobalLoadingIndicator from '@/components/ui/GlobalLoadingIndicator';

// Critical pages - load immediately
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import Auth from '@/pages/Auth';
import PropertyDetail from '@/pages/PropertyDetail';
import Dijual from '@/pages/Dijual';
import Disewa from '@/pages/Disewa';
import ErrorPage from '@/pages/ErrorPage';

// Route guards
import VendorOnlyRoute from '@/components/VendorOnlyRoute';
import AgentOnlyRoute from '@/components/AgentOnlyRoute';
import PropertyOwnerOnlyRoute from '@/components/PropertyOwnerOnlyRoute';

// Lazy load heavy pages for better initial load performance
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const AgentDashboard = lazy(() => import('@/pages/AgentDashboard'));
const VendorDashboard = lazy(() => import('@/pages/VendorDashboard'));
const PropertyOwnerDashboard = lazy(() => import('@/pages/PropertyOwnerDashboard'));
const VendorKYCDashboard = lazy(() => import('@/pages/VendorKYCDashboard'));
const CustomerServiceDashboardPage = lazy(() => import('@/pages/CustomerServiceDashboard'));
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage'));
const ThreeDShowcase = lazy(() => import('@/pages/ThreeDShowcase'));
const AddProperty = lazy(() => import('@/pages/AddProperty'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const BookingSuccessPage = lazy(() => import('@/pages/BookingSuccessPage'));
const MembershipPage = lazy(() => import('@/pages/MembershipPage'));
const AstraTokensPage = lazy(() => import('@/pages/AstraTokensPage'));
const Community = lazy(() => import('@/pages/Community'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const MarketplaceCategory = lazy(() => import('@/pages/MarketplaceCategory'));
const VendorRegistration = lazy(() => import('@/pages/VendorRegistration'));
const ConstructionCostCalculator = lazy(() => import('@/pages/calculators/ConstructionCostCalculator'));
const HomeLoanCalculator = lazy(() => import('@/pages/calculators/HomeLoanCalculator'));
const AreaUnitConverter = lazy(() => import('@/pages/calculators/AreaUnitConverter'));
const Saved = lazy(() => import('@/pages/Saved'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileEditPage = lazy(() => import('@/pages/ProfileEditPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const DesignSystemSettings = lazy(() => import('@/pages/admin/DesignSystemSettings'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceCategory = lazy(() => import('@/pages/ServiceCategory'));
const PreLaunching = lazy(() => import('@/pages/PreLaunching'));
const NewProjects = lazy(() => import('@/pages/NewProjects'));
const AreaGuides = lazy(() => import('@/pages/AreaGuides'));
const Properties = lazy(() => import('@/pages/Properties'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Users = lazy(() => import('@/pages/Users'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const MobileFirstDemo = lazy(() => import('@/components/responsive/MobileFirstDemo'));
const ForeignInvestment = lazy(() => import('@/pages/ForeignInvestment'));
const Offers = lazy(() => import('@/pages/Offers'));
const PartnerNetwork = lazy(() => import('@/pages/partners/PartnerNetwork'));
const BecomePartner = lazy(() => import('@/pages/partners/BecomePartner'));
const PartnerBenefits = lazy(() => import('@/pages/partners/PartnerBenefits'));
const JointVentures = lazy(() => import('@/pages/partners/JointVentures'));
const SharedSearch = lazy(() => import('@/pages/SharedSearch'));
const AstraDevelopment = lazy(() => import('@/pages/AstraDevelopment'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const LocationMap = lazy(() => import('@/pages/LocationMap'));

// Lazy loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  useCLSMonitor(process.env.NODE_ENV === 'development');
  useScrollRestore(true);
  useVIPNotifications();
  
  const location = useLocation();
  const { language } = useLanguage();
  const isAdminRoute = ['/admin', '/admin-dashboard', '/settings'].includes(location.pathname);
  const { isMobile } = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalLoadingIndicator />
      {!isAdminRoute && <Navigation />}
      <main className={isAdminRoute ? '' : 'pt-10 md:pt-11 lg:pt-12'}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/astra-tokens" element={<AstraTokensPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/category/:categoryId" element={<ServiceCategory />} />
            <Route path="/dijual" element={<Dijual />} />
            <Route path="/buy" element={<Dijual />} />
            <Route path="/disewa" element={<Disewa />} />
            <Route path="/rent" element={<Disewa />} />
            <Route path="/pre-launching" element={<PreLaunching />} />
            <Route path="/new-projects" element={<NewProjects />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/3d-showcase" element={<ThreeDShowcase />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/design-system" element={<DesignSystemSettings />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/agent" element={<Navigate to="/agent-dashboard" replace />} />
            <Route path="/listings" element={<Navigate to="/agent-dashboard" replace />} />
            <Route path="/agent-listings" element={<Navigate to="/agent-dashboard" replace />} />
            <Route path="/vendor/kyc" element={<VendorKYCDashboard />} />
            <Route element={<VendorOnlyRoute />}>
              <Route path="/dashboard/vendor" element={<VendorDashboard />} />
              <Route path="/vendor" element={<VendorDashboard />} />
            </Route>
            <Route element={<AgentOnlyRoute />}>
              <Route path="/dashboard/agent" element={<AgentDashboard />} />
            </Route>
            <Route element={<PropertyOwnerOnlyRoute />}>
              <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
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
            <Route path="/foreign-investment" element={<ForeignInvestment />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/partners/network" element={<PartnerNetwork />} />
            <Route path="/partners/become" element={<BecomePartner />} />
            <Route path="/partners/benefits" element={<PartnerBenefits />} />
            <Route path="/partners/ventures" element={<JointVentures />} />
            <Route path="/mobile-demo" element={<MobileFirstDemo />} />
            <Route path="/community" element={<Community />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/category/:categoryId" element={<MarketplaceCategory />} />
            <Route path="/vendor-registration" element={<VendorRegistration />} />
            <Route path="/shared-search/:shareId" element={<SharedSearch />} />
            <Route path="/development" element={<AstraDevelopment />} />
            <Route path="/astra-development" element={<AstraDevelopment />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/location" element={<LocationMap />} />
            <Route path="/location-map" element={<LocationMap />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && (isMobile ? <MobileFooter /> : <ProfessionalFooter language={language} />)}
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <InitialLoadingScreen key="loading" />
        ) : (
          <Router key="app">
            <QueryClientProvider client={queryClient}>
              <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
                <DesignSystemProvider>
                  <LanguageProvider>
                    <AlertProvider>
                      <AuthProvider>
                        <NotificationProvider>
                          <PropertyComparisonProvider>
                            <AppContent />
                            <Toaster />
                            <Sonner />
                            <CookieSystem />
                            <ResponsiveAIChatWidget />
                          </PropertyComparisonProvider>
                        </NotificationProvider>
                      </AuthProvider>
                    </AlertProvider>
                  </LanguageProvider>
                </DesignSystemProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </Router>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
