
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SocialMediaSettings {
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  telegramUrl: string;
}

const defaultSocialSettings: SocialMediaSettings = {
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  telegramUrl: '',
};

export const useSocialMediaSettings = () => {
  const [settings, setSettings] = useState<SocialMediaSettings>(defaultSocialSettings);
  const queryClient = useQueryClient();

  const { data: socialData, isLoading } = useQuery({
    queryKey: ['social-media-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'facebookUrl', 'twitterUrl', 'instagramUrl', 
          'linkedinUrl', 'youtubeUrl', 'whatsappNumber', 'telegramUrl'
        ]);
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: Partial<SocialMediaSettings>) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value,
        category: 'social_media',
        description: `Social media setting for ${key}`,
        is_public: true,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Social media settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
    },
    onError: (error) => {
      console.error('Error saving social media settings:', error);
      toast.error('Failed to save social media settings');
    },
  });

  useEffect(() => {
    if (socialData) {
      const loadedSettings = { ...defaultSocialSettings };
      
      socialData.forEach((setting) => {
        if (setting.key in loadedSettings) {
          (loadedSettings as any)[setting.key] = setting.value || '';
        }
      });
      
      setSettings(loadedSettings);
    }
  }, [socialData]);

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
