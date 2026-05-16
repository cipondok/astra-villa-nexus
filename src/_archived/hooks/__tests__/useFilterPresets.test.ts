import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterPresets } from '../useFilterPresets';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const STORAGE_KEY = 'property_filter_presets';

const mockFilters = {
  searchQuery: 'jakarta',
  priceRange: [0, 1000000] as [number, number],
  location: 'DKI Jakarta',
  propertyTypes: ['house'],
  bedrooms: '2',
  bathrooms: '1',
  minArea: 50,
  maxArea: 500,
  listingType: 'sale',
  sortBy: 'newest',
};

describe('useFilterPresets', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with empty presets', () => {
    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.savedPresets).toEqual([]);
  });

  it('loads presets from localStorage on mount', async () => {
    const existing = [{ id: '1', name: 'Test', filters: { search: 'bali' }, createdAt: '2024-01-01' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    const { result } = renderHook(() => useFilterPresets());
    // Wait for useEffect
    await vi.waitFor(() => {
      expect(result.current.savedPresets).toHaveLength(1);
    });
  });

  it('saves a new preset', () => {
    const { result } = renderHook(() => useFilterPresets());
    act(() => result.current.savePreset('My Preset', mockFilters));
    expect(result.current.savedPresets).toHaveLength(1);
    expect(result.current.savedPresets[0].name).toBe('My Preset');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  it('deletes a preset by id', () => {
    const { result } = renderHook(() => useFilterPresets());
    act(() => result.current.savePreset('A', mockFilters));
    const id = result.current.savedPresets[0].id;
    act(() => result.current.deletePreset(id));
    expect(result.current.savedPresets).toHaveLength(0);
  });

  it('loads a preset by id and returns filters', () => {
    const { result } = renderHook(() => useFilterPresets());
    act(() => result.current.savePreset('X', mockFilters));
    const id = result.current.savedPresets[0].id;
    let filters: any;
    act(() => { filters = result.current.loadPreset(id); });
    expect(filters).toEqual(mockFilters);
  });

  it('returns null when loading non-existent preset', () => {
    const { result } = renderHook(() => useFilterPresets());
    let filters: any;
    act(() => { filters = result.current.loadPreset('nope'); });
    expect(filters).toBeNull();
  });
});
