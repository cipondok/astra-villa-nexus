
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import PropertyOwnerDashboardPage from "./pages/PropertyOwnerDashboardPage";
import WalletPage from "./pages/WalletPage";
import { SessionMonitor } from "@/components/SessionMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AlertProvider>
          <AuthProvider>
            <BrowserRouter>
              <SessionMonitor />
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
                  <Route path="/dashboard/user" element={<UserDashboardPage />} />
                  <Route path="/dashboard/agent" element={<AgentDashboardPage />} />
                  <Route path="/dashboard/vendor" element={<VendorDashboardPage />} />
                  <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboardPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </AlertProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
