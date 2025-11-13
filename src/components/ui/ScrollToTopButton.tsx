import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.pageYOffset > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 md:bottom-24 md:right-24 z-[9950]"
        >
          <Button
            onClick={scrollToTop}
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/25 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform pointer-events-auto border-2 border-primary-foreground/20 backdrop-blur-sm"
            size="icon"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground drop-shadow-lg" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;