import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import jakartaSkylineDark from "@/assets/jakarta-skyline-dark.jpg";

interface HomeIntroSliderProps {
  className?: string;
  language?: "en" | "id";
  children?: React.ReactNode;
}

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className, language = 'en', children }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);

  // Track desktop breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background",
        "h-screen min-h-[600px]", // Full viewport height
        className
      )}
      aria-label="Jakarta Property Hero"
    >
      {/* Dark Jakarta Skyline Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={jakartaSkylineDark} 
          alt="Jakarta Premium Skyline - Luxury Real Estate" 
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlays for luxury feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none" />
      </div>

      {/* Content Overlay - Centered vertically */}
      {children && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeIntroSlider;
