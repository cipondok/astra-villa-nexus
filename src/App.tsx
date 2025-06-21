import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { AlertProvider } from './contexts/AlertContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Web3ModalProvider } from './contexts/Web3ModalContext';
import EnhancedNavigation from './components/layout/EnhancedNavigation';
import ProfessionalFooter from './components/layout/ProfessionalFooter';
import ResponsiveAIChatWidget from './components/ai/ResponsiveAIChatWidget';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import WalletDashboard from './components/wallet/WalletDashboard';
import TokenConfiguration from './pages/TokenConfiguration';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <AlertProvider>
              <LanguageProvider>
                <Web3ModalProvider>
                  <div className="min-h-screen bg-background">
                    <EnhancedNavigation />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                        <Route path="/wallet" element={<WalletDashboard />} />
                        <Route path="/token-config" element={<TokenConfiguration />} />
                      </Routes>
                    </main>
                    <ProfessionalFooter />
                    <ResponsiveAIChatWidget />
                    <Toaster />
                  </div>
                </Web3ModalProvider>
              </LanguageProvider>
            </AlertProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
