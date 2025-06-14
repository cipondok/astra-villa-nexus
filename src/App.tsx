
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import PropertyOwnerDashboard from "./pages/PropertyOwnerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AddProperty from "./pages/AddProperty";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import NewProjects from "./pages/NewProjects";
import PreLaunching from "./pages/PreLaunching";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertProvider>
      <AuthProvider>
        <ThemeSettingsProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/user" element={<UserDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/agent" element={<AgentDashboard />} />
                  <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
                  <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/buy" element={<Buy />} />
                  <Route path="/rent" element={<Rent />} />
                  <Route path="/new-projects" element={<NewProjects />} />
                  <Route path="/pre-launching" element={<PreLaunching />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </ThemeSettingsProvider>
      </AuthProvider>
    </AlertProvider>
  </QueryClientProvider>
);

export default App;
