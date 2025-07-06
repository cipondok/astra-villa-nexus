
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { ThemeSettingsProvider } from '@/contexts/ThemeSettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import AppInitializer from '@/components/AppInitializer';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import About from '@/pages/About';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import UserDashboard from '@/pages/UserDashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import VendorsHub from '@/pages/VendorsHub';
import PropertyOwnerDashboard from '@/pages/PropertyOwnerDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import Analytics from '@/pages/Analytics';
import Services from '@/pages/Services';
import ServiceForm from '@/pages/ServiceForm';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminOnlyRoute from '@/components/AdminOnlyRoute';
import VendorOnlyRoute from '@/components/VendorOnlyRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
        <AlertProvider>
          <LanguageProvider>
            <WebsiteSettingsProvider>
              <ThemeSettingsProvider>
                <AuthProvider>
                  <AppInitializer>
                    <Router>
                      <div className="min-h-screen bg-background text-foreground theme-transition">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/properties" element={<Properties />} />
                          <Route path="/properties/:id" element={<PropertyDetail />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/services/new" element={<ServiceForm />} />

                          <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/user-dashboard" element={<UserDashboard />} />
                            <Route path="/analytics" element={<Analytics />} />
                          </Route>

                          <Route element={<AdminOnlyRoute />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/vendors-hub" element={<VendorsHub />} />
                          </Route>

                          <Route element={<VendorOnlyRoute />}>
                            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                          </Route>

                          <Route path="/property-owner-dashboard" element={<PropertyOwnerDashboard />} />
                          <Route path="/agent-dashboard" element={<AgentDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Toaster />
                      </div>
                    </Router>
                  </AppInitializer>
                </AuthProvider>
              </ThemeSettingsProvider>
            </WebsiteSettingsProvider>
          </LanguageProvider>
        </AlertProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
