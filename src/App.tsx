
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionMonitor } from "@/components/SessionMonitor";
import AppInitializer from "@/components/AppInitializer";
import DuplicateLoginDetector from "@/components/DuplicateLoginDetector";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContentManagement from "./pages/ContentManagement";
import Loading from "./pages/Loading";
import Services from "./pages/Services";
import ServiceForm from "./pages/ServiceForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduced retry for faster loading
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <LanguageProvider>
          <ThemeSettingsProvider>
            <AlertProvider>
              <EnhancedAuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/content-management" element={<ContentManagement />} />
                      <Route path="/loading" element={<Loading />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/new" element={<ServiceForm />} />
                    </Routes>
                    <SessionMonitor />
                    <DuplicateLoginDetector />
                  </BrowserRouter>
                </TooltipProvider>
              </EnhancedAuthProvider>
            </AlertProvider>
          </ThemeSettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
