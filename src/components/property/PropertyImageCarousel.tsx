import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
  fallbackSrc?: string;
  children?: React.ReactNode; // For overlays (badges, buttons, gradients)
}

const PropertyImageCarousel = ({
  images,
  alt,
  className,
  imageClassName,
  onImageLoad,
  onImageError,
  fallbackSrc = "/placeholder.svg",
  children,
}: PropertyImageCarouselProps) => {
  const hasMultiple = images.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    watchDrag: hasMultiple,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Prevent card click when swiping
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Don't stop propagation for single images — let card handle click
    // For multi-image, embla handles drag vs click internally
  }, []);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
    >
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((src, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full"
            >
              <img
                src={src}
                alt={`${alt} ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover",
                  imageClassName
                )}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={index === 0 ? onImageLoad : undefined}
                onError={(e) => {
                  e.currentTarget.src = fallbackSrc;
                  if (index === 0) onImageError?.();
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay content (badges, buttons, gradients) */}
      {children}

      {/* Navigation Arrows - only show on hover with multiple images */}
      {hasMultiple && isHovered && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultiple && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex gap-1">
          {images.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                emblaApi?.scrollTo(index);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
          {images.length > 5 && (
            <span className="text-[8px] text-white/70 self-center ml-0.5">+{images.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyImageCarousel;
