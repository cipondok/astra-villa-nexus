import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import jakartaSkyline from "@/assets/jakarta-aerial-bundaran.jpg";

interface HomeIntroSliderProps {
  className?: string;
  language?: "en" | "id";
  children?: React.ReactNode;
}

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className, language = 'en', children }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Track desktop breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lock initial height on mobile to prevent URL bar resize jumping
  useEffect(() => {
    const applyHeight = () => {
      if (!isDesktop) {
        setFixedHeight(200);
      } else {
        setFixedHeight(null);
      }
    };
    applyHeight();
    const onOrientation = () => applyHeight();
    const onResize = () => applyHeight();
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', onResize);
    };
  }, [isDesktop]);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background",
        "min-h-[200px] md:min-h-[400px]",
        "pt-16 md:pt-0",
        className
      )}
      style={{ 
        height: fixedHeight ? `${fixedHeight}px` : undefined
      }}
      aria-label="Jakarta Property Hero"
    >
      {/* Static Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={jakartaSkyline} 
          alt="Jakarta Premium Skyline - Luxury Real Estate" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />
      </div>

      {/* Search Panel Overlay - Centered */}
      {children && (
        <div className="absolute top-1/2 left-0 right-0 z-30 px-4 -translate-y-1/2">
          <div className="w-full mx-auto">
            {children}
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeIntroSlider;
