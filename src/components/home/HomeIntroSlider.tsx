import React from "react";
import { cn } from "@/lib/utils";
import villaCommunityDaylight from "@/assets/villa-community-daylight.jpg";

interface HomeIntroSliderProps {
  className?: string;
  language?: "en" | "id" | "zh" | "ja" | "ko";
  children?: React.ReactNode;
}

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className, language = 'en', children }) => {

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background",
        className
      )}
      style={{ minHeight: '600px', height: '100dvh', contain: 'layout' }}
      aria-label="Premium Villa Community Hero"
    >
      {/* Villa Community Background (Daylight) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={villaCommunityDaylight} 
          alt="Luxury villa community with pools and gardens - Premium real estate" 
          className="w-full h-full object-cover brightness-110 saturate-110"
          width={1920}
          height={1080}
          style={{ display: 'block' }}
        />
        {/* Light gradient overlays for clean professional look */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90 pointer-events-none" />
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
