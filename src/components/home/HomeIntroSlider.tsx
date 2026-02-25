import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import villaCommunityDaylight from "@/assets/villa-community-daylight.jpg";

interface HomeIntroSliderProps {
  className?: string;
  language?: "en" | "id" | "zh" | "ja" | "ko";
  children?: React.ReactNode;
}

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className, language = 'en', children }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: image moves slower than scroll (0 → 30% down)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative w-full overflow-hidden bg-background",
        className
      )}
      style={{ minHeight: '600px', height: '100dvh', contain: 'layout' }}
      aria-label="Premium Villa Community Hero"
    >
      {/* Villa Community Background (Daylight) with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <img 
          src={villaCommunityDaylight} 
          alt="Luxury villa community with pools and gardens - Premium real estate" 
          className="w-full h-full object-cover brightness-110 saturate-110"
          width={1920}
          height={1080}
          style={{ display: 'block', height: '130%' }}
        />
        {/* Light gradient overlays for clean professional look */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      </motion.div>

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
