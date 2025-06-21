
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { AlertProvider } from './contexts/AlertContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Web3ModalProvider } from './components/wallet/Web3ModalProvider';
import Navigation from './components/Navigation';
import ProfessionalFooter from './components/ProfessionalFooter';
import ResponsiveAIChatWidget from './components/ai/ResponsiveAIChatWidget';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import About from './pages/About';
import Properties from './pages/Properties';
import Help from './pages/Help';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import WalletDashboard from './components/wallet/WalletDashboard';
import TokenConfiguration from './pages/TokenConfiguration';

const AppContent = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/help" element={<Help />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/wallet" element={<WalletDashboard />} />
          <Route path="/token-config" element={<TokenConfiguration />} />
        </Routes>
      </main>
      <ProfessionalFooter language={language} />
      <ResponsiveAIChatWidget />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Web3ModalProvider>
          <AuthProvider>
            <WalletProvider>
              <AlertProvider>
                <LanguageProvider>
                  <AppContent />
                </LanguageProvider>
              </AlertProvider>
            </WalletProvider>
          </AuthProvider>
        </Web3ModalProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
