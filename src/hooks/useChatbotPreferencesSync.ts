import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomSound {
  event: string;
  audioData: string;
  fileName: string;
}

interface ChatbotPreferences {
  position: { x: number; y: number };
  size: { width: number; height: number };
  snapSensitivity: number;
  pinnedActions: string[];
  viewMode: 'mini' | 'full';
  autoCollapseEnabled: boolean;
  autoCollapseDuration: number;
  soundMute: boolean;
  customSounds: CustomSound[];
}

export const useChatbotPreferencesSync = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFromCloud = async (): Promise<ChatbotPreferences | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('chatbot_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        console.error('Error loading chatbot preferences:', error);
        return null;
      }

      if (!data) return null;

      return {
        position: data.position as { x: number; y: number },
        size: data.size as { width: number; height: number },
        snapSensitivity: data.snap_sensitivity || 50,
        pinnedActions: (data.pinned_actions as string[]) || [],
        viewMode: (data.view_mode as 'mini' | 'full') || 'full',
        autoCollapseEnabled: data.auto_collapse_enabled ?? true,
        autoCollapseDuration: data.auto_collapse_duration || 30,
        soundMute: data.sound_mute ?? false,
        customSounds: (data.custom_sounds as unknown as CustomSound[]) || [],
      };
    } catch (error) {
      console.error('Error loading chatbot preferences:', error);
      return null;
    }
  };

  const saveToCloud = async (preferences: ChatbotPreferences) => {
    if (!userId) return;

    setSyncStatus('syncing');

    try {
      const { error } = await supabase
        .from('chatbot_preferences')
        .upsert(
          {
            user_id: userId,
            position: preferences.position as any,
            size: preferences.size as any,
            snap_sensitivity: preferences.snapSensitivity,
            pinned_actions: preferences.pinnedActions as any,
            view_mode: preferences.viewMode,
            auto_collapse_enabled: preferences.autoCollapseEnabled,
            auto_collapse_duration: preferences.autoCollapseDuration,
            sound_mute: preferences.soundMute,
            custom_sounds: preferences.customSounds as any,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error saving chatbot preferences:', error);
        setSyncStatus('error');
        toast({
          title: "Sync Error",
          description: "Failed to sync chatbot preferences to cloud",
          variant: "destructive",
        });
      } else {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        // Reset to idle after 2 seconds
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error saving chatbot preferences:', error);
      setSyncStatus('error');
    }
  };

  const deleteFromCloud = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('chatbot_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting chatbot preferences:', error);
      }
    } catch (error) {
      console.error('Error deleting chatbot preferences:', error);
    }
  };

  return {
    isAuthenticated: !!userId,
    isLoading,
    syncStatus,
    lastSyncTime,
    loadFromCloud,
    saveToCloud,
    deleteFromCloud,
  };
};
