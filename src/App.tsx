
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import PropertyListings from "./pages/PropertyListings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ThemeSettingsProvider>
            <LanguageProvider>
              <AuthProvider>
                <WalletProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/properties" element={<PropertyListings />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/user" element={<UserDashboard />} />
                    </Routes>
                  </TooltipProvider>
                </WalletProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeSettingsProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
