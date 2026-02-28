// App entry point
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { Loader2 } from 'lucide-react';

import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DesignSystemProvider } from '@/components/DesignSystemProvider';
import CookieSystem from '@/components/cookies/CookieSystem';
import { useTranslation } from '@/i18n/useTranslation';
import { useCLSMonitor } from '@/hooks/useCLSMonitor';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVIPNotifications } from '@/hooks/useVIPNotifications';
import { usePropertyAlerts } from '@/hooks/usePropertyAlerts';
import { useReferralTracking } from '@/hooks/useReferralTracking';
import { useNewListingMatcher } from '@/hooks/useNewListingMatcher';

import { useAdminCheck } from '@/hooks/useAdminCheck';
import MaintenancePage from '@/pages/MaintenancePage';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';

// Lazy load all non-critical shell components — reduces initial parse time
const Navigation = lazy(() => import('@/components/Navigation'));
const ProfessionalFooter = lazy(() => import('@/components/ProfessionalFooter'));
const MobileFooter = lazy(() => import('@/components/MobileFooter'));
const InitialLoadingScreen = lazy(() => import('@/components/ui/InitialLoadingScreen'));
const GlobalLoadingIndicator = lazy(() => import('@/components/ui/GlobalLoadingIndicator'));


const ResponsiveAIChatWidget = lazy(() => import('@/components/ai/ResponsiveAIChatWidget'));
const WhatsAppInquiryButton = lazy(() => import('@/components/WhatsAppInquiryButton'));

// Lazy load shell handlers — none are needed for first paint
const SessionExpirationHandler = lazy(() => import('@/components/SessionExpirationHandler'));
const AuthNotificationHandler = lazy(() => import('@/components/AuthNotificationHandler'));

// Route guards — small but pull in auth context chains eagerly
import VendorOnlyRoute from '@/components/VendorOnlyRoute';
import AgentOnlyRoute from '@/components/AgentOnlyRoute';
import PropertyOwnerOnlyRoute from '@/components/PropertyOwnerOnlyRoute';

