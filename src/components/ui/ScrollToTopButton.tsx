import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

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

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 md:bottom-24 md:right-24 z-[9950] h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-2xl hover:shadow-orange-500/25 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform pointer-events-auto animate-in fade-in zoom-in border-2 border-white/20 backdrop-blur-sm"
      size="icon"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-lg" />
    </Button>
  );
};

export default ScrollToTopButton;