import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchPanelBackgroundSliderProps {
  className?: string;
  interval?: number;
  images?: string[];
}

// Stunning luxury property images
const defaultImages = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80', // Modern glass mansion
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80', // White villa with pool
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=80', // Luxury apartment high-rise
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80', // Modern interior pool
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80', // Contemporary architecture
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80', // Bright open living
  'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1920&q=80', // Beachfront villa
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1920&q=80', // Luxury kitchen
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
