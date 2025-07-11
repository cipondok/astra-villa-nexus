import React, { createContext, useContext, useState, useCallback } from 'react';
import { BaseProperty } from '@/types/property';

interface PropertyComparisonContextType {
  selectedProperties: BaseProperty[];
  addToComparison: (property: BaseProperty) => void;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
  isInComparison: (propertyId: string) => boolean;
  canAddMore: boolean;
  maxCompareLimit: number;
}

const PropertyComparisonContext = createContext<PropertyComparisonContextType | undefined>(undefined);

interface PropertyComparisonProviderProps {
  children: React.ReactNode;
  maxLimit?: number;
}

export const PropertyComparisonProvider = ({ 
  children, 
  maxLimit = 4 
}: PropertyComparisonProviderProps) => {
  const [selectedProperties, setSelectedProperties] = useState<BaseProperty[]>([]);

  const addToComparison = useCallback((property: BaseProperty) => {
    setSelectedProperties(prev => {
      if (prev.length >= maxLimit) return prev;
      if (prev.some(p => p.id === property.id)) return prev;
      return [...prev, property];
    });
  }, [maxLimit]);

  const removeFromComparison = useCallback((propertyId: string) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== propertyId));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedProperties([]);
  }, []);

  const isInComparison = useCallback((propertyId: string) => {
    return selectedProperties.some(p => p.id === propertyId);
  }, [selectedProperties]);

  const canAddMore = selectedProperties.length < maxLimit;

  const value = {
    selectedProperties,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
    maxCompareLimit: maxLimit
  };

  return (
    <PropertyComparisonContext.Provider value={value}>
      {children}
    </PropertyComparisonContext.Provider>
  );
};

export const usePropertyComparison = () => {
  const context = useContext(PropertyComparisonContext);
  if (context === undefined) {
    // During initial render, return null instead of throwing error
    if (typeof window !== 'undefined' && window.location) {
      console.warn('usePropertyComparison must be used within a PropertyComparisonProvider');
      return null;
    }
    throw new Error('usePropertyComparison must be used within a PropertyComparisonProvider');
  }
  return context;
};