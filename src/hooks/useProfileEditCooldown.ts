import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CooldownStatus {
  canEdit: boolean;
  changeCount: number;
  daysRemaining: number;
  lockedUntil: string | null;
  message: string | null;
  nextCooldownDays: number;
  changesRemaining: number;
  mustContactSupport: boolean;
  loading: boolean;
}

interface RecordChangeResult {
  success: boolean;
  changeCount?: number;
  lockedUntil?: string;
  cooldownDays?: number;
  mustContactSupport?: boolean;
  error?: string;
}

interface CanEditProfileResponse {
  can_edit?: boolean;
  change_count?: number;
  days_remaining?: number;
  locked_until?: string | null;
  message?: string | null;
  next_cooldown_days?: number;
  changes_remaining?: number;
}

interface RecordProfileChangeResponse {
  success?: boolean;
  change_count?: number;
  locked_until?: string;
  cooldown_days?: number;
  must_contact_support?: boolean;
  error?: string;
}

export const useProfileEditCooldown = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CooldownStatus>({
    canEdit: true,
    changeCount: 0,
    daysRemaining: 0,
    lockedUntil: null,
    message: null,
    nextCooldownDays: 30,
    changesRemaining: 3,
    mustContactSupport: false,
    loading: true,
  });

  const checkCooldownStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.rpc('can_edit_profile', {
        user_id: user.id,
      });

      if (error) {
        console.error('Error checking profile edit cooldown:', error);
        setStatus(prev => ({ ...prev, loading: false, canEdit: true }));
        return;
      }

      if (data) {
        // Cast to typed response
        const response = data as unknown as CanEditProfileResponse;
        
        setStatus({
          canEdit: response.can_edit ?? true,
          changeCount: response.change_count ?? 0,
          daysRemaining: response.days_remaining ?? 0,
          lockedUntil: response.locked_until ?? null,
          message: response.message ?? null,
          nextCooldownDays: response.next_cooldown_days ?? 30,
          changesRemaining: response.changes_remaining ?? 3,
          mustContactSupport: (response.change_count ?? 0) >= 3,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking profile edit cooldown:', error);
      setStatus(prev => ({ ...prev, loading: false, canEdit: true }));
    }
  }, [user?.id]);

  const recordProfileChange = useCallback(async (changedFields: string[]): Promise<RecordChangeResult> => {
    if (!user?.id) {
      return { success: false, error: 'No user found' };
    }

    try {
      const { data, error } = await supabase.rpc('record_profile_change', {
        user_id: user.id,
        changed_fields: changedFields,
      });

      if (error) {
        console.error('Error recording profile change:', error);
        return { success: false, error: error.message };
      }

      if (data) {
        // Cast to typed response
        const response = data as unknown as RecordProfileChangeResponse;
        
        // Refresh status after recording change
        await checkCooldownStatus();
        
        return {
          success: response.success ?? false,
          changeCount: response.change_count,
          lockedUntil: response.locked_until,
          cooldownDays: response.cooldown_days,
          mustContactSupport: response.must_contact_support,
        };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error: any) {
      console.error('Error recording profile change:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id, checkCooldownStatus]);

  useEffect(() => {
    checkCooldownStatus();
  }, [checkCooldownStatus]);

  return {
    ...status,
    checkCooldownStatus,
    recordProfileChange,
  };
};

// Helper to get cooldown message based on change count
export const getCooldownMessage = (changeCount: number, daysRemaining: number): string => {
  if (changeCount >= 3) {
    return 'You have reached the maximum profile changes. Please contact customer support to make further changes.';
  }
  
  if (daysRemaining > 0) {
    return `Profile editing is locked for ${daysRemaining} more day${daysRemaining > 1 ? 's' : ''}.`;
  }
  
  const nextCooldown = changeCount >= 2 ? 60 : changeCount >= 1 ? 30 : 0;
  if (nextCooldown > 0) {
    return `After this change, you'll need to wait ${nextCooldown} days before editing again.`;
  }
  
  return '';
};

// Helper to format locked until date
export const formatLockedUntil = (lockedUntil: string | null): string | null => {
  if (!lockedUntil) return null;
  
  const date = new Date(lockedUntil);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
