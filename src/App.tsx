
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Profile from "./pages/Profile";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import UserDashboardPage from "./pages/UserDashboardPage";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="astra-villa-theme">
      <ThemeSettingsProvider>
        <AlertProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/agent" element={<AgentDashboard />} />
                  <Route path="/dashboard/user" element={<UserDashboardPage />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
