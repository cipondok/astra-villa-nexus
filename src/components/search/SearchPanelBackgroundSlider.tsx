import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchPanelBackgroundSliderProps {
  className?: string;
  interval?: number;
  images?: string[];
}

// Default property images - can be replaced with actual images
const defaultImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
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
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      
      {/* Gradient overlays for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
      
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
