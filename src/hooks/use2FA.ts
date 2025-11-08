import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TwoFASettings {
  id: string;
  user_id: string;
  method: 'sms' | 'totp' | 'both';
  totp_secret: string | null;
  phone_number: string | null;
  is_enabled: boolean;
  backup_codes: string[] | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const use2FA = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TwoFASettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_2fa_settings' as any)
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as unknown as TwoFASettings | null);
    } catch (error: any) {
      console.error('Error fetching 2FA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async (method: 'sms' | 'totp' | 'both', data: {
    totp_secret?: string;
    phone_number?: string;
    backup_codes?: string[];
  }) => {
    try {
      const payload = {
        user_id: user?.id,
        method,
        totp_secret: data.totp_secret || null,
        phone_number: data.phone_number || null,
        backup_codes: data.backup_codes || null,
        is_enabled: true,
        verified_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('user_2fa_settings' as any)
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      setSettings(result as unknown as TwoFASettings);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
      });
      
      return { success: true, data: result };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const disable2FA = async () => {
    try {
      const { error } = await supabase
        .from('user_2fa_settings' as any)
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchSettings();
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const verifyCode = async (code: string, method: 'sms' | 'totp') => {
    try {
      // This would call an edge function to verify the code
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { code, method, user_id: user?.id }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  return {
    settings,
    loading,
    enable2FA,
    disable2FA,
    verifyCode,
    fetchSettings,
  };
};