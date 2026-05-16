import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lastSelectedProvince';

export interface LastSelectedProvince {
  id: string;
  name: string;
  code: string;
  selectedAt: number;
}

/**
 * Hook to persist and retrieve the user's last selected province.
 * Data is stored in localStorage for cross-session persistence.
 */
export const useLastSelectedProvince = () => {
  const [lastProvince, setLastProvince] = useState<LastSelectedProvince | null>(() => {
    // Initialize synchronously so UI can render the marker immediately on first paint.
    try {
      if (typeof window === 'undefined') return null;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as LastSelectedProvince) : null;
    } catch (error) {
      console.error('Failed to load last selected province:', error);
      return null;
    }
  });

  // Save a new selection
  const saveLastProvince = useCallback((province: Omit<LastSelectedProvince, 'selectedAt'>) => {
    const data: LastSelectedProvince = {
      ...province,
      selectedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastProvince(data);
    } catch (error) {
      console.error('Failed to save last selected province:', error);
    }
  }, []);

  // Clear the saved province
  const clearLastProvince = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLastProvince(null);
    } catch (error) {
      console.error('Failed to clear last selected province:', error);
    }
  }, []);

  return {
    lastProvince,
    saveLastProvince,
    clearLastProvince,
  };
};

export default useLastSelectedProvince;