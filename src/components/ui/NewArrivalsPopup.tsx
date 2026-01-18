import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Home, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'astra_new_arrivals_seen';

export const NewArrivalsPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the popup
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    
    if (!hasSeen) {
      // Show popup after a short delay for better UX
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(showTimer);
    }
  }, []);

  // Auto-close after 3 seconds
  useEffect(() => {
    if (isVisible) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 3000);
      
      return () => clearTimeout(autoCloseTimer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleExplore = () => {
    handleClose();
    navigate('/properties');
  };

  const handleViewMap = () => {
    handleClose();
    navigate('/location');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[10000] mx-auto max-w-[220px] sm:max-w-[260px]"
          >
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden">
              {/* Header - slim */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-2.5 py-2 sm:px-3 sm:py-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-1 right-1 h-5 w-5 p-0 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-white/90" />
                  <span className="text-[8px] font-medium text-white/80 uppercase tracking-wider">
                    Baru Tiba
                  </span>
                </div>

                <h2 className="mt-0.5 text-xs font-semibold text-white leading-tight sm:text-sm">
                  Selamat Datang! 🎉
                </h2>
                <p className="text-[9px] text-white/70 leading-tight sm:text-[10px]">
                  Temukan properti impian Anda
                </p>
              </div>
              
              {/* Content */}
              <div className="p-3 -mt-3 sm:p-4 sm:-mt-4">
                <div className="bg-muted/70 backdrop-blur-sm rounded-lg p-2.5 mb-3 sm:rounded-xl sm:p-3 sm:mb-4">
                  <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 sm:h-9 sm:w-9 sm:rounded-lg">
                      <Home className="h-4 w-4 text-primary sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground sm:text-sm">Properti Terbaru</h3>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">100+ listing baru minggu ini</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 sm:h-9 sm:w-9 sm:rounded-lg">
                      <MapPin className="h-4 w-4 text-orange-500 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground sm:text-sm">Jelajahi Peta</h3>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">Cari berdasarkan lokasi favorit</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewMap}
                    className="flex-1 h-8 text-[10px] sm:h-9 sm:text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
                    Lihat Peta
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExplore}
                    className="flex-1 h-8 text-[10px] bg-primary hover:bg-primary/90 sm:h-9 sm:text-xs"
                  >
                    Jelajahi
                    <ArrowRight className="h-3 w-3 ml-1 sm:h-3.5 sm:w-3.5 sm:ml-1.5" />
                  </Button>
                </div>
                
                {/* Skip link */}
                <button
                  onClick={handleClose}
                  className="w-full mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors sm:mt-3 sm:text-xs"
                >
                  Lewati untuk sekarang
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewArrivalsPopup;
