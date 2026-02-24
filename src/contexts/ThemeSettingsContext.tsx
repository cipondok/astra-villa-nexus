
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAllSystemSettings, selectSettingsByKeys } from '@/hooks/useAllSystemSettings';

interface ThemeSettings {
  primaryColor: string;
  currency: string;
  siteName: string;
  isDarkMode: boolean;
}

interface ThemeSettingsContextType {
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
}

const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#0066FF',
  currency: 'IDR',
  siteName: 'AstraVilla Realty',
  isDarkMode: true
};

const ThemeSettingsContext = createContext<ThemeSettingsContextType>({
  themeSettings: defaultThemeSettings,
  updateThemeSettings: () => {}
});

export const useThemeSettings = () => {
  const context = useContext(ThemeSettingsContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeSettingsProvider');
  }
  return context;
};

export const ThemeSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const { data: allSettings } = useAllSystemSettings();

  useEffect(() => {
    if (!allSettings) return;
    
    const picked = selectSettingsByKeys(allSettings, [
      'site_name', 'primary_color', 'default_currency', 'dark_mode'
    ]);

    const settings: Partial<ThemeSettings> = {};
    if (picked.site_name) settings.siteName = String(picked.site_name);
    if (picked.primary_color) settings.primaryColor = String(picked.primary_color);
    if (picked.default_currency) settings.currency = String(picked.default_currency);
    if (picked.dark_mode !== undefined) settings.isDarkMode = picked.dark_mode as boolean;

    setThemeSettings(prev => ({ ...prev, ...settings }));
    
    const primaryColor = (settings.primaryColor || defaultThemeSettings.primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
    document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-20)})`);
    
    document.documentElement.style.setProperty('--samsung-blue-primary', '214 100% 47%');
    document.documentElement.style.setProperty('--samsung-blue-light', '217 91% 60%');
    document.documentElement.style.setProperty('--samsung-blue-dark', '215 50% 35%');
    document.documentElement.style.setProperty('--titanium-light', '220 30% 85%');
    document.documentElement.style.setProperty('--titanium-medium', '220 30% 65%');
    document.documentElement.style.setProperty('--titanium-dark', '220 30% 25%');
    document.documentElement.style.setProperty('--titanium-white', '220 15% 96%');
  }, [allSettings]);

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeSettingsContext.Provider value={{ themeSettings, updateThemeSettings }}>
      {children}
    </ThemeSettingsContext.Provider>
  );
};
