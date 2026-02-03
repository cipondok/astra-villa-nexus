import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchPanelBackgroundSliderProps {
  className?: string;
  interval?: number;
  images?: string[];
}

// Premium property images - vibrant & luxurious
const defaultImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80', // Sunny modern mansion
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=80', // White luxury home
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80', // Elegant villa exterior
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80', // Modern living space
  'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1920&q=80', // Infinity pool view
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1920&q=80', // Bright minimalist home
  'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1920&q=80', // Coastal property
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1920&q=80', // Garden villa
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
