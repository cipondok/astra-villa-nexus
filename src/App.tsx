import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import AddProperty from "@/pages/AddProperty";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from "@tanstack/react-query";
import AstraMarketplace from "@/pages/AstraMarketplace";

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <AuthProvider>
          <WalletProvider>
            <ThemeSettingsProvider>
              <LanguageProvider>
                <AlertProvider>
                  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/properties" element={<Properties />} />
                      <Route path="/property/:id" element={<PropertyDetails />} />
                      <Route path="/add-property" element={<AddProperty />} />
                      <Route path="/dashboard" element={<UserDashboard />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />
                      <Route path="/contact" element={<Contact />} />
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
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
