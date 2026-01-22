import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { useGlobalLoading } from './useGlobalLoading';

export const useSystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const { startLoading, updateProgress, finishLoading } = useGlobalLoading();
  const [settings, setSettings] = useState<Record<string, any>>({
    siteName: 'Property Platform',
    siteDescription: 'Find your dream property',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,pdf',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    // Discounting System Settings
    discountEnabled: true,
    maxDiscountPercentage: '90',
    minDiscountDuration: '1',
    requireAdminApproval: false,
    allowSeasonalDiscounts: true,
    discountNotifications: true,
    // SEO Settings
    seoTitle: '',
    seoTagline: '',
    seoDescription: '',
    seoKeywords: '',
    enableOpenGraph: true,
    ogTitle: '',
    ogSiteName: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    hotjarId: '',
    enableAnalytics: true,
    enableCookieConsent: true,
    enableSitemap: true,
    enableRobotsTxt: true,
    enableSchemaMarkup: true,
    enableCanonicalUrls: true,
    organizationType: 'RealEstateAgent',
    organizationName: '',
    organizationLogo: '',
    customMetaTags: '',
    googleSiteVerification: '',
    bingSiteVerification: '',
    yandexVerification: '',
    pinterestVerification: '',
    // Branding Settings
    headerLogo: '',
    footerLogo: '',
    welcomeScreenLogo: '',
    welcomePageImage: '',
    welcomePageBackgroundImage: '',
    chatbotLogo: '',
    faviconUrl: '',
    defaultPropertyImage: '',
    defaultAvatarImage: '',
    emailLogoUrl: '',
    loginPageBackground: '',
    mobileAppIcon: '',
    // Welcome Screen Settings
    welcomeScreenEnabled: true,
    welcomeQuickLoginEnabled: true,
    welcomeShowConnectionStatus: true,
    welcomeSkipOnReturn: false,
    welcomeAnimationStyle: 'gradient',
    welcomeLoadingDuration: 1750,
    welcomeBackgroundStyle: 'dark',
    welcomeLoadingIndicator: 'dots',
    welcomePrimaryColor: '#7f5af0',
    welcomeAccentColor: '#2cb67d',
    welcomeBackgroundColor: '#000000',
    welcomeTextColor: '#ffffff',
    // Loading Popup Settings
    loadingPopupEnabled: true,
    loadingPopupAutoHide: true,
    loadingPopupDismissible: true,
    loadingPopupShowPercent: true,
    loadingPopupPosition: 'bottom-right',
    loadingPopupAutoHideDelay: 1500,
    loadingPopupSize: 'medium',
    loadingPopupAnimation: 'slide',
    loadingPopupBarStyle: 'shimmer',
    loadingPopupTheme: 'default',
    loadingPopupBarColor: '#7f5af0',
    loadingPopupAccentColor: '#2cb67d',
    loadingPopupBgColor: '#1a1a2e',
    loadingPopupBorderRadius: 'xl'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load all settings from all categories
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;

      if (data) {
        const settingsObj = data.reduce((acc, setting) => {
          // Parse JSON values if they look like JSON
          let value = setting.value;
          if (typeof value === 'string') {
            try {
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
              else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            } catch {
              // Keep as string
            }
          }
          acc[setting.key] = value;
          return acc;
        }, {} as Record<string, any>);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Error', 'Failed to load system settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    startLoading('Saving settings...');
    
    try {
      const entries = Object.entries(settings);
      const total = entries.length;
      let completed = 0;

      for (const [key, value] of entries) {
        // Determine category based on key prefix
        let category = 'general';
        if (key.startsWith('welcome') || key.startsWith('loading')) {
          category = 'loading_page';
        } else if (key.startsWith('seo') || key.startsWith('og') || key.startsWith('twitter') || 
                   key.startsWith('google') || key.startsWith('facebook') || key.startsWith('hotjar') ||
                   key.startsWith('bing') || key.startsWith('yandex') || key.startsWith('pinterest') ||
                   key.startsWith('enable') && (key.includes('Analytics') || key.includes('Sitemap'))) {
          category = 'seo';
        } else if (key.includes('Logo') || key.includes('Image') || key.includes('favicon') || key.includes('Icon')) {
          category = 'branding';
        }

        const { error } = await supabase
          .from('system_settings')
          .upsert(
            {
              key,
              value: String(value),
              category,
              description: `System setting for ${key}`
            },
            {
              onConflict: 'key'
            }
          );
        
        if (error) throw error;
        
        completed++;
        updateProgress((completed / total) * 100, `Saving ${key}...`);
      }

      showSuccess('Settings Saved', 'System settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save system settings');
    } finally {
      setLoading(false);
      finishLoading();
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    saveSettings,
    handleInputChange,
    reloadSettings: loadSettings
  };
};
