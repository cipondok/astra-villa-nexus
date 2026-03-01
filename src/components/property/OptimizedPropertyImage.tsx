import { useState, useMemo, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { getResponsiveImageProps, PROPERTY_CARD_SIZES } from '@/utils/responsiveImage';

interface OptimizedPropertyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  /** Show a blur-up placeholder while loading */
  showPlaceholder?: boolean;
}

const FALLBACK = '/placeholder.svg';

/**
 * Optimized property image with:
 * - Supabase Storage srcSet (320–1280w)
 * - Native lazy loading
 * - Blur placeholder fade-in
 * - Error fallback
 */
const OptimizedPropertyImage = ({
  src,
  alt,
  fallbackSrc = FALLBACK,
  sizes = PROPERTY_CARD_SIZES,
  showPlaceholder = true,
  className,
  ...rest
}: OptimizedPropertyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imgProps = useMemo(
    () => getResponsiveImageProps(error ? fallbackSrc : src, sizes),
    [src, error, fallbackSrc, sizes]
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Low-quality blur placeholder */}
      {showPlaceholder && !loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        {...imgProps}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) setError(true);
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...rest}
      />
    </div>
  );
};

export default OptimizedPropertyImage;
