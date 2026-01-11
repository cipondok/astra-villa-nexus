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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-sm"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-4 pb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-2 right-2 h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
                    Baru Tiba
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1">
                  Selamat Datang! 🎉
                </h2>
                <p className="text-sm text-white/80">
                  Temukan properti impian Anda bersama Astra
                </p>
              </div>
              
              {/* Content */}
              <div className="p-4 -mt-4">
                <div className="bg-muted/50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Properti Terbaru</h3>
                      <p className="text-xs text-muted-foreground">100+ listing baru minggu ini</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Jelajahi Peta</h3>
                      <p className="text-xs text-muted-foreground">Cari berdasarkan lokasi favorit</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewMap}
                    className="flex-1 h-9 text-xs"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    Lihat Peta
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExplore}
                    className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90"
                  >
                    Jelajahi
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
                
                {/* Skip link */}
                <button
                  onClick={handleClose}
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
