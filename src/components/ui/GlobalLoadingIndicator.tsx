import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const GlobalLoadingIndicator = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const location = useLocation();

  // Detect navigation
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Detect slow connection
  useEffect(() => {
    const checkConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        const slowTypes = ['slow-2g', '2g', '3g'];
        setIsSlowConnection(slowTypes.includes(effectiveType));
      }
    };

    checkConnection();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', checkConnection);
      return () => connection?.removeEventListener('change', checkConnection);
    }
  }, []);

  const showLoading = isNavigating;

  return (
    <AnimatePresence>
      {showLoading && (
        <>
          {/* Top progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary z-[9999] origin-left"
          />
          
          {/* Corner loading indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 right-3 z-[9998] flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 shadow-lg"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-xs font-medium text-foreground">
              {isSlowConnection ? 'Koneksi lambat...' : 'Memuat...'}
            </span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingIndicator;
