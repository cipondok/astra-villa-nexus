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
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[10000] mx-auto max-w-[280px] sm:max-w-xs md:max-w-sm"
          >
            <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-3 py-2.5 sm:px-4 sm:py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-1 right-1 h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 sm:top-1.5 sm:right-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-white/15 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                    Baru Tiba
                  </span>
                </div>

                <h2 className="mt-1 text-sm font-bold text-white leading-tight sm:text-base">
                  Selamat Datang! 🎉
                </h2>
                <p className="mt-0.5 text-[11px] text-white/80 leading-snug sm:text-xs">
                  Temukan properti impian Anda bersama Astra
                </p>
              </div>
              
              {/* Content */}
              <div className="p-3 -mt-3 sm:p-4 sm:-mt-4">
                <div className="bg-muted/50 rounded-lg p-2.5 mb-3 sm:rounded-xl sm:p-3 sm:mb-4">
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
