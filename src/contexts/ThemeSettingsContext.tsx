
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  primaryColor: '#3b82f6', // Default blue
  currency: 'USD',
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

  const { data: systemSettings } = useQuery({
    queryKey: ['system-settings-theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_name', 'primary_color', 'default_currency', 'dark_mode']);
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (systemSettings) {
      const settings: Partial<ThemeSettings> = {};
      
      systemSettings.forEach((setting) => {
        switch (setting.key) {
          case 'site_name':
            settings.siteName = setting.value as string || defaultThemeSettings.siteName;
            break;
          case 'primary_color':
            settings.primaryColor = setting.value as string || defaultThemeSettings.primaryColor;
            break;
          case 'default_currency':
            settings.currency = setting.value as string || defaultThemeSettings.currency;
            break;
          case 'dark_mode':
            settings.isDarkMode = setting.value as boolean ?? defaultThemeSettings.isDarkMode;
            break;
        }
      });

      setThemeSettings(prev => ({ ...prev, ...settings }));
      
      // Apply primary color to CSS custom properties
      if (settings.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        
        // Generate lighter and darker variants
        const hex = settings.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
        document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-20)})`);
      }
    }
  }, [systemSettings]);

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeSettingsContext.Provider value={{ themeSettings, updateThemeSettings }}>
      {children}
    </ThemeSettingsContext.Provider>
  );
};
