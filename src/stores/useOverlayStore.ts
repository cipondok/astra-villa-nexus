import { create } from 'zustand';

interface OverlayState {
  isLocationOpen: boolean;
  isPropertyTypeOpen: boolean;
  isFacilitiesOpen: boolean;
  isFiltersOpen: boolean;
  isAnyOpen: boolean;
  openOverlay: (overlay: 'location' | 'propertyType' | 'facilities' | 'filters') => void;
  closeOverlay: (overlay: 'location' | 'propertyType' | 'facilities' | 'filters') => void;
  closeAll: () => void;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  isLocationOpen: false,
  isPropertyTypeOpen: false,
  isFacilitiesOpen: false,
  isFiltersOpen: false,
  isAnyOpen: false,

  openOverlay: (overlay) => {
    set((state) => {
      const newState = {
        ...state,
        isLocationOpen: overlay === 'location',
        isPropertyTypeOpen: overlay === 'propertyType',
        isFacilitiesOpen: overlay === 'facilities',
        isFiltersOpen: overlay === 'filters',
      };
      return {
        ...newState,
        isAnyOpen: newState.isLocationOpen || newState.isPropertyTypeOpen || newState.isFacilitiesOpen || newState.isFiltersOpen,
      };
    });
  },

  closeOverlay: (overlay) => {
    set((state) => {
      const newState = { ...state };
      if (overlay === 'location') newState.isLocationOpen = false;
      if (overlay === 'propertyType') newState.isPropertyTypeOpen = false;
      if (overlay === 'facilities') newState.isFacilitiesOpen = false;
      if (overlay === 'filters') newState.isFiltersOpen = false;
      
      return {
        ...newState,
        isAnyOpen: newState.isLocationOpen || newState.isPropertyTypeOpen || newState.isFacilitiesOpen || newState.isFiltersOpen,
      };
    });
  },

  closeAll: () => {
    set({
      isLocationOpen: false,
      isPropertyTypeOpen: false,
      isFacilitiesOpen: false,
      isFiltersOpen: false,
      isAnyOpen: false,
    });
  },
}));
