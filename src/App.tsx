
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Index from "@/pages/Index";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import AddProperty from "@/pages/AddProperty";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  console.log('App component rendering...');
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeSettingsProvider>
            <LanguageProvider>
              <AlertProvider>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                    <Route path="/add-property" element={<AddProperty />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/*" element={<UserDashboard />} />
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/about" element={<About />} />
                  </Routes>
                  <Toaster />
                </ThemeProvider>
              </AlertProvider>
            </LanguageProvider>
          </ThemeSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
