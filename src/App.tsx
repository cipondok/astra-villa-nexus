
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import UserDashboardPage from "./pages/UserDashboardPage";
import PropertyOwnerDashboard from "./pages/PropertyOwnerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VendorRegistration from "./pages/VendorRegistration";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import AddProperty from "./pages/AddProperty";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import NewProjects from "./pages/NewProjects";
import PreLaunching from "./pages/PreLaunching";
import About from "./pages/About";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import WalletPage from "./pages/WalletPage";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AlertProvider } from "./contexts/AlertContext";
import { Web3ModalProvider } from "./components/wallet/Web3ModalProvider";
import { WalletProvider } from "./contexts/WalletContext";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Web3ModalProvider>
          <LanguageProvider>
            <AuthProvider>
              <WalletProvider>
                <AlertProvider>
                  <TooltipProvider>
                    <Toaster />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/user" element={<UserDashboard />} />
                        <Route path="/user-dashboard" element={<UserDashboardPage />} />
                        <Route path="/dashboard/owner" element={<PropertyOwnerDashboard />} />
                        <Route path="/dashboard/agent" element={<AgentDashboard />} />
                        <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                        <Route path="/vendor/register" element={<VendorRegistration />} />
                        <Route path="/properties" element={<Properties />} />
                        <Route path="/property/:id" element={<PropertyDetail />} />
                        <Route path="/add-property" element={<AddProperty />} />
                        <Route path="/buy" element={<Buy />} />
                        <Route path="/rent" element={<Rent />} />
                        <Route path="/new-projects" element={<NewProjects />} />
                        <Route path="/pre-launching" element={<PreLaunching />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </AlertProvider>
              </WalletProvider>
            </AuthProvider>
          </LanguageProvider>
        </Web3ModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
