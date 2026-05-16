
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAllSystemSettings, selectSettingsByKeys, useInvalidateSystemSettings } from './useAllSystemSettings';

interface SocialMediaSettings {
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  tiktokUrl: string;
}

const SOCIAL_KEYS = [
  'facebookUrl', 'twitterUrl', 'instagramUrl',
  'youtubeUrl', 'whatsappNumber', 'tiktokUrl'
] as const;

const defaultSocialSettings: SocialMediaSettings = {
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  tiktokUrl: '',
};

export const useSocialMediaSettings = () => {
  const [settings, setSettings] = useState<SocialMediaSettings>(defaultSocialSettings);
  const queryClient = useQueryClient();
  const invalidateAll = useInvalidateSystemSettings();

  const { data: allSettings, isLoading } = useAllSystemSettings();

  const saveMutation = useMutation({
    mutationFn: async (newSettings: Partial<SocialMediaSettings>) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: value ?? '',
        category: 'social_media',
        description: `Social media setting for ${key}`,
        is_public: true,
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Social media settings saved successfully!');
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
    },
    onError: (error) => {
      console.error('Error saving social media settings:', error);
      toast.error('Failed to save social media settings');
    },
  });

  useEffect(() => {
    if (!allSettings) return;
    const picked = selectSettingsByKeys(allSettings, [...SOCIAL_KEYS]);
    const loadedSettings = { ...defaultSocialSettings };
    for (const key of SOCIAL_KEYS) {
      if (picked[key] !== undefined) {
        (loadedSettings as any)[key] = String(picked[key] || '');
      }
    }
    setSettings(loadedSettings);
  }, [allSettings]);

  const updateSetting = (key: keyof SocialMediaSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    saveMutation.mutate(settings);
  };

  return {
    settings,
    isLoading,
    isSaving: saveMutation.isPending,
    updateSetting,
    saveSettings,
  };
};
