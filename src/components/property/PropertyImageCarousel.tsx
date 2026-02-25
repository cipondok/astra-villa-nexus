import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Individual slide with blur placeholder and fade-in
const CarouselSlide = ({ src, alt, imageClassName, fallbackSrc, isFirst, onImageLoad, onImageError }: {
  src: string; alt: string; imageClassName?: string; fallbackSrc: string;
  isFirst: boolean; onImageLoad?: () => void; onImageError?: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex-[0_0_100%] min-w-0 h-full relative">
      {/* Gold shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--gold-primary)/0.08)] to-transparent animate-[shimmer_1.5s_infinite] translate-x-[-100%]" 
               style={{ animation: 'shimmer 1.5s infinite' }} />
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName
          )}
          loading={isFirst ? "eager" : "lazy"}
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => { setLoaded(true); if (isFirst) onImageLoad?.(); }}
          onError={(e) => { e.currentTarget.src = fallbackSrc; setLoaded(true); if (isFirst) onImageError?.(); }}
        />
      )}
    </div>
  );
};

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
            <CarouselSlide
              key={index}
              src={src}
              alt={`${alt} ${index + 1}`}
              imageClassName={imageClassName}
              fallbackSrc={fallbackSrc}
              isFirst={index === 0}
              onImageLoad={onImageLoad}
              onImageError={onImageError}
            />
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
