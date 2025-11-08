import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  device_type: string | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  ip_address: string | null;
  location_data: Record<string, any>;
  is_trusted: boolean;
  last_used_at: string;
  first_seen_at: string;
  created_at: string;
  updated_at: string;
}

export const useDeviceManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user devices
  const { data: devices, isLoading, error } = useQuery({
    queryKey: ['user-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      return data as UserDevice[];
    },
  });

  // Update device (rename, trust)
  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserDevice> }) => {
      const { data, error } = await supabase
        .from('user_devices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast({
        title: 'Device Updated',
        description: 'Device settings have been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update device. Please try again.',
        variant: 'destructive',
      });
      console.error('Device update error:', error);
    },
  });

  // Remove device
  const removeDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast({
        title: 'Device Removed',
        description: 'Device has been removed from your trusted devices.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove device. Please try again.',
        variant: 'destructive',
      });
      console.error('Device removal error:', error);
    },
  });

  // Register current device
  const registerDeviceMutation = useMutation({
    mutationFn: async (deviceInfo: Partial<UserDevice>) => {
      const { data, error } = await supabase
        .from('user_devices')
        .upsert([deviceInfo] as any, { onConflict: 'user_id,device_fingerprint' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
    },
  });

  return {
    devices,
    isLoading,
    error,
    updateDevice: updateDeviceMutation.mutate,
    removeDevice: removeDeviceMutation.mutate,
    registerDevice: registerDeviceMutation.mutate,
    isUpdating: updateDeviceMutation.isPending,
    isRemoving: removeDeviceMutation.isPending,
  };
};
