import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useIsFetching } from '@tanstack/react-query';

export const GlobalLoadingIndicator = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const isFetching = useIsFetching();

  // Detect navigation between pages
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      setIsNavigating(true);
      previousPath.current = location.pathname;
      
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 800);

      return () => clearTimeout(timer);
    }
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

  // Show loading during navigation or when data is being fetched
  const showLoading = isNavigating || isFetching > 0;

  return (
    <AnimatePresence>
      {showLoading && (
        <>
          {/* Top progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary z-[9999] origin-left"
          />
          
          {/* Corner loading indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-12 right-3 z-[9998] flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 shadow-lg"
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
