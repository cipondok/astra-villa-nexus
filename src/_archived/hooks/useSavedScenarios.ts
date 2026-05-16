import { useState, useCallback } from 'react';

export interface SavedScenario {
  id: string;
  label: string;
  propertyPrice: number;
  downPaymentPercent: number;
  downPayment: number;
  loanAmount: number;
  loanTermYears: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  affordabilityRatio?: number;
  monthlyIncome?: number;
  bankName?: string;
  rateName?: string;
  savedAt: string;
}

const STORAGE_KEY = 'kpr-saved-scenarios';

const loadFromStorage = (): SavedScenario[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (scenarios: SavedScenario[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
};

export const useSavedScenarios = () => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(loadFromStorage);

  const addScenario = useCallback((scenario: Omit<SavedScenario, 'id' | 'savedAt'>) => {
    const newScenario: SavedScenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      savedAt: new Date().toISOString(),
    };
    setScenarios(prev => {
      const updated = [newScenario, ...prev].slice(0, 10); // max 10
      saveToStorage(updated);
      return updated;
    });
    return newScenario;
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setScenarios([]);
    saveToStorage([]);
  }, []);

  const updateLabel = useCallback((id: string, label: string) => {
    setScenarios(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, label } : s);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return { scenarios, addScenario, removeScenario, clearAll, updateLabel };
};
