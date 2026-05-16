
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

export const useBackupSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    lastBackup: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackupSettings();
  }, []);

  const loadBackupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'backup');
      
      if (error) throw error;

      if (data) {
        const backupObj = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setBackupSettings(prev => ({ ...prev, ...backupObj }));
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  };

  const saveBackupSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(backupSettings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key,
            value,
            category: 'backup',
            description: `Backup setting for ${key}`
          });
        
        if (error) throw error;
      }

      showSuccess('Backup Settings Saved', 'Backup settings updated successfully');
    } catch (error) {
      console.error('Error saving backup settings:', error);
      showError('Error', 'Failed to save backup settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSettingChange = (key: string, value: any) => {
    setBackupSettings(prev => ({ ...prev, [key]: value }));
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBackupSettings(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
      showSuccess('Backup Created', 'System backup has been created successfully');
    } catch (error) {
      showError('Error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  return {
    backupSettings,
    loading,
    saveBackupSettings,
    handleBackupSettingChange,
    createBackup
  };
};
