
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

console.log('=== APP.TSX DEBUG START ===');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log('1. QueryClient created:', queryClient);

const App: React.FC = () => {
  console.log('2. App component rendering...');
  
  try {
    console.log('3. Rendering app structure...');
    
    return (
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
    );
  } catch (error) {
    console.error('❌ Error in App component:', error);
    console.error('Error stack:', error.stack);
    
    // Fallback UI
    return (
      <div style={{ 
        padding: '20px', 
        background: 'red', 
        color: 'white', 
        fontSize: '20px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <h1>ERROR IN APP COMPONENT</h1>
        <p>Check the console for details</p>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
};

console.log('4. App component defined');
console.log('=== APP.TSX DEBUG END ===');

export default App;
