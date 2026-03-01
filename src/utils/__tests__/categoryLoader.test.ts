import { describe, it, expect } from 'vitest';
import { CategoryLoader } from '../categoryLoader';

describe('CategoryLoader.getSmartSuggestions', () => {
  it('returns all product suggestions without search term', () => {
    const suggestions = CategoryLoader.getSmartSuggestions('product');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain('sofas');
    expect(suggestions).toContain('refrigerators');
  });

  it('returns all service suggestions without search term', () => {
    const suggestions = CategoryLoader.getSmartSuggestions('service');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain('cleaning_residential');
    expect(suggestions).toContain('car_rentals');
  });

  it('filters by search term', () => {
    const suggestions = CategoryLoader.getSmartSuggestions('product', 'sofa');
    expect(suggestions).toContain('sofas');
    expect(suggestions).not.toContain('beds');
  });

  it('is case-insensitive', () => {
    const suggestions = CategoryLoader.getSmartSuggestions('service', 'CLEAN');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every(s => s.toLowerCase().includes('clean'))).toBe(true);
  });

  it('returns empty array for non-matching search', () => {
    const suggestions = CategoryLoader.getSmartSuggestions('product', 'zzzznonexistent');
    expect(suggestions).toEqual([]);
  });
});

describe('CategoryLoader.clearCache', () => {
  it('clears cache without error', () => {
    expect(() => CategoryLoader.clearCache()).not.toThrow();
  });
});
