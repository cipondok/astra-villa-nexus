import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useConnectionSpeed, ConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { safeLocalStorage } from '@/lib/safeStorage';

interface DataSaverContextValue {
  /** Whether data saver mode is active (auto or manual) */
  isDataSaver: boolean;
  /** Whether the user manually toggled data saver */
  manualOverride: boolean | null;
  /** Toggle data saver manually */
  toggleDataSaver: () => void;
  /** Current connection speed */
  connectionSpeed: ConnectionSpeed;
  /** Image quality to use (0-100) */
  imageQuality: number;
  /** Max image width to request */
  maxImageWidth: number;
  /** Whether to skip non-essential requests */
  skipNonEssential: boolean;
}

const DataSaverContext = createContext<DataSaverContextValue | undefined>(undefined);

const STORAGE_KEY = 'astra_data_saver';

export const DataSaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { speed } = useConnectionSpeed();
  const [manualOverride, setManualOverride] = useState<boolean | null>(() => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return null;
  });

  const isDataSaver = useMemo(() => {
    if (manualOverride !== null) return manualOverride;
    return speed === 'slow' || speed === 'offline';
  }, [manualOverride, speed]);

  const toggleDataSaver = useCallback(() => {
    setManualOverride(prev => {
      const next = prev === null ? true : prev ? false : null;
      if (next === null) {
        safeLocalStorage.removeItem(STORAGE_KEY);
      } else {
        safeLocalStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  // Notify service worker when data saver changes
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'DATA_SAVER_MODE',
        payload: { enabled: isDataSaver }
      });
    }
  }, [isDataSaver]);

  const value = useMemo<DataSaverContextValue>(() => ({
    isDataSaver,
    manualOverride,
    toggleDataSaver,
    connectionSpeed: speed,
    imageQuality: isDataSaver ? 40 : 75,
    maxImageWidth: isDataSaver ? 400 : 1280,
    skipNonEssential: isDataSaver,
  }), [isDataSaver, manualOverride, toggleDataSaver, speed]);

  return (
    <DataSaverContext.Provider value={value}>
      {children}
    </DataSaverContext.Provider>
  );
};

export const useDataSaver = (): DataSaverContextValue => {
  const ctx = useContext(DataSaverContext);
  if (!ctx) {
    // Fallback for components outside provider
    return {
      isDataSaver: false,
      manualOverride: null,
      toggleDataSaver: () => {},
      connectionSpeed: 'fast',
      imageQuality: 75,
      maxImageWidth: 1280,
      skipNonEssential: false,
    };
  }
  return ctx;
};
