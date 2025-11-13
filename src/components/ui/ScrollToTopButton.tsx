import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = (scrollTop / docHeight) * 100;
          
          setScrollProgress(Math.min(progress, 100));
          
          if (scrollTop > 300) {
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

  const circumference = 2 * Math.PI * 22; // radius of 22 for the progress ring
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {/* Progress Ring */}
                  <svg
                    className="absolute inset-0 w-12 h-12 md:w-14 md:h-14 -rotate-90 pointer-events-none"
                    viewBox="0 0 48 48"
                  >
                    {/* Background ring */}
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="hsl(var(--primary-foreground))"
                      strokeWidth="3"
                      opacity="0.2"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  
                  <Button
                    onClick={scrollToTop}
                    className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/25 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform pointer-events-auto border-2 border-primary-foreground/20 backdrop-blur-sm"
                    size="icon"
                    aria-label="Scroll to top"
                  >
                    <ArrowUp className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground drop-shadow-lg" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                <p>{Math.round(scrollProgress)}% scrolled</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;