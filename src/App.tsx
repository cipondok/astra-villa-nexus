
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContentManagement from "./pages/ContentManagement";
import Loading from "./pages/Loading";
import Services from "./pages/Services";
import ServiceForm from "./pages/ServiceForm";
import VendorDashboard from "./pages/VendorDashboard";

// Simple deployment verification
console.log('🚀 DEPLOYMENT CHECK: App.tsx loaded at', new Date().toISOString());
console.log('🚀 DEPLOYMENT CHECK: React version:', React.version);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  console.log('🚀 DEPLOYMENT CHECK: App component rendering...');
  
  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <div style={{ 
        padding: '20px', 
        background: 'green', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        ✅ NEW VERSION IS LIVE! Deployment working at {new Date().toLocaleTimeString()}
      </div>
      
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <LanguageProvider>
            <ThemeSettingsProvider>
              <AuthProvider>
                <AlertProvider>
                  <TooltipProvider>
                    <Toaster />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/content-management" element={<ContentManagement />} />
                        <Route path="/loading" element={<Loading />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/new" element={<ServiceForm />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </AlertProvider>
              </AuthProvider>
            </ThemeSettingsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
