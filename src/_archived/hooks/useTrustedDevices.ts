import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';

export interface TrustedDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  trusted_at: string;
  last_used_at: string;
  is_active: boolean;
}

export const useTrustedDevices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ['trusted-devices', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trusted_devices' as any)
        .select('*')
        .order('last_used_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as TrustedDevice[];
    },
    enabled: !!user,
  });

  const currentFingerprint = useQuery({
    queryKey: ['current-fingerprint'],
    queryFn: generateDeviceFingerprint,
    staleTime: Infinity,
  });

  const removeMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('trusted_devices' as any)
        .delete()
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted-devices'] });
      toast({ title: 'Device removed', description: 'Trusted device has been removed.' });
    },
  });

  const isCurrentDeviceTrusted = devices?.some(
    d => d.device_fingerprint === currentFingerprint.data && d.is_active
  ) ?? false;

  return {
    devices: devices || [],
    isLoading,
    removeDevice: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    isCurrentDeviceTrusted,
    currentFingerprint: currentFingerprint.data,
  };
};