// All pages — lazy loaded for minimum initial bundle
const Index = lazy(() => import('@/pages/Index'));
const Search = lazy(() => import('@/pages/Search'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const Dijual = lazy(() => import('@/pages/Dijual'));
const Disewa = lazy(() => import('@/pages/Disewa'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const ProvinceProperties = lazy(() => import('@/pages/ProvinceProperties'));
const LocationAnalyticsDashboard = lazy(() => import('@/pages/LocationAnalyticsDashboard'));
const AgentDashboard = lazy(() => import('@/pages/AgentDashboard'));
const VendorDashboard = lazy(() => import('@/pages/VendorDashboard'));
const PropertyOwnerDashboard = lazy(() => import('@/pages/PropertyOwnerDashboard'));
const VendorKYCDashboard = lazy(() => import('@/pages/VendorKYCDashboard'));
const CustomerServiceDashboardPage = lazy(() => import('@/pages/CustomerServiceDashboard'));
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage'));
// ThreeDShowcase removed - consolidated into VR Tour
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
const MyProperties = lazy(() => import('@/pages/MyProperties'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Users = lazy(() => import('@/pages/Users'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const MobileFirstDemo = lazy(() => import('@/components/responsive/MobileFirstDemo'));
const Investment = lazy(() => import('@/pages/Investment'));
const Offers = lazy(() => import('@/pages/Offers'));
const PartnerNetwork = lazy(() => import('@/pages/partners/PartnerNetwork'));
const BecomePartner = lazy(() => import('@/pages/partners/BecomePartner'));
const PartnerBenefits = lazy(() => import('@/pages/partners/PartnerBenefits'));
const JointVentures = lazy(() => import('@/pages/partners/JointVentures'));
const SharedSearch = lazy(() => import('@/pages/SharedSearch'));
const AdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage'));
const AstraDevelopment = lazy(() => import('@/pages/AstraDevelopment'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const LocationMap = lazy(() => import('@/pages/LocationMap'));
const Contact = lazy(() => import('@/pages/Contact'));
const Help = lazy(() => import('@/pages/Help'));
const About = lazy(() => import('@/pages/About'));
const WNIPage = lazy(() => import('@/pages/investor/WNIPage'));
const WNAPage = lazy(() => import('@/pages/investor/WNAPage'));
const VerificationCenter = lazy(() => import('@/pages/VerificationCenter'));
const CommunityHub = lazy(() => import('@/pages/CommunityHub'));
const AIContentGenerator = lazy(() => import('@/pages/AIContentGenerator'));
const ViralCampaigns = lazy(() => import('@/pages/ViralCampaigns'));
const PlatformHub = lazy(() => import('@/pages/PlatformHub'));
const VRTourShowcase = lazy(() => import('@/pages/VRTourShowcase'));
const BlockchainVerification = lazy(() => import('@/pages/BlockchainVerification'));
const MediaHub = lazy(() => import('@/pages/MediaHub'));
const AgentDirectory = lazy(() => import('@/pages/AgentDirectory'));
const AgentRegistration = lazy(() => import('@/pages/AgentRegistration'));
const PropertyComparison = lazy(() => import('@/pages/PropertyComparison'));
const PreQualificationPage = lazy(() => import('@/pages/PreQualificationPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const UserRentalDashboard = lazy(() => import('@/pages/UserRentalDashboard'));
const AIPriceEstimator = lazy(() => import('@/pages/AIPriceEstimator'));
const KprCalculatorPage = lazy(() => import('@/pages/KprCalculatorPage'));

// Minimal lazy loading fallback - just shows content area skeleton
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--gold-primary))]" />
  </div>
);

// Hook to check maintenance mode status from DB
const useMaintenanceMode = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['maintenanceMode', 'maintenanceMessage']);
        const map: Record<string, string> = {};
        data?.forEach((r) => { map[r.key] = String(r.value ?? ''); });
        setMaintenanceMode(map.maintenanceMode === 'true');
        setMaintenanceMessage(map.maintenanceMessage || '');
      } catch {
        // silent — don't block app on settings error
      }
    };
    check();
  }, []);

  return { maintenanceMode, maintenanceMessage };
};

const AppContent = () => {
  useCLSMonitor(process.env.NODE_ENV === 'development');
  useScrollRestore(true);
  useVIPNotifications();
  usePropertyAlerts();
  useReferralTracking();
  useNewListingMatcher();
  
  
  const location = useLocation();
  const { language } = useTranslation();
  const isAdminRoute = ['/admin', '/admin-dashboard', '/settings'].includes(location.pathname);
  const { isMobile } = useIsMobile();
  const { isAdmin } = useAdminCheck();
  const { maintenanceMode, maintenanceMessage } = useMaintenanceMode();

  // Block non-admins when maintenance mode is on (admin routes stay accessible)
  if (maintenanceMode && !isAdmin && !isAdminRoute) {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NetworkStatusIndicator />
      <Suspense fallback={null}><GlobalLoadingIndicator /></Suspense>
      {!isAdminRoute && <Suspense fallback={null}><Navigation /></Suspense>}
      <main className={isAdminRoute ? '' : 'pt-10 md:pt-11 lg:pt-12 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0'}>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search-advanced" element={<AdvancedSearchPage />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/favorites" element={<Saved />} />
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
                <Route path="/3d-showcase" element={<Navigate to="/vr-tour" replace />} />
                <Route path="/vr-tour" element={<VRTourShowcase />} />
                <Route path="/blockchain-verification" element={<BlockchainVerification />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/location-analytics" element={<LocationAnalyticsDashboard />} />
                <Route path="/province-properties" element={<ProvinceProperties />} />
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
                <Route path="/my-properties" element={<MyProperties />} />
                <Route path="/dashboard/customer-service" element={<CustomerServiceDashboardPage />} />
                <Route path="/dashboard/user" element={<UserDashboardPage />} />
                <Route path="/user-dashboard" element={<UserDashboardPage />} />
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
                <Route path="/investment" element={<Investment />} />
                <Route path="/foreign-investment" element={<Navigate to="/investment" replace />} />
                <Route path="/kpr-calculator" element={<KprCalculatorPage />} />
                <Route path="/simulasi-kpr" element={<Navigate to="/kpr-calculator" replace />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/partners/network" element={<PartnerNetwork />} />
                <Route path="/partners/become" element={<BecomePartner />} />
                <Route path="/partners/benefits" element={<PartnerBenefits />} />
                <Route path="/partners/ventures" element={<JointVentures />} />
                <Route path="/mobile-demo" element={<MobileFirstDemo />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community-hub" element={<CommunityHub />} />
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
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<Help />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Contact />} />
                <Route path="/investor/wni" element={<Navigate to="/investment?section=wni" replace />} />
                <Route path="/investor/wna" element={<Navigate to="/investment?section=wna" replace />} />
                <Route path="/verification" element={<VerificationCenter />} />
                <Route path="/verification-center" element={<VerificationCenter />} />
                <Route path="/ai-content-generator" element={<AIContentGenerator />} />
                <Route path="/content-generator" element={<AIContentGenerator />} />
                <Route path="/campaigns" element={<ViralCampaigns />} />
                <Route path="/viral-campaigns" element={<ViralCampaigns />} />
                <Route path="/marketing" element={<ViralCampaigns />} />
                <Route path="/media" element={<MediaHub />} />
                <Route path="/platform" element={<PlatformHub />} />
                <Route path="/infrastructure" element={<PlatformHub />} />
                <Route path="/agents" element={<AgentDirectory />} />
                <Route path="/cari-agen" element={<AgentDirectory />} />
                <Route path="/agent-registration" element={<AgentRegistration />} />
                <Route path="/daftar-agen" element={<AgentRegistration />} />
                <Route path="/property-comparison" element={<PropertyComparison />} />
                <Route path="/pre-qualification" element={<PreQualificationPage />} />
                <Route path="/mortgage-prequalification" element={<PreQualificationPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/my-rentals" element={<UserRentalDashboard />} />
                <Route path="/ai-pricing" element={<AIPriceEstimator />} />
                <Route path="/price-estimator" element={<AIPriceEstimator />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isAdminRoute && (
        <Suspense fallback={null}>
          {isMobile ? <MobileFooter /> : <ProfessionalFooter language={language} />}
        </Suspense>
      )}
    </div>
  );
};

// Create QueryClient instance outside component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,      // 10 min - reduce unnecessary refetches
      gcTime: 30 * 60 * 1000,          // 30 min - keep cache longer
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
});

function App() {
  // Only show initial loading on first app load (not on navigation)
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);

  useEffect(() => {
    const checkWelcomeScreen = async () => {
      try {
        const { safeSessionStorage, storageSupport } = await import('@/lib/safeStorage');

        // If sessionStorage is not persistent (private/restricted mode), fail-closed.
        // Otherwise the welcome screen would reappear on every refresh.
        if (!storageSupport.session) {
          setWelcomeEnabled(false);
          setIsLoading(false);
          return;
        }

        // FIRST: Check if welcome screen was already shown this session
        const hasLoaded = safeSessionStorage.getItem('astra_app_loaded');
        if (hasLoaded === 'true') {
          // Already shown this session - skip immediately
          setIsLoading(false);
          return;
        }

        // Import supabase client
        const { supabase } = await import('@/integrations/supabase/client');

        // Fetch welcome screen settings from the correct category
        const { data: settingsData } = await supabase
          .from('system_settings')
          .select('key, value')
          .eq('category', 'loading_page')
          .in('key', ['welcomeScreenEnabled', 'welcomeSkipOnReturn', 'welcomeLoadingDuration']);

        // Parse settings
        const settings: Record<string, any> = {};
        settingsData?.forEach((row) => {
          settings[row.key] = row.value;
        });

        // Default to enabled if not set
        const isEnabled =
          settings.welcomeScreenEnabled === undefined ||
          settings.welcomeScreenEnabled === null ||
          settings.welcomeScreenEnabled === true ||
          settings.welcomeScreenEnabled === 'true';

        const loadingDuration =
          typeof settings.welcomeLoadingDuration === 'number'
            ? settings.welcomeLoadingDuration
            : parseInt(settings.welcomeLoadingDuration) || 2000;

        setWelcomeEnabled(isEnabled);

        if (!isEnabled) {
          setIsLoading(false);
          safeSessionStorage.setItem('astra_app_loaded', 'true');
          return;
        }

        // Show welcome screen for configured duration, then mark as loaded
        const timer = setTimeout(() => {
          setIsLoading(false);
          safeSessionStorage.setItem('astra_app_loaded', 'true');
        }, loadingDuration);

        return () => clearTimeout(timer);
      } catch (error) {
        // On error, show welcome screen briefly then proceed
        const timer = setTimeout(async () => {
          setIsLoading(false);
          try {
            const { safeSessionStorage } = await import('@/lib/safeStorage');
            safeSessionStorage.setItem('astra_app_loaded', 'true');
          } catch {
            // ignore
          }
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    checkWelcomeScreen();
  }, []);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isLoading && welcomeEnabled ? (
          <Suspense fallback={null}><InitialLoadingScreen key="loading" /></Suspense>
        ) : (
          <Router key="app" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
                <DesignSystemProvider>
                  <LanguageProvider>
                    <AlertProvider>
                      <AuthProvider>
                        <NotificationProvider>
                          <PropertyComparisonProvider>
                            <AppContent />
                            <Suspense fallback={null}>
                              {React.createElement(lazy(() => import('@/components/property/PropertyComparisonPanel')))}
                            </Suspense>
                            <Toaster />
                            <Sonner />
                            <CookieSystem />
                            <Suspense fallback={null}>
                              <ResponsiveAIChatWidget />
                              <WhatsAppInquiryButton variant="floating" defaultType="general" />
                              
                              <SessionExpirationHandler />
                              <AuthNotificationHandler />
                            </Suspense>
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
