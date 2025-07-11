
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
        <LanguageProvider>
          <WebsiteSettingsProvider>
            <AlertProvider>
              <AuthProvider>
                <PropertyComparisonProvider>
                  <Router>
                    <div className="min-h-screen bg-background text-foreground">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </Router>
                </PropertyComparisonProvider>
              </AuthProvider>
            </AlertProvider>
          </WebsiteSettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
