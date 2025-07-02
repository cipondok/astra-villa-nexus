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
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailsPage from '@/pages/PropertyDetailsPage';
import AgentsPage from '@/pages/AgentsPage';
import AgentDetailsPage from '@/pages/AgentDetailsPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import ContactPage from '@/pages/ContactPage';
import AboutUsPage from '@/pages/AboutUsPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminPropertiesPage from '@/pages/admin/AdminPropertiesPage';
import AdminAgentsPage from '@/pages/admin/AdminAgentsPage';
import AdminVendorsPage from '@/pages/admin/AdminVendorsPage';
import AdminBlogPostsPage from '@/pages/admin/AdminBlogPostsPage';
import AdminSystemSettingsPage from '@/pages/admin/AdminSystemSettingsPage';
import AdminWebsiteDesignPage from '@/pages/admin/AdminWebsiteDesignPage';
import VendorDashboardPage from '@/pages/vendor/VendorDashboardPage';
import VendorPropertiesPage from '@/pages/vendor/VendorPropertiesPage';
import VendorProfilePage from '@/pages/vendor/VendorProfilePage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicOnlyRoute from '@/components/PublicOnlyRoute';
import AdminOnlyRoute from '@/components/AdminOnlyRoute';
import VendorOnlyRoute from '@/components/VendorOnlyRoute';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
        <WebsiteSettingsProvider>
          <ThemeSettingsProvider>
            <AuthProvider>
              <AlertProvider>
                <LanguageProvider>
                  <AppInitializer>
                    <Router>
                      <div className="min-h-screen bg-background text-foreground theme-transition">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/properties" element={<PropertiesPage />} />
                          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                          <Route path="/agents" element={<AgentsPage />} />
                          <Route path="/agents/:id" element={<AgentDetailsPage />} />
                          <Route path="/blog" element={<BlogPage />} />
                          <Route path="/blog/:id" element={<BlogPostPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/about" element={<AboutUsPage />} />
                          <Route path="/terms" element={<TermsOfServicePage />} />
                          <Route path="/privacy" element={<PrivacyPolicyPage />} />

                          <Route element={<PublicOnlyRoute />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                          </Route>

                          <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                          </Route>

                          <Route element={<AdminOnlyRoute />}>
                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                            <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                            <Route path="/admin/agents" element={<AdminAgentsPage />} />
                            <Route path="/admin/vendors" element={<AdminVendorsPage />} />
                            <Route path="/admin/blog-posts" element={<AdminBlogPostsPage />} />
                            <Route path="/admin/system-settings" element={<AdminSystemSettingsPage />} />
                            <Route path="/admin/website-design" element={<AdminWebsiteDesignPage />} />
                          </Route>

                          <Route element={<VendorOnlyRoute />}>
                            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
                            <Route path="/vendor/properties" element={<VendorPropertiesPage />} />
                            <Route path="/vendor/profile" element={<VendorProfilePage />} />
                          </Route>

                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                        <Toaster />
                      </div>
                    </Router>
                  </AppInitializer>
                </LanguageProvider>
              </AlertProvider>
            </AuthProvider>
          </ThemeSettingsProvider>
        </WebsiteSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
