
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import UserDashboard from "@/pages/UserDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import AgentDashboard from "@/pages/AgentDashboard";
import PropertyOwnerDashboard from "@/pages/PropertyOwnerDashboard";
import Auth from "@/pages/Auth";
import Properties from "@/pages/Properties";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/user" element={<UserDashboard />} />
                <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                <Route path="/dashboard/agent" element={<AgentDashboard />} />
                <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}

export default App;
