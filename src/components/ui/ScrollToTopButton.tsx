import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
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
      className="fixed bottom-24 right-6 z-[9998] h-12 w-12 rounded-full bg-primary/90 hover:bg-primary shadow-lg hover:scale-110 transition-all transform-gpu will-change-transform pointer-events-auto"
      size="icon"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 text-primary-foreground" />
    </Button>
  );
};

export default ScrollToTopButton;