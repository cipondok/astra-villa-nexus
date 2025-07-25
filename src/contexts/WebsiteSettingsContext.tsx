import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteSettings {
  // Design Settings
  siteName: string;
  siteTagline: string;
  siteLogo: string;
  faviconUrl: string;
  
  // Colors
  lightPrimaryColor: string;
  lightSecondaryColor: string;
  lightBackgroundColor: string;
  lightSurfaceColor: string;
  lightTextColor: string;
  lightAccentColor: string;
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkBackgroundColor: string;
  darkSurfaceColor: string;
  darkTextColor: string;
  darkAccentColor: string;
  
  // Typography
  primaryFont: string;
  secondaryFont: string;
  baseFontSize: number;
  headingFontWeight: number;
  bodyFontWeight: number;
  
  // Layout
  containerMaxWidth: number;
  borderRadius: number;
  spacing: number;
  shadowIntensity: number;
  
  // Header
  headerHeight: number;
  headerBackground: string;
  headerPosition: string;
  showNavigation: boolean;
  showUserMenu: boolean;
  showThemeToggle: boolean;
  
  // Footer
  copyrightText: string;
  footerBackground: string;
  footerTextColor: string;
  showFooterLinks: boolean;
  showSocialMedia: boolean;
  
  // Backgrounds
  heroBackgroundType: string;
  heroBackgroundImage: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  bodyBackgroundPattern: string;
  bodyBackgroundImage: string;
  
  // Advanced
  animations: boolean;
  glassEffect: boolean;
  particleEffects: boolean;
  darkModeDefault: boolean;
  rtlSupport: boolean;
  customCSS: string;
  
  // Social Media
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  
  // General
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  isLoading: boolean;
  updateSetting: (key: string, value: any) => void;
  applyCSSVariables: () => void;
}

const defaultSettings: WebsiteSettings = {
  siteName: 'AstraVilla',
  siteTagline: 'Premium Real Estate Platform',
  siteLogo: '',
  faviconUrl: '',
  lightPrimaryColor: '#3B82F6',
  lightSecondaryColor: '#10B981',
  lightBackgroundColor: '#FFFFFF',
  lightSurfaceColor: '#F8FAFC',
  lightTextColor: '#1E293B',
  lightAccentColor: '#F59E0B',
  darkPrimaryColor: '#60A5FA',
  darkSecondaryColor: '#424242',
  darkBackgroundColor: '#424242',
  darkSurfaceColor: '#1E293B',
  darkTextColor: '#F1F5F9',
  darkAccentColor: '#FBBF24',
  primaryFont: 'Inter',
  secondaryFont: 'SF Pro Display',
  baseFontSize: 16,
  headingFontWeight: 600,
  bodyFontWeight: 400,
  containerMaxWidth: 1200,
  borderRadius: 12,
  spacing: 16,
  shadowIntensity: 3,
  headerHeight: 80,
  headerBackground: 'glass',
  headerPosition: 'sticky',
  showNavigation: true,
  showUserMenu: true,
  showThemeToggle: true,
  copyrightText: '© 2024 AstraVilla. All rights reserved.',
  footerBackground: '#1F2937',
  footerTextColor: '#F9FAFB',
  showFooterLinks: true,
  showSocialMedia: true,
  heroBackgroundType: 'gradient',
  heroBackgroundImage: '',
  heroGradientStart: '#667EEA',
  heroGradientEnd: '#764BA2',
  bodyBackgroundPattern: 'none',
  bodyBackgroundImage: '',
  animations: true,
  glassEffect: true,
  particleEffects: false,
  darkModeDefault: false,
  rtlSupport: false,
  customCSS: '',
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
};

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: false,
  updateSetting: () => {},
  applyCSSVariables: () => {},
});

export const useWebsiteSettings = () => {
  const context = useContext(WebsiteSettingsContext);
  if (!context) {
    throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
  }
  return context;
};

export const WebsiteSettingsProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['website-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Load settings from database
  useEffect(() => {
    if (settingsData) {
      const loadedSettings = { ...defaultSettings };
      
      settingsData.forEach((setting) => {
        let value = setting.value;
        
        // Handle different value types
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch {
            // Keep as string if not valid JSON
          }
        }
        
        // Map database keys to our settings object
        if (setting.key in loadedSettings) {
          (loadedSettings as any)[setting.key] = value;
        }
      });
      
      setSettings(loadedSettings);
    }
  }, [settingsData]);

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 0.7) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Apply CSS variables to document root
  const applyCSSVariables = React.useCallback(() => {
    const root = document.documentElement;
    
    // Apply light mode colors
    root.style.setProperty('--primary-light', settings.lightPrimaryColor);
    root.style.setProperty('--secondary-light', settings.lightSecondaryColor);
    root.style.setProperty('--background-light', settings.lightBackgroundColor);
    root.style.setProperty('--surface-light', settings.lightSurfaceColor);
    root.style.setProperty('--text-light', settings.lightTextColor);
    root.style.setProperty('--accent-light', settings.lightAccentColor);
    
    // Apply dark mode colors with transparency for secondary
    root.style.setProperty('--primary-dark', settings.darkPrimaryColor);
    root.style.setProperty('--secondary-dark', hexToRgba(settings.darkSecondaryColor, 0.7));
    root.style.setProperty('--background-dark', settings.darkBackgroundColor);
    root.style.setProperty('--surface-dark', settings.darkSurfaceColor);
    root.style.setProperty('--text-dark', settings.darkTextColor);
    root.style.setProperty('--accent-dark', settings.darkAccentColor);
    
    // Apply typography
    root.style.setProperty('--font-primary', settings.primaryFont);
    root.style.setProperty('--font-secondary', settings.secondaryFont);
    root.style.setProperty('--font-size-base', `${settings.baseFontSize}px`);
    
    // Apply layout
    root.style.setProperty('--container-max-width', `${settings.containerMaxWidth}px`);
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--spacing-base', `${settings.spacing}px`);
    
    // Update document title and favicon
    document.title = settings.siteName;
    if (settings.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.faviconUrl;
      }
    }
  }, [settings]);

  // Apply CSS variables whenever settings change
  useEffect(() => {
    applyCSSVariables();
  }, [applyCSSVariables]);

  const updateSetting = React.useCallback((key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const contextValue = React.useMemo(() => ({
    settings,
    isLoading,
    updateSetting,
    applyCSSVariables
  }), [settings, isLoading, updateSetting, applyCSSVariables]);

  return (
    <WebsiteSettingsContext.Provider value={contextValue}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
});

WebsiteSettingsProvider.displayName = 'WebsiteSettingsProvider';
