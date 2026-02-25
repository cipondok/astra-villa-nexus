import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalLoadingIndicator = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();
  const previousPath = useRef(location.pathname);

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

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--gold-primary))] via-[hsl(var(--gold-secondary))] to-[hsl(var(--orange-primary))] z-[9999] origin-left"
        />
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingIndicator;
