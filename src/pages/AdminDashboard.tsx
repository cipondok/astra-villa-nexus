
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AlertTriangle, Home, LogIn, Shield } from 'lucide-react';
import ModernEnhancedAdminDashboard from '@/components/admin/ModernEnhancedAdminDashboard';
import AlertMonitoringProvider from '@/components/admin/AlertMonitoringProvider';
import LoadingPage from '@/components/LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { profile, user } = useAuth();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const { connectionStatus } = useDatabaseConnection();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard mounted');
    console.log('User:', user);
    console.log('Profile:', profile);
    
    // Remove artificial loading delay - check immediately
    if (user && profile) {
      setIsLoading(false);
    } else {
      // Quick timeout if no user/profile
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  console.log('isAdmin:', isAdmin);

  if (isLoading || adminCheckLoading) {
    return (
      <LoadingPage
        message="Loading admin dashboard..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Glassmorphic Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
            {/* Gradient Top Accent */}
            <div className="h-1.5 bg-gradient-to-r from-destructive via-orange-500 to-amber-500" />
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Icon with Glow */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 0px hsl(var(--destructive) / 0)',
                      '0 0 20px hsl(var(--destructive) / 0.3)',
                      '0 0 0px hsl(var(--destructive) / 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 rounded-full bg-destructive/10 border border-destructive/20"
                >
                  <Shield className="h-10 w-10 text-destructive" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Admin Access Required
                </h2>
                <p className="text-sm text-muted-foreground">
                  You don't have permission to view this dashboard. Please contact an administrator or sign in with an admin account.
                </p>
              </div>

              {/* Alert Box */}
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  This area is restricted to authorized administrators only.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="/?from=admin"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </a>
                <a 
                  href="/?auth=true"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-all border border-border/50"
                >
                  <LogIn className="h-4 w-4" />
                  Re-login
                </a>
              </div>
            </div>

            {/* Bottom Gradient */}
            <div className="h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AlertMonitoringProvider>
      <ModernEnhancedAdminDashboard />
    </AlertMonitoringProvider>
  );
};

export default AdminDashboard;
