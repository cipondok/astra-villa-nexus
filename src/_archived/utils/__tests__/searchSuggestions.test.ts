import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateTimeWeightedScore,
  sortByPopularity,
  getLocationSuggestions,
  getFilteredSuggestions,
  trackSuggestionClick,
  getDisplayCount
} from '../searchSuggestions';

describe('searchSuggestions', () => {
  describe('calculateTimeWeightedScore', () => {
    beforeEach(() => {
      // Mock Date.now() to return a consistent timestamp
      vi.spyOn(Date, 'now').mockReturnValue(1000000000000);
    });

    it('should return 0 for suggestion with no click data', () => {
      const score = calculateTimeWeightedScore('test', {});
      expect(score).toBe(0);
    });

    it('should return 0 for suggestion with empty timestamps', () => {
      const clickData = { test: { count: 0, timestamps: [] } };
      const score = calculateTimeWeightedScore('test', clickData);
      expect(score).toBe(0);
    });

    it('should calculate higher score for recent clicks', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const recentClickData = { test: { count: 1, timestamps: [oneHourAgo] } };
      const oldClickData = { test: { count: 1, timestamps: [oneDayAgo] } };

      const recentScore = calculateTimeWeightedScore('test', recentClickData);
      const oldScore = calculateTimeWeightedScore('test', oldClickData);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should handle multiple timestamps correctly', () => {
      const now = Date.now();
      const clickData = {
        test: {
          count: 3,
          timestamps: [
            now - 60 * 60 * 1000, // 1 hour ago
            now - 12 * 60 * 60 * 1000, // 12 hours ago
            now - 24 * 60 * 60 * 1000  // 1 day ago
          ]
        }
      };

      const score = calculateTimeWeightedScore('test', clickData);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('sortByPopularity', () => {
    it('should sort items by weighted popularity score', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const items = ['popular', 'medium', 'unpopular'];
      const clickData = {
        popular: { count: 5, timestamps: [now - 1000, now - 2000, now - 3000] },
        medium: { count: 2, timestamps: [now - 86400000] }, // 1 day old
        unpopular: { count: 1, timestamps: [now - 172800000] } // 2 days old
      };

      const sorted = sortByPopularity(items, clickData);
      expect(sorted[0]).toBe('popular');
    });

    it('should not mutate original array', () => {
      const items = ['a', 'b', 'c'];
      const clickData = {};
      const sorted = sortByPopularity(items, clickData);
      
      expect(sorted).not.toBe(items);
      expect(items).toEqual(['a', 'b', 'c']);
    });
  });

  describe('getLocationSuggestions', () => {
    const mockProvinces = [
      { code: '31', name: 'DKI Jakarta' },
      { code: '32', name: 'Jawa Barat' }
    ];

    const mockCities = [
      { code: '3171', name: 'Jakarta Selatan', type: 'Kota' },
      { code: '3172', name: 'Jakarta Pusat', type: 'Kota' },
      { code: '3201', name: 'Bandung', type: 'Kota' }
    ];

    const mockAreas = [
      { code: '317101', name: 'Kebayoran Baru' },
      { code: '317102', name: 'Menteng' }
    ];

    it('should return empty array for queries shorter than 2 characters', () => {
      const result = getLocationSuggestions('a', mockProvinces, mockCities, mockAreas);
      expect(result).toEqual([]);
    });

    it('should match provinces', () => {
      const result = getLocationSuggestions('jakarta', mockProvinces, mockCities, mockAreas);
      expect(result).toContain('DKI Jakarta');
    });

    it('should match cities with province name', () => {
      const result = getLocationSuggestions(
        'jakarta selatan',
        mockProvinces,
        mockCities,
        mockAreas,
        '31'
      );
      expect(result.some(item => item.includes('Jakarta Selatan'))).toBe(true);
    });

    it('should match areas with full location path', () => {
      const result = getLocationSuggestions(
        'kebayoran',
        mockProvinces,
        mockCities,
        mockAreas,
        '31',
        '3171'
      );
      expect(result.some(item => item.includes('Kebayoran Baru'))).toBe(true);
    });

    it('should limit results to 5 items', () => {
      const manyProvinces = Array.from({ length: 10 }, (_, i) => ({
        code: `${i}`,
        name: `Province Test ${i}`
      }));
      
      const result = getLocationSuggestions(
        'test',
        manyProvinces,
        [],
        []
      );
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should be case-insensitive', () => {
      const result = getLocationSuggestions('JAKARTA', mockProvinces, mockCities, mockAreas);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getFilteredSuggestions', () => {
    const mockProvinces = [{ code: '31', name: 'DKI Jakarta' }];
    const mockCities = [{ code: '3171', name: 'Jakarta Selatan', type: 'Kota' }];
    const mockAreas = [{ code: '317101', name: 'Kebayoran Baru' }];
    const recentTerms = ['Recent Search 1', 'Recent Search 2', 'Test Recent'];
    const trending = ['Trending 1', 'Trending 2', 'Test Trending'];
    const smart = ['Smart 1', 'Smart Test', 'Smart 3'];

    it('should return default suggestions when query is empty', () => {
      const result = getFilteredSuggestions(
        '',
        recentTerms,
        trending,
        smart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.recent).toHaveLength(3);
      expect(result.smart).toHaveLength(3);
      expect(result.trending).toHaveLength(3);
      expect(result.locations).toHaveLength(0);
    });

    it('should filter all suggestion types by query', () => {
      const result = getFilteredSuggestions(
        'test',
        recentTerms,
        trending,
        smart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.recent).toContain('Test Recent');
      expect(result.trending).toContain('Test Trending');
      expect(result.smart).toContain('Smart Test');
    });

    it('should include location matches', () => {
      const result = getFilteredSuggestions(
        'jakarta',
        recentTerms,
        trending,
        smart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.locations.length).toBeGreaterThan(0);
    });

    it('should limit recent to 3 items', () => {
      const manyRecent = Array.from({ length: 10 }, (_, i) => `test ${i}`);
      
      const result = getFilteredSuggestions(
        'test',
        manyRecent,
        trending,
        smart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.recent.length).toBeLessThanOrEqual(3);
    });

    it('should limit smart to 3 items', () => {
      const manySmart = Array.from({ length: 10 }, (_, i) => `test ${i}`);
      
      const result = getFilteredSuggestions(
        'test',
        recentTerms,
        trending,
        manySmart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.smart.length).toBeLessThanOrEqual(3);
    });

    it('should limit trending to 4 items', () => {
      const manyTrending = Array.from({ length: 10 }, (_, i) => `test ${i}`);
      
      const result = getFilteredSuggestions(
        'test',
        recentTerms,
        manyTrending,
        smart,
        mockProvinces,
        mockCities,
        mockAreas
      );

      expect(result.trending.length).toBeLessThanOrEqual(4);
    });
  });

  describe('trackSuggestionClick', () => {
    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(1000000000000);
    });

    it('should create new entry for first click', () => {
      const result = trackSuggestionClick('test', {});
      
      expect(result.test).toBeDefined();
      expect(result.test.count).toBe(1);
      expect(result.test.timestamps).toHaveLength(1);
    });

    it('should increment count for existing suggestion', () => {
      const existing = {
        test: { count: 2, timestamps: [999999999999] }
      };

      const result = trackSuggestionClick('test', existing);
      
      expect(result.test.count).toBe(3);
      expect(result.test.timestamps).toHaveLength(2);
    });

    it('should limit timestamps to 50 most recent', () => {
      const manyTimestamps = Array.from({ length: 50 }, (_, i) => 1000000000000 - i);
      const existing = {
        test: { count: 50, timestamps: manyTimestamps }
      };

      const result = trackSuggestionClick('test', existing);
      
      expect(result.test.timestamps).toHaveLength(50);
      expect(result.test.timestamps[0]).toBe(1000000000000 - 1); // Oldest kept
    });

    it('should not mutate original data', () => {
      const original = {
        test: { count: 1, timestamps: [999999999999] }
      };
      const originalCopy = JSON.parse(JSON.stringify(original));

      trackSuggestionClick('test', original);
      
      expect(original).toEqual(originalCopy);
    });
  });

  describe('getDisplayCount', () => {
    it('should return 0 for non-existent suggestion', () => {
      const count = getDisplayCount('test', {});
      expect(count).toBe(0);
    });

    it('should return correct count for existing suggestion', () => {
      const clickData = {
        test: { count: 42, timestamps: [] }
      };
      
      const count = getDisplayCount('test', clickData);
      expect(count).toBe(42);
    });

    it('should handle missing count property', () => {
      const clickData = {
        test: { count: 0, timestamps: [] }
      };
      
      const count = getDisplayCount('test', clickData);
      expect(count).toBe(0);
    });
  });
});
