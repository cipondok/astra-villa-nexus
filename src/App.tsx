
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboardPage from "./pages/UserDashboardPage";
import AgentDashboard from "./pages/AgentDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import PropertyOwnerDashboard from "./pages/PropertyOwnerDashboard";
import { SessionMonitor } from "@/components/SessionMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AlertProvider>
        <AuthProvider>
          <BrowserRouter>
            <SessionMonitor />
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/user" element={<UserDashboardPage />} />
                <Route path="/dashboard/agent" element={<AgentDashboard />} />
                <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </AlertProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
