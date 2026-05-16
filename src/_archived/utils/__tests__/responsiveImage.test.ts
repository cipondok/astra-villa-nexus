import { describe, it, expect } from 'vitest';
import {
  isSupabaseStorageUrl,
  getResizedUrl,
  buildSrcSet,
  getResponsiveImageProps,
  PROPERTY_CARD_SIZES,
} from '../responsiveImage';

const SUPABASE_URL = 'https://example.supabase.co/storage/v1/object/public/images/photo.jpg';
const EXTERNAL_URL = 'https://example.com/photo.jpg';

describe('responsiveImage', () => {
  describe('isSupabaseStorageUrl', () => {
    it('returns true for Supabase storage URLs', () => {
      expect(isSupabaseStorageUrl(SUPABASE_URL)).toBe(true);
    });

    it('returns false for external URLs', () => {
      expect(isSupabaseStorageUrl(EXTERNAL_URL)).toBe(false);
    });
  });

  describe('getResizedUrl', () => {
    it('transforms Supabase storage URL to render URL', () => {
      const result = getResizedUrl(SUPABASE_URL, 640);
      expect(result).toContain('/storage/v1/render/image/public/');
      expect(result).toContain('width=640');
      expect(result).toContain('quality=75');
    });

    it('returns original URL for non-Supabase URLs', () => {
      expect(getResizedUrl(EXTERNAL_URL, 640)).toBe(EXTERNAL_URL);
    });

    it('uses custom quality', () => {
      const result = getResizedUrl(SUPABASE_URL, 320, 50);
      expect(result).toContain('quality=50');
    });
  });

  describe('buildSrcSet', () => {
    it('generates srcSet for Supabase URLs', () => {
      const srcSet = buildSrcSet(SUPABASE_URL);
      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
      expect(srcSet).toContain('960w');
      expect(srcSet).toContain('1280w');
    });

    it('returns empty string for non-Supabase URLs', () => {
      expect(buildSrcSet(EXTERNAL_URL)).toBe('');
    });
  });

  describe('getResponsiveImageProps', () => {
    it('returns full props for Supabase URLs', () => {
      const props = getResponsiveImageProps(SUPABASE_URL);
      expect(props.srcSet).toBeDefined();
      expect(props.sizes).toBe(PROPERTY_CARD_SIZES);
      expect(props.src).toContain('width=640');
    });

    it('returns only src for non-Supabase URLs', () => {
      const props = getResponsiveImageProps(EXTERNAL_URL);
      expect(props.src).toBe(EXTERNAL_URL);
      expect(props.srcSet).toBeUndefined();
      expect(props.sizes).toBeUndefined();
    });
  });
});
