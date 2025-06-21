
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
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
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AstraMarketplace from "@/pages/AstraMarketplace";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WalletProvider>
            <ThemeSettingsProvider>
              <LanguageProvider>
                <AlertProvider>
                  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/properties" element={<Properties />} />
                      <Route path="/property/:id" element={<PropertyDetail />} />
                      <Route path="/add-property" element={<AddProperty />} />
                      <Route path="/dashboard" element={<UserDashboard />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/astra-marketplace" element={<AstraMarketplace />} />
                    </Routes>
                    <Toaster />
                  </ThemeProvider>
                </AlertProvider>
              </LanguageProvider>
            </ThemeSettingsProvider>
          </WalletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
