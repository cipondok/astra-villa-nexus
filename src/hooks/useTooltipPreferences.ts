import { useState, useEffect } from 'react';

export interface TooltipPreferences {
  enabled: boolean;
  delay: number;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const DEFAULT_PREFERENCES: TooltipPreferences = {
  enabled: true,
  delay: 300,
  position: 'top',
};

export const useTooltipPreferences = () => {
  const [preferences, setPreferences] = useState<TooltipPreferences>(() => {
    const saved = localStorage.getItem('tooltip_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const updatePreferences = (updates: Partial<TooltipPreferences>) => {
    setPreferences((prev) => {
      const newPreferences = { ...prev, ...updates };
      localStorage.setItem('tooltip_preferences', JSON.stringify(newPreferences));
      return newPreferences;
    });
  };

  return { preferences, updatePreferences };
};
