import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import jakartaSkylineDay from "@/assets/jakarta-premium-skyline.jpg";

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
      {/* Jakarta Skyline Background (Daylight) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={jakartaSkylineDay} 
          alt="Jakarta skyline in daylight - Premium real estate" 
          className="w-full h-full object-cover brightness-110 saturate-110"
        />
        {/* Light gradient overlays for clean professional look */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-background/90 pointer-events-none dark:from-black/40 dark:to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
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
