import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { PropertyComparisonProvider, usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import { BaseProperty } from '@/types/property';

const makeProperty = (id: string, overrides: Partial<BaseProperty> = {}): BaseProperty => ({
  id,
  title: `Property ${id}`,
  price: 1000000,
  location: 'Jakarta',
  listing_type: 'sale',
  ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PropertyComparisonProvider maxLimit={4}>{children}</PropertyComparisonProvider>
);

describe('PropertyComparisonContext', () => {
  it('starts with empty comparison list', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    expect(result.current.selectedProperties).toEqual([]);
    expect(result.current.canAddMore).toBe(true);
  });

  it('adds properties to comparison', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    act(() => result.current.addToComparison(makeProperty('1')));
    expect(result.current.selectedProperties).toHaveLength(1);
    expect(result.current.isInComparison('1')).toBe(true);
  });

  it('prevents duplicate additions', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    const p = makeProperty('1');
    act(() => {
      result.current.addToComparison(p);
      result.current.addToComparison(p);
    });
    expect(result.current.selectedProperties).toHaveLength(1);
  });

  it('enforces max limit of 4', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    act(() => {
      for (let i = 1; i <= 5; i++) {
        result.current.addToComparison(makeProperty(String(i)));
      }
    });
    expect(result.current.selectedProperties).toHaveLength(4);
    expect(result.current.canAddMore).toBe(false);
  });

  it('removes a property from comparison', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    act(() => {
      result.current.addToComparison(makeProperty('1'));
      result.current.addToComparison(makeProperty('2'));
    });
    act(() => result.current.removeFromComparison('1'));
    expect(result.current.selectedProperties).toHaveLength(1);
    expect(result.current.isInComparison('1')).toBe(false);
    expect(result.current.isInComparison('2')).toBe(true);
  });

  it('clears all comparisons', () => {
    const { result } = renderHook(() => usePropertyComparison(), { wrapper });
    act(() => {
      result.current.addToComparison(makeProperty('1'));
      result.current.addToComparison(makeProperty('2'));
    });
    act(() => result.current.clearComparison());
    expect(result.current.selectedProperties).toHaveLength(0);
    expect(result.current.canAddMore).toBe(true);
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => usePropertyComparison());
    }).toThrow('usePropertyComparison must be used within a PropertyComparisonProvider');
  });
});
