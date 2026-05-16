import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LangProvider } from "@/i18n/LangProvider";
import { AuthProvider } from "@/features/admin/AuthProvider";
import SiteLayout from "@/components/SiteLayout";
import AdminLayout from "@/features/admin/AdminLayout";
import RequireAdmin from "@/features/admin/RequireAdmin";

const Home = lazy(() => import("@/pages/public/Home"));
const Villas = lazy(() => import("@/pages/public/Villas"));
const VillaDetail = lazy(() => import("@/pages/public/VillaDetail"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const Privacy = lazy(() => import("@/pages/public/Privacy"));
const Terms = lazy(() => import("@/pages/public/Terms"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminPropertyForm = lazy(() => import("@/pages/admin/PropertyForm"));
const AdminLeads = lazy(() => import("@/pages/admin/Leads"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
    Loading…
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Public site */}
                  <Route element={<SiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/villas" element={<Villas />} />
                    <Route path="/villas/:slug" element={<VillaDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="properties/new" element={<AdminPropertyForm />} />
                    <Route path="properties/:id" element={<AdminPropertyForm />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Route>
                </Routes>
              </Suspense>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </LangProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
