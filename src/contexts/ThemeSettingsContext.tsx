
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
  primaryColor: '#0066FF', // Samsung Blue Titanium
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
      
      // Apply Samsung Blue Titanium primary color to CSS custom properties
      const primaryColor = settings.primaryColor || defaultThemeSettings.primaryColor;
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      
      // Generate Samsung Blue variants
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
      document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-20)})`);
      
      // Set Samsung Blue Titanium colors
      document.documentElement.style.setProperty('--samsung-blue-primary', '214 100% 47%'); // #0066FF
      document.documentElement.style.setProperty('--samsung-blue-light', '217 91% 60%');   // #4285FF
      document.documentElement.style.setProperty('--samsung-blue-dark', '215 50% 35%');    // #2C5AA0
      document.documentElement.style.setProperty('--titanium-light', '220 30% 85%');       // #D1D9E6
      document.documentElement.style.setProperty('--titanium-medium', '220 30% 65%');      // #9DB2CC
      document.documentElement.style.setProperty('--titanium-dark', '220 30% 25%');        // #3D4852
      document.documentElement.style.setProperty('--titanium-white', '220 15% 96%');       // #F5F6F8
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
