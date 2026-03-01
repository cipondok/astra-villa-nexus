import { describe, it, expect, beforeEach } from 'vitest';
import { useOverlayStore } from '../useOverlayStore';

describe('useOverlayStore', () => {
  beforeEach(() => {
    useOverlayStore.getState().closeAll();
  });

  it('starts with all overlays closed', () => {
    const state = useOverlayStore.getState();
    expect(state.isLocationOpen).toBe(false);
    expect(state.isPropertyTypeOpen).toBe(false);
    expect(state.isFacilitiesOpen).toBe(false);
    expect(state.isFiltersOpen).toBe(false);
    expect(state.isAnyOpen).toBe(false);
  });

  it('opens location overlay and closes others', () => {
    useOverlayStore.getState().openOverlay('location');
    const state = useOverlayStore.getState();
    expect(state.isLocationOpen).toBe(true);
    expect(state.isPropertyTypeOpen).toBe(false);
    expect(state.isAnyOpen).toBe(true);
  });

  it('opening one overlay closes previously open overlay', () => {
    useOverlayStore.getState().openOverlay('location');
    useOverlayStore.getState().openOverlay('filters');
    const state = useOverlayStore.getState();
    expect(state.isLocationOpen).toBe(false);
    expect(state.isFiltersOpen).toBe(true);
    expect(state.isAnyOpen).toBe(true);
  });

  it('closes specific overlay', () => {
    useOverlayStore.getState().openOverlay('facilities');
    useOverlayStore.getState().closeOverlay('facilities');
    const state = useOverlayStore.getState();
    expect(state.isFacilitiesOpen).toBe(false);
    expect(state.isAnyOpen).toBe(false);
  });

  it('closeAll resets all overlays', () => {
    useOverlayStore.getState().openOverlay('propertyType');
    useOverlayStore.getState().closeAll();
    const state = useOverlayStore.getState();
    expect(state.isPropertyTypeOpen).toBe(false);
    expect(state.isAnyOpen).toBe(false);
  });

  it('isAnyOpen tracks correctly across operations', () => {
    useOverlayStore.getState().openOverlay('filters');
    expect(useOverlayStore.getState().isAnyOpen).toBe(true);
    useOverlayStore.getState().closeOverlay('filters');
    expect(useOverlayStore.getState().isAnyOpen).toBe(false);
  });
});
