import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchPanelBackgroundSliderProps {
  className?: string;
  interval?: number;
  images?: string[];
}

// Bright daylight luxury property images
const defaultImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80', // Sunny villa exterior
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1920&q=80', // Daylight modern home
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80', // Bright white interior
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80', // Sunny living room
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80', // Daylight pool house
  'https://images.unsplash.com/photo-1600563438938-a9a27215b4b8?w=1920&q=80', // Bright modern kitchen
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=80', // Sunny home exterior
  'https://images.unsplash.com/photo-1600573472591-ee6c8e695481?w=1920&q=80', // Bright luxury patio
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
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/5 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-background/10" />
      
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
                ? "bg-primary-foreground w-4"
                : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPanelBackgroundSlider;
