/**
 * Shared utilities for responsive Supabase-hosted images.
 * Works with Supabase Storage image transformation API.
 */

const SUPABASE_STORAGE_MARKER = '/storage/v1/object/public/';
const SRCSET_WIDTHS = [320, 640, 960, 1280] as const;
const DATASAVER_WIDTHS = [320, 400] as const;

/** Check if a URL is a Supabase storage URL that supports transforms */
export const isSupabaseStorageUrl = (url: string): boolean =>
  url.includes(SUPABASE_STORAGE_MARKER);

/** Generate a Supabase storage render URL with width/quality transforms */
export const getResizedUrl = (url: string, width: number, quality = 75): string => {
  if (!isSupabaseStorageUrl(url)) return url;
  const transformed = url.replace(SUPABASE_STORAGE_MARKER, '/storage/v1/render/image/public/');
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=${width}&quality=${quality}`;
};

/** Generate srcSet string for Supabase-hosted images */
export const buildSrcSet = (url: string): string => {
  if (!isSupabaseStorageUrl(url)) return '';
  return SRCSET_WIDTHS.map((w) => `${getResizedUrl(url, w)} ${w}w`).join(', ');
};

/** Default sizes attribute for property card images */
export const PROPERTY_CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
export const PROPERTY_DETAIL_SIZES = '(max-width: 768px) 100vw, 60vw';

/**
 * Returns img attributes for responsive display.
 * Use with spread: <img {...getResponsiveImageProps(url)} />
 */
export const getResponsiveImageProps = (
  url: string,
  sizes: string = PROPERTY_CARD_SIZES,
  maxWidth?: number,
  quality?: number
): { src: string; srcSet?: string; sizes?: string } => {
  const q = quality ?? 75;
  if (maxWidth && isSupabaseStorageUrl(url)) {
    // Data saver: single smaller image, no srcSet
    return { src: getResizedUrl(url, maxWidth, q) };
  }
  const srcSet = buildSrcSet(url);
  if (!srcSet) return { src: url };
  return {
    src: getResizedUrl(url, 640, q),
    srcSet,
    sizes,
  };
};
