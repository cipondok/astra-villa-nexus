import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchPanelBackgroundSliderProps {
  className?: string;
  interval?: number;
  images?: string[];
}

// Fresh luxury property images - bright & modern
const defaultImages = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80', // White modern villa with pool
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80', // Luxury penthouse terrace
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=80', // Modern home exterior
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1920&q=80', // Tropical luxury resort
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80', // Bright living room
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80', // Contemporary kitchen
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80', // Pool villa sunset
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80', // Modern apartment balcony
];

export const SearchPanelBackgroundSlider: React.FC<SearchPanelBackgroundSliderProps> = ({
  className,
  interval = 5000,
  images = defaultImages,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 500);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [nextSlide, interval]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={image}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-in-out",
            index === currentIndex 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          )}
        >
          <img
            src={image}
            alt={`Property ${index + 1}`}
            className="w-full h-full object-cover brightness-110 saturate-110"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      
      {/* Light, airy gradient overlays - bright & professional */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-white/40 dark:from-black/30 dark:via-transparent dark:to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-white/10 dark:bg-transparent" />
      
      {/* Slide indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              "hover:scale-125",
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPanelBackgroundSlider;
