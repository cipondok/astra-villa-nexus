
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

export const useSystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
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
    discountNotifications: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'general');
      
      if (error) throw error;

      if (data) {
        const settingsObj = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Error', 'Failed to load system settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(
            {
              key,
              value,
              category: 'general',
              description: `System setting for ${key}`
            },
            {
              onConflict: 'key,category'
            }
          );
        
        if (error) throw error;
      }

      showSuccess('Settings Saved', 'System settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    saveSettings,
    handleInputChange
  };
};
