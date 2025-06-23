
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Index from "@/pages/Index";
import Properties from "@/pages/Properties";
import PropertyList from "@/pages/PropertyList";
import Buy from "@/pages/Buy";
import Rent from "@/pages/Rent";
import NewProjects from "@/pages/NewProjects";
import PreLaunching from "@/pages/PreLaunching";
import PropertyDetail from "@/pages/PropertyDetail";
import AddProperty from "@/pages/AddProperty";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeSettingsProvider>
          <LanguageProvider>
            <AlertProvider>
              <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/my-properties" element={<PropertyList />} />
                    <Route path="/buy" element={<Buy />} />
                    <Route path="/rent" element={<Rent />} />
                    <Route path="/new-projects" element={<NewProjects />} />
                    <Route path="/pre-launching" element={<PreLaunching />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                    <Route path="/add-property" element={<AddProperty />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/*" element={<UserDashboard />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/about" element={<About />} />
                  </Routes>
                  <Toaster />
                </BrowserRouter>
              </ThemeProvider>
            </AlertProvider>
          </LanguageProvider>
        </ThemeSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
